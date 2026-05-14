import { useEffect, useRef } from 'react';

interface LaylineData {
  starboard: { angle: number; distanceToLine: number; timeToLine: number };
  port: { angle: number; distanceToLine: number; timeToLine: number };
}

interface LaylineCanvasProps {
  twd: number;         // true wind direction
  boatBearing: number; // boat's bearing to mark
  laylines?: LaylineData;
  size?: number;
}

export function LaylineCanvas({ twd, boatBearing, laylines, size = 300 }: LaylineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = size / 2;
    const cy = size * 0.65; // boat below center
    const scale = size * 0.35;

    ctx.clearRect(0, 0, size, size);

    // Wind arrow (top)
    const windRad = (twd - 90) * (Math.PI / 180);
    const wx = cx + Math.cos(windRad) * scale;
    const wy = cy + Math.sin(windRad) * scale;
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(cx, cy);
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Windward mark
    const markY = cy - scale * 0.6;
    ctx.beginPath();
    ctx.arc(cx, markY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#cc0000';
    ctx.fill();

    // Laylines (±45° from wind direction)
    const portAngle = (twd + 45) * (Math.PI / 180);
    const stbAngle = (twd - 45) * (Math.PI / 180);
    const lineLen = scale * 1.2;

    ctx.lineWidth = 2;

    // Starboard tack layline (green)
    ctx.beginPath();
    ctx.moveTo(cx, markY);
    ctx.lineTo(cx + Math.cos(stbAngle + Math.PI / 2) * lineLen, markY + Math.sin(stbAngle + Math.PI / 2) * lineLen);
    ctx.strokeStyle = '#00aa00';
    ctx.stroke();

    // Port tack layline (red)
    ctx.beginPath();
    ctx.moveTo(cx, markY);
    ctx.lineTo(cx + Math.cos(portAngle - Math.PI / 2) * lineLen, markY + Math.sin(portAngle - Math.PI / 2) * lineLen);
    ctx.strokeStyle = '#cc0000';
    ctx.stroke();

    // Boat
    const boatRad = (boatBearing - 90) * (Math.PI / 180);
    const boatX = cx;
    const boatY = cy;
    ctx.save();
    ctx.translate(boatX, boatY);
    ctx.rotate(boatRad + Math.PI / 2);
    ctx.fillStyle = '#0066cc';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(6, 8);
    ctx.lineTo(0, 4);
    ctx.lineTo(-6, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Labels
    if (laylines) {
      ctx.fillStyle = '#333';
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`STB: ${laylines.starboard.distanceToLine.toFixed(2)}nm / ${laylines.starboard.timeToLine.toFixed(0)}s`, 4, size - 24);
      ctx.fillText(`PRT: ${laylines.port.distanceToLine.toFixed(2)}nm / ${laylines.port.timeToLine.toFixed(0)}s`, 4, size - 8);
    }
  }, [twd, boatBearing, laylines, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="rounded border border-gray-300" />;
}
