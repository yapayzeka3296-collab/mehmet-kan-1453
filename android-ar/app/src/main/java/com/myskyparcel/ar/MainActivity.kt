package com.myskyparcel.ar

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.camera.view.CameraController
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
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

private const val PERMISSION_REQUEST_CODE = 1001

private data class TestParcel(val id: String, val title: String, val price: Int, val anchor: Anchor)

class MainActivity : ComponentActivity() {
    private var cameraPermissionGranted by mutableStateOf(false)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        cameraPermissionGranted = hasCameraPermission()
        requestRequiredPermissions()

        setContent {
            DualModeScanner(
                activity = this,
                cameraPermissionGranted = cameraPermissionGranted,
                onRequestCameraPermission = { requestCameraPermission() },
                onParcelSelected = { parcelId ->
                    startActivity(
                        Intent(
                            Intent.ACTION_VIEW,
                            Uri.parse("https://myskyparcel.com/parsel-satin-al?parcels=$parcelId"),
                        ),
                    )
                },
            )
        }
    }

    private fun hasCameraPermission(): Boolean =
        ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED

    private fun requestCameraPermission() {
        if (!hasCameraPermission()) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.CAMERA),
                PERMISSION_REQUEST_CODE,
            )
        }
    }

    private fun requestRequiredPermissions() {
        val missing = arrayOf(
            Manifest.permission.CAMERA,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
        ).filter { ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED }

        if (missing.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, missing.toTypedArray(), PERMISSION_REQUEST_CODE)
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray,
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSION_REQUEST_CODE) {
            cameraPermissionGranted = hasCameraPermission()
        }
    }
}

@Composable
private fun DualModeScanner(
    activity: MainActivity,
    cameraPermissionGranted: Boolean,
    onRequestCameraPermission: () -> Unit,
    onParcelSelected: (String) -> Unit,
) {
    // IMPORTANT: the non-AR camera is the initial screen. ARCore must never
    // block the camera from opening on unsupported devices.
    var mode by remember { mutableStateOf("fallback") }

    fun checkArCore() {
        if (!cameraPermissionGranted) return

        ArCoreApk.getInstance().checkAvailabilityAsync(activity) { availability ->
            if (!availability.isSupported) {
                mode = "fallback"
                return@checkAvailabilityAsync
            }

            mode = "fallback"
            try {
                when (ArCoreApk.getInstance().requestInstall(activity, false)) {
                    ArCoreApk.InstallStatus.INSTALLED -> mode = "ar"
                    ArCoreApk.InstallStatus.INSTALL_REQUESTED -> mode = "fallback"
                }
            } catch (_: Exception) {
                // AR is optional. Any ARCore failure falls back to CameraX.
                mode = "fallback"
            }
        }
    }

    DisposableEffect(activity, cameraPermissionGranted) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME && cameraPermissionGranted) {
                checkArCore()
            }
        }
        activity.lifecycle.addObserver(observer)
        onDispose { activity.lifecycle.removeObserver(observer) }
    }

    LaunchedEffect(cameraPermissionGranted) {
        if (cameraPermissionGranted) checkArCore()
    }

    when (mode) {
        "ar" -> MySkyParcelArScreen(onParcelSelected)
        else -> CompatibilitySkyScreen(
            cameraPermissionGranted = cameraPermissionGranted,
            onRequestCameraPermission = onRequestCameraPermission,
            onParcelSelected = onParcelSelected,
        )
    }
}

@Composable
private fun CompatibilitySkyScreen(
    cameraPermissionGranted: Boolean,
    onRequestCameraPermission: () -> Unit,
    onParcelSelected: (String) -> Unit,
) {
    val activity = LocalContext.current as MainActivity
    val parcels = listOf("MSP-AR-001" to 199, "MSP-AR-002" to 499, "MSP-AR-003" to 999)

    Box(Modifier.fillMaxSize().background(Color.Black)) {
        if (cameraPermissionGranted) {
            CameraPreview(activity)
        }

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Transparent)
                .padding(16.dp),
        ) {
            Column(
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .background(Color(0xCC06111F), MaterialTheme.shapes.large)
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text("GÖKYÜZÜNÜ TARA", color = Color.White, style = MaterialTheme.typography.titleMedium)
                Text("Kamera aktif · Uyumlu tarama modu", color = Color(0xFF7FF7D0), style = MaterialTheme.typography.bodySmall)
                Text("ARCore bu cihazda zorunlu değil; kamera ve konum ile devam ediliyor.", color = Color.White.copy(alpha = 0.78f), style = MaterialTheme.typography.labelSmall)
            }

            if (!cameraPermissionGranted) {
                Column(
                    modifier = Modifier
                        .align(Alignment.Center)
                        .background(Color(0xEE06111F), MaterialTheme.shapes.large)
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Text("Kamera izni gerekli", color = Color.White, style = MaterialTheme.typography.titleMedium)
                    Text("Gökyüzünü Tara için arka kamera kullanılacak.", color = Color.White.copy(alpha = 0.8f))
                    Button(onClick = onRequestCameraPermission) { Text("Kameraya izin ver") }
                }
            }

            Column(
                modifier = Modifier.align(Alignment.BottomCenter),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                parcels.forEach { (id, price) ->
                    Text(
                        "$id · $price TL",
                        color = Color(0xFF7FF7D0),
                        modifier = Modifier
                            .background(Color(0xE610243A), MaterialTheme.shapes.medium)
                            .clickable { onParcelSelected(id) }
                            .padding(horizontal = 20.dp, vertical = 12.dp),
                    )
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
            // The fallback only needs a live preview. Disabling the extra use
            // cases makes this path lighter on entry-level devices.
            setEnabledUseCases(0)
        }
    }

    DisposableEffect(controller, activity) {
        controller.bindToLifecycle(activity)
        onDispose { controller.unbind() }
    }

    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { context ->
            PreviewView(context).apply {
                scaleType = PreviewView.ScaleType.FILL_CENTER
                this.controller = controller
            }
        },
    )
}

