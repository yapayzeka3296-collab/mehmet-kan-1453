package com.myskyparcel.ar

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import java.util.Locale

private const val SUPABASE_URL = "https://agfxwddvobkhwbbrdzpt.supabase.co"
private const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZnh3ZGR2b2JraHdiYnJkenB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMTgxNDAsImV4cCI6MjEwMTc5NDE0MH0.T_CEm6eUddkxL2mqDpSfHl5WJqw4uufLi5fRqueGm5s"

class SupabaseParcelRepository(private val client: OkHttpClient = OkHttpClient()) {
    suspend fun loadParcels(cityCode: String): List<ArParcel> = withContext(Dispatchers.IO) {
        runCatching {
            val cityName = resolveCityName(cityCode) ?: error("Unknown city code: $cityCode")
            val url = "$SUPABASE_URL/rest/v1/parcel_map_public".toHttpUrl().newBuilder()
                .addQueryParameter("select", "id,parcel_number,status,price,tier,tier_price,latitude,longitude")
                .addQueryParameter("city_name", "eq.$cityName")
                .addQueryParameter("status", "in.(available,sold)")
                .addQueryParameter("order", "parcel_number.asc")
                .addQueryParameter("limit", "1000")
                .build()
            val request = Request.Builder().url(url)
                .header("apikey", SUPABASE_ANON_KEY)
                .header("Authorization", "Bearer $SUPABASE_ANON_KEY")
                .header("Accept", "application/json").build()
            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) error("Supabase HTTP ${response.code}")
                parse(response.body?.string().orEmpty())
            }
        }.onFailure { Log.e("MySkyParcelAR", "Parcel fetch failed", it) }.getOrDefault(emptyList())
    }

    private fun resolveCityName(cityCode: String): String? {
        val normalized = cityCode.trim().uppercase(Locale.ROOT)
        if (normalized.length == 2 && normalized.all(Char::isDigit)) return provinceNames[normalized]
        val url = "$SUPABASE_URL/rest/v1/cities".toHttpUrl().newBuilder()
            .addQueryParameter("select", "name").addQueryParameter("code", "eq.$normalized")
            .addQueryParameter("is_active", "eq.true").addQueryParameter("limit", "1").build()
        val request = Request.Builder().url(url)
            .header("apikey", SUPABASE_ANON_KEY).header("Authorization", "Bearer $SUPABASE_ANON_KEY")
            .header("Accept", "application/json").build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) error("Supabase city HTTP ${response.code}")
            val json = JSONArray(response.body?.string().orEmpty())
            return if (json.length() == 0) null else json.getJSONObject(0).optString("name").takeIf { it.isNotBlank() }
        }
    }

    private fun parse(body: String): List<ArParcel> {
        val json = JSONArray(body)
        return buildList(json.length()) {
            for (i in 0 until json.length()) {
                val row = json.getJSONObject(i)
                val id = row.optString("id"); val number = row.optString("parcel_number")
                val lat = row.optDouble("latitude", Double.NaN); val lon = row.optDouble("longitude", Double.NaN)
                val tier = row.optString("tier", "digital")
                if (id.isBlank() || number.isBlank() || lat.isNaN() || lon.isNaN()) continue
                add(ArParcel(id, number, row.optDouble("tier_price", row.optDouble("price", 0.0)), row.optString("status", "available"), lat, lon, tier))
            }
        }
    }

    companion object {
        private val provinceNames = mapOf(
            "01" to "Adana", "02" to "Adıyaman", "03" to "Afyonkarahisar", "04" to "Ağrı", "05" to "Amasya", "06" to "Ankara", "07" to "Antalya", "08" to "Artvin", "09" to "Aydın", "10" to "Balıkesir", "11" to "Bilecik", "12" to "Bingöl", "13" to "Bitlis", "14" to "Bolu", "15" to "Burdur", "16" to "Bursa", "17" to "Çanakkale", "18" to "Çankırı", "19" to "Çorum", "20" to "Denizli", "21" to "Diyarbakır", "22" to "Edirne", "23" to "Elazığ", "24" to "Erzincan", "25" to "Erzurum", "26" to "Eskişehir", "27" to "Gaziantep", "28" to "Giresun", "29" to "Gümüşhane", "30" to "Hakkari", "31" to "Hatay", "32" to "Isparta", "33" to "Mersin", "34" to "İstanbul", "35" to "İzmir", "36" to "Kars", "37" to "Kastamonu", "38" to "Kayseri", "39" to "Kırklareli", "40" to "Kırşehir", "41" to "Kocaeli", "42" to "Konya", "43" to "Kütahya", "44" to "Malatya", "45" to "Manisa", "46" to "Kahramanmaraş", "47" to "Mardin", "48" to "Muğla", "49" to "Muş", "50" to "Nevşehir", "51" to "Niğde", "52" to "Ordu", "53" to "Rize", "54" to "Sakarya", "55" to "Samsun", "56" to "Siirt", "57" to "Sinop", "58" to "Sivas", "59" to "Tekirdağ", "60" to "Tokat", "61" to "Trabzon", "62" to "Tunceli", "63" to "Şanlıurfa", "64" to "Uşak", "65" to "Van", "66" to "Yozgat", "67" to "Zonguldak", "68" to "Aksaray", "69" to "Bayburt", "70" to "Karaman", "71" to "Kırıkkale", "72" to "Batman", "73" to "Şırnak", "74" to "Bartın", "75" to "Ardahan", "76" to "Iğdır", "77" to "Yalova", "78" to "Karabük", "79" to "Kilis", "80" to "Osmaniye", "81" to "Düzce"
        )
    }
}
