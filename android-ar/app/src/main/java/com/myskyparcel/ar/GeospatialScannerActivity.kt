package com.myskyparcel.ar

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Geocoder
import android.location.Location
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.ar.core.Anchor
import com.google.ar.core.ArCoreApk
import com.google.ar.core.Config
import com.google.ar.core.TrackingState
import io.github.sceneview.ar.ARSceneView
import io.github.sceneview.ar.node.AnchorNode
import io.github.sceneview.node.BillboardNode
import io.github.sceneview.node.TextNode
import io.github.sceneview.rememberEngine
import io.github.sceneview.rememberOnGestureListener
import java.util.Locale
import kotlin.math.cos
import kotlin.math.sin

private const val REQUEST_PERMISSIONS = 2001

class GeospatialScannerActivity : ComponentActivity() {
    private val locationClient by lazy { LocationServices.getFusedLocationProviderClient(this) }
    private var location by mutableStateOf<Location?>(null)
    private var cameraGranted by mutableStateOf(false)
    private val locationCallback = object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) {
            result.lastLocation?.let { location = it }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        cameraGranted = hasPermission(Manifest.permission.CAMERA)
        requestPermissionsIfNeeded()
        setContent {
            ScannerRoot(
                activity = this,
                location = location,
                cameraGranted = cameraGranted,
                requestPermissions = ::requestPermissionsIfNeeded,
                selectParcel = ::openPurchase,
            )
        }
    }

    override fun onResume() {
        super.onResume()
        if (hasLocationPermission()) {
            locationClient.lastLocation.addOnSuccessListener { if (it != null) location = it }
            val request = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 1000L)
                .setMinUpdateIntervalMillis(500L)
                .setWaitForAccurateLocation(false)
                .build()
            locationClient.requestLocationUpdates(request, locationCallback, mainLooper)
        }
    }

    override fun onPause() {
        locationClient.removeLocationUpdates(locationCallback)
        super.onPause()
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, results: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, results)
        if (requestCode == REQUEST_PERMISSIONS) {
            cameraGranted = hasPermission(Manifest.permission.CAMERA)
            if (hasLocationPermission()) locationClient.lastLocation.addOnSuccessListener { if (it != null) location = it }
        }
    }

    private fun hasPermission(permission: String) = ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED
    private fun hasLocationPermission() = hasPermission(Manifest.permission.ACCESS_FINE_LOCATION) || hasPermission(Manifest.permission.ACCESS_COARSE_LOCATION)

    private fun requestPermissionsIfNeeded() {
        val missing = buildList {
            if (!hasPermission(Manifest.permission.CAMERA)) add(Manifest.permission.CAMERA)
            if (!hasLocationPermission()) add(Manifest.permission.ACCESS_FINE_LOCATION)
        }
        if (missing.isNotEmpty()) ActivityCompat.requestPermissions(this, missing.toTypedArray(), REQUEST_PERMISSIONS)
    }

    private fun openPurchase(parcelId: String) {
        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://myskyparcel.com/parsel-satin-al?parcels=$parcelId")))
    }
}

@Composable
private fun ScannerRoot(
    activity: GeospatialScannerActivity,
    location: Location?,
    cameraGranted: Boolean,
    requestPermissions: () -> Unit,
    selectParcel: (String) -> Unit,
) {
    var mode by remember { mutableStateOf("checking") }
    var cityCode by remember { mutableStateOf<String?>(null) }
    var cityName by remember { mutableStateOf("TÜRKİYE") }

    LaunchedEffect(location) {
        location?.let { loc ->
            val name = runCatching {
                Geocoder(activity, Locale("tr", "TR")).getFromLocation(loc.latitude, loc.longitude, 1)
                    ?.firstOrNull()?.adminArea
            }.getOrNull()
            cityName = name ?: "TÜRKİYE"
            cityCode = CityCodes.fromName(name)
        }
    }

    fun checkArCore() {
        if (!cameraGranted) return
        ArCoreApk.getInstance().checkAvailabilityAsync(activity) { availability ->
            if (!availability.isSupported) {
                mode = "unsupported"
                return@checkAvailabilityAsync
            }
            try {
                mode = when (ArCoreApk.getInstance().requestInstall(activity, false)) {
                    ArCoreApk.InstallStatus.INSTALLED -> "ar"
                    ArCoreApk.InstallStatus.INSTALL_REQUESTED -> "installing"
                }
            } catch (_: Exception) {
                mode = "unsupported"
            }
        }
    }

    DisposableEffect(cameraGranted) {
        checkArCore()
        onDispose { }
    }

    when (mode) {
        "ar" -> GeospatialParcelScene(cityCode, cityName, selectParcel)
        "installing" -> StatusScreen("Google Play Services for AR hazırlanıyor…")
        "unsupported" -> StatusScreen("Bu cihaz ARCore Geospatial desteği vermiyor.")
        else -> PermissionScreen(cameraGranted, requestPermissions)
    }
}

