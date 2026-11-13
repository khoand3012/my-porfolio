import { test } from "node:test";
import assert from "node:assert/strict";
import { subsolarPoint, toEarthVector } from "./solar.ts";

function assertClose(
  actual: number,
  expected: number,
  tol: number,
  label: string,
): void {
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `${label}: expected ${expected} +/- ${tol}, got ${actual}`,
  );
}

test("March equinox has declination near 0", () => {
  const { latDeg } = subsolarPoint(new Date("2026-03-20T14:46:00Z"));
  assertClose(latDeg, 0, 0.5, "lat");
});

test("June solstice has declination near +23.4", () => {
  const { latDeg } = subsolarPoint(new Date("2026-06-21T08:24:00Z"));
  assertClose(latDeg, 23.4, 1, "lat");
});

test("December solstice has declination near -23.4", () => {
  const { latDeg } = subsolarPoint(new Date("2026-12-21T20:50:00Z"));
  assertClose(latDeg, -23.4, 1, "lat");
});

test("mid-November: Sun is fast, subsolar point west of Greenwich", () => {
  const { lonDeg } = subsolarPoint(new Date("2026-11-13T12:00:00Z"));
  assertClose(lonDeg, -4.0, 0.5, "lon");
});

test("mid-February: Sun is slow, subsolar point east of Greenwich", () => {
  const { lonDeg } = subsolarPoint(new Date("2026-02-11T12:00:00Z"));
  assertClose(lonDeg, 3.5, 0.5, "lon");
});

test("leap day returns finite values", () => {
  const { latDeg, lonDeg } = subsolarPoint(new Date("2028-02-29T12:00:00Z"));
  assert.ok(Number.isFinite(latDeg));
  assert.ok(Number.isFinite(lonDeg));
});

test("year boundary is continuous", () => {
  const a = subsolarPoint(new Date("2026-12-31T23:59:59Z"));
  const b = subsolarPoint(new Date("2027-01-01T00:00:00Z"));
  assert.ok(Math.abs(a.lonDeg - b.lonDeg) < 0.1, "lon jump");
  assert.ok(Math.abs(a.latDeg - b.latDeg) < 0.05, "lat jump");
});

test("longitude stays within -180..180", () => {
  for (let h = 0; h < 24; h++) {
    const { lonDeg } = subsolarPoint(
      new Date(Date.UTC(2026, 5, 1, h, 30)),
    );
    assert.ok(lonDeg >= -180 && lonDeg <= 180, `lon ${lonDeg} at ${h}h`);
  }
});

test("toEarthVector maps known points", () => {
  const cases: Array<[number, number, [number, number, number]]> = [
    [0, 0, [1, 0, 0]],
    [0, 90, [0, 0, -1]],
    [90, 0, [0, 1, 0]],
  ];
  for (const [lat, lon, expected] of cases) {
    const v = toEarthVector(lat, lon);
    expected.forEach((e, i) =>
      assertClose(v[i]!, e, 1e-9, `vec(${lat},${lon})[${i}]`),
    );
  }
});

test("result does not depend on the process timezone", () => {
  const original = process.env.TZ;
  try {
    const date = new Date("2026-07-04T05:06:07Z");
    process.env.TZ = "Asia/Ho_Chi_Minh";
    const a = subsolarPoint(date);
    process.env.TZ = "America/Los_Angeles";
    const b = subsolarPoint(date);
    assert.deepStrictEqual(a, b);
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});
