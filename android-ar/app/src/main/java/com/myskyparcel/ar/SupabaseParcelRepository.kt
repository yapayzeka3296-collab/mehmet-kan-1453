package com.myskyparcel.ar

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray

private const val SUPABASE_URL = "https://agfxwddvobkhwbbrdzpt.supabase.co"
private const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZnh3ZGR2b2JraHdiYnJkenB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMTgxNDAsImV4cCI6MjEwMTc5NDE0MH0.T_CEm6eUddkxL2mqDpSfHl5WJqw4uufLi5fRqueGm5s"

class SupabaseParcelRepository(private val client: OkHttpClient = OkHttpClient()) {
    suspend fun loadAvailableParcels(cityCode: String): List<ArParcel> = withContext(Dispatchers.IO) {
        val url = "$SUPABASE_URL/rest/v1/parcel_map_public".toHttpUrl().newBuilder()
            .addQueryParameter("select", "id,parcel_number,status,price,tier,tier_price,latitude,longitude")
            .addQueryParameter("city_code", "eq.$cityCode")
            .addQueryParameter("status", "eq.available")
            .addQueryParameter("order", "parcel_number.asc")
            .addQueryParameter("limit", "1000")
            .build()
        val request = Request.Builder()
            .url(url)
            .header("apikey", SUPABASE_ANON_KEY)
            .header("Authorization", "Bearer $SUPABASE_ANON_KEY")
            .header("Accept", "application/json")
            .build()
        runCatching {
            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) error("Supabase HTTP ${response.code}")
                parse(response.body?.string().orEmpty())
            }
        }.onFailure { Log.e("MySkyParcelAR", "Parcel fetch failed", it) }.getOrDefault(emptyList())
    }

    private fun parse(body: String): List<ArParcel> {
        val json = JSONArray(body)
        return buildList(json.length()) {
            for (i in 0 until json.length()) {
                val row = json.getJSONObject(i)
                val id = row.optString("id")
                val number = row.optString("parcel_number")
                val lat = row.optDouble("latitude", Double.NaN)
                val lon = row.optDouble("longitude", Double.NaN)
                val tier = row.optString("tier", "digital")
                if (id.isBlank() || number.isBlank() || lat.isNaN() || lon.isNaN()) continue
                add(
                    ArParcel(
                        id = id,
                        parcelNumber = number,
                        price = row.optDouble("tier_price", row.optDouble("price", 0.0)),
                        status = row.optString("status", "available"),
                        latitude = lat,
                        longitude = lon,
                        tier = tier,
                    )
                )
            }
        }
    }
}