@Composable
private fun GeospatialParcelScene(cityCode: String?, cityName: String, selectParcel: (String) -> Unit) {
    val engine = rememberEngine()
    val repository = remember { SupabaseParcelRepository() }
    val placed = remember { mutableStateListOf<PlacedParcel>() }
    var parcels by remember { mutableStateOf<List<ArParcel>>(emptyList()) }
    var loaded by remember { mutableStateOf(false) }
    var anchorsCreated by remember { mutableStateOf(false) }
    var earthTracking by remember { mutableStateOf(false) }
    var status by remember { mutableStateOf("VPS konumu bekleniyor…") }

    LaunchedEffect(cityCode) {
        loaded = false
        anchorsCreated = false
        placed.forEach { it.anchor.detach() }
        placed.clear()
        parcels = cityCode?.let { repository.loadAvailableParcels(it) } ?: emptyList()
        loaded = true
    }

    Box(Modifier.fillMaxSize()) {
        ARSceneView(
            modifier = Modifier.fillMaxSize(),
            engine = engine,
            planeRenderer = false,
            sessionConfiguration = { session, config ->
                if (session.isGeospatialModeSupported(Config.GeospatialMode.ENABLED)) {
                    config.geospatialMode = Config.GeospatialMode.ENABLED
                }
                config.lightEstimationMode = Config.LightEstimationMode.ENVIRONMENTAL_HDR
                config.depthMode = if (session.isDepthModeSupported(Config.DepthMode.AUTOMATIC)) {
                    Config.DepthMode.AUTOMATIC
                } else {
                    Config.DepthMode.DISABLED
                }
            },
            onSessionUpdated = { session, _ ->
                val earth = session.earth
                val tracking = earth?.trackingState == TrackingState.TRACKING
                earthTracking = tracking
                if (!tracking || earth == null) {
                    status = "VPS konumu bekleniyor…"
                } else {
                    val pose = earth.cameraGeospatialPose
                    status = "GPS ±%.1fm · Yön ±%.1f°".format(pose.horizontalAccuracy, pose.orientationYawAccuracy)
                    if (loaded && parcels.size >= 3 && !anchorsCreated &&
                        pose.horizontalAccuracy <= 30.0 &&
                        pose.verticalAccuracy <= 30.0 &&
                        pose.orientationYawAccuracy <= 30.0
                    ) {
                        // Three deterministic real-parcel-backed test markers: 1 km, 1.5 km and 2 km.
                        val distances = doubleArrayOf(1000.0, 1500.0, 2000.0)
                        val bearings = doubleArrayOf(0.0, 120.0, 240.0)
                        parcels.take(3).forEachIndexed { index, parcel ->
                            val point = GeoMath.destination(
                                pose.latitude, pose.longitude, pose.altitude,
                                bearings[index], 20.0, distances[index]
                            )
                            val anchor = runCatching {
                                earth.createAnchor(point.latitude, point.longitude, point.altitude, 0f, 0f, 0f, 1f)
                            }.getOrNull()
                            if (anchor != null) {
                                placed += PlacedParcel(
                                    parcel.copy(isTest = true, latitude = point.latitude, longitude = point.longitude),
                                    anchor
                                )
                            }
                        }

                        // Real database parcels keep their database coordinates and IDs.
                        parcels.drop(3).take(6).forEach { parcel ->
                            val anchor = runCatching {
                                earth.createAnchor(
                                    parcel.latitude,
                                    parcel.longitude,
                                    pose.altitude + 150.0,
                                    0f, 0f, 0f, 1f
                                )
                            }.getOrNull()
                            if (anchor != null) placed += PlacedParcel(parcel, anchor)
                        }
                        anchorsCreated = true
                    }
                }
            },
            onGestureListener = rememberOnGestureListener(
                onSingleTapConfirmed = { _, node ->
                    node?.name?.takeIf { it.isNotBlank() }?.let(selectParcel)
                }
            )
        ) {
            placed.forEach { placedParcel ->
                key(placedParcel.parcel.id) {
                    AnchorNode(anchor = placedParcel.anchor) {
                        BillboardNode {
                            TextNode(
                                text = if (placedParcel.parcel.isTest) {
                                    "TEST · ${placedParcel.parcel.parcelNumber}"
                                } else {
                                    placedParcel.parcel.parcelNumber
                                },
                                fontSize = 52f,
                                textColor = android.graphics.Color.WHITE,
                                backgroundColor = if (placedParcel.parcel.isTest) 0xDDFF8A00.toInt() else 0xDD06111F.toInt(),
                                widthMeters = 1.6f,
                                heightMeters = 0.42f,
                                apply = {
                                    name = placedParcel.parcel.id
                                    isTouchable = true
                                }
                            )
                        }
                    }
                }
            }
        }

        Column(
            Modifier.align(Alignment.TopCenter)
                .padding(14.dp)
                .background(Color(0xDD06111F), MaterialTheme.shapes.large)
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(3.dp)
        ) {
            Text("GÖKYÜZÜNÜ TARA", color = Color.White, style = MaterialTheme.typography.titleMedium)
            Text("$cityName · GERÇEK PARSELLER", color = Color(0xFF7FF7D0), style = MaterialTheme.typography.labelMedium)
            Text(if (earthTracking) status else "GPS + VPS konumu hazırlanıyor…", color = Color.White.copy(alpha = .82f), style = MaterialTheme.typography.labelSmall)
            Text("${parcels.size} satışa uygun · ${placed.size} AR noktası", color = Color.White.copy(alpha = .7f), style = MaterialTheme.typography.labelSmall)
        }
    }
}

