// Low-precision NOAA/Meeus solar position. Time comes only from
// date.getTime() (UTC epoch), never from local-time getters.

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const MS_PER_DAY = 86_400_000;
const UNIX_EPOCH_JD = 2_440_587.5;
const J2000_JD = 2_451_545.0;

/** Wrap an angle in degrees into [-180, 180). */
function wrap180(deg: number): number {
  return ((((deg + 180) % 360) + 360) % 360) - 180;
}

export function subsolarPoint(date: Date): { latDeg: number; lonDeg: number } {
  const ms = date.getTime();
  const n = ms / MS_PER_DAY + UNIX_EPOCH_JD - J2000_JD; // days since J2000

  const meanLon = 280.46 + 0.9856474 * n; // L, degrees
  const anomaly = (357.528 + 0.9856003 * n) * RAD; // g
  const eclLon =
    (meanLon + 1.915 * Math.sin(anomaly) + 0.02 * Math.sin(2 * anomaly)) * RAD;
  const obliq = (23.439 - 0.0000004 * n) * RAD;

  const declination = Math.asin(Math.sin(obliq) * Math.sin(eclLon));
  const rightAscension = Math.atan2(
    Math.cos(obliq) * Math.sin(eclLon),
    Math.cos(eclLon),
  );

  // Equation of time = apparent minus mean solar time (positive in Nov),
  // expressed in degrees of longitude (1 minute = 0.25 degree).
  const eotDeg = wrap180(meanLon - rightAscension * DEG);

  const utcHours = (((ms / 3_600_000) % 24) + 24) % 24;
  const lonDeg = wrap180(-15 * (utcHours - 12) - eotDeg);

  return { latDeg: declination * DEG, lonDeg };
}

/** Unit vector for three.js SphereGeometry with an equirectangular map. */
export function toEarthVector(
  latDeg: number,
  lonDeg: number,
): [number, number, number] {
  const phi = latDeg * RAD;
  const lambda = lonDeg * RAD;
  return [
    Math.cos(phi) * Math.cos(lambda),
    Math.sin(phi),
    -Math.cos(phi) * Math.sin(lambda),
  ];
}
