package com.myskyparcel.ar

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.location.Location
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.camera.view.LifecycleCameraController
import androidx.camera.view.PreviewView
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
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
import com.google.android.gms.location.LocationServices
import kotlin.math.abs

private const val SKY_PERMISSION_REQUEST = 2001

class SkyScannerActivity : ComponentActivity(), SensorEventListener {
    private lateinit var sensorManager: SensorManager
    private val rotationMatrix = FloatArray(9)
    private val orientation = FloatArray(3)
    private var rotationVectorAvailable = false
    var azimuth by mutableFloatStateOf(0f)
        private set
    var elevation by mutableFloatStateOf(0f)
        private set
    var location by mutableStateOf<Location?>(null)
        private set

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        sensorManager = getSystemService(SENSOR_SERVICE) as SensorManager
        rotationVectorAvailable = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR) != null
        requestPermissionsIfNeeded()
        setContent { SkyScannerUi(this) }
    }

    override fun onResume() {
        super.onResume()
        val sensor = if (rotationVectorAvailable) {
            sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
        } else null
        if (sensor != null) {
            sensorManager.registerListener(this, sensor, SensorManager.SENSOR_DELAY_GAME)
        } else {
            sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)?.let {
                sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
            }
            sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)?.let {
                sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
            }
        }
        if (hasLocationPermission()) {
            LocationServices.getFusedLocationProviderClient(this).lastLocation.addOnSuccessListener { it?.let { l -> location = l } }
        }
    }

    override fun onPause() {
        sensorManager.unregisterListener(this)
        super.onPause()
    }

    override fun onSensorChanged(event: SensorEvent) {
        if (event.sensor.type == Sensor.TYPE_ROTATION_VECTOR) {
            SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values)
        } else return
        SensorManager.getOrientation(rotationMatrix, orientation)
        azimuth = ((Math.toDegrees(orientation[0].toDouble()).toFloat() + 360f) % 360f)
        elevation = (-Math.toDegrees(orientation[1].toDouble()).toFloat()).coerceIn(-90f, 90f)
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit

    private fun hasLocationPermission() = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
    private fun requestPermissionsIfNeeded() {
        val missing = arrayOf(Manifest.permission.CAMERA, Manifest.permission.ACCESS_FINE_LOCATION)
            .filter { ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED }
        if (missing.isNotEmpty()) ActivityCompat.requestPermissions(this, missing.toTypedArray(), SKY_PERMISSION_REQUEST)
    }
}

private fun shortestAngle(target: Float, current: Float): Float = ((target - current + 540f) % 360f) - 180f

@androidx.compose.runtime.Composable
private fun SkyScannerUi(activity: SkyScannerActivity) {
    var cameraGranted by remember { mutableStateOf(ContextCompat.checkSelfPermission(activity, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) }
    val parcel = remember(activity.location?.latitude) {
        SkyParcelCoordinateEngine.testParcel("GAZIANTEP")
    }
    val controller = remember(activity) {
        LifecycleCameraController(activity).apply {
            cameraSelector = androidx.camera.core.CameraSelector.DEFAULT_BACK_CAMERA
        }
    }
    DisposableEffect(controller, activity) {
        controller.bindToLifecycle(activity)
        onDispose { controller.unbind() }
    }
    Box(Modifier.fillMaxSize().background(Color.Black)) {
        if (cameraGranted) {
            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { context -> PreviewView(context).apply { scaleType = PreviewView.ScaleType.FILL_CENTER; this.controller = controller } }
            )
            SkyParcelProjection(activity.azimuth, activity.elevation, parcel) { id ->
                activity.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://myskyparcel.com/parsel-satin-al?parcels=$id")))
            }
        }
        Column(
            Modifier.align(Alignment.TopCenter).padding(16.dp)
                .background(Color(0xCC06111F), MaterialTheme.shapes.large).padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("GÖKYÜZÜNÜ TARA", color = Color.White, style = MaterialTheme.typography.titleMedium)
            Text("Sky koordinatı sabit · yönünüze göre hareket eder", color = Color(0xFF7FF7D0), style = MaterialTheme.typography.labelSmall)
            Text("Azimut %.1f° · Yükseklik %.1f°".format(activity.azimuth, activity.elevation), color = Color.White.copy(alpha = .75f), style = MaterialTheme.typography.labelSmall)
        }
        if (!cameraGranted) {
            Text("Kamera izni gerekli", color = Color.White, modifier = Modifier.align(Alignment.Center).clickable { ActivityCompat.requestPermissions(activity, arrayOf(Manifest.permission.CAMERA), SKY_PERMISSION_REQUEST) }.padding(24.dp))
        }
    }
}

@androidx.compose.runtime.Composable
private fun SkyParcelProjection(
    azimuth: Float,
    elevation: Float,
    parcel: SkyParcelCoordinate,
    onClick: (String) -> Unit,
) {
    Canvas(Modifier.fillMaxSize()) {
        val horizontalFov = 65f
        val verticalFov = horizontalFov * size.height / size.width
        val dx = shortestAngle(parcel.azimuthDeg, azimuth)
        val dy = parcel.elevationDeg - elevation
        if (abs(dx) <= horizontalFov * .62f && abs(dy) <= verticalFov * .62f) {
            val x = size.width / 2f + (dx / horizontalFov) * size.width
            val y = size.height / 2f - (dy / verticalFov) * size.height
            val radius = 34f
            drawCircle(Color(0xFF59F0D0), radius, androidx.compose.ui.geometry.Offset(x, y))
        }
    }
    Box(Modifier.fillMaxSize()) {
        val dx = shortestAngle(parcel.azimuthDeg, azimuth)
        val dy = parcel.elevationDeg - elevation
        val horizontalFov = 65f
        val verticalFov = horizontalFov * 9f / 16f
        if (abs(dx) <= horizontalFov * .62f && abs(dy) <= verticalFov * .62f) {
            val xFraction = (.5f + dx / horizontalFov).coerceIn(.05f, .95f)
            val yFraction = (.5f - dy / verticalFov).coerceIn(.08f, .92f)
            Column(
                Modifier.align(Alignment.TopStart).padding((xFraction * 1000).dp, (yFraction * 1800).dp)
                    .background(Color(0xDD06111F), MaterialTheme.shapes.large)
                    .clickable { onClick(parcel.parcelId) }.padding(10.dp)
            ) {
                Text(parcel.parcelId, color = Color.White, style = MaterialTheme.typography.labelLarge)
                Text("PARSEL #${parcel.index}", color = Color(0xFF7FF7D0), style = MaterialTheme.typography.labelSmall)
            }
        }
    }
}