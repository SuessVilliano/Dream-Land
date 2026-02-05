"use client";

import { useEffect } from "react";
import L from "leaflet";

/**
 * Fixes the broken default Leaflet marker icons in Next.js / webpack.
 * Webpack changes the image paths, so we need to explicitly set them
 * using the CDN versions of the marker images.
 *
 * Import and render <LeafletIconFix /> once inside any map page.
 */
export default function LeafletIconFix() {
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
      ._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return null;
}

/**
 * Custom colored marker icons for different property types / states.
 */
export function createColoredIcon(
  color: "blue" | "red" | "green" | "gold" | "violet" | "orange" | "grey" = "blue"
) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}
