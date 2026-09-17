package com.myskyparcel.ar

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
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
import com.google.ar.core.Pose
import com.google.ar.core.TrackingState
import io.github.sceneview.ar.ARSceneView
import io.github.sceneview.ar.node.AnchorNode
import io.github.sceneview.node.ViewNode
import io.github.sceneview.rememberEngine
import io.github.sceneview.rememberViewNodeManager

private const val LOCAL_REQUEST = 2099

class GeospatialScannerActivity2 : ComponentActivity() {
    private val locationClient by lazy { LocationServices.getFusedLocationProviderClient(this) }
    private var location by mutableStateOf<android.location.Location?>(null)
    private val callback = object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) { result.lastLocation?.let { location = it } }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestPermissionsIfNeeded()
        setContent { Scanner2(location, ::openPurchase) }
    }

    override fun onResume() {
        super.onResume()
        if (hasLocation()) {
            locationClient.lastLocation.addOnSuccessListener { it?.let { location = it } }
            locationClient.requestLocationUpdates(
                LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 1000L)
                    .setMinUpdateIntervalMillis(500L).build(), callback, mainLooper
            )
        }
    }

    override fun onPause() { locationClient.removeLocationUpdates(callback); super.onPause() }

    override fun onRequestPermissionsResult(r: Int, p: Array<String>, g: IntArray) {
        super.onRequestPermissionsResult(r, p, g)
        if (r == LOCAL_REQUEST && hasLocation()) locationClient.lastLocation.addOnSuccessListener { it?.let { location = it } }
    }

    private fun has(p: String) = ContextCompat.checkSelfPermission(this, p) == PackageManager.PERMISSION_GRANTED
    private fun hasLocation() = has(Manifest.permission.ACCESS_FINE_LOCATION) || has(Manifest.permission.ACCESS_COARSE_LOCATION)
    private fun requestPermissionsIfNeeded() {
        val missing = buildList {
            if (!has(Manifest.permission.CAMERA)) add(Manifest.permission.CAMERA)
            if (!hasLocation()) add(Manifest.permission.ACCESS_FINE_LOCATION)
        }
        if (missing.isNotEmpty()) ActivityCompat.requestPermissions(this, missing.toTypedArray(), LOCAL_REQUEST)
    }
    private fun openPurchase(id: String) = startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://myskyparcel.com/parsel-satin-al?parcels=$id")))
}

@Composable
private fun Scanner2(location: android.location.Location?, select: (String) -> Unit) {
    var supported by remember { mutableStateOf<Boolean?>(null) }
    LaunchedEffect(Unit) {
        ArCoreApk.getInstance().checkAvailabilityAsync(LocalContextHolder.current) { supported = it.isSupported }
    }
    if (supported == false) {
        Box(Modifier.fillMaxSize().background(Color.Black), contentAlignment = Alignment.Center) {
            Text("Bu cihaz ARCore'u desteklemiyor.", color = Color.White)
        }
        return
    }
    if (supported == null) {
        Box(Modifier.fillMaxSize().background(Color.Black), contentAlignment = Alignment.Center) {
            Text("AR hazırlanıyor…", color = Color.White)
        }
        return
    }
    ParcelScene2(location, select)
}

private object LocalContextHolder {
    lateinit var current: android.content.Context
}

