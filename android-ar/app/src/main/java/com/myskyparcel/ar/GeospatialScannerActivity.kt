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
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.StrokeCap
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.camera.core.CameraSelector
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.ui.viewinterop.AndroidView
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
import kotlin.math.*

private const val REQUEST_PERMISSIONS = 2001

class GeospatialScannerActivity : ComponentActivity() {
    private val locationClient by lazy { LocationServices.getFusedLocationProviderClient(this) }
    private var location by mutableStateOf<Location?>(null)
    private var cameraGranted by mutableStateOf(false)
    private val callback = object : LocationCallback() { override fun onLocationResult(result: LocationResult) { result.lastLocation?.let { location = it } } }
    override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState); cameraGranted = has(Manifest.permission.CAMERA); requestPermissionsIfNeeded(); setContent { ScannerRoot(this, location, cameraGranted, ::requestPermissionsIfNeeded, ::openPurchase) } }
    override fun onResume() { super.onResume(); if (!hasLocation()) return; locationClient.lastLocation.addOnSuccessListener { it?.let { location = it } }; locationClient.requestLocationUpdates(LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 1000L).setMinUpdateIntervalMillis(500L).build(), callback, mainLooper) }
    override fun onPause() { locationClient.removeLocationUpdates(callback); super.onPause() }
    override fun onRequestPermissionsResult(r: Int, p: Array<String>, g: IntArray) { super.onRequestPermissionsResult(r,p,g); if (r == REQUEST_PERMISSIONS) { cameraGranted = has(Manifest.permission.CAMERA); if (hasLocation()) locationClient.lastLocation.addOnSuccessListener { it?.let { location = it } } } }
    private fun has(p: String) = ContextCompat.checkSelfPermission(this,p) == PackageManager.PERMISSION_GRANTED
    private fun hasLocation() = has(Manifest.permission.ACCESS_FINE_LOCATION) || has(Manifest.permission.ACCESS_COARSE_LOCATION)
    private fun requestPermissionsIfNeeded() { val missing=buildList { if(!has(Manifest.permission.CAMERA)) add(Manifest.permission.CAMERA); if(!hasLocation()) add(Manifest.permission.ACCESS_FINE_LOCATION) }; if(missing.isNotEmpty()) ActivityCompat.requestPermissions(this,missing.toTypedArray(),REQUEST_PERMISSIONS) }
    private fun openPurchase(id:String)=startActivity(Intent(Intent.ACTION_VIEW,Uri.parse("https://myskyparcel.com/parsel-satin-al?parcels=$id")))
}

@Composable private fun ScannerRoot(a:GeospatialScannerActivity,location:Location?,cameraGranted:Boolean,request:()->Unit,select:(String)->Unit){
    var mode by remember{mutableStateOf("checking")}; var cityCode by remember{mutableStateOf<String?>(null)}; var cityName by remember{mutableStateOf("TÜRKİYE")}
    LaunchedEffect(location){location?.let{loc->val n=runCatching{Geocoder(a,Locale("tr","TR")).getFromLocation(loc.latitude,loc.longitude,1)?.firstOrNull()?.adminArea}.getOrNull();cityName=n?:"TÜRKİYE";cityCode=CityCodes.fromName(n)}}
    DisposableEffect(cameraGranted){if(cameraGranted)ArCoreApk.getInstance().checkAvailabilityAsync(a){av->if(!av.isSupported)mode="fallback" else mode=try{when(ArCoreApk.getInstance().requestInstall(a,false)){ArCoreApk.InstallStatus.INSTALLED->"ar";ArCoreApk.InstallStatus.INSTALL_REQUESTED->"installing"}}catch(_:Exception){"fallback"}};onDispose{}}
    when(mode){"ar"->ParcelScene(cityCode,cityName,select);"installing"->Status("Google Play Services for AR hazırlanıyor…");"fallback"->FallbackSkyScene(a,location,cityCode,cityName,select);else->Permission(cameraGranted,request)}
}

@Composable private fun ParcelScene(cityCode:String?,cityName:String,select:(String)->Unit){
    val engine=rememberEngine();val viewManager=rememberViewNodeManager();val repo=remember{SupabaseParcelRepository()};val placed=remember{mutableStateListOf<PlacedParcel>()}
    var parcels by remember{mutableStateOf<List<ArParcel>>(emptyList())};var loaded by remember{mutableStateOf(false)};var created by remember{mutableStateOf(false)};var tracking by remember{mutableStateOf(false)};var status by remember{mutableStateOf("VPS konumu bekleniyor…")}
    LaunchedEffect(cityCode){loaded=false;created=false;placed.forEach{it.anchor.detach()};placed.clear();parcels=cityCode?.let{repo.loadParcels(it)}?:emptyList();loaded=true}
    Box(Modifier.fillMaxSize()){
        ARSceneView(modifier=Modifier.fillMaxSize(),engine=engine,planeRenderer=false,viewNodeWindowManager=viewManager,
            sessionConfiguration={s,c->if(s.isGeospatialModeSupported(Config.GeospatialMode.ENABLED))c.geospatialMode=Config.GeospatialMode.ENABLED;c.lightEstimationMode=Config.LightEstimationMode.ENVIRONMENTAL_HDR;c.depthMode=if(s.isDepthModeSupported(Config.DepthMode.AUTOMATIC))Config.DepthMode.AUTOMATIC else Config.DepthMode.DISABLED},
            onSessionUpdated={session,_->val earth=session.earth;tracking=earth?.trackingState==TrackingState.TRACKING;if(!tracking||earth==null)status="VPS konumu bekleniyor…" else {val p=earth.cameraGeospatialPose;status="GPS ±%.1fm · Yön ±%.1f°".format(p.horizontalAccuracy,p.orientationYawAccuracy);val avail=parcels.filter{it.status=="available"};if(loaded&&avail.size>=3&&!created&&p.horizontalAccuracy<=30&&p.verticalAccuracy<=30&&p.orientationYawAccuracy<=30){listOf(1000.0,1500.0,2000.0).forEachIndexed{i,d->{val q=GeoMath.destination(p.latitude,p.longitude,p.altitude,i*120.0,20.0,d);runCatching{earth.createAnchor(q.latitude,q.longitude,q.altitude,0f,0f,0f,1f)}.getOrNull()?.let{placed+=PlacedParcel(avail[i].copy(isTest=true),it)}}};avail.drop(3).sortedBy{GeoMath.distance(p.latitude,p.longitude,it.latitude,it.longitude)}.filter{GeoMath.distance(p.latitude,p.longitude,it.latitude,it.longitude)<=10000}.take(6).forEach{parcel->runCatching{earth.createAnchor(parcel.latitude,parcel.longitude,p.altitude+150,0f,0f,0f,1f)}.getOrNull()?.let{placed+=PlacedParcel(parcel,it)}};parcels.filter{it.status=="sold"}.sortedBy{GeoMath.distance(p.latitude,p.longitude,it.latitude,it.longitude)}.filter{GeoMath.distance(p.latitude,p.longitude,it.latitude,it.longitude)<=10000}.take(3).forEach{parcel->runCatching{earth.createAnchor(parcel.latitude,parcel.longitude,p.altitude+150,0f,0f,0f,1f)}.getOrNull()?.let{placed+=PlacedParcel(parcel,it)}};created=true}}},
            onGestureListener=rememberOnGestureListener(onSingleTapConfirmed={_,node->node?.name?.takeIf{it.isNotBlank()}?.let(select)})
        ){placed.forEach{item->key(item.parcel.id){AnchorNode(anchor=item.anchor){val sold=item.parcel.status=="sold";ViewNode(windowManager=viewManager,unlit=true,apply={name=if(sold)null else item.parcel.id;isTouchable=!sold}){Column(Modifier.background(if(item.parcel.isTest)Color(0xDDFF8A00)else if(sold)Color(0xDD6B1F2B)else Color(0xDD06111F),MaterialTheme.shapes.large).padding(horizontal=12.dp,vertical=8.dp),horizontalAlignment=Alignment.CenterHorizontally){Text(if(item.parcel.isTest)"TEST · ${item.parcel.parcelNumber}"else if(sold)"SATILDI · ${item.parcel.parcelNumber}"else item.parcel.parcelNumber,color=Color.White,style=MaterialTheme.typography.labelLarge);if(!sold)Text("Satın almak için dokun",color=Color(0xFFFFD166),style=MaterialTheme.typography.labelSmall)}}}}}}
        Column(Modifier.align(Alignment.TopCenter).padding(14.dp).background(Color(0xDD06111F),MaterialTheme.shapes.large).padding(12.dp),horizontalAlignment=Alignment.CenterHorizontally,verticalArrangement=Arrangement.spacedBy(3.dp)){Text("GÖKYÜZÜNÜ TARA",color=Color.White,style=MaterialTheme.typography.titleMedium);Text("$cityName · GERÇEK PARSELLER",color=Color(0xFF7FF7D0),style=MaterialTheme.typography.labelMedium);Text(if(tracking)status else "GPS + VPS konumu hazırlanıyor…",color=Color.White.copy(alpha=.82f),style=MaterialTheme.typography.labelSmall);Text("${parcels.count{it.status=="available"}} boş · ${parcels.count{it.status=="sold"}} satıldı · ${placed.size} AR noktası",color=Color.White.copy(alpha=.7f),style=MaterialTheme.typography.labelSmall)}
    }
}

