import { useNavigate } from 'react-router-dom';
import { TopBar } from '../../components/common/NavBar';
import { useVesselStore } from '../../store/vesselStore';
import { BUILTIN_POLARS, loadPolarFromURL } from '../../lib/polars';

export function PolarsView() {
  const navigate = useNavigate();
  const { polars, setPolars } = useVesselStore();

  const handleLoadBuiltin = async (file: string, label: string) => {
    try {
      const p = await loadPolarFromURL(`/polar-resources/${file}`);
      await setPolars({ ...p, name: label });
    } catch (e) {
      alert('Failed to load polar file');
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Vessel Polars" />
      <main className="pt-14 pb-20 px-4 mt-4">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <p className="text-sm text-gray-500">Current polars</p>
          <p className="font-semibold text-gray-800 text-lg">{polars?.name ?? 'None loaded'}</p>
          {polars && (
            <p className="text-sm text-gray-500">{polars.entries.length} entries</p>
          )}
        </div>

        {polars && (
          <div className="mb-4">
            <button
              onClick={() => navigate('/land/polars/table')}
              className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold"
            >
              View / Edit Polar Table
            </button>
          </div>
        )}

        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Load Built-in Polar</h2>
        <ul className="space-y-2">
          {BUILTIN_POLARS.map(({ label, file }) => (
            <li key={file}>
              <button
                onClick={() => handleLoadBuiltin(file, label)}
                className="w-full bg-white rounded-xl px-4 py-3 shadow-sm text-left flex items-center gap-3 active:bg-gray-100"
              >
                <span className="text-xl">📐</span>
                <span className="font-medium text-gray-800">{label}</span>
                {polars?.name === label && <span className="ml-auto text-green-600 text-sm">✓ Active</span>}
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