@Composable
private fun ParcelScene2(location: android.location.Location?, select: (String) -> Unit) {
    val context = androidx.compose.ui.platform.LocalContext.current
    LocalContextHolder.current = context
    val engine = rememberEngine()
    val manager = rememberViewNodeManager()
    val repo = remember { SupabaseParcelRepository() }
    val placed = remember { mutableStateListOf<PlacedParcel>() }
    var parcels by remember { mutableStateOf<List<ArParcel>>(emptyList()) }
    var created by remember { mutableStateOf(false) }
    var tracking by remember { mutableStateOf(false) }
    var status by remember { mutableStateOf("AR konumu hazırlanıyor…") }

    LaunchedEffect(Unit) {
        parcels = runCatching { repo.loadParcels("27") }.getOrDefault(emptyList())
    }

    Box(Modifier.fillMaxSize()) {
        ARSceneView(
            modifier = Modifier.fillMaxSize(),
            engine = engine,
            planeRenderer = false,
            viewNodeWindowManager = manager,
            sessionConfiguration = { session, config ->
                if (session.isGeospatialModeSupported(Config.GeospatialMode.ENABLED)) {
                    config.geospatialMode = Config.GeospatialMode.ENABLED
                }
                config.lightEstimationMode = Config.LightEstimationMode.ENVIRONMENTAL_HDR
            },
            onSessionUpdated = { session, _ ->
                val cameraTracking = session.camera.trackingState == TrackingState.TRACKING
                val earth = session.earth
                val geoTracking = earth?.trackingState == TrackingState.TRACKING
                tracking = cameraTracking
                if (!cameraTracking || created || parcels.isEmpty()) return@ARSceneView

                if (geoTracking && earth != null) {
                    val p = earth.cameraGeospatialPose
                    status = "GERÇEK KONUM · GPS ±%.1fm · Yön ±%.1f°".format(p.horizontalAccuracy, p.orientationYawAccuracy)
                    val usable = p.horizontalAccuracy <= 100.0 && p.verticalAccuracy <= 100.0
                    if (usable) {
                        val available = parcels.filter { it.status == "available" }
                        available.take(3).forEachIndexed { i, parcel ->
                            val q = GeoMath.destination(p.latitude, p.longitude, p.altitude, i * 120.0, 12.0, 120.0 + i * 60.0)
                            runCatching { earth.createAnchor(q.latitude, q.longitude, q.altitude, 0f, 0f, 0f, 1f) }
                                .getOrNull()?.let { placed += PlacedParcel(parcel, it) }
                        }
                        available.drop(3).sortedBy { GeoMath.distance(p.latitude, p.longitude, it.latitude, it.longitude) }
                            .filter { GeoMath.distance(p.latitude, p.longitude, it.latitude, it.longitude) <= 10000.0 }
                            .take(6).forEach { parcel ->
                                runCatching { earth.createAnchor(parcel.latitude, parcel.longitude, p.altitude + 150.0, 0f, 0f, 0f, 1f) }
                                    .getOrNull()?.let { placed += PlacedParcel(parcel, it) }
                            }
                        created = placed.isNotEmpty()
                    }
                }

                if (!created) {
                    status = "AR yerel görünüm · pusula/VPS beklemeden parseller gösteriliyor"
                    val available = parcels.filter { it.status == "available" }.take(6)
                    val poses = listOf(
                        Pose.makeTranslation(-1.8f, 1.1f, -4.5f),
                        Pose.makeTranslation(0f, 1.8f, -5.5f),
                        Pose.makeTranslation(1.8f, 1.1f, -4.5f),
                        Pose.makeTranslation(-2.4f, 2.4f, -7.0f),
                        Pose.makeTranslation(0f, 2.8f, -8.0f),
                        Pose.makeTranslation(2.4f, 2.4f, -7.0f)
                    )
                    available.forEachIndexed { i, parcel ->
                        val anchor = runCatching { session.createAnchor(session.camera.pose.compose(poses[i])) }.getOrNull()
                        anchor?.let { placed += PlacedParcel(parcel.copy(isTest = true), it) }
                    }
                    created = placed.isNotEmpty()
                }
            }
        ) {
            placed.forEach { item ->
                key(item.parcel.id) {
                    AnchorNode(anchor = item.anchor) {
                        ViewNode(
                            windowManager = manager,
                            unlit = true,
                            apply = { name = item.parcel.id; isTouchable = true }
                        ) {
                            Column(
                                Modifier.background(Color(0xDD06111F), MaterialTheme.shapes.large)
                                    .padding(horizontal = 12.dp, vertical = 8.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text("PARSEL ${item.parcel.parcelNumber}", color = Color.White, style = MaterialTheme.typography.labelLarge)
                                Text(if (item.parcel.isTest) "AR GÖRÜNÜM · dokun" else "Satın almak için dokun", color = Color(0xFFFFD166), style = MaterialTheme.typography.labelSmall)
                            }
                        }
                    }
                }
            }
        }
        Column(
            Modifier.align(Alignment.TopCenter).padding(14.dp)
                .background(Color(0xDD06111F), MaterialTheme.shapes.large).padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(3.dp)
        ) {
            Text("GÖKYÜZÜNÜ TARA", color = Color.White, style = MaterialTheme.typography.titleMedium)
            Text(status, color = Color(0xFF7FF7D0), style = MaterialTheme.typography.labelMedium)
            Text("${parcels.size} parsel · ${placed.size} AR noktası", color = Color.White.copy(alpha = .75f), style = MaterialTheme.typography.labelSmall)
            if (!tracking) Text("Kamera AR takibi bekleniyor…", color = Color.White.copy(alpha = .7f), style = MaterialTheme.typography.labelSmall)
        }
    }
}
