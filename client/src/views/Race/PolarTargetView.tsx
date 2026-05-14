import { TopBar } from '../../components/common/NavBar';
import { Gauge, GaugeNumeric } from '../../components/gauges/Gauge';
import { useGeoStore } from '../../store/geoStore';
import { useVesselStore } from '../../store/vesselStore';
import { getPolarTarget } from '../../lib/polars';

export function PolarTargetView() {
  const { currentPoint } = useGeoStore();
  const { polars } = useVesselStore();

  const target = (polars && currentPoint?.trueWindSpeed != null && currentPoint.trueWindAngle != null)
    ? getPolarTarget(polars, currentPoint.trueWindSpeed, currentPoint.trueWindAngle)
    : null;

  const sow = currentPoint?.speedOverWater;
  const deltaSpeed = target && sow != null ? target.v - sow : null;
  const vmg = currentPoint?.VMG;
  const deltaVMG = target && vmg != null ? target.vmg - vmg : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <TopBar title="Polar Targets" />
      <main className="pt-14 pb-20 px-4 mt-4">
        {!polars && (
          <p className="text-gray-400 text-center mt-8">No polars loaded. Load them in Land → Vessel Polars.</p>
        )}
        {!currentPoint?.trueWindSpeed && (
          <p className="text-gray-400 text-center mt-4 text-sm">
            Polar targets require TWS/TWA data from instruments.
          </p>
        )}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <GaugeNumeric label="Target Speed" value={target?.v} precision={1} suffix=" kts" />
          <Gauge
            label="Δ Speed"
            value={deltaSpeed != null ? (deltaSpeed > 0 ? `+${deltaSpeed.toFixed(1)}` : 'OK') : 'N/A'}
            highlight={deltaSpeed == null || deltaSpeed <= 0}
          />
          <GaugeNumeric label="Target VMG" value={target?.vmg} precision={1} suffix=" kts" />
          <Gauge
            label="Δ VMG"
            value={deltaVMG != null ? (deltaVMG > 0 ? `+${deltaVMG.toFixed(1)}` : 'OK') : 'N/A'}
            highlight={deltaVMG == null || deltaVMG <= 0}
          />
          <GaugeNumeric label="Target Angle" value={target?.twa} precision={0} suffix="°" />
          <GaugeNumeric label="Target Heel" value={target?.heel} precision={0} suffix="°" />
        </div>
      </main>
    </div>
  );
}
