package com.myskyparcel.ar

import android.Manifest
import android.content.Context
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
import androidx.camera.core.CameraSelector
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.Locale
import kotlin.math.*

private const val REQUEST_PERMISSIONS = 2001

class GeospatialScannerActivity : ComponentActivity() {
    private val locationClient by lazy { com.google.android.gms.location.LocationServices.getFusedLocationProviderClient(this) }
    private var location by mutableStateOf<Location?>(null)
    private val callback = object : com.google.android.gms.location.LocationCallback() {
        override fun onLocationResult(result: com.google.android.gms.location.LocationResult) {
            result.lastLocation?.let { location = it }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestPermissionsIfNeeded()
        setContent { SkyScanner(location = location, openPurchase = ::openPurchase) }
    }

    override fun onResume() {
        super.onResume()
        if (!hasLocation()) return
        locationClient.lastLocation.addOnSuccessListener { it?.let { location = it } }
        locationClient.requestLocationUpdates(
            com.google.android.gms.location.LocationRequest.Builder(
                com.google.android.gms.location.Priority.PRIORITY_HIGH_ACCURACY, 1000L
            ).setMinUpdateIntervalMillis(500L).build(), callback, mainLooper
        )
    }

    override fun onPause() {
        locationClient.removeLocationUpdates(callback)
        super.onPause()
    }

    private fun has(p: String) = ContextCompat.checkSelfPermission(this, p) == PackageManager.PERMISSION_GRANTED
    private fun hasLocation() = has(Manifest.permission.ACCESS_FINE_LOCATION) || has(Manifest.permission.ACCESS_COARSE_LOCATION)

    private fun requestPermissionsIfNeeded() {
        val missing = buildList {
            if (!has(Manifest.permission.CAMERA)) add(Manifest.permission.CAMERA)
            if (!hasLocation()) add(Manifest.permission.ACCESS_FINE_LOCATION)
        }
        if (missing.isNotEmpty()) ActivityCompat.requestPermissions(this, missing.toTypedArray(), REQUEST_PERMISSIONS)
    }

    private fun openPurchase(id: String) {
        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://myskyparcel.com/parsel-satin-al?parcels=$id")))
    }
}

private data class SkyTarget(
    val parcel: ArParcel,
    val bearing: Double,
    val distance: Double,
    val elevation: Double,
)

@Composable
private fun SkyScanner(location: Location?, openPurchase: (String) -> Unit) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val scope = rememberCoroutineScope()
    var parcels by remember { mutableStateOf<List<ArParcel>>(emptyList()) }
    var cityName by remember { mutableStateOf("Türkiye") }
    var cityCode by remember { mutableStateOf<String?>(null) }
    var heading by remember { mutableFloatStateOf(0f) }
    var hasHeading by remember { mutableStateOf(false) }
    var gpsText by remember { mutableStateOf("GPS bekleniyor…") }

    LaunchedEffect(location) {
        if (location == null) return@LaunchedEffect
        gpsText = "GPS ±%.0fm".format(location.accuracy)
        val admin = runCatching {
            Geocoder(context, Locale("tr", "TR"))
                .getFromLocation(location.latitude, location.longitude, 1)
                ?.firstOrNull()?.adminArea
        }.getOrNull()
        cityName = admin ?: "Türkiye"
        cityCode = CityCodes.fromName(admin)
    }

    LaunchedEffect(cityCode) {
        val code = cityCode ?: return@LaunchedEffect
        scope.launch(Dispatchers.IO) {
            val loaded = runCatching { SupabaseParcelRepository().loadParcels(code) }.getOrDefault(emptyList())
            parcels = loaded
        }
    }

    DisposableEffect(Unit) {
        val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val rotationSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
        val listener = object : SensorEventListener {
            private val rotation = FloatArray(9)
            private val orientation = FloatArray(3)
            override fun onSensorChanged(event: SensorEvent) {
                if (event.sensor.type != Sensor.TYPE_ROTATION_VECTOR) return
                SensorManager.getRotationMatrixFromVector(rotation, event.values)
                SensorManager.getOrientation(rotation, orientation)
                val raw = Math.toDegrees(orientation[0].toDouble()).toFloat()
                heading = ((raw + 360f) % 360f)
                hasHeading = true
            }
            override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit
        }
        rotationSensor?.let { sensorManager.registerListener(listener, it, SensorManager.SENSOR_DELAY_GAME) }
        onDispose { sensorManager.unregisterListener(listener) }
    }