private object GeoMath {
    private const val EARTH_RADIUS_METERS = 6_378_137.0

    data class Destination(val latitude: Double, val longitude: Double, val altitude: Double)

    fun destination(
        latitude: Double,
        longitude: Double,
        altitude: Double,
        bearingDeg: Double,
        elevationDeg: Double,
        slantDistanceMeters: Double,
    ): Destination {
        val bearing = Math.toRadians(bearingDeg)
        val elevation = Math.toRadians(elevationDeg)
        val horizontal = slantDistanceMeters * cos(elevation)
        val north = horizontal * cos(bearing)
        val east = horizontal * sin(bearing)
        val newLatitude = latitude + Math.toDegrees(north / EARTH_RADIUS_METERS)
        val newLongitude = longitude + Math.toDegrees(east / (EARTH_RADIUS_METERS * cos(Math.toRadians(latitude))))
        return Destination(newLatitude, newLongitude, altitude + slantDistanceMeters * sin(elevation))
    }
}

@Composable
private fun PermissionScreen(cameraGranted: Boolean, requestPermissions: () -> Unit) {
    Box(Modifier.fillMaxSize().background(Color.Black), contentAlignment = Alignment.Center) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text("GÖKYÜZÜNÜ TARA", color = Color.White, style = MaterialTheme.typography.headlineSmall)
            Text(
                if (cameraGranted) "Konum izni gerekli." else "Kamera ve konum izinleri gerekli.",
                color = Color.White.copy(alpha = .8f)
            )
            Button(onClick = requestPermissions) { Text("İzinleri ver") }
        }
    }
}

@Composable
private fun StatusScreen(text: String) {
    Box(Modifier.fillMaxSize().background(Color.Black), contentAlignment = Alignment.Center) {
        Text(text, color = Color.White, modifier = Modifier.padding(24.dp))
    }
}

private object CityCodes {
    private val map = mapOf(
        "Adana" to "01", "Adıyaman" to "02", "Afyonkarahisar" to "03", "Ağrı" to "04", "Amasya" to "05",
        "Ankara" to "06", "Antalya" to "07", "Artvin" to "08", "Aydın" to "09", "Balıkesir" to "10",
        "Bilecik" to "11", "Bingöl" to "12", "Bitlis" to "13", "Bolu" to "14", "Burdur" to "15",
        "Bursa" to "16", "Çanakkale" to "17", "Çankırı" to "18", "Çorum" to "19", "Denizli" to "20",
        "Diyarbakır" to "21", "Edirne" to "22", "Elazığ" to "23", "Erzincan" to "24", "Erzurum" to "25",
        "Eskişehir" to "26", "Gaziantep" to "27", "Giresun" to "28", "Gümüşhane" to "29", "Hakkari" to "30",
        "Hatay" to "31", "Isparta" to "32", "Mersin" to "33", "İstanbul" to "34", "İzmir" to "35",
        "Kars" to "36", "Kastamonu" to "37", "Kayseri" to "38", "Kırklareli" to "39", "Kırşehir" to "40",
        "Kocaeli" to "41", "Konya" to "42", "Kütahya" to "43", "Malatya" to "44", "Manisa" to "45",
        "Kahramanmaraş" to "46", "Mardin" to "47", "Muğla" to "48", "Muş" to "49", "Nevşehir" to "50",
        "Niğde" to "51", "Ordu" to "52", "Rize" to "53", "Sakarya" to "54", "Samsun" to "55",
        "Siirt" to "56", "Sinop" to "57", "Sivas" to "58", "Tekirdağ" to "59", "Tokat" to "60",
        "Trabzon" to "61", "Tunceli" to "62", "Şanlıurfa" to "63", "Uşak" to "64", "Van" to "65",
        "Yozgat" to "66", "Zonguldak" to "67", "Aksaray" to "68", "Bayburt" to "69", "Karaman" to "70",
        "Kırıkkale" to "71", "Batman" to "72", "Şırnak" to "73", "Bartın" to "74", "Ardahan" to "75",
        "Iğdır" to "76", "Yalova" to "77", "Karabük" to "78", "Kilis" to "79", "Osmaniye" to "80", "Düzce" to "81"
    )

    fun fromName(name: String?): String? = name?.let { value ->
        map.entries.firstOrNull { value.contains(it.key, ignoreCase = true) }?.value
    }
}
