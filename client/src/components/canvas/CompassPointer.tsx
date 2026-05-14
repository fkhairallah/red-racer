import { useEffect, useRef } from 'react';

interface CompassPointerProps {
  /** Current device heading in degrees (true) */
  heading: number;
  /** Bearing to the target mark in degrees (true) */
  targetBearing: number;
  size?: number;
}

export function CompassPointer({ heading, targetBearing, size = 150 }: CompassPointerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 4;

    ctx.clearRect(0, 0, size, size);

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cardinal labels
    ctx.fillStyle = '#333';
    ctx.font = `${size * 0.1}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const cards = [['N', 0], ['E', 90], ['S', 180], ['W', 270]] as const;
    for (const [label, deg] of cards) {
      const rad = (deg - heading - 90) * (Math.PI / 180);
      ctx.fillText(label, cx + (r - 10) * Math.cos(rad), cy + (r - 10) * Math.sin(rad));
    }

    // Arrow to target bearing
    const diff = targetBearing - heading;
    const arrowRad = (diff - 90) * (Math.PI / 180);
    const arrowLen = r * 0.7;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(arrowRad + Math.PI / 2);

    // Arrow body
    ctx.beginPath();
    ctx.moveTo(0, -arrowLen);
    ctx.lineTo(0, arrowLen * 0.3);
    ctx.strokeStyle = '#cc0000';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(0, -arrowLen);
    ctx.lineTo(-6, -arrowLen + 14);
    ctx.lineTo(6, -arrowLen + 14);
    ctx.closePath();
    ctx.fillStyle = '#cc0000';
    ctx.fill();

    ctx.restore();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();
  }, [heading, targetBearing, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="rounded-full" />;
}
