package com.myskyparcel.ar

data class ArParcel(
    val id: String,
    val parcelNumber: String,
    val price: Double,
    val status: String,
    val latitude: Double,
    val longitude: Double,
    val tier: String,
    val isTest: Boolean = false,
)

data class PlacedParcel(
    val parcel: ArParcel,
    val anchor: com.google.ar.core.Anchor,
)
