import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Ride, Booking } from '../types';
import { useAuthStore } from '../store/authStore';
import api, { getErrorMessage } from '../lib/api';
import { PageLoader } from '../components/LoadingSpinner';
import Alert from '../components/Alert';

type Tab = 'my-rides' | 'my-bookings';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('my-rides');
  const [rides, setRides] = useState<Ride[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ridesRes, bookingsRes] = await Promise.all([
          api.get('/dashboard/my-rides'),
          api.get('/dashboard/my-bookings'),
        ]);
        setRides(ridesRes.data.rides);
        setBookings(bookingsRes.data.bookings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCancelRide = async (rideId: string) => {
    if (!confirm('Cancel this ride? All bookings will be cancelled.')) return;
    try {
      await api.delete(`/rides/${rideId}`);
      setRides((prev) =>
        prev.map((r) => (r.id === rideId ? { ...r, status: 'CANCELLED' } : r))
      );
      setAlert({ type: 'success', message: 'Ride cancelled successfully.' });
    } catch (err) {
      setAlert({ type: 'error', message: getErrorMessage(err) });
    }
  };

  const handleCancelBooking = async (rideId: string, bookingId: string) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.delete(`/rides/${rideId}/book`);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
      );
      setAlert({ type: 'success', message: 'Booking cancelled successfully.' });
    } catch (err) {
      setAlert({ type: 'error', message: getErrorMessage(err) });
    }
  };

  const activeRides = rides.filter((r) => r.status === 'ACTIVE');
  const activeBookings = bookings.filter((b) => b.status !== 'CANCELLED');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name?.split(' ')[0]}!
            {user?.isStudent && <span className="badge-student ml-2">🎓 Student</span>}
          </p>
        </div>
        <Link to="/post-ride" className="btn-primary text-sm">
          + Post a Ride
        </Link>
      </div>

      {alert && (
        <div className="mb-6">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Rides', value: activeRides.length, icon: '🚗', color: 'bg-primary-50 text-primary-700' },
          { label: 'Total Rides Posted', value: rides.length, icon: '📋', color: 'bg-gray-50 text-gray-700' },
          { label: 'Active Bookings', value: activeBookings.length, icon: '🎫', color: 'bg-secondary-50 text-secondary-700' },
          { label: 'Total Bookings', value: bookings.length, icon: '📊', color: 'bg-gray-50 text-gray-700' },
        ].map((stat) => (
          <div key={stat.label} className={`card p-4 ${stat.color}`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs font-medium opacity-80">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-0">
          {(['my-rides', 'my-bookings'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'my-rides' ? `My Rides (${rides.length})` : `My Bookings (${bookings.length})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : activeTab === 'my-rides' ? (
        <div>
          {rides.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🚗</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No rides posted yet</h3>
              <p className="text-gray-500 mb-6">Share your journey and help others travel affordably.</p>
              <Link to="/post-ride" className="btn-primary">Post Your First Ride</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {rides.map((ride) => (
                <div key={ride.id} className="card p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {ride.rideType === 'SHORT_DISTANCE' ? (
                          <span className="badge-short">🎓 Campus</span>
                        ) : (
                          <span className="badge-long">🛣️ Long Distance</span>
                        )}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          ride.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          ride.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {ride.status}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        {ride.fromCity} → {ride.toCity}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {format(new Date(ride.departureDate), 'MMM d, yyyy · h:mm a')}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>${ride.pricePerSeat}/seat</span>
                        <span>{ride.seatsLeft}/{ride.seats} seats left</span>
                        <span>{(ride.bookings?.filter(b => b.status !== 'CANCELLED') || []).length} passenger{(ride.bookings?.filter(b => b.status !== 'CANCELLED') || []).length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => navigate(`/rides/${ride.id}`)}
                        className="btn-outline text-xs py-1.5 px-3"
                      >
                        View
                      </button>
                      {ride.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleCancelRide(ride.id)}
                          className="text-xs bg-red-50 hover:bg-red-100 text-red-700 py-1.5 px-3 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Passengers list */}
                  {ride.bookings && ride.bookings.filter(b => b.status !== 'CANCELLED').length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2">PASSENGERS</p>
                      <div className="flex flex-wrap gap-2">
                        {ride.bookings
                          .filter(b => b.status !== 'CANCELLED')
                          .map((booking) => (
                            <div key={booking.id} className="flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1">
                              <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
                                {booking.user?.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs text-gray-700">{booking.user?.name}</span>
                              <span className="text-xs text-gray-400">({booking.seats})</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {bookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🎫</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-500 mb-6">Find a ride and book your seat today.</p>
              <Link to="/search" className="btn-primary">Find a Ride</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="card p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {booking.ride.rideType === 'SHORT_DISTANCE' ? (
                          <span className="badge-short">🎓 Campus</span>
                        ) : (
                          <span className="badge-long">🛣️ Long Distance</span>
                        )}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                          booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        {booking.ride.fromCity} → {booking.ride.toCity}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {format(new Date(booking.ride.departureDate), 'MMM d, yyyy · h:mm a')}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>{booking.seats} seat{booking.seats !== 1 ? 's' : ''}</span>
                        <span className="font-medium text-primary-700">
                          ${(booking.ride.pricePerSeat * booking.seats).toFixed(2)} total
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
                          {booking.ride.driver.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-600">Driver: {booking.ride.driver.name}</span>
                        {booking.ride.driver.phone && booking.status === 'CONFIRMED' && (
                          <span className="text-sm text-gray-500">· {booking.ride.driver.phone}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => navigate(`/rides/${booking.ride.id}`)}
                        className="btn-outline text-xs py-1.5 px-3"
                      >
                        View
                      </button>
                      {booking.status !== 'CANCELLED' && booking.ride.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleCancelBooking(booking.ride.id, booking.id)}
                          className="text-xs bg-red-50 hover:bg-red-100 text-red-700 py-1.5 px-3 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
