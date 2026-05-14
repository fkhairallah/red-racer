import type { ReactNode } from 'react';

interface GaugeProps {
  label: string;
  value: string | number | null | undefined;
  highlight?: boolean;
  className?: string;
}

export function Gauge({ label, value, highlight, className = '' }: GaugeProps) {
  const display = value == null || (typeof value === 'number' && isNaN(value)) ? 'N/A' : String(value);
  return (
    <div
      className={`flex flex-col items-center justify-center rounded border px-2 py-1 min-w-[80px] ${
        highlight === false ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
      } ${className}`}
    >
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="text-xl font-mono font-bold">{display}</span>
    </div>
  );
}

interface GaugeAngleProps {
  label: string;
  value: number | null | undefined;
  displayMagnetic?: boolean;
  declination?: number;
  className?: string;
}

export function GaugeAngle({ label, value, displayMagnetic = false, declination = 0, className }: GaugeAngleProps) {
  let display: ReactNode = 'N/A';
  if (value != null && !isNaN(value)) {
    const adjusted = displayMagnetic ? ((value + declination + 360) % 360) : value;
    display = adjusted.toFixed(0) + '°' + (displayMagnetic ? 'M' : 'T');
  }
  return <Gauge label={label} value={display as string} className={className} />;
}

interface GaugeDistanceProps {
  label: string;
  value: number | null | undefined;
  unit?: string;
  precision?: number;
  className?: string;
}

export function GaugeDistance({ label, value, unit = 'nm', precision = 2, className }: GaugeDistanceProps) {
  const display = value != null && !isNaN(value) ? `${value.toFixed(precision)} ${unit}` : 'N/A';
  return <Gauge label={label} value={display} className={className} />;
}

interface GaugeNumericProps {
  label: string;
  value: number | null | undefined;
  precision?: number;
  suffix?: string;
  className?: string;
}

export function GaugeNumeric({ label, value, precision = 1, suffix = '', className }: GaugeNumericProps) {
  const display = value != null && !isNaN(value) ? `${value.toFixed(precision)}${suffix}` : 'N/A';
  return <Gauge label={label} value={display} className={className} />;
}
