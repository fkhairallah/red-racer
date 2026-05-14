import type { Polars, PolarEntry } from '../types';

// Parse a polar XML file (same format as RedRacer-Air polarResources/*.xml)
export async function loadPolarFromURL(url: string): Promise<Polars> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load polar: ${res.statusText}`);
  const xmlStr = await res.text();
  return parsePolarXML(xmlStr, url.split('/').pop()?.replace('.xml', '') ?? 'Unknown');
}

export function parsePolarXML(xmlStr: string, defaultName: string): Polars {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, 'application/xml');

  const name =
    doc.querySelector('polars')?.getAttribute('name') ??
    doc.querySelector('name')?.textContent ??
    defaultName;

  const entries: PolarEntry[] = [];

  // Support flat <point tws="..." twa="..." v="..." vmg="..." />
  // and grouped <windspeed tws="..."><point twa="..." vb="..." vmg="..." /></windspeed>
  doc.querySelectorAll('point, polar').forEach((el) => {
    const parentTws = el.parentElement?.getAttribute('tws') ?? '0';
    const tws = parseFloat(el.getAttribute('tws') ?? el.querySelector('tws')?.textContent ?? parentTws);
    const twa = parseFloat(el.getAttribute('twa') ?? el.querySelector('twa')?.textContent ?? '0');
    const v = parseFloat(
      el.getAttribute('v') ?? el.getAttribute('vb') ?? el.querySelector('v')?.textContent ?? '0'
    );
    const vmg = parseFloat(el.getAttribute('vmg') ?? el.querySelector('vmg')?.textContent ?? '0');
    const heel = parseFloat(el.getAttribute('heel') ?? el.querySelector('heel')?.textContent ?? '0');

    if (!isNaN(tws) && !isNaN(twa) && !isNaN(v)) {
      entries.push({ tws, twa, v, vmg: isNaN(vmg) ? 0 : vmg, heel: isNaN(heel) ? 0 : heel });
    }
  });

  return { name, entries };
}

// Built-in polar files available in public/polar-resources/
export const BUILTIN_POLARS = [
  { label: "Frers 33", file: "Frers_33.xml" },
  { label: "Farr 40", file: "Farr 40.xml" },
  { label: "X44.2", file: "X442.xml" },
  { label: "Flying Scot", file: "flying-scot.xml" },
  { label: "J/22", file: "J22_polars.xml" },
  { label: "Schock 34", file: "Schock34_polars.xml" },
  { label: "B367", file: "B367_polars.xml" },
  { label: "Melges 32", file: "Melges32.xml" },
  { label: "Tartan 4100", file: "Tartan4100.xml" },
  { label: "J/109", file: "J109.xml" },
];

// Simple target lookup: find closest polar entry for given TWS/TWA
export function getPolarTarget(polars: Polars, tws: number, twa: number): PolarEntry | null {
  if (!polars.entries.length) return null;
  let best: PolarEntry | null = null;
  let bestDist = Infinity;
  for (const e of polars.entries) {
    const d = Math.abs(e.tws - tws) * 2 + Math.abs(e.twa - twa);
    if (d < bestDist) { bestDist = d; best = e; }
  }
  return best;
}
