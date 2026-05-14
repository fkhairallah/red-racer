import { useEffect, useRef } from 'react';
import type { GPSPoint } from '../../types';

interface StartLineCanvasProps {
  rcBoat: GPSPoint | null;
  pin: GPSPoint | null;
  boatLat?: number;
  boatLon?: number;
  inSequence: boolean;
  width?: number;
  height?: number;
}

function latLonToCanvas(
  lat: number, lon: number,
  minLat: number, maxLat: number,
  minLon: number, maxLon: number,
  w: number, h: number
): [number, number] {
  const x = ((lon - minLon) / (maxLon - minLon)) * w;
  const y = h - ((lat - minLat) / (maxLat - minLat)) * h;
  return [x, y];
}

export function StartLineCanvas({
  rcBoat, pin, boatLat, boatLon, inSequence, width = 320, height = 200,
}: StartLineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const points = [rcBoat, pin, boatLat != null ? { lat: boatLat, lon: boatLon ?? 0, name: 'Boat' } : null].filter(Boolean) as GPSPoint[];

    if (points.length < 2) {
      ctx.fillStyle = '#999';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Set RC and Pin positions', width / 2, height / 2);
      return;
    }

    const lats = points.map((p) => p.lat);
    const lons = points.map((p) => p.lon);
    const pad = 0.0005;
    const minLat = Math.min(...lats) - pad;
    const maxLat = Math.max(...lats) + pad;
    const minLon = Math.min(...lons) - pad;
    const maxLon = Math.max(...lons) + pad;

    const toXY = (lat: number, lon: number) =>
      latLonToCanvas(lat, lon, minLat, maxLat, minLon, maxLon, width, height);

    // Draw start line
    if (rcBoat && pin) {
      const [rx, ry] = toXY(rcBoat.lat, rcBoat.lon);
      const [px, py] = toXY(pin.lat, pin.lon);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(px, py);
      ctx.strokeStyle = inSequence ? '#cc0000' : '#999';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // RC flag
      ctx.fillStyle = '#0066cc';
      ctx.beginPath();
      ctx.arc(rx, ry, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('RC', rx, ry);

      // Pin
      ctx.fillStyle = '#cc6600';
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText('P', px, py);
    }

    // Draw boat
    if (boatLat != null && boatLon != null) {
      const [bx, by] = toXY(boatLat, boatLon);
      ctx.fillStyle = '#009900';
      ctx.beginPath();
      ctx.arc(bx, by, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [rcBoat, pin, boatLat, boatLon, inSequence, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} className="rounded border border-gray-300 w-full" />;
}