    Box(Modifier.fillMaxSize()) {
        CameraPreview(context, lifecycleOwner)

        val targets = remember(location, parcels) {
            if (location == null) emptyList()
            else parcels
                .filter { it.status == "available" }
                .map { parcel ->
                    val bearing = GeoProjection.bearing(location.latitude, location.longitude, parcel.latitude, parcel.longitude)
                    val distance = GeoProjection.distance(location.latitude, location.longitude, parcel.latitude, parcel.longitude)
                    SkyTarget(parcel, bearing, distance, GeoProjection.skyElevation(distance))
                }
                .sortedBy { it.distance }
                .take(40)
        }

        val visible = targets.mapIndexedNotNull { index, target ->
            val delta = if (hasHeading) {
                GeoProjection.delta(target.bearing, heading.toDouble())
            } else {
                GeoProjection.previewDelta(index, targets.size)
            }
            if (hasHeading && abs(delta) > 60.0) return@mapIndexedNotNull null
            target to Pair(delta / 60.0, target.elevation)
        }.take(18)

        visible.forEach { (target, pos) ->
            val xPx = (pos.first * 420f).roundToInt()
            val yPx = (-pos.second * 5f).roundToInt()
            Box(
                Modifier.fillMaxSize().offset { IntOffset(xPx, yPx) },
                contentAlignment = Alignment.Center
            ) {
                ParcelCard(target, openPurchase)
            }
        }

        Column(
            Modifier.align(Alignment.TopCenter)
                .padding(14.dp)
                .background(Color(0xDD06111F), RoundedCornerShape(18.dp))
                .padding(horizontal = 14.dp, vertical = 11.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("GÖKYÜZÜNÜ TARA", color = Color.White, style = MaterialTheme.typography.titleMedium)
            Text("$cityName · ${parcels.size} parsel", color = Color(0xFFFFD166), style = MaterialTheme.typography.labelMedium)
            Text(
                if (location == null) "Konum bekleniyor…"
                else if (hasHeading) "$gpsText · yön aktif · ${visible.size} parsel görünür"
                else "$gpsText · pusulasız görünüm · ${visible.size} parsel görünür",
                color = Color.White.copy(alpha = .82f),
                style = MaterialTheme.typography.labelSmall
            )
        }

        if (location == null) {
            Text(
                "Konum alınamıyor.\nGPS'yi açıp tekrar deneyin.",
                color = Color.White,
                modifier = Modifier.align(Alignment.Center)
                    .background(Color(0xDD06111F), RoundedCornerShape(16.dp))
                    .padding(20.dp)
            )
        }
    }
}

@Composable
private fun ParcelCard(target: SkyTarget, openPurchase: (String) -> Unit) {
    Box(
        Modifier.size(142.dp, 86.dp)
            .background(Color(0xE0063B66), RoundedCornerShape(14.dp))
            .padding(10.dp)
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(target.parcel.parcelNumber, color = Color.White, style = MaterialTheme.typography.labelLarge)
            Text("${target.distance.roundToInt()} m · GÖKYÜZÜ PARSELİ", color = Color(0xFFFFD166), style = MaterialTheme.typography.labelSmall)
            Text(
                "BU PARSELİ SATIN AL",
                color = Color.White,
                style = MaterialTheme.typography.labelSmall,
                modifier = Modifier
                    .padding(top = 7.dp)
                    .background(Color(0xFF0B6E4F), RoundedCornerShape(8.dp))
                    .padding(horizontal = 8.dp, vertical = 5.dp)
                    .clickable { openPurchase(target.parcel.id) }
            )
        }
    }
}

@Composable
private fun CameraPreview(context: Context, lifecycleOwner: androidx.lifecycle.LifecycleOwner) {
    AndroidView(
        factory = { ctx ->
            PreviewView(ctx).apply {
                scaleType = PreviewView.ScaleType.FILL_CENTER
                post {
                    val future = ProcessCameraProvider.getInstance(ctx)
                    future.addListener({
                        val provider = future.get()
                        val preview = Preview.Builder().build()
                        preview.surfaceProvider = surfaceProvider
                        runCatching {
                            provider.unbindAll()
                            provider.bindToLifecycle(lifecycleOwner, CameraSelector.DEFAULT_BACK_CAMERA, preview)
                        }
                    }, ContextCompat.getMainExecutor(ctx))
                }
            }
        },
        modifier = Modifier.fillMaxSize()
    )
}

private object GeoProjection {
    private const val EARTH = 6378137.0

    fun distance(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val p1 = Math.toRadians(lat1)
        val p2 = Math.toRadians(lat2)
        val dp = Math.toRadians(lat2 - lat1)
        val dl = Math.toRadians(lon2 - lon1)
        val a = sin(dp / 2).pow(2) + cos(p1) * cos(p2) * sin(dl / 2).pow(2)
        return 2.0 * EARTH * atan2(sqrt(a), sqrt(1.0 - a))
    }

    fun bearing(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val p1 = Math.toRadians(lat1)
        val p2 = Math.toRadians(lat2)
        val dl = Math.toRadians(lon2 - lon1)
        val y = sin(dl) * cos(p2)
        val x = cos(p1) * sin(p2) - sin(p1) * cos(p2) * cos(dl)
        return (Math.toDegrees(atan2(y, x)) + 360.0) % 360.0
    }

    fun delta(bearing: Double, heading: Double): Double = (bearing - heading + 540.0) % 360.0 - 180.0

    fun skyElevation(distance: Double): Double = (28.0 - distance / 900.0).coerceIn(8.0, 28.0)

    fun previewDelta(index: Int, count: Int): Double {
        if (count <= 1) return 0.0
        val slots = min(count, 9)
        return -50.0 + (index % slots) * (100.0 / (slots - 1).coerceAtLeast(1))
    }
}
