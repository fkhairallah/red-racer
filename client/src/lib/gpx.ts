import type { GPSPoint, CourseMark } from '../types';

// Parse a GPX XML string into waypoints and marks
export function loadFromXML(xmlStr: string): { waypoints: GPSPoint[]; marks: CourseMark[] } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, 'application/xml');
  const waypoints: GPSPoint[] = [];
  const marks: CourseMark[] = [];

  // GPX wpt elements → waypoints
  doc.querySelectorAll('wpt').forEach((wpt) => {
    const lat = parseFloat(wpt.getAttribute('lat') ?? '0');
    const lon = parseFloat(wpt.getAttribute('lon') ?? '0');
    const name = wpt.querySelector('name')?.textContent ?? '';
    const description = wpt.querySelector('desc')?.textContent ?? '';
    const type = wpt.querySelector('type')?.textContent ?? '';

    if (type === 'mark') {
      marks.push({ name, description, lat, lon });
    } else {
      waypoints.push({ name, description, lat, lon });
    }
  });

  return { waypoints, marks };
}

// Serialize waypoints and marks to a GPX XML string
export function saveToXML(waypoints: GPSPoint[], marks: CourseMark[]): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<gpx version="1.1" creator="[Red] Racer" xmlns="http://www.topografix.com/GPX/1/1">',
  ];

  for (const wp of waypoints) {
    lines.push(
      `  <wpt lat="${wp.lat}" lon="${wp.lon}">`,
      `    <name>${escapeXml(wp.name)}</name>`,
      wp.description ? `    <desc>${escapeXml(wp.description)}</desc>` : '',
      `  </wpt>`,
    );
  }

  for (const m of marks) {
    if (m.lat != null && m.lon != null) {
      lines.push(
        `  <wpt lat="${m.lat}" lon="${m.lon}">`,
        `    <name>${escapeXml(m.name)}</name>`,
        m.description ? `    <desc>${escapeXml(m.description)}</desc>` : '',
        `    <type>mark</type>`,
        `  </wpt>`,
      );
    }
  }

  lines.push('</gpx>');
  return lines.filter((l) => l !== '').join('\n');
}

// Convert sail track data to Expedition-compatible CSV
export function createExpeditionCSV(track: Array<{ lat: number; lon: number; timestamp: Date; speedOverGround?: number; courseOverGround?: number }>): string {
  const header = 'Utc,Lat,Lon,Sog,Cog\n';
  const rows = track
    .map((p) =>
      [
        p.timestamp.toISOString(),
        p.lat.toFixed(6),
        p.lon.toFixed(6),
        (p.speedOverGround ?? 0).toFixed(2),
        (p.courseOverGround ?? 0).toFixed(1),
      ].join(',')
    )
    .join('\n');
  return header + rows;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Trigger a browser file download
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
