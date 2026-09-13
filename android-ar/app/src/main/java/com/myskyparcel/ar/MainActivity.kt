package com.myskyparcel.ar

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.location.Geocoder
import android.location.Location
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.camera.view.LifecycleCameraController
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
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
import io.github.sceneview.math.Direction
import io.github.sceneview.math.Position
import io.github.sceneview.math.Rotation
import io.github.sceneview.math.Size
import io.github.sceneview.node.PlaneNode
import io.github.sceneview.node.TextNode
import io.github.sceneview.rememberEngine
import io.github.sceneview.rememberMaterialLoader
import io.github.sceneview.rememberOnGestureListener
import java.util.Locale

private const val PERMISSION_REQUEST_CODE = 1001
private data class TestParcel(val id: String, val title: String, val price: Int, val anchor: Anchor)

class MainActivity : ComponentActivity(), SensorEventListener {
    private var cameraPermissionGranted by mutableStateOf(false)
    var latitude by mutableStateOf<Double?>(null); private set
    var longitude by mutableStateOf<Double?>(null); private set
    var locationAccuracy by mutableStateOf<Float?>(null); private set
    var azimuthDegrees by mutableStateOf(0f); private set
    var elevationDegrees by mutableStateOf(0f); private set
    var cityName by mutableStateOf("TÜRKİYE"); private set

    private lateinit var sensorManager: SensorManager
    private val gravity = FloatArray(3)
    private val magnetic = FloatArray(3)
    private var hasGravity = false
    private var hasMagnetic = false
    private val rotation = FloatArray(9)
    private val inclination = FloatArray(9)
    private val orientation = FloatArray(3)
    private val locationClient by lazy { LocationServices.getFusedLocationProviderClient(this) }
    private val locationCallback = object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) {
            result.lastLocation?.let { updateLocation(it) }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        sensorManager = getSystemService(SENSOR_SERVICE) as SensorManager
        cameraPermissionGranted = hasCameraPermission()
        requestRequiredPermissions()
        setContent {
            DualModeScanner(
                activity = this,
                cameraPermissionGranted = cameraPermissionGranted,
                onRequestCameraPermission = { requestCameraPermission() },
                onParcelSelected = { parcelId ->
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://myskyparcel.com/parsel-satin-al?parcels=$parcelId")))
                },
            )
        }
    }

    override fun onResume() { super.onResume(); startSensorsAndLocation() }
    override fun onPause() { stopSensorsAndLocation(); super.onPause() }

    private fun startSensorsAndLocation() {
        sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)?.also { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }
        sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)?.also { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }
        if (!hasLocationPermission()) return
        val request = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 1000L).setMinUpdateIntervalMillis(500L).setWaitForAccurateLocation(false).build()
        locationClient.requestLocationUpdates(request, locationCallback, mainLooper)
        locationClient.lastLocation.addOnSuccessListener { it?.let { location -> updateLocation(location) } }
    }

    private fun stopSensorsAndLocation() {
        sensorManager.unregisterListener(this)
        if (hasLocationPermission()) locationClient.removeLocationUpdates(locationCallback)
    }

    private fun updateLocation(location: Location) {
        latitude = location.latitude
        longitude = location.longitude
        locationAccuracy = location.accuracy
        Thread {
            runCatching {
                val address = Geocoder(this, Locale("tr", "TR")).getFromLocation(location.latitude, location.longitude, 1)?.firstOrNull()
                val city = address?.adminArea ?: address?.locality
                if (!city.isNullOrBlank()) runOnUiThread { cityName = normalizeCity(city) }
            }
        }.start()
    }

    private fun normalizeCity(value: String): String = value.uppercase(Locale("tr", "TR"))
        .replace("İ", "I").replace("Ğ", "G").replace("Ü", "U").replace("Ş", "S").replace("Ö", "O").replace("Ç", "C").replace(" ", "_")

    override fun onSensorChanged(event: SensorEvent) {
        when (event.sensor.type) {
            Sensor.TYPE_ACCELEROMETER -> { System.arraycopy(event.values, 0, gravity, 0, 3); hasGravity = true }
            Sensor.TYPE_MAGNETIC_FIELD -> { System.arraycopy(event.values, 0, magnetic, 0, 3); hasMagnetic = true }
        }
        if (!hasGravity || !hasMagnetic) return
        if (!SensorManager.getRotationMatrix(rotation, inclination, gravity, magnetic)) return
        SensorManager.getOrientation(rotation, orientation)
        azimuthDegrees = ((Math.toDegrees(orientation[0].toDouble()).toFloat() + 360f) % 360f)
        elevationDegrees = (-Math.toDegrees(orientation[1].toDouble()).toFloat()).coerceIn(-90f, 90f)
    }
    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit

    private fun hasCameraPermission() = ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
    private fun hasLocationPermission() = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED || ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
    private fun requestCameraPermission() { if (!hasCameraPermission()) ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA), PERMISSION_REQUEST_CODE) }
    private fun requestRequiredPermissions() {
        val missing = arrayOf(Manifest.permission.CAMERA, Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION).filter { ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED }
        if (missing.isNotEmpty()) ActivityCompat.requestPermissions(this, missing.toTypedArray(), PERMISSION_REQUEST_CODE)
    }
    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSION_REQUEST_CODE) {
            cameraPermissionGranted = hasCameraPermission()
            if (hasLocationPermission()) startSensorsAndLocation()
        }
    }
}

