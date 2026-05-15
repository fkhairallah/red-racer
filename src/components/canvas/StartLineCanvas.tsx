import { useEffect, useRef } from 'react';
import type { GPSPoint } from '../../types';

interface StartLineCanvasProps {
  rcBoat: GPSPoint | null;
  pin: GPSPoint | null;
  boatLat?: number;
  boatLon?: number;
  inSequence: boolean;
  windDirection?: number; // degrees true, wind FROM this direction
  width?: number;
  height?: number;
}


// Project a lat/lon point into wind-up canvas coordinates.
// windDir = degrees true that wind blows FROM (compass bearing of upwind direction).
// After rotation, +y = upwind (screen top), +x = right looking upwind (starboard side).
function toWindUp(
  lat: number,
  lon: number,
  centerLat: number,
  centerLon: number,
  windDir: number,
  scale: number,
  cx: number,
  cy: number,
): [number, number] {
  const dLat = lat - centerLat;
  const dLon = (lon - centerLon) * Math.cos((centerLat * Math.PI) / 180);
  const a = (-windDir * Math.PI) / 180;
  const xRot = dLon * Math.cos(a) - dLat * Math.sin(a);
  const yRot = dLon * Math.sin(a) + dLat * Math.cos(a);
  // yRot positive = upwind → negative screen y (upward)
  return [cx + xRot * scale, cy - yRot * scale];
}

function computeBias(
  rcBoat: GPSPoint,
  pin: GPSPoint,
  windDir: number,
): { biasAngle: number; favored: 'RC' | 'Pin' | 'Square' } {
  const centerLat = (rcBoat.lat + pin.lat) / 2;
  const centerLon = (rcBoat.lon + pin.lon) / 2;
  const cosLat = Math.cos((centerLat * Math.PI) / 180);

  const rcE = (rcBoat.lon - centerLon) * cosLat;
  const rcN = rcBoat.lat - centerLat;
  const pinE = (pin.lon - centerLon) * cosLat;
  const pinN = pin.lat - centerLat;

  // Project onto upwind vector (sin(TWD), cos(TWD)) in (east, north)
  const windRad = (windDir * Math.PI) / 180;
  const rcUpwind = rcE * Math.sin(windRad) + rcN * Math.cos(windRad);
  const pinUpwind = pinE * Math.sin(windRad) + pinN * Math.cos(windRad);
  const diff = rcUpwind - pinUpwind;

  // Normalize bias to degrees: angle = asin(diff / lineLen)
  const lineLen = Math.sqrt((rcE - pinE) ** 2 + (rcN - pinN) ** 2);
  const biasAngle = lineLen > 0 ? (Math.asin(Math.max(-1, Math.min(1, diff / lineLen))) * 180) / Math.PI : 0;

  const THRESHOLD = 0.5;
  const favored: 'RC' | 'Pin' | 'Square' =
    biasAngle > THRESHOLD ? 'RC' : biasAngle < -THRESHOLD ? 'Pin' : 'Square';

  return { biasAngle, favored };
}

export function StartLineCanvas({
  rcBoat, pin, boatLat, boatLon, inSequence, windDirection = 0, width = 320, height = 200,
}: StartLineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;

    // ── Wind indicator at top ─────────────────────────────────────────────────
    const arrowTopY = 8;
    const arrowBotY = 34;
    ctx.strokeStyle = '#60a5fa';
    ctx.fillStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, arrowTopY);
    ctx.lineTo(cx, arrowBotY);
    ctx.stroke();
    // arrowhead pointing down (wind blowing down the screen)
    ctx.beginPath();
    ctx.moveTo(cx, arrowBotY);
    ctx.lineTo(cx - 7, arrowBotY - 10);
    ctx.lineTo(cx + 7, arrowBotY - 10);
    ctx.closePath();
    ctx.fill();
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#60a5fa';
    ctx.fillText(`${Math.round(((windDirection % 360) + 360) % 360)}°`, cx, arrowTopY - 2);

    // ── Upwind mark indicator ─────────────────────────────────────────────────
    const markY = 48;
    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.arc(cx, markY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('M', cx, markY);
    ctx.textBaseline = 'alphabetic';

    // ── Start line ────────────────────────────────────────────────────────────
    const lineY = Math.round(height * 0.65); // line sits in lower 2/3

    if (!rcBoat || !pin) {
      // Schematic placeholder — line exactly perpendicular to wind
      const halfLen = Math.min(cx - 24, 90);
      ctx.strokeStyle = inSequence ? '#dc2626' : '#6b7280';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(cx - halfLen, lineY);
      ctx.lineTo(cx + halfLen, lineY);
      ctx.stroke();
      ctx.setLineDash([]);

      // RC right, Pin left
      const dotR = 10;
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(cx + halfLen, lineY, dotR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('RC', cx + halfLen, lineY);

      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.arc(cx - halfLen, lineY, dotR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText('P', cx - halfLen, lineY);
      ctx.textBaseline = 'alphabetic';

      ctx.fillStyle = '#6b7280';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Set RC and Pin positions', cx, height - 6);
      return;
    }

    // ── GPS-based wind-up render ───────────────────────────────────────────────
    const centerLat = (rcBoat.lat + pin.lat) / 2;
    const centerLon = (rcBoat.lon + pin.lon) / 2;

    const dLat = rcBoat.lat - pin.lat;
    const dLon = (rcBoat.lon - pin.lon) * Math.cos((centerLat * Math.PI) / 180);
    const lineLenDeg = Math.sqrt(dLat ** 2 + dLon ** 2);
    const halfLinePixels = Math.min(cx - 20, 90);
    const scale = lineLenDeg > 0 ? halfLinePixels / (lineLenDeg / 2) : 8000;

    const lineCY = lineY;
    const toXY = (lat: number, lon: number): [number, number] =>
      toWindUp(lat, lon, centerLat, centerLon, windDirection, scale, cx, lineCY);

    const [rx, ry] = toXY(rcBoat.lat, rcBoat.lon);
    const [px, py] = toXY(pin.lat, pin.lon);

    const bias = computeBias(rcBoat, pin, windDirection);

    // Line
    ctx.strokeStyle = inSequence ? '#dc2626' : '#6b7280';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.setLineDash([]);

    const dotR = 10;

    // RC dot
    ctx.fillStyle = bias.favored === 'RC' ? '#16a34a' : '#2563eb';
    ctx.beginPath();
    ctx.arc(rx, ry, dotR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RC', rx, ry);

    // Pin dot
    ctx.fillStyle = bias.favored === 'Pin' ? '#16a34a' : '#c2410c';
    ctx.beginPath();
    ctx.arc(px, py, dotR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('P', px, py);
    ctx.textBaseline = 'alphabetic';

    // Favored star label
    if (bias.favored !== 'Square') {
      const [fx, fy] = bias.favored === 'RC' ? [rx, ry] : [px, py];
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#4ade80';
      ctx.textAlign = 'center';
      ctx.fillText(`★ ${bias.favored}`, fx, fy - dotR - 4);
    }

    // Boat
    if (boatLat != null && boatLon != null) {
      const [bx, by] = toXY(boatLat, boatLon);
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(bx, by, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bias text at bottom
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.textAlign = 'center';
    const biasLabel =
      bias.favored === 'Square'
        ? 'Square line'
        : `${Math.abs(bias.biasAngle).toFixed(0)}° bias — ${bias.favored} favored`;
    ctx.fillText(biasLabel, cx, height - 4);
  }, [rcBoat, pin, boatLat, boatLon, inSequence, windDirection, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded border border-gray-700 w-full"
    />
  );
}