@Composable private fun FallbackSkyScene(a:GeospatialScannerActivity,location:Location?,cityCode:String?,cityName:String,select:(String)->Unit){
    val context=LocalContext.current
    val lifecycleOwner=LocalLifecycleOwner.current
    var heading by remember{mutableFloatStateOf(0f)}
    var pitch by remember{mutableFloatStateOf(0f)}
    var hasHeading by remember{mutableStateOf(false)}
    var parcels by remember{mutableStateOf<List<ArParcel>>(emptyList())}
    var status by remember{mutableStateOf("GPS konumu bekleniyor…")}
    LaunchedEffect(cityCode){parcels=cityCode?.let{SupabaseParcelRepository().loadParcels(it)}?:emptyList()}
    DisposableEffect(Unit){
        val sm=context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val listener=object:SensorEventListener{
            private val rotation=FloatArray(9);private val orientation=FloatArray(3)
            override fun onSensorChanged(e:SensorEvent){if(e.sensor.type!=Sensor.TYPE_ROTATION_VECTOR)return;SensorManager.getRotationMatrixFromVector(rotation,e.values);SensorManager.getOrientation(rotation,orientation);heading=((Math.toDegrees(orientation[0].toDouble())+360.0)%360.0).toFloat();pitch=Math.toDegrees(orientation[1].toDouble()).toFloat();hasHeading=true}
            override fun onAccuracyChanged(s:Sensor?,accuracy:Int){}
        }
        val sensor=sm.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
        if(sensor!=null){sm.registerListener(listener,sensor,SensorManager.SENSOR_DELAY_GAME)}
        onDispose{sm.unregisterListener(listener)}
    }
    LaunchedEffect(location,hasHeading,parcels.size){status=when{location==null->"GPS konumu bekleniyor…";hasHeading->"GPS + yön sensörü aktif";else->"Pusula yok · parseller pusulasız önizleme modunda"}}
    Box(Modifier.fillMaxSize()){
        CameraPreview(context,lifecycleOwner)
        SkyParcelOverlay(location,heading,pitch,hasHeading,parcels,select)
        Column(Modifier.padding(14.dp).background(Color(0xDD06111F),MaterialTheme.shapes.large).padding(12.dp),horizontalAlignment=Alignment.CenterHorizontally,verticalArrangement=Arrangement.spacedBy(3.dp)){Text("GÖKYÜZÜNÜ TARA",color=Color.White,style=MaterialTheme.typography.titleMedium);Text("$cityName · 3B SKY MODE",color=Color(0xFFFFD166),style=MaterialTheme.typography.labelMedium);Text(status,color=Color.White.copy(alpha=.82f),style=MaterialTheme.typography.labelSmall);Text(if(hasHeading)"GPS + cihaz yönü · gerçek yönlendirme"else"GPS aktif · pusulasız görünüm · yön yaklaşık",color=Color.White.copy(alpha=.7f),style=MaterialTheme.typography.labelSmall)}
        if(location==null) Text("Konum bekleniyor…",color=Color.White,modifier=Modifier.align(Alignment.Center).background(Color(0xCC000000)).padding(16.dp))
    }
}

