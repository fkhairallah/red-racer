import { TopBar } from '../../components/common/NavBar';
import { useVesselStore } from '../../store/vesselStore';

export function PolarTable() {
  const { polars } = useVesselStore();

  if (!polars) return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Polar Table" />
      <main className="pt-14 pb-20 px-4 flex items-center justify-center h-64">
        <p className="text-gray-400">No polars loaded</p>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title={polars.name} />
      <main className="pt-14 pb-20 overflow-auto">
        <table className="w-full text-sm font-mono">
          <thead className="bg-gray-100 sticky top-14">
            <tr>
              <th className="px-3 py-2 text-left">TWS</th>
              <th className="px-3 py-2 text-left">TWA</th>
              <th className="px-3 py-2 text-left">Speed</th>
              <th className="px-3 py-2 text-left">VMG</th>
              <th className="px-3 py-2 text-left">Heel</th>
            </tr>
          </thead>
          <tbody>
            {polars.entries.map((e, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-1">{e.tws.toFixed(1)}</td>
                <td className="px-3 py-1">{e.twa.toFixed(1)}</td>
                <td className="px-3 py-1">{e.v.toFixed(2)}</td>
                <td className="px-3 py-1">{e.vmg.toFixed(2)}</td>
                <td className="px-3 py-1">{(e.heel ?? 0).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