@Composable
private fun MySkyParcelArScreen(onParcelSelected: (String) -> Unit) {
    val engine = rememberEngine()
    val materialLoader = rememberMaterialLoader(engine)
    val parcels = androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateListOf<TestParcel>() }
    var latestEarthTracking by remember { mutableStateOf(false) }
    var latestLocation by remember { mutableStateOf("Konum bekleniyor") }
    var placed by remember { mutableStateOf(false) }

    val parcelMaterial = remember(materialLoader) {
        materialLoader.createColorInstance(
            color = Color(0.03f, 0.85f, 0.95f, 0.92f),
            metallic = 0.15f,
            roughness = 0.35f,
        )
    }

    ARSceneView(
        modifier = Modifier.fillMaxSize(),
        engine = engine,
        materialLoader = materialLoader,
        planeRenderer = false,
        depthMode = Config.DepthMode.AUTOMATIC,
        sessionConfiguration = { session, config ->
            if (session.isGeospatialModeSupported(Config.GeospatialMode.ENABLED)) {
                config.geospatialMode = Config.GeospatialMode.ENABLED
            }
            config.lightEstimationMode = Config.LightEstimationMode.ENVIRONMENTAL_HDR
        },
        onSessionUpdated = { session, _ ->
            val earth = session.earth
            latestEarthTracking = earth?.trackingState == TrackingState.TRACKING
            if (latestEarthTracking && earth != null) {
                val pose = earth.cameraGeospatialPose
                latestLocation = "%.6f, %.6f · ±%.1fm".format(
                    pose.latitude,
                    pose.longitude,
                    pose.horizontalAccuracy,
                )
                if (!placed) {
                    placed = true
                    val definitions = listOf(
                        Triple("MSP-AR-001", 0.00000 to 0.00010, 199),
                        Triple("MSP-AR-002", 0.00008 to 0.00004, 499),
                        Triple("MSP-AR-003", -0.00007 to -0.00006, 999),
                    )
                    definitions.forEachIndexed { index, (id, offset, price) ->
                        val anchor = runCatching {
                            earth.createAnchor(
                                pose.latitude + offset.first,
                                pose.longitude + offset.second,
                                pose.altitude + 18.0 + index * 3.0,
                                0f,
                                0f,
                                0f,
                                1f,
                            )
                        }.getOrNull()
                        if (anchor != null) {
                            parcels += TestParcel(
                                id,
                                "MySkyParcel ${id.removePrefix("MSP-AR-")}",
                                price,
                                anchor,
                            )
                        }
                    }
                }
            }
        },
        onSessionFailed = { latestEarthTracking = false },
        onGestureListener = rememberOnGestureListener(
            onSingleTapConfirmed = { _, node -> node?.name?.let(onParcelSelected) },
        ),
    ) {
        parcels.forEach { parcel ->
            androidx.compose.runtime.key(parcel.id) {
                AnchorNode(anchor = parcel.anchor) {
                    PlaneNode(
                        size = Size(x = 1.4f, y = 1.0f),
                        normal = Direction(z = 1f),
                        materialInstance = parcelMaterial,
                        rotation = Rotation(y = 180f),
                        apply = { name = parcel.id },
                    )
                    TextNode(
                        text = "${parcel.title}  ${parcel.price} TL",
                        fontSize = 48f,
                        textColor = android.graphics.Color.WHITE,
                        backgroundColor = 0xCC06111F.toInt(),
                        widthMeters = 1.4f,
                        heightMeters = 0.22f,
                        position = Position(y = 0.72f),
                        apply = { name = parcel.id },
                    )
                }
            }
        }
    }

    Box(Modifier.fillMaxSize().padding(16.dp)) {
        Column(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .background(Color(0xCC06111F), MaterialTheme.shapes.large)
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text("GÖKYÜZÜNÜ TARA · AR", color = Color.White, style = MaterialTheme.typography.titleMedium)
            Text(
                if (latestEarthTracking) "AR konumu hazır · Parsellere dokun" else "AR konumu hazırlanıyor…",
                color = if (latestEarthTracking) Color(0xFF7FF7D0) else Color(0xFFFFD166),
                style = MaterialTheme.typography.bodySmall,
            )
            Text(latestLocation, color = Color.White.copy(alpha = 0.7f), style = MaterialTheme.typography.labelSmall)
        }
    }
}
