import type { Polars, PolarEntry } from '../types';

export async function loadPolarFromURL(url: string): Promise<Polars> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load polar: ${res.statusText}`);
  return res.json() as Promise<Polars>;
}

// Built-in polar files available in public/polar-resources/
export const BUILTIN_POLARS = [
  { label: "Frers 33",    file: "Frers_33.json" },
  { label: "Farr 40",     file: "Farr 40.json" },
  { label: "X44.2",       file: "X442.json" },
  { label: "Flying Scott", file: "flying-scott.json" },
  { label: "J/22",        file: "J22_polars.json" },
  { label: "Schock 34",   file: "Schock34_polars.json" },
  { label: "B367",        file: "B367_polars.json" },
  { label: "Melges 32",   file: "Melges32.json" },
  { label: "Tartan 4100", file: "Tartan4100.json" },
  { label: "J/109",       file: "J109.json" },
];

// Simple target lookup: find closest polar entry for given TWS/TWA
export function getPolarTarget(polars: Polars, tws: number, twa: number): PolarEntry | null {
  if (!polars.factoryPolars.length) return null;
  let best: PolarEntry | null = null;
  let bestDist = Infinity;
  for (const e of polars.factoryPolars) {
    const d = Math.abs(e.tws - tws) * 2 + Math.abs(e.twa - twa);
    if (d < bestDist) { bestDist = d; best = e; }
  }
  return best;
}
