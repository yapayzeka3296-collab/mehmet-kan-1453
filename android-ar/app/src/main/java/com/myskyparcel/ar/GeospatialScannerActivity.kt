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
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.android.gms.location.*
import com.google.ar.core.ArCoreApk
import com.google.ar.core.Config
import com.google.ar.core.TrackingState
import io.github.sceneview.ar.ARSceneView
import io.github.sceneview.ar.node.AnchorNode
import io.github.sceneview.node.ViewNode
import io.github.sceneview.rememberEngine
import io.github.sceneview.rememberOnGestureListener
import io.github.sceneview.rememberViewNodeManager
import java.util.Locale

private const val REQUEST_PERMISSIONS = 2001

class GeospatialScannerActivity : ComponentActivity() {
    private val locationClient by lazy { LocationServices.getFusedLocationProviderClient(this) }
    private var location by mutableStateOf<Location?>(null)
    private var cameraGranted by mutableStateOf(false)
    private val callback = object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) {
            result.lastLocation?.let { location = it }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        cameraGranted = has(Manifest.permission.CAMERA)
        requestPermissionsIfNeeded()
        setContent { ScannerRoot(this, location, cameraGranted, ::requestPermissionsIfNeeded, ::openPurchase) }
    }

    override fun onResume() {
        super.onResume()
        if (!hasLocation()) return
        locationClient.lastLocation.addOnSuccessListener { it?.let { location = it } }
        locationClient.requestLocationUpdates(
            LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 1000L)
                .setMinUpdateIntervalMillis(500L)
                .build(), callback, mainLooper
        )
    }

    override fun onPause() {
        locationClient.removeLocationUpdates(callback)
        super.onPause()
    }

    override fun onRequestPermissionsResult(r: Int, p: Array<String>, g: IntArray) {
        super.onRequestPermissionsResult(r, p, g)
        if (r == REQUEST_PERMISSIONS) {
            cameraGranted = has(Manifest.permission.CAMERA)
            if (hasLocation()) locationClient.lastLocation.addOnSuccessListener { it?.let { location = it } }
        }
    }

    private fun has(permission: String) =
        ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED

    private fun hasLocation() =
        has(Manifest.permission.ACCESS_FINE_LOCATION) || has(Manifest.permission.ACCESS_COARSE_LOCATION)

    private fun requestPermissionsIfNeeded() {
        val missing = buildList {
            if (!has(Manifest.permission.CAMERA)) add(Manifest.permission.CAMERA)
            if (!hasLocation()) add(Manifest.permission.ACCESS_FINE_LOCATION)
        }
        if (missing.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, missing.toTypedArray(), REQUEST_PERMISSIONS)
        }
    }

    private fun openPurchase(id: String) = startActivity(
        Intent(Intent.ACTION_VIEW, Uri.parse("https://myskyparcel.com/parsel-satin-al?parcels=$id"))
    )
}

@Composable
private fun ScannerRoot(
    activity: GeospatialScannerActivity,
    location: Location?,
    cameraGranted: Boolean,
    request: () -> Unit,
    select: (String) -> Unit,
) {
    var mode by remember { mutableStateOf("checking") }
    var cityCode by remember { mutableStateOf<String?>(null) }
    var cityName by remember { mutableStateOf("TÜRKİYE") }

    LaunchedEffect(location) {
        location?.let { loc ->
            val name = runCatching {
                Geocoder(activity, Locale("tr", "TR"))
                    .getFromLocation(loc.latitude, loc.longitude, 1)
                    ?.firstOrNull()
                    ?.adminArea
            }.getOrNull()
            cityName = name ?: "TÜRKİYE"
            cityCode = CityCodes.fromName(name)
        }
    }

    DisposableEffect(cameraGranted) {
        if (cameraGranted) {
            ArCoreApk.getInstance().checkAvailabilityAsync(activity) { availability ->
                mode = if (!availability.isSupported) {
                    "unsupported"
                } else {
                    try {
                        when (ArCoreApk.getInstance().requestInstall(activity, false)) {
                            ArCoreApk.InstallStatus.INSTALLED -> "ar"
                            ArCoreApk.InstallStatus.INSTALL_REQUESTED -> "installing"
                        }
                    } catch (_: Exception) {
                        "unsupported"
                    }
                }
            }
        }
        onDispose { }
    }

    when (mode) {
        "ar" -> ParcelScene(cityCode, cityName, select)
        "installing" -> Status("AR bileşeni hazırlanıyor…")
        "unsupported" -> Status("Bu aşamada 2B fallback kaldırıldı. Yeni evrensel 3B Sky Engine hazırlanıyor…")
        else -> Permission(cameraGranted, request)
    }
}

