import type { SailPoint } from '../types';

type SailPointListener = (point: SailPoint) => void;

class GeoService {
  private watchId: number | null = null;
  private listeners: Set<SailPointListener> = new Set();
  private lastPoint: SailPoint | null = null;
  private _accuracy: number = Infinity;
  private _isConnected: boolean = false;

  get isConnected() { return this._isConnected; }
  get accuracy() { return this._accuracy; }
  get currentData() { return this.lastPoint; }

  start() {
    if (this.watchId !== null) return;
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this.handlePosition(pos),
      (err) => this.handleError(err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  }

  stop() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this._isConnected = false;
  }

  listen(fn: SailPointListener) {
    this.listeners.add(fn);
  }

  unlisten(fn: SailPointListener) {
    this.listeners.delete(fn);
  }

  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
      });
    });
  }

  private handlePosition(pos: GeolocationPosition) {
    this._isConnected = true;
    this._accuracy = pos.coords.accuracy;

    const point: SailPoint = {
      lat: pos.coords.latitude,
      lon: pos.coords.longitude,
      timestamp: new Date(pos.timestamp),
      speedOverGround: pos.coords.speed != null ? pos.coords.speed * 1.944 : 0, // m/s → knots
      courseOverGround: pos.coords.heading ?? 0,
    };

    this.lastPoint = point;
    this.listeners.forEach((fn) => fn(point));
  }

  private handleError(err: GeolocationPositionError) {
    this._isConnected = false;
    console.warn('Geolocation error:', err.message);
  }
}

export const geoService = new GeoService();