@Composable private fun CameraPreview(context:Context,lifecycleOwner:androidx.lifecycle.LifecycleOwner){AndroidView(factory={ctx->PreviewView(ctx).apply{scaleType=PreviewView.ScaleType.FILL_CENTER;post{val providerFuture=ProcessCameraProvider.getInstance(ctx);providerFuture.addListener({val provider=providerFuture.get();val preview=Preview.Builder().build().also{it.surfaceProvider=surfaceProvider};runCatching{provider.unbindAll();provider.bindToLifecycle(lifecycleOwner,CameraSelector.DEFAULT_BACK_CAMERA,preview)}},ContextCompat.getMainExecutor(ctx))}}},modifier=Modifier.fillMaxSize())}

@Composable private fun SkyParcelOverlay(location:Location?,heading:Float,pitch:Float,hasHeading:Boolean,parcels:List<ArParcel>,select:(String)->Unit){
    val available=parcels.filter{it.status=="available"}.take(24);val sold=parcels.filter{it.status=="sold"}.take(8);val targets=available+sold
    Box(Modifier.fillMaxSize()){
        Canvas(Modifier.fillMaxSize()){targets.forEachIndexed{index,parcel->val distance=GeoMath.distance(location?.latitude?:0.0,location?.longitude?:0.0,parcel.latitude,parcel.longitude);val elevation=GeoMath.elevationAngle(location,parcel);if(hasHeading){val dx=GeoMath.signedBearingDelta(GeoMath.bearing(location?.latitude?:0.0,location?.longitude?:0.0,parcel.latitude,parcel.longitude),heading);if(abs(dx)<=55&&elevation in -45.0..55.0){drawSkyParcel(parcel,dx.toFloat(),elevation.toFloat(),distance)}}else{val dx=GeoMath.previewDelta(index,targets.size);val previewElevation=18.0+(index%5)*7.0;drawSkyParcel(parcel,dx,previewElevation,distance)}}}
        Column(Modifier.align(Alignment.BottomCenter).padding(bottom=24.dp).background(Color(0xCC06111F),MaterialTheme.shapes.large).padding(10.dp)){Text(if(hasHeading)"Telefonu sağa/sola çevir · parseli nişanla · dokun"else"Pusula olmadan da parseller gösteriliyor · yön yaklaşık",color=Color.White,style=MaterialTheme.typography.labelMedium)}
    }
}

private fun DrawScope.drawSkyParcel(parcel:ArParcel,delta:Float,elevation:Float,distance:Double){val w=size.width;val h=size.height;val x=w/2f+(delta/55f)*(w*.44f);val y=h*.48f-(elevation/55f)*(h*.38f);val scale=(420.0/(distance.coerceAtLeast(250.0))).coerceIn(.32,2.4).toFloat();val pw=120f*scale;val ph=72f*scale;val z=14f*scale;val path=Path().apply{moveTo(x-pw/2,y-ph/2);lineTo(x+pw/2,y-ph/2-z);lineTo(x+pw/2,y+ph/2-z);lineTo(x-pw/2,y+ph/2);close()};drawPath(path,color=if(parcel.status=="sold")Color(0xCC8B2635)else Color(0xCC063B66));drawLine(color=Color(0xFFFFD166),start=androidx.compose.ui.geometry.Offset(x-pw/2,y+ph/2),end=androidx.compose.ui.geometry.Offset(x+pw/2,y+ph/2-z),strokeWidth=2f,cap=StrokeCap.Butt);val label=if(parcel.status=="sold")"SATILDI"else parcel.parcelNumber;drawContext.canvas.nativeCanvas.drawText(label,x-pw*.42f,y+4f,android.graphics.Paint().apply{color=android.graphics.Color.WHITE;textSize=(18f*scale).coerceAtLeast(12f);isFakeBoldText=true})}