private data class SkyParcelSelection(val id: String, val index: Int, val azimuth: Float, val elevation: Float)

private fun calculateSkyParcel(city: String, azimuth: Float, elevation: Float): SkyParcelSelection {
    // 1000 x 1000 angular cells = 1,000,000 deterministic sky parcels per city.
    val azCell = ((azimuth / 360f) * 1000f).toInt().coerceIn(0, 999)
    val elCell = (((elevation + 90f) / 180f) * 1000f).toInt().coerceIn(0, 999)
    val index = elCell * 1000 + azCell + 1
    return SkyParcelSelection("$city-GOKYUZU-${index.toString().padStart(7, '0')}", index, azimuth, elevation)
}

@Composable
private fun DualModeScanner(activity: MainActivity, cameraPermissionGranted: Boolean, onRequestCameraPermission: () -> Unit, onParcelSelected: (String) -> Unit) {
    var mode by remember { mutableStateOf("fallback") }
    fun checkArCore() {
        if (!cameraPermissionGranted) return
        ArCoreApk.getInstance().checkAvailabilityAsync(activity) { availability ->
            if (!availability.isSupported) { mode = "fallback"; return@checkAvailabilityAsync }
            mode = "fallback"
            try {
                when (ArCoreApk.getInstance().requestInstall(activity, false)) {
                    ArCoreApk.InstallStatus.INSTALLED -> mode = "ar"
                    ArCoreApk.InstallStatus.INSTALL_REQUESTED -> mode = "fallback"
                }
            } catch (_: Exception) { mode = "fallback" }
        }
    }
    DisposableEffect(activity, cameraPermissionGranted) {
        val observer = LifecycleEventObserver { _, event -> if (event == Lifecycle.Event.ON_RESUME && cameraPermissionGranted) checkArCore() }
        activity.lifecycle.addObserver(observer)
        onDispose { activity.lifecycle.removeObserver(observer) }
    }
    LaunchedEffect(cameraPermissionGranted) { if (cameraPermissionGranted) checkArCore() }
    when (mode) {
        "ar" -> MySkyParcelArScreen(onParcelSelected)
        else -> RealSkyCameraScreen(activity, cameraPermissionGranted, onRequestCameraPermission, onParcelSelected)
    }
}

