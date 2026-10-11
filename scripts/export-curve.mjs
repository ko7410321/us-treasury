import { writeFileSync } from "node:fs";

const ids = [
  ["y2", "DGS2"],
  ["y5", "DGS5"],
  ["y7", "DGS7"],
  ["y10", "DGS10"],
  ["y30", "DGS30"],
];

async function series(id) {
  const res = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}&cosd=2024-01-01`);
  if (!res.ok) throw new Error(`${id} ${res.status}`);
  const map = new Map();
  for (const line of (await res.text()).trim().split(/\n/).slice(1)) {
    const [date, raw] = line.split(",");
    const value = Number(raw);
    if (date && Number.isFinite(value)) map.set(date, value);
  }
  return map;
}

const maps = await Promise.all(ids.map(async ([key, id]) => [key, await series(id)]));
const dates = new Set();
for (const [, map] of maps) for (const date of map.keys()) dates.add(date);
const history = [];
for (const date of [...dates].sort()) {
  const point = { d: date };
  if (maps.some(([key, map]) => !Number.isFinite(map.get(date)))) continue;
  for (const [key, map] of maps) point[key] = map.get(date);
  history.push(point);
}
const months = new Map();
for (const point of history) months.set(point.d.slice(0, 7), point);
const monthly = [...months.values()];
const spot = monthly.at(-1);
if (!spot) throw new Error("no yield rows");
writeFileSync(
  "public/curve.json",
  JSON.stringify({ history: monthly, spot, source: "FRED", fetchedAt: Date.now() }),
);
console.log(`curve ${spot.d} 10y ${spot.y10}`);
