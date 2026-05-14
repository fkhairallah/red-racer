import { useRef, useState } from 'react';
import { TopBar } from '../../components/common/NavBar';
import { useWaypointStore } from '../../store/waypointStore';
import { useMarkStore } from '../../store/markStore';
import { useSettingsStore } from '../../store/settingsStore';
import { loadFromXML, saveToXML, downloadFile } from '../../lib/gpx';
import { generateId } from '../../lib/persistence';

export function ImportExport() {
  const { waypoints, add: addWp } = useWaypointStore();
  const { marks, add: addMark } = useMarkStore();
  const { email, setEmail } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importStatus, setImportStatus] = useState('');
  const [exportEmail, setExportEmail] = useState(email);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const { waypoints: wps, marks: mks } = loadFromXML(text);
      for (const wp of wps) await addWp({ ...wp, id: generateId() } as never);
      for (const m of mks) await addMark({ ...m, id: generateId() } as never);
      setImportStatus(`Imported ${wps.length} waypoints and ${mks.length} marks`);
    } catch {
      setImportStatus('Failed to parse GPX file');
    }
  };

  const handleExportGPX = () => {
    const xml = saveToXML(waypoints, marks);
    downloadFile(xml, 'redracer-export.gpx', 'application/gpx+xml');
  };

  const handleSaveEmail = async () => {
    await setEmail(exportEmail);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Import / Export" />
      <main className="pt-14 pb-20 px-4 mt-4 space-y-6">

        <section className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Import GPX File</h2>
          <p className="text-sm text-gray-500">
            Import waypoints and marks from a GPX file created by a chartplotter or desktop mapping app.
          </p>
          {importStatus && <p className="text-sm text-green-700">{importStatus}</p>}
          <input
            ref={fileInputRef}
            type="file"
            accept=".gpx,.xml"
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold"
          >
            📂 Choose GPX File
          </button>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Export GPX</h2>
          <p className="text-sm text-gray-500">
            Download {waypoints.length} waypoints and {marks.length} marks as a GPX file.
          </p>
          <button
            onClick={handleExportGPX}
            className="w-full bg-red-700 text-white rounded-lg py-3 font-semibold"
          >
            ⬇️ Download GPX File
          </button>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Email Address</h2>
          <p className="text-sm text-gray-500">Saved for quick reference when exporting.</p>
          <input
            type="email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            value={exportEmail}
            onChange={(e) => setExportEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <button onClick={handleSaveEmail} className="w-full bg-gray-700 text-white rounded-lg py-2 text-sm font-semibold">
            Save Email
          </button>
        </section>
      </main>
    </div>
  );
}
