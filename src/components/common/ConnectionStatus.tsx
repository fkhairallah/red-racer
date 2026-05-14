import { useGeoStore } from '../../store/geoStore';

export function ConnectionStatus() {
  const { isConnected, accuracy } = useGeoStore();

  return (
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
        isConnected ? (accuracy < 15 ? 'bg-green-500' : 'bg-yellow-500') : 'bg-red-500'
      }`}
      title={isConnected ? `GPS: ±${accuracy.toFixed(0)}m` : 'No GPS'}
    >
      {isConnected ? 'G' : '!'}
    </div>
  );
}