@Composable
private fun RealSkyCameraScreen(activity: MainActivity, cameraPermissionGranted: Boolean, onRequestCameraPermission: () -> Unit, onParcelSelected: (String) -> Unit) {
    val lat = activity.latitude
    val lon = activity.longitude
    val selection = calculateSkyParcel(activity.cityName, activity.azimuthDegrees, activity.elevationDegrees)
    Box(Modifier.fillMaxSize().background(Color.Black)) {
        if (cameraPermissionGranted) CameraPreview(activity)
        Box(Modifier.fillMaxSize().padding(16.dp)) {
            Column(Modifier.align(Alignment.TopCenter).background(Color(0xCC06111F), MaterialTheme.shapes.large).padding(horizontal = 16.dp, vertical = 12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("GÖKYÜZÜNÜ TARA", color = Color.White, style = MaterialTheme.typography.titleMedium)
                Text("GERÇEK ZAMANLI GÖKYÜZÜ PARSELİ", color = Color(0xFF7FF7D0), style = MaterialTheme.typography.bodySmall)
                Text(if (lat != null && lon != null) "Konum hazır · Pusula aktif" else "Konum hazırlanıyor…", color = Color.White.copy(alpha = 0.82f), style = MaterialTheme.typography.labelSmall)
            }
            if (!cameraPermissionGranted) {
                Column(Modifier.align(Alignment.Center).background(Color(0xEE06111F), MaterialTheme.shapes.large).padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Kamera izni gerekli", color = Color.White, style = MaterialTheme.typography.titleMedium)
                    Text("Gökyüzünü Tara için arka kamera kullanılacak.", color = Color.White.copy(alpha = 0.8f))
                    Button(onClick = onRequestCameraPermission) { Text("Kameraya izin ver") }
                }
            } else {
                Column(Modifier.align(Alignment.Center).background(Color(0xDD06111F), MaterialTheme.shapes.large).clickable { onParcelSelected(selection.id) }.padding(horizontal = 22.dp, vertical = 18.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(5.dp)) {
                    Text("GÖKYÜZÜ PARSELİ", color = Color(0xFF7FF7D0), style = MaterialTheme.typography.labelMedium)
                    Text(selection.id, color = Color.White, style = MaterialTheme.typography.titleMedium)
                    Text("Parsel ${selection.index} / 1.000.000", color = Color.White.copy(alpha = 0.86f))
                    Text("Azimut %.1f° · Yükseklik %.1f°".format(selection.azimuth, selection.elevation), color = Color.White.copy(alpha = 0.72f), style = MaterialTheme.typography.labelSmall)
                    Text("Satın almak için dokun", color = Color(0xFFFFD166), style = MaterialTheme.typography.labelSmall)
                }
                Column(Modifier.align(Alignment.BottomCenter), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("${activity.cityName} · 1.000.000 gökyüzü parseli", color = Color.White, style = MaterialTheme.typography.labelMedium)
                    if (lat != null && lon != null) Text("%.6f, %.6f · GPS ±%.0fm".format(lat, lon, activity.locationAccuracy ?: 0f), color = Color.White.copy(alpha = 0.72f), style = MaterialTheme.typography.labelSmall)
                }
            }
        }
    }
}

@Composable
private fun CameraPreview(activity: MainActivity) {
    val controller = remember(activity) {
        LifecycleCameraController(activity).apply {
            cameraSelector = androidx.camera.core.CameraSelector.DEFAULT_BACK_CAMERA
            setEnabledUseCases(0)
        }
    }
    DisposableEffect(controller, activity) {
        controller.bindToLifecycle(activity)
        onDispose { controller.unbind() }
    }
    AndroidView(Modifier.fillMaxSize(), factory = { context -> PreviewView(context).apply { scaleType = PreviewView.ScaleType.FILL_CENTER; this.controller = controller } })
}

@Composable
private fun MySkyParcelArScreen(onParcelSelected: (String) -> Unit) {
    val engine = rememberEngine()
    val materialLoader = rememberMaterialLoader(engine)
    val parcels = androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateListOf<TestParcel>() }
    var latestEarthTracking by remember { mutableStateOf(false) }
    var latestLocation by remember { mutableStateOf("Konum bekleniyor") }
    var placed by remember { mutableStateOf(false) }
    val parcelMaterial = remember(materialLoader) { materialLoader.createColorInstance(color = Color(0.03f, 0.85f, 0.95f, 0.92f), metallic = 0.15f, roughness = 0.35f) }
    ARSceneView(
        modifier = Modifier.fillMaxSize(), engine = engine, materialLoader = materialLoader, planeRenderer = false, depthMode = Config.DepthMode.AUTOMATIC,
        sessionConfiguration = { session, config -> if (session.isGeospatialModeSupported(Config.GeospatialMode.ENABLED)) config.geospatialMode = Config.GeospatialMode.ENABLED; config.lightEstimationMode = Config.LightEstimationMode.ENVIRONMENTAL_HDR },
        onSessionUpdated = { session, _ ->
            val earth = session.earth
            latestEarthTracking = earth?.trackingState == TrackingState.TRACKING
            if (latestEarthTracking && earth != null) {
                val pose = earth.cameraGeospatialPose
                latestLocation = "%.6f, %.6f · ±%.1fm".format(pose.latitude, pose.longitude, pose.horizontalAccuracy)
                if (!placed) {
                    placed = true
                    listOf(Triple("MSP-AR-001", 0.00000 to 0.00010, 199), Triple("MSP-AR-002", 0.00008 to 0.00004, 499), Triple("MSP-AR-003", -0.00007 to -0.00006, 999)).forEachIndexed { index, (id, offset, price) ->
                        runCatching { earth.createAnchor(pose.latitude + offset.first, pose.longitude + offset.second, pose.altitude + 18.0 + index * 3.0, 0f, 0f, 0f, 1f) }.getOrNull()?.let { parcels += TestParcel(id, "MySkyParcel ${id.removePrefix("MSP-AR-")}", price, it) }
                    }
                }
            }
        },
        onSessionFailed = { latestEarthTracking = false },
        onGestureListener = rememberOnGestureListener(onSingleTapConfirmed = { _, node -> node?.name?.let(onParcelSelected) }),
    ) {
        parcels.forEach { parcel -> androidx.compose.runtime.key(parcel.id) { AnchorNode(anchor = parcel.anchor) {
            PlaneNode(size = Size(x = 1.4f, y = 1.0f), normal = Direction(z = 1f), materialInstance = parcelMaterial, rotation = Rotation(y = 180f), apply = { name = parcel.id })
            TextNode(text = "${parcel.title}  ${parcel.price} TL", fontSize = 48f, textColor = android.graphics.Color.WHITE, backgroundColor = 0xCC06111F.toInt(), widthMeters = 1.4f, heightMeters = 0.22f, position = Position(y = 0.72f), apply = { name = parcel.id })
        } } }
    }
    Box(Modifier.fillMaxSize().padding(16.dp)) {
        Column(Modifier.align(Alignment.TopCenter).background(Color(0xCC06111F), MaterialTheme.shapes.large).padding(horizontal = 16.dp, vertical = 12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text("GÖKYÜZÜNÜ TARA · AR", color = Color.White, style = MaterialTheme.typography.titleMedium)
            Text(if (latestEarthTracking) "AR konumu hazır · Parsellere dokun" else "AR konumu hazırlanıyor…", color = if (latestEarthTracking) Color(0xFF7FF7D0) else Color(0xFFFFD166), style = MaterialTheme.typography.bodySmall)
            Text(latestLocation, color = Color.White.copy(alpha = 0.7f), style = MaterialTheme.typography.labelSmall)
        }
    }
}
