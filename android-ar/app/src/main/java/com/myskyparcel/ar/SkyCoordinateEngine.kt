package com.myskyparcel.ar

import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

/**
 * Platform-neutral MySkyParcel world coordinates.
 *
 * The user's GPS position is the local origin. Geographic parcel positions
 * are converted to metres in an East/North/Up frame so the same coordinate
 * model can later be consumed by the web Babylon.js renderer and the native
 * renderer without changing parcel semantics.
 */
object SkyCoordinateEngine {
    private const val EARTH_RADIUS_METRES = 6_378_137.0
    private const val METRES_PER_DEGREE_LATITUDE = 111_320.0

    data class Origin(
        val latitude: Double,
        val longitude: Double,
        val altitudeMetres: Double,
    )

    data class GeoPoint(
        val latitude: Double,
        val longitude: Double,
        val altitudeMetres: Double,
    )

    /** Right-handed local ENU coordinates: +X east, +Y up, +Z north. */
    data class WorldPosition(
        val xEastMetres: Double,
        val yUpMetres: Double,
        val zNorthMetres: Double,
    )

    data class HorizontalPolar(
        val distanceMetres: Double,
        val bearingDegrees: Double,
    )

    fun toWorld(origin: Origin, point: GeoPoint): WorldPosition {
        val latitudeRad = degreesToRadians(origin.latitude)
        val metresPerDegreeLongitude = METRES_PER_DEGREE_LATITUDE * cos(latitudeRad)
        val east = (point.longitude - origin.longitude) * metresPerDegreeLongitude
        val north = (point.latitude - origin.latitude) * METRES_PER_DEGREE_LATITUDE
        val up = point.altitudeMetres - origin.altitudeMetres
        return WorldPosition(east, up, north)
    }

    fun toGeo(origin: Origin, position: WorldPosition): GeoPoint {
        val latitudeRad = degreesToRadians(origin.latitude)
        val metresPerDegreeLongitude = METRES_PER_DEGREE_LATITUDE * cos(latitudeRad)
        require(kotlin.math.abs(metresPerDegreeLongitude) > 1e-9) { "Origin latitude is invalid for longitude conversion" }
        return GeoPoint(
            latitude = origin.latitude + position.zNorthMetres / METRES_PER_DEGREE_LATITUDE,
            longitude = origin.longitude + position.xEastMetres / metresPerDegreeLongitude,
            altitudeMetres = origin.altitudeMetres + position.yUpMetres,
        )
    }

    fun horizontalPolar(position: WorldPosition): HorizontalPolar {
        val distance = kotlin.math.hypot(position.xEastMetres, position.zNorthMetres)
        val bearing = normalizeDegrees(radiansToDegrees(kotlin.math.atan2(position.xEastMetres, position.zNorthMetres)))
        return HorizontalPolar(distance, bearing)
    }

    fun destination(origin: GeoPoint, bearingDegrees: Double, distanceMetres: Double, altitudeDeltaMetres: Double = 0.0): GeoPoint {
        require(distanceMetres >= 0.0) { "Distance cannot be negative" }
        val bearing = degreesToRadians(bearingDegrees)
        val north = distanceMetres * cos(bearing)
        val east = distanceMetres * sin(bearing)
        val latitudeRad = degreesToRadians(origin.latitude)
        val metresPerDegreeLongitude = METRES_PER_DEGREE_LATITUDE * cos(latitudeRad)
        require(kotlin.math.abs(metresPerDegreeLongitude) > 1e-9) { "Latitude is too close to a pole" }
        return GeoPoint(
            latitude = origin.latitude + north / METRES_PER_DEGREE_LATITUDE,
            longitude = origin.longitude + east / metresPerDegreeLongitude,
            altitudeMetres = origin.altitudeMetres + altitudeDeltaMetres,
        )
    }

    fun distanceMetres(a: GeoPoint, b: GeoPoint): Double {
        val dLat = degreesToRadians(b.latitude - a.latitude)
        val dLon = degreesToRadians(b.longitude - a.longitude)
        val lat1 = degreesToRadians(a.latitude)
        val lat2 = degreesToRadians(b.latitude)
        val haversine = sin(dLat / 2) * sin(dLat / 2) +
            cos(lat1) * cos(lat2) * sin(dLon / 2) * sin(dLon / 2)
        val centralAngle = 2.0 * kotlin.math.atan2(kotlin.math.sqrt(haversine), kotlin.math.sqrt(1.0 - haversine))
        val horizontal = EARTH_RADIUS_METRES * centralAngle
        val vertical = b.altitudeMetres - a.altitudeMetres
        return kotlin.math.hypot(horizontal, vertical)
    }

    fun normalizeDegrees(value: Double): Double {
        val normalized = value % 360.0
        return if (normalized < 0.0) normalized + 360.0 else normalized
    }

    private fun degreesToRadians(value: Double): Double = value * PI / 180.0
    private fun radiansToDegrees(value: Double): Double = value * 180.0 / PI
}
