package com.myskyparcel.ar

import android.content.Intent
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
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.google.ar.core.Anchor
import com.google.ar.core.Config
import com.google.ar.core.TrackingState
import io.github.sceneview.ar.ARSceneView
import io.github.sceneview.ar.node.AnchorNode
import io.github.sceneview.math.Direction
import io.github.sceneview.math.Position
import io.github.sceneview.math.Size
import io.github.sceneview.math.Rotation
import io.github.sceneview.node.BillboardNode
import io.github.sceneview.node.PlaneNode
import io.github.sceneview.node.TextNode
import io.github.sceneview.rememberEngine
import io.github.sceneview.rememberMaterialLoader
import io.github.sceneview.rememberOnGestureListener

private data class TestParcel(
    val id: String,
    val title: String,
    val price: Int,
    val anchor: Anchor,
)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MySkyParcelArScreen(
                onParcelSelected = { parcelId ->
                    val uri = Uri.parse("https://myskyparcel.com/parsel-satin-al?parcels=$parcelId")
                    startActivity(Intent(Intent.ACTION_VIEW, uri))
                },
            )
        }
    }
}

@Composable
private fun MySkyParcelArScreen(
    onParcelSelected: (String) -> Unit,
) {
    val engine = rememberEngine()
    val materialLoader = io.github.sceneview.rememberMaterialLoader(engine)
    val parcels = remember { mutableStateListOf<TestParcel>() }
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
        geospatialMode = Config.GeospatialMode.ENABLED,
        sessionConfiguration = { _, config ->
            config.lightEstimationMode = Config.LightEstimationMode.ENVIRONMENTAL_HDR
        },
        onSessionUpdated = { session, _ ->
            val earth = session.earth
            val isTracking = earth?.trackingState == TrackingState.TRACKING
            latestEarthTracking = isTracking

            if (isTracking && earth != null) {
                val pose = earth.cameraGeospatialPose
                latestLocation = "%.6f, %.6f · ±%.1fm".format(
                    pose.latitude,
                    pose.longitude,
                    pose.horizontalAccuracy,
                )

                if (!placed) {
                    placed = true
                    val baseLat = pose.latitude
                    val baseLng = pose.longitude
                    val baseAlt = pose.altitude + 18.0

                    val definitions = listOf(
                        Triple("MSP-AR-001", 0.00000 to 0.00010, 199),
                        Triple("MSP-AR-002", 0.00008 to 0.00004, 499),
                        Triple("MSP-AR-003", -0.00007 to -0.00006, 999),
                    )

                    definitions.forEachIndexed { index, (id, offset, price) ->
                        val anchor = runCatching {
                            earth.createAnchor(
                                baseLat + offset.first,
                                baseLng + offset.second,
                                baseAlt + index * 3.0,
                                0f,
                                0f,
                                0f,
                                1f,
                            )
                        }.getOrNull()

                        if (anchor != null) {
                            parcels += TestParcel(
                                id = id,
                                title = "MySkyParcel ${id.removePrefix("MSP-AR-")}",
                                price = price,
                                anchor = anchor,
                            )
                        }
                    }
                }
            }
        },
        onSessionFailed = {
            latestEarthTracking = false
        },
        onGestureListener = rememberOnGestureListener(
            onSingleTapConfirmed = { _, node ->
                node?.name?.let(onParcelSelected)
            },
        ),
    ) {
        parcels.forEach { parcel ->
            key(parcel.id) {
                AnchorNode(anchor = parcel.anchor) {
                    PlaneNode(
                        size = Size(x = 1.4f, y = 1.0f),
                        normal = Direction(z = 1f),
                        materialInstance = parcelMaterial,
                        rotation = Rotation(y = 180f),
                        apply = { name = parcel.id },
                    )
                    BillboardNode(position = Position(y = 0.72f)) {
                        TextNode(
                            text = "${parcel.title}\n${parcel.price} TL",
                            size = 0.12f,
                            materialInstance = materialLoader.createColorInstance(
                                color = Color.White,
                                unlit = true,
                            ),
                            apply = { name = parcel.id },
                        )
                    }
                }
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
    ) {
        Column(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .background(Color(0xCC06111F), MaterialTheme.shapes.large)
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Text(
                text = "GÖKYÜZÜNÜ TARA · AR",
                color = Color.White,
                style = MaterialTheme.typography.titleMedium,
            )
            Text(
                text = if (latestEarthTracking) "AR konumu hazır · Parsellere dokun" else "AR konumu hazırlanıyor…",
                color = if (latestEarthTracking) Color(0xFF7FF7D0) else Color(0xFFFFD166),
                style = MaterialTheme.typography.bodySmall,
            )
            Text(
                text = latestLocation,
                color = Color.White.copy(alpha = 0.7f),
                style = MaterialTheme.typography.labelSmall,
            )
        }
    }
}
