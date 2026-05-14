import { useState } from 'react';
import { TopBar } from '../../components/common/NavBar';

function angleDiff(a: number, b: number): number {
  return ((a - b + 540) % 360) - 180;
}

interface DiagramProps {
  diff: number; // positive = RC is upwind, negative = Pin is upwind
}

function LineBiasDiagram({ diff }: DiagramProps) {
  const diffRad = (diff * Math.PI) / 180;
  const cx = 110;
  const lineY = 145;
  const halfLen = 80;

  const rcX = cx + halfLen * Math.cos(diffRad);
  const rcY = lineY - halfLen * Math.sin(diffRad);
  const pinX = cx - halfLen * Math.cos(diffRad);
  const pinY = lineY + halfLen * Math.sin(diffRad);

  const rcFavored = diff > 0;
  const pinFavored = diff < 0;

  return (
    <svg viewBox="0 0 220 210" className="w-full max-w-xs mx-auto">
      <defs>
        <marker id="wind-arrow" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#60a5fa" />
        </marker>
      </defs>

      {/* Wind label */}
      <text x="110" y="14" textAnchor="middle" fill="#93c5fd" fontSize="11" fontFamily="monospace" fontWeight="bold">
        WIND
      </text>

      {/* Wind arrow — points down, wind comes from top */}
      <line x1="110" y1="20" x2="110" y2="88" stroke="#60a5fa" strokeWidth="2.5" markerEnd="url(#wind-arrow)" />

      {/* Square line reference (dashed) */}
      <line
        x1={cx - halfLen} y1={lineY}
        x2={cx + halfLen} y2={lineY}
        stroke="#374151" strokeWidth="1.5" strokeDasharray="5,4"
      />

      {/* Actual start line */}
      <line
        x1={pinX} y1={pinY}
        x2={rcX} y2={rcY}
        stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round"
      />

      {/* RC end */}
      <circle cx={rcX} cy={rcY} r={rcFavored ? 9 : 6} fill={rcFavored ? '#22c55e' : '#3b82f6'} />
      <text
        x={rcX + 13} y={rcY + 4}
        fill={rcFavored ? '#86efac' : '#93c5fd'}
        fontSize="13" fontFamily="monospace" fontWeight="bold"
      >
        RC
      </text>

      {/* Pin end */}
      <circle cx={pinX} cy={pinY} r={pinFavored ? 9 : 6} fill={pinFavored ? '#22c55e' : '#f97316'} />
      <text
        x={pinX - 36} y={pinY + 4}
        fill={pinFavored ? '#86efac' : '#fdba74'}
        fontSize="13" fontFamily="monospace" fontWeight="bold"
      >
        Pin
      </text>

      {/* Upwind / downwind labels */}
      <text x="110" y="104" textAnchor="middle" fill="#4b5563" fontSize="9" fontFamily="monospace">
        ↑ upwind
      </text>
      <text x="110" y="204" textAnchor="middle" fill="#4b5563" fontSize="9" fontFamily="monospace">
        ↓ downwind
      </text>
    </svg>
  );
}

type LineDirection = 'pin-to-rc' | 'rc-to-pin';

export function LineBiasView() {
  const [windHeading, setWindHeading] = useState('');
  const [lineBearing, setLineBearing] = useState('');
  const [direction, setDirection] = useState<LineDirection>('pin-to-rc');

  const wind = windHeading !== '' ? parseFloat(windHeading) : NaN;
  const line = lineBearing !== '' ? parseFloat(lineBearing) : NaN;
  const valid = !isNaN(wind) && !isNaN(line);

  // Square bearing offset: +90 when running Pin→RC, +270 (i.e. -90) when running RC→Pin
  const squareBearing = valid
    ? (wind + (direction === 'pin-to-rc' ? 90 : 270) + 360) % 360
    : null;

  // Raw diff relative to square for whichever direction was run.
  // Normalize so that positive always means RC is upwind (for the diagram and result).
  const rawDiff = valid && squareBearing !== null ? angleDiff(line, squareBearing) : 0;
  const diff = direction === 'pin-to-rc' ? rawDiff : -rawDiff;

  const favored = !valid ? null : Math.abs(diff) < 1 ? 'Square' : diff > 0 ? 'RC' : 'Pin';
  const bias = Math.abs(diff);

  const resultBg =
    favored === 'RC' ? 'bg-blue-950 border border-blue-700' :
    favored === 'Pin' ? 'bg-orange-950 border border-orange-700' :
    'bg-gray-700';

  const dirLabel = direction === 'pin-to-rc' ? 'Pin → RC' : 'RC → Pin';

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <TopBar title="Start Line Bias" />
      <main className="pt-14 pb-20 px-4 mt-4 space-y-4">

        <div className="bg-gray-800 rounded-xl p-4 text-sm text-gray-300 leading-relaxed">
          Head into the wind and record your compass heading, then motor along the line and record that bearing. Select which direction you ran the line.
        </div>

        {/* Step 1 — Into wind */}
        <div className="bg-gray-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm shrink-0">
              1
            </span>
            <div>
              <div className="font-semibold">Head Into the Wind</div>
              <div className="text-xs text-gray-400">Point bow directly into wind — record magnetic compass reading</div>
            </div>
          </div>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            max="359"
            step="1"
            value={windHeading}
            onChange={(e) => setWindHeading(e.target.value)}
            placeholder="°M"
            className="w-full bg-gray-700 rounded-lg px-4 py-4 text-white text-3xl text-center placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Step 2 — Run the line */}
        <div className="bg-gray-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 rounded-full w-7 h-7 flex items-center justify-center font-bold text-sm shrink-0">
              2
            </span>
            <div>
              <div className="font-semibold">Run the Start Line</div>
              <div className="text-xs text-gray-400">Motor along the line — record magnetic compass reading</div>
            </div>
          </div>

          {/* Direction toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-600">
            {(['pin-to-rc', 'rc-to-pin'] as LineDirection[]).map((d) => (
              <button
                key={d}
                onClick={() => setDirection(d)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  direction === d
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400 active:bg-gray-600'
                }`}
              >
                {d === 'pin-to-rc' ? 'Pin → RC' : 'RC → Pin'}
              </button>
            ))}
          </div>

          <input
            type="number"
            inputMode="decimal"
            min="0"
            max="359"
            step="1"
            value={lineBearing}
            onChange={(e) => setLineBearing(e.target.value)}
            placeholder={`°M  (${dirLabel})`}
            className="w-full bg-gray-700 rounded-lg px-4 py-4 text-white text-3xl text-center placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Result */}
        {favored && (
          <div className={`rounded-xl p-6 text-center ${resultBg}`}>
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Favored End</div>
            <div className="text-6xl font-black mb-2 tracking-tight">
              {favored === 'RC' ? 'RC' : favored === 'Pin' ? 'Pin' : '—'}
            </div>
            {bias >= 1 && (
              <div className="text-2xl font-semibold text-gray-200">{bias.toFixed(1)}° bias</div>
            )}
            <div className="text-sm text-gray-400 mt-2">
              {favored === 'RC' && 'Start near the Race Committee boat'}
              {favored === 'Pin' && 'Start near the pin mark'}
              {favored === 'Square' && 'Line is square — no meaningful bias'}
            </div>
            {valid && (
              <div className="text-xs text-gray-500 mt-3">
                Square line (Pin→RC): {Math.round((wind + 90 + 360) % 360)}°M
              </div>
            )}
          </div>
        )}

        {/* Diagram */}
        {valid && (
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 text-center mb-2 uppercase tracking-wide">Start Line Diagram</div>
            <LineBiasDiagram diff={diff} />
          </div>
        )}

        {/* Reset */}
        {valid && (
          <button
            onClick={() => { setWindHeading(''); setLineBearing(''); }}
            className="w-full bg-gray-700 active:bg-gray-600 rounded-xl py-3 text-gray-300 text-sm"
          >
            Reset
          </button>
        )}

      </main>
    </div>
  );
}
