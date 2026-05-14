import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { TopBar } from '../../components/common/NavBar';
import { useCourseStore } from '../../store/courseStore';
import { useMarkStore } from '../../store/markStore';
import { useGeoStore } from '../../store/geoStore';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default Leaflet marker icons with Vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function RecenterOnBoat({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lon], map.getZoom()); }, [lat, lon, map]);
  return null;
}

export function CourseChart() {
  const { course } = useCourseStore();
  const { marks } = useMarkStore();
  const { currentPoint } = useGeoStore();

  const courseMarks = course.markIds
    .map((id) => marks.find((m) => m.id === id))
    .filter((m): m is typeof marks[0] => !!m && m.lat != null);

  const polyline = courseMarks.map((m) => [m.lat!, m.lon!] as [number, number]);
  if (course.rcBoat) polyline.unshift([course.rcBoat.lat, course.rcBoat.lon]);

  const center: [number, number] = currentPoint
    ? [currentPoint.lat, currentPoint.lon]
    : courseMarks[0]
    ? [courseMarks[0].lat!, courseMarks[0].lon!]
    : [41.2, -72.9];

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar title="Course Chart" />
      <div className="flex-1 pt-12">
        <MapContainer center={center} zoom={13} style={{ height: 'calc(100vh - 96px)', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* RC Boat */}
          {course.rcBoat && (
            <Marker position={[course.rcBoat.lat, course.rcBoat.lon]}>
              <Popup>RC Boat</Popup>
            </Marker>
          )}
          {/* Pin */}
          {course.pinMark && (
            <Marker position={[course.pinMark.lat, course.pinMark.lon]}>
              <Popup>Pin</Popup>
            </Marker>
          )}
          {/* Course marks */}
          {courseMarks.map((m, i) => (
            <Marker key={m.id} position={[m.lat!, m.lon!]}>
              <Popup>{i + 1}. {m.name}</Popup>
            </Marker>
          ))}
          {/* Course line */}
          {polyline.length > 1 && <Polyline positions={polyline} color="#cc0000" dashArray="8 4" />}
          {/* Boat */}
          {currentPoint && (
            <>
              <Marker position={[currentPoint.lat, currentPoint.lon]}>
                <Popup>Boat</Popup>
              </Marker>
              <RecenterOnBoat lat={currentPoint.lat} lon={currentPoint.lon} />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
