// Kept as a compatibility module for the existing import path.
// Parcel rendering is now handled directly by GoogleParcelMap.tsx.
// Intentionally no global Google Maps monkey-patching is performed here;
// this prevents a per-zoom global polygon scan and keeps the neon renderer
// local to the active map instance.
export {};
