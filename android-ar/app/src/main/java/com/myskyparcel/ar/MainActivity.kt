package com.myskyparcel.ar

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
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
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestRequiredPermissions()
        setContent {
            DualModeScanner(
                activity = this,
                onParcelSelected = { parcelId ->
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://myskyparcel.com/parsel-satin-al?parcels=$parcelId")))
                },
            )
        }
    }

    private fun requestRequiredPermissions() {
        val missing = arrayOf(
            Manifest.permission.CAMERA,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
        ).filter { ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED }
        if (missing.isNotEmpty()) ActivityCompat.requestPermissions(this, missing.toTypedArray(), PERMISSION_REQUEST_CODE)
    }
}

@Composable
private fun DualModeScanner(activity: MainActivity, onParcelSelected: (String) -> Unit) {
    var mode by androidx.compose.runtime.remember { mutableStateOf("checking") }

    LaunchedEffect(Unit) {
        ArCoreApk.getInstance().checkAvailabilityAsync(activity) { availability ->
            if (!availability.isSupported) {
                mode = "fallback"
            } else {
                mode = try {
                    when (ArCoreApk.getInstance().requestInstall(activity, false)) {
                        ArCoreApk.InstallStatus.INSTALLED -> "ar"
                        ArCoreApk.InstallStatus.INSTALL_REQUESTED -> "checking"
                    }
                } catch (_: Exception) {
                    "fallback"
                }
            }
        }
    }

    when (mode) {
        "ar" -> MySkyParcelArScreen(onParcelSelected)
        "fallback" -> CompatibilitySkyScreen(onParcelSelected)
        else -> LoadingScreen()
    }
}

@Composable
private fun LoadingScreen() {
    Box(Modifier.fillMaxSize().background(Color(0xFF06111F)), contentAlignment = Alignment.Center) {
        Text("Gökyüzünü Tara hazırlanıyor…", color = Color.White)
    }
}

@Composable
private fun CompatibilitySkyScreen(onParcelSelected: (String) -> Unit) {
    val parcels = listOf("MSP-AR-001" to 199, "MSP-AR-002" to 499, "MSP-AR-003" to 999)
    Box(Modifier.fillMaxSize().background(Color(0xFF06111F))) {
        Column(
            modifier = Modifier.align(Alignment.Center).padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text("GÖKYÜZÜNÜ TARA", color = Color.White, style = MaterialTheme.typography.headlineSmall)
            Text("ARCore desteklenmiyor. Uyumlu tarama modu aktif.", color = Color(0xFFFFD166))
            Text("Bu mod, ARCore gerektirmeden gökyüzü parsellerini görüntülemek ve seçmek için hazırlanmıştır.", color = Color.White.copy(alpha = 0.8f))
            parcels.forEach { (id, price) ->
                Text(
                    "$id · $price TL",
                    color = Color(0xFF7FF7D0),
                    modifier = Modifier
                        .background(Color(0xCC10243A), MaterialTheme.shapes.medium)
                        .clickable { onParcelSelected(id) }
                        .padding(horizontal = 20.dp, vertical = 12.dp),
                )
            }
        }
    }
}

@Composable
private fun MySkyParcelArScreen(onParcelSelected: (String) -> Unit) {
    val engine = rememberEngine()
    val materialLoader = rememberMaterialLoader(engine)
    val parcels = androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateListOf<TestParcel>() }
    var latestEarthTracking by androidx.compose.runtime.remember { mutableStateOf(false) }
    var latestLocation by androidx.compose.runtime.remember { mutableStateOf("Konum bekleniyor") }
    var placed by androidx.compose.runtime.remember { mutableStateOf(false) }

    val parcelMaterial = androidx.compose.runtime.remember(materialLoader) {
        materialLoader.createColorInstance(color = Color(0.03f, 0.85f, 0.95f, 0.92f), metallic = 0.15f, roughness = 0.35f)
    }

    ARSceneView(
        modifier = Modifier.fillMaxSize(),
        engine = engine,
        materialLoader = materialLoader,
        planeRenderer = false,
        depthMode = Config.DepthMode.AUTOMATIC,
        sessionConfiguration = { session, config ->
            if (session.isGeospatialModeSupported(Config.GeospatialMode.ENABLED)) config.geospatialMode = Config.GeospatialMode.ENABLED
            config.lightEstimationMode = Config.LightEstimationMode.ENVIRONMENTAL_HDR
        },
        onSessionUpdated = { session, _ ->
            val earth = session.earth
            latestEarthTracking = earth?.trackingState == TrackingState.TRACKING
            if (latestEarthTracking && earth != null) {
                val pose = earth.cameraGeospatialPose
                latestLocation = "%.6f, %.6f · ±%.1fm".format(pose.latitude, pose.longitude, pose.horizontalAccuracy)
                if (!placed) {
                    placed = true
                    val definitions = listOf(
                        Triple("MSP-AR-001", 0.00000 to 0.00010, 199),
                        Triple("MSP-AR-002", 0.00008 to 0.00004, 499),
                        Triple("MSP-AR-003", -0.00007 to -0.00006, 999),
                    )
                    definitions.forEachIndexed { index, (id, offset, price) ->
                        val anchor = runCatching {
                            earth.createAnchor(pose.latitude + offset.first, pose.longitude + offset.second, pose.altitude + 18.0 + index * 3.0, 0f, 0f, 0f, 1f)
                        }.getOrNull()
                        if (anchor != null) parcels += TestParcel(id, "MySkyParcel ${id.removePrefix("MSP-AR-")}", price, anchor)
                    }
                }
            }
        },
        onSessionFailed = { latestEarthTracking = false },
        onGestureListener = rememberOnGestureListener(onSingleTapConfirmed = { _, node -> node?.name?.let(onParcelSelected) }),
    ) {
        parcels.forEach { parcel ->
            androidx.compose.runtime.key(parcel.id) {
                AnchorNode(anchor = parcel.anchor) {
                    PlaneNode(size = Size(x = 1.4f, y = 1.0f), normal = Direction(z = 1f), materialInstance = parcelMaterial, rotation = Rotation(y = 180f), apply = { name = parcel.id })
                    TextNode(text = "${parcel.title}  ${parcel.price} TL", fontSize = 48f, textColor = android.graphics.Color.WHITE, backgroundColor = 0xCC06111F.toInt(), widthMeters = 1.4f, heightMeters = 0.22f, position = Position(y = 0.72f), apply = { name = parcel.id })
                }
            }
        }
    }

    Box(Modifier.fillMaxSize().padding(16.dp)) {
        Column(
            modifier = Modifier.align(Alignment.TopCenter).background(Color(0xCC06111F), MaterialTheme.shapes.large).padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text("GÖKYÜZÜNÜ TARA · AR", color = Color.White, style = MaterialTheme.typography.titleMedium)
            Text(if (latestEarthTracking) "AR konumu hazır · Parsellere dokun" else "AR konumu hazırlanıyor…", color = if (latestEarthTracking) Color(0xFF7FF7D0) else Color(0xFFFFD166), style = MaterialTheme.typography.bodySmall)
            Text(latestLocation, color = Color.White.copy(alpha = 0.7f), style = MaterialTheme.typography.labelSmall)
        }
    }
}