private object GeoMath{private const val R=6378137.0;data class Destination(val latitude:Double,val longitude:Double,val altitude:Double);fun destination(lat:Double,lon:Double,alt:Double,bearingDeg:Double,elevationDeg:Double,slant:Double):Destination{val b=Math.toRadians(bearingDeg);val e=Math.toRadians(elevationDeg);val h=slant*cos(e);return Destination(lat+Math.toDegrees(h*cos(b)/R),lon+Math.toDegrees(h*sin(b)/(R*cos(Math.toRadians(lat)))),alt+slant*sin(e))};fun distance(a:Double,b:Double,c:Double,d:Double):Double{val p1=Math.toRadians(a);val p2=Math.toRadians(c);val dp=Math.toRadians(c-a);val dl=Math.toRadians(d-b);val x=sin(dp/2).pow(2)+cos(p1)*cos(p2)*sin(dl/2).pow(2);return 2*R*atan2(sqrt(x),sqrt(1-x))};fun bearing(a:Double,b:Double,c:Double,d:Double):Double{val p1=Math.toRadians(a);val p2=Math.toRadians(c);val dl=Math.toRadians(d-b);return (Math.toDegrees(atan2(sin(dl)*cos(p2),cos(p1)*sin(p2)-sin(p1)*cos(p2)*cos(dl)))+360)%360};fun signedBearingDelta(target:Double,heading:Float):Double{var d=target-heading;while(d>180)d-=360;while(d< -180)d+=360;return d};fun previewDelta(index:Int,total:Int):Float{if(total<=1)return 0f;val spread=min(50f,18f+(total-1)*2.2f);return -spread+(index.toFloat()/(total-1).coerceAtLeast(1))*spread*2f};fun elevationAngle(loc:Location?,parcel:ArParcel):Double{if(loc==null)return 0.0;val ground=distance(loc.latitude,loc.longitude,parcel.latitude,parcel.longitude);val dh=150.0;return Math.toDegrees(atan2(dh,ground.coerceAtLeast(1.0)))} }

@Composable private fun Permission(camera:Boolean,request:()->Unit){Box(Modifier.fillMaxSize().background(Color.Black),contentAlignment=Alignment.Center){Column(Modifier.padding(24.dp),horizontalAlignment=Alignment.CenterHorizontally,verticalArrangement=Arrangement.spacedBy(12.dp)){Text("GÖKYÜZÜNÜ TARA",color=Color.White,style=MaterialTheme.typography.headlineSmall);Text(if(camera)"Konum izni gerekli."else"Kamera ve konum izinleri gerekli.",color=Color.White.copy(alpha=.8f));Button(onClick=request){Text("İzinleri ver")}}}}
@Composable private fun Status(text:String){Box(Modifier.fillMaxSize().background(Color.Black),contentAlignment=Alignment.Center){Text(text,color=Color.White,modifier=Modifier.padding(24.dp))}}
private object CityCodes{private val map=mapOf("Adana" to "01","Adıyaman" to "02","Afyonkarahisar" to "03","Ağrı" to "04","Amasya" to "05","Ankara" to "06","Antalya" to "07","Artvin" to "08","Aydın" to "09","Balıkesir" to "10","Bilecik" to "11","Bingöl" to "12","Bitlis" to "13","Bolu" to "14","Burdur" to "15","Bursa" to "16","Çanakkale" to "17","Çankırı" to "18","Çorum" to "19","Denizli" to "20","Diyarbakır" to "21","Edirne" to "22","Elazığ" to "23","Erzincan" to "24","Erzurum" to "25","Eskişehir" to "26","Gaziantep" to "27","Giresun" to "28","Gümüşhane" to "29","Hakkari" to "30","Hatay" to "31","Isparta" to "32","Mersin" to "33","İstanbul" to "34","İzmir" to "35","Kars" to "36","Kastamonu" to "37","Kayseri" to "38","Kırklareli" to "39","Kırşehir" to "40","Kocaeli" to "41","Konya" to "42","Kütahya" to "43","Malatya" to "44","Manisa" to "45","Kahramanmaraş" to "46","Mardin" to "47","Muğla" to "48","Muş" to "49","Nevşehir" to "50","Niğde" to "51","Ordu" to "52","Rize" to "53","Sakarya" to "54","Samsun" to "55","Siirt" to "56","Sinop" to "57","Sivas" to "58","Tekirdağ" to "59","Tokat" to "60","Trabzon" to "61","Tunceli" to "62","Şanlıurfa" to "63","Uşak" to "64","Van" to "65","Yozgat" to "66","Zonguldak" to "67","Aksaray" to "68","Bayburt" to "69","Karaman" to "70","Kırıkkale" to "71","Batman" to "72","Şırnak" to "73","Bartın" to "74","Ardahan" to "75","Iğdır" to "76","Yalova" to "77","Karabük" to "78","Kilis" to "79","Osmaniye" to "80","Düzce" to "81");fun fromName(n:String?):String?=n?.let{v->map.entries.firstOrNull{v.contains(it.key,true)}?.value}}
