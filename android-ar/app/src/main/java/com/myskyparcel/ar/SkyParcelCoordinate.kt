package com.myskyparcel.ar

/** Stable angular coordinate for a parcel in the MySkyParcel sky. */
data class SkyParcelCoordinate(
    val parcelId: String,
    val city: String,
    val index: Int,
    val azimuthDeg: Float,
    val elevationDeg: Float,
    val angularSizeDeg: Float = 1.2f,
)

object SkyParcelCoordinateEngine {
    private const val CELLS_PER_AXIS = 1000
    private const val PARCEL_COUNT = CELLS_PER_AXIS * CELLS_PER_AXIS

    fun coordinate(city: String, index: Int): SkyParcelCoordinate {
        val safeIndex = index.coerceIn(1, PARCEL_COUNT)
        val zero = safeIndex - 1
        val azCell = zero % CELLS_PER_AXIS
        val elCell = zero / CELLS_PER_AXIS
        val az = (azCell + 0.5f) / CELLS_PER_AXIS * 360f
        val el = (elCell + 0.5f) / CELLS_PER_AXIS * 180f - 90f
        return SkyParcelCoordinate("$city-GOKYUZU-${safeIndex.toString().padStart(7, '0')}", city, safeIndex, az, el)
    }

    fun testParcel(city: String): SkyParcelCoordinate = SkyParcelCoordinate(
        "$city-GOKYUZU-0000001", city, 1, 180f, 30f
    )
}