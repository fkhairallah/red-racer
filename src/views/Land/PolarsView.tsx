import { TopBar } from '../../components/common/NavBar';
import { useVesselStore } from '../../store/vesselStore';
import { BUILTIN_POLARS } from '../../lib/polars';

export function PolarsView() {
  const { polars } = useVesselStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Vessel Polars" />
      <main className="pt-14 pb-20 px-4 mt-4">

        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <p className="text-sm text-gray-500">Active polars</p>
          <p className="font-semibold text-gray-800 text-lg">{polars?.name ?? 'None loaded'}</p>
          {polars && <p className="text-sm text-gray-500">{polars.entries.length} entries</p>}
        </div>

        <p className="text-xs text-gray-400 mb-3 text-center">
          Polar selection has moved to Vessel Dynamics.
        </p>

        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Available Polar Curves</h2>
        <ul className="space-y-2 opacity-50 pointer-events-none select-none">
          {BUILTIN_POLARS.map(({ label }) => (
            <li key={label}>
              <div className="w-full bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
                <span className="text-xl">📐</span>
                <span className="font-medium text-gray-800">{label}</span>
                {polars?.name === label && (
                  <span className="ml-auto text-green-600 text-sm">✓ Active</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
