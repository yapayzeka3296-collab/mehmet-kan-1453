export type CityImageCode = "IST" | "ANK" | "IZM" | "BUR" | "ANT" | "KAY" | "GZT";

export const CITY_IMAGES: Record<CityImageCode, string> = {
  IST: "/images/cities/istanbul.webp",
  ANK: "/images/cities/ankara.webp",
  IZM: "/images/cities/izmir.webp",
  BUR: "/images/cities/bursa.webp",
  ANT: "/images/cities/antalya.webp",
  KAY: "/images/cities/kayseri.webp",
  GZT: "/images/cities/gaziantep.webp",
};

export const CITY_IMAGE_FALLBACK = "/images/cities/gaziantep.webp";
