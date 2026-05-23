import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../lib/api';
import Alert from '../components/Alert';

interface RideForm {
  fromCity: string;
  toCity: string;
  fromAddress: string;
  toAddress: string;
  departureDate: string;
  departureTime: string;
  seats: number;
  pricePerSeat: number;
  rideType: 'SHORT_DISTANCE' | 'LONG_DISTANCE';
  description: string;
}

export default function PostRidePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<RideForm>({
    fromCity: '',
    toCity: '',
    fromAddress: '',
    toAddress: '',
    departureDate: '',
    departureTime: '08:00',
    seats: 2,
    pricePerSeat: 20,
    rideType: 'LONG_DISTANCE',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'seats' || name === 'pricePerSeat' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.fromCity.trim() || !form.toCity.trim()) {
      setError('Please enter departure and destination cities.');
      return;
    }
    if (!form.departureDate) {
      setError('Please select a departure date.');
      return;
    }

    const departureDate = new Date(`${form.departureDate}T${form.departureTime}:00`);
    if (departureDate <= new Date()) {
      setError('Departure date must be in the future.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/rides', {
        fromCity: form.fromCity.trim(),
        toCity: form.toCity.trim(),
        fromAddress: form.fromAddress.trim() || undefined,
        toAddress: form.toAddress.trim() || undefined,
        departureDate: departureDate.toISOString(),
        seats: form.seats,
        pricePerSeat: form.pricePerSeat,
        rideType: form.rideType,
        description: form.description.trim() || undefined,
      });
      navigate(`/rides/${data.ride.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const isShortDistance = form.rideType === 'SHORT_DISTANCE';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Post a Ride</h1>
        <p className="text-gray-600 mt-2">Share your journey and help others travel affordably.</p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ride Type */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Ride Type</h2>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                form.rideType === 'LONG_DISTANCE'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="rideType"
                value="LONG_DISTANCE"
                checked={form.rideType === 'LONG_DISTANCE'}
                onChange={handleChange}
                className="sr-only"
              />
              <span className="text-3xl">🛣️</span>
              <div className="text-center">
                <p className="font-semibold text-sm text-gray-900">Long Distance</p>
                <p className="text-xs text-gray-500">Intercity, 50km+</p>
                <p className="text-xs text-primary-600 mt-1">All users</p>
              </div>
            </label>
            <label
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                form.rideType === 'SHORT_DISTANCE'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="rideType"
                value="SHORT_DISTANCE"
                checked={form.rideType === 'SHORT_DISTANCE'}
                onChange={handleChange}
                className="sr-only"
              />
              <span className="text-3xl">🏙️</span>
              <div className="text-center">
                <p className="font-semibold text-sm text-gray-900">Short Distance</p>
                <p className="text-xs text-gray-500">Within city, ~50km</p>
                <p className="text-xs text-purple-600 mt-1">Open to everyone</p>
              </div>
            </label>
          </div>
          {isShortDistance && (
            <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-xs text-purple-700">
                🏙️ Short distance rides are great for campus trips, airport runs, and local travel. Open to all users — students get a special badge!
              </p>
            </div>
          )}
        </div>

        {/* Route */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Route</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fromCity"
                  value={form.fromCity}
                  onChange={handleChange}
                  placeholder="e.g. Toronto"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="toCity"
                  value={form.toCity}
                  onChange={handleChange}
                  placeholder="e.g. Montreal"
                  className="input-field"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Address <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="fromAddress"
                  value={form.fromAddress}
                  onChange={handleChange}
                  placeholder="e.g. Union Station"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dropoff Address <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="toAddress"
                  value={form.toAddress}
                  onChange={handleChange}
                  placeholder="e.g. Gare Centrale"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Departure</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="departureDate"
                value={form.departureDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="departureTime"
                value={form.departureTime}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>
        </div>

        {/* Seats & Price */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Seats & Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Seats <span className="text-red-500">*</span>
              </label>
              <select
                name="seats"
                value={form.seats}
                onChange={handleChange}
                className="input-field"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>{n} seat{n !== 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price per Seat ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="pricePerSeat"
                value={form.pricePerSeat}
                onChange={handleChange}
                min="0"
                step="0.50"
                className="input-field"
                required
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Total potential earnings: ${(form.pricePerSeat * form.seats).toFixed(2)}
          </p>
        </div>

        {/* Description */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Description</h2>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Tell passengers about your ride: stops, luggage space, music preferences, pet policy, etc."
            rows={4}
            className="input-field resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/500</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-3 text-base"
        >
          {submitting ? 'Posting...' : 'Post Ride'}
        </button>
      </form>
    </div>
  );
}
