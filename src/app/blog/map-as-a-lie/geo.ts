import {
  geoEqualEarthRaw,
  geoMercatorRaw,
  geoProjection,
  geoPath,
  geoArea,
} from 'd3-geo';
import { feature } from 'topojson-client';
import world from './data/world.json';
import type { FeatureCollection, Feature } from 'geojson';
export const countries = (
  feature(
    world as never,
    world.objects.countries as never,
  ) as unknown as FeatureCollection
).features;
export const africaIds = new Set([
  12, 24, 72, 108, 120, 132, 140, 148, 174, 178, 180, 204, 226, 231, 232, 262,
  266, 270, 288, 324, 384, 404, 426, 430, 434, 450, 454, 466, 478, 480, 504,
  508, 516, 562, 566, 624, 638, 646, 654, 678, 686, 690, 694, 706, 710, 716,
  728, 729, 732, 748, 768, 788, 800, 818, 834, 854, 894,
]);
export const africa = {
  type: 'FeatureCollection',
  features: countries.filter((f) => africaIds.has(Number(f.id))),
} as FeatureCollection;
export function raw(t: number) {
  return (l: number, p: number) => {
    const a = geoMercatorRaw(l, p),
      b = geoEqualEarthRaw(l, p);
    return [a[0] * (1 - t) + b[0] * t, a[1] * (1 - t) + b[1] * t] as [
      number,
      number,
    ];
  };
}
export function worldProjection(t: number, w = 900, h = 510) {
  const s0 = Math.min(w / 6.283, h / 6.263) * 0.94,
    s1 = Math.min(w / 5.414, h / 2.635) * 0.94;
  const p = geoProjection(raw(t))
    .scale(s0 * (1 - t) + s1 * t)
    .translate([w / 2, h / 2])
    .precision(0.3)
    .clipExtent([
      [1, 1],
      [w - 1, h - 1],
    ]);
  if (t === 0) {
    const s = p.scale();
    p.clipExtent([
      [w / 2 - Math.PI * s, h / 2 - 3.1313 * s],
      [w / 2 + Math.PI * s, h / 2 + 3.1313 * s],
    ]);
  }
  return p;
}
export function countryRatio(t: number, id: number) {
  const p = worldProjection(t),
    other = countries.find((f) => Number(f.id) === id) as Feature;
  return {
    real: geoArea(africa) / geoArea(other),
    shown: geoPath(p).area(africa) / geoPath(p).area(other),
  };
}
export function localProjection(t: number) {
  return geoProjection(raw(t))
    .center([35, 32])
    .scale(5200)
    .translate([290, 215])
    .precision(0.05)
    .clipExtent([
      [0, 0],
      [580, 430],
    ]);
}
export function localDistortion(t: number, lon = 35, lat = 32) {
  const f = raw(t),
    e = 1e-6,
    l = (lon * Math.PI) / 180,
    p = (lat * Math.PI) / 180,
    c = Math.cos(p),
    L = f(l - e, p),
    R = f(l + e, p),
    B = f(l, p - e),
    T = f(l, p + e);
  const ax = (R[0] - L[0]) / (2 * e * c),
    ay = (R[1] - L[1]) / (2 * e * c),
    bx = (T[0] - B[0]) / (2 * e),
    by = (T[1] - B[1]) / (2 * e),
    area = Math.abs(ax * by - ay * bx),
    tr = ax * ax + ay * ay + bx * bx + by * by,
    disc = Math.sqrt(Math.max(0, tr * tr - 4 * area * area)),
    hi = Math.sqrt((tr + disc) / 2),
    lo = Math.sqrt((tr - disc) / 2);
  return {
    area,
    angle: (2 * Math.asin((hi - lo) / (hi + lo)) * 180) / Math.PI,
  };
}