@Composable
private fun ParcelScene(cityCode: String?, cityName: String, select: (String) -> Unit) {
    val engine = rememberEngine()
    val viewManager = rememberViewNodeManager()
    val repository = remember { SupabaseParcelRepository() }
    val placed = remember { mutableStateListOf<PlacedParcel>() }
    var parcels by remember { mutableStateOf<List<ArParcel>>(emptyList()) }
    var loaded by remember { mutableStateOf(false) }
    var created by remember { mutableStateOf(false) }
    var tracking by remember { mutableStateOf(false) }
    var status by remember { mutableStateOf("VPS konumu bekleniyor…") }

    LaunchedEffect(cityCode) {
        loaded = false
        created = false
        placed.forEach { it.anchor.detach() }
        placed.clear()
        parcels = cityCode?.let { repository.loadParcels(it) } ?: emptyList()
        loaded = true
    }

    Box(Modifier.fillMaxSize()) {
        ARSceneView(
            modifier = Modifier.fillMaxSize(),
            engine = engine,
            planeRenderer = false,
            viewNodeWindowManager = viewManager,
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
                tracking = earth?.trackingState == TrackingState.TRACKING
                if (!tracking || earth == null) {
                    status = "VPS konumu bekleniyor…"
                } else {
                    val pose = earth.cameraGeospatialPose
                    status = "GPS ±%.1fm · Yön ±%.1f°".format(
                        pose.horizontalAccuracy,
                        pose.orientationYawAccuracy,
                    )
                    val available = parcels.filter { it.status == "available" }
                    if (
                        loaded &&
                        available.size >= 3 &&
                        !created &&
                        pose.horizontalAccuracy <= 30 &&
                        pose.verticalAccuracy <= 30 &&
                        pose.orientationYawAccuracy <= 30
                    ) {
                        listOf(1000.0, 1500.0, 2000.0).forEachIndexed { index, distance ->
                            val point = GeoMath.destination(
                                pose.latitude,
                                pose.longitude,
                                pose.altitude,
                                index * 120.0,
                                20.0,
                                distance,
                            )
                            runCatching {
                                earth.createAnchor(
                                    point.latitude,
                                    point.longitude,
                                    point.altitude,
                                    0f,
                                    0f,
                                    0f,
                                    1f,
                                )
                            }.getOrNull()?.let { anchor ->
                                placed += PlacedParcel(
                                    available[index].copy(
                                        isTest = true,
                                        latitude = point.latitude,
                                        longitude = point.longitude,
                                        altitude = point.altitude,
                                    ),
                                    anchor,
                                )
                            }
                        }
                        available.drop(3)
                            .sortedBy { GeoMath.distance(pose.latitude, pose.longitude, it.latitude, it.longitude) }
                            .filter { GeoMath.distance(pose.latitude, pose.longitude, it.latitude, it.longitude) <= 10000 }
                            .take(6)
                            .forEach { parcel ->
                                runCatching {
                                    earth.createAnchor(parcel.latitude, parcel.longitude, pose.altitude + 150, 0f, 0f, 0f, 1f)
                                }.getOrNull()?.let { anchor -> placed += PlacedParcel(parcel, anchor) }
                            }
                        parcels.filter { it.status == "sold" }
                            .sortedBy { GeoMath.distance(pose.latitude, pose.longitude, it.latitude, it.longitude) }
                            .filter { GeoMath.distance(pose.latitude, pose.longitude, it.latitude, it.longitude) <= 10000 }
                            .take(3)
                            .forEach { parcel ->
                                runCatching {
                                    earth.createAnchor(parcel.latitude, parcel.longitude, pose.altitude + 150, 0f, 0f, 0f, 1f)
                                }.getOrNull()?.let { anchor -> placed += PlacedParcel(parcel, anchor) }
                            }
                        created = true
                    }
                }
            },
            onGestureListener = rememberOnGestureListener(
                onSingleTapConfirmed = { _, node ->
                    node?.name?.takeIf { it.isNotBlank() }?.let(select)
                },
            ),
        ) {
            placed.forEach { item ->
                key(item.parcel.id) {
                    AnchorNode(anchor = item.anchor) {
                        val sold = item.parcel.status == "sold"
                        ViewNode(
                            windowManager = viewManager,
                            unlit = true,
                            apply = {
                                name = if (sold) null else item.parcel.id
                                isTouchable = !sold
                            },
                        ) {
                            Column(
                                Modifier
                                    .background(
                                        if (item.parcel.isTest) Color(0xDDFF8A00)
                                        else if (sold) Color(0xDD6B1F2B)
                                        else Color(0xDD06111F),
                                        MaterialTheme.shapes.large,
                                    )
                                    .padding(horizontal = 12.dp, vertical = 8.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                            ) {
                                Text(
                                    when {
                                        item.parcel.isTest -> "TEST · ${item.parcel.parcelNumber}"
                                        sold -> "SATILDI · ${item.parcel.parcelNumber}"
                                        else -> item.parcel.parcelNumber
                                    },
                                    color = Color.White,
                                    style = MaterialTheme.typography.labelLarge,
                                )
                                if (!sold) {
                                    Text(
                                        "Satın almak için dokun",
                                        color = Color(0xFFFFD166),
                                        style = MaterialTheme.typography.labelSmall,
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        Column(
            Modifier
                .align(Alignment.TopCenter)
                .padding(14.dp)
                .background(Color(0xDD06111F), MaterialTheme.shapes.large)
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(3.dp),
        ) {
            Text("GÖKYÜZÜNÜ TARA", color = Color.White, style = MaterialTheme.typography.titleMedium)
            Text("$cityName · GERÇEK PARSELLER", color = Color(0xFF7FF7D0), style = MaterialTheme.typography.labelMedium)
            Text(
                if (tracking) status else "GPS + VPS konumu hazırlanıyor…",
                color = Color.White.copy(alpha = .82f),
                style = MaterialTheme.typography.labelSmall,
            )
            Text(
                "${parcels.count { it.status == "available" }} boş · ${parcels.count { it.status == "sold" }} satıldı · ${placed.size} AR noktası",
                color = Color.White.copy(alpha = .7f),
                style = MaterialTheme.typography.labelSmall,
            )
        }
    }
}
