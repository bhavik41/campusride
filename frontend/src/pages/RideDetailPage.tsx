import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Ride } from '../types';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import api, { getErrorMessage } from '../lib/api';
import { PageLoader } from '../components/LoadingSpinner';
import Alert from '../components/Alert';

export default function RideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { startConversation } = useChatStore();
  const [startingChat, setStartingChat] = useState(false);

  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/rides/${id}`)
      .then(({ data }) => setRide(data.ride))
      .catch(() => navigate('/search'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const userBooking = ride?.bookings?.find(
    (b) => b.userId === user?.id && b.status !== 'CANCELLED'
  );

  const isDriver = ride?.driverId === user?.id;
  const canBook =
    isAuthenticated &&
    !isDriver &&
    !userBooking &&
    ride?.status === 'ACTIVE' &&
    (ride?.seatsLeft ?? 0) > 0;

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setBooking(true);
    setAlert(null);
    try {
      await api.post(`/rides/${id}/book`, { seats: seatsToBook });
      setAlert({ type: 'success', message: `Successfully booked ${seatsToBook} seat(s)! Check your dashboard for details.` });
      // Refresh ride data
      const { data } = await api.get(`/rides/${id}`);
      setRide(data.ride);
    } catch (err) {
      setAlert({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setBooking(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!userBooking) return;
    setCancelling(true);
    setAlert(null);
    try {
      await api.delete(`/rides/${id}/book`);
      setAlert({ type: 'success', message: 'Booking cancelled successfully.' });
      const { data } = await api.get(`/rides/${id}`);
      setRide(data.ride);
    } catch (err) {
      setAlert({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelRide = async () => {
    if (!confirm('Are you sure you want to cancel this ride? All bookings will be cancelled.')) return;
    try {
      await api.delete(`/rides/${id}`);
      navigate('/dashboard');
    } catch (err) {
      setAlert({ type: 'error', message: getErrorMessage(err) });
    }
  };

  const handleMessageDriver = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!ride) return;
    setStartingChat(true);
    try {
      const conv = await startConversation(ride.id, ride.driverId);
      navigate(`/chat/${conv.id}`);
    } catch (err) {
      setAlert({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!ride) return null;

  const departureDate = new Date(ride.departureDate);
  const isShortDistance = ride.rideType === 'SHORT_DISTANCE';
  const isFull = ride.seatsLeft === 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link to="/search" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to search
      </Link>

      {alert && (
        <div className="mb-6">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {isShortDistance ? (
                    <span className="badge-short">🎓 Campus / Short Distance</span>
                  ) : (
                    <span className="badge-long">🛣️ Long Distance</span>
                  )}
                  {ride.status === 'CANCELLED' && (
                    <span className="inline-flex items-center bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
                      Cancelled
                    </span>
                  )}
                  {ride.status === 'COMPLETED' && (
                    <span className="inline-flex items-center bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                      Completed
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {ride.fromCity} → {ride.toCity}
                </h1>
                {(ride.fromAddress || ride.toAddress) && (
                  <p className="text-gray-500 text-sm mt-1">
                    {ride.fromAddress} {ride.fromAddress && ride.toAddress && '→'} {ride.toAddress}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-700">${ride.pricePerSeat}</div>
                <div className="text-sm text-gray-500">per seat</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-1">Date</p>
                <p className="font-semibold text-sm">{format(departureDate, 'MMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Time</p>
                <p className="font-semibold text-sm">{format(departureDate, 'h:mm a')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Seats</p>
                <p className="font-semibold text-sm">{ride.seats}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Seats Left</p>
                <p className={`font-semibold text-sm ${isFull ? 'text-red-500' : 'text-secondary-600'}`}>
                  {isFull ? 'Full' : ride.seatsLeft}
                </p>
              </div>
            </div>

            {ride.description && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">About this ride</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{ride.description}</p>
              </div>
            )}
          </div>

          {/* Passengers */}
          {ride.bookings && ride.bookings.filter(b => b.status !== 'CANCELLED').length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Passengers ({ride.bookings.filter(b => b.status !== 'CANCELLED').length})
              </h3>
              <div className="space-y-3">
                {ride.bookings
                  .filter(b => b.status !== 'CANCELLED')
                  .map((booking) => (
                    <div key={booking.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-700 font-semibold text-sm">
                        {booking.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{booking.user?.name}</p>
                        <p className="text-xs text-gray-500">{booking.seats} seat{booking.seats !== 1 ? 's' : ''}</p>
                      </div>
                      {booking.user?.isStudent && (
                        <span className="badge-student ml-auto">🎓 Student</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Driver card */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Driver</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                {ride.driver.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{ride.driver.name}</p>
                {ride.driver.university && (
                  <p className="text-xs text-gray-500">{ride.driver.university}</p>
                )}
                {ride.driver.isStudent && (
                  <span className="badge-student mt-1">🎓 Verified Student</span>
                )}
              </div>
            </div>
            {ride.driver.bio && (
              <p className="text-sm text-gray-600 border-t border-gray-100 pt-3">{ride.driver.bio}</p>
            )}
            {isDriver && ride.driver.phone && (
              <p className="text-sm text-gray-600 mt-2">📞 {ride.driver.phone}</p>
            )}
            {!isDriver && isAuthenticated && (
              <button
                onClick={handleMessageDriver}
                disabled={startingChat}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {startingChat ? 'Opening chat…' : 'Message Driver'}
              </button>
            )}
            {!isDriver && !isAuthenticated && (
              <Link
                to="/login"
                className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Login to Message Driver
              </Link>
            )}
          </div>

          {/* Booking card */}
          <div className="card p-5">
            {isDriver ? (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">You are the driver of this ride.</p>
                {ride.status === 'ACTIVE' && (
                  <button
                    onClick={handleCancelRide}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Cancel Ride
                  </button>
                )}
              </div>
            ) : userBooking ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-secondary-600 text-lg">✅</span>
                  <p className="text-sm font-medium text-gray-900">You have a booking!</p>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  {userBooking.seats} seat{userBooking.seats !== 1 ? 's' : ''} booked · Status: {userBooking.status}
                </p>
                {ride.driver.phone && (
                  <p className="text-sm text-gray-600 mb-4">📞 Driver: {ride.driver.phone}</p>
                )}
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              </div>
            ) : canBook ? (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Book This Ride</h3>
                {isShortDistance && !user?.isStudent && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-purple-700">
                      🎓 This is a campus ride. You need a verified student account to book.
                    </p>
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seats</label>
                  <select
                    value={seatsToBook}
                    onChange={(e) => setSeatsToBook(parseInt(e.target.value))}
                    className="input-field"
                  >
                    {Array.from({ length: Math.min(ride.seatsLeft, 4) }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} seat{n !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between text-sm mb-4 py-3 border-t border-gray-100">
                  <span className="text-gray-600">Total</span>
                  <span className="font-bold text-lg text-primary-700">
                    ${(ride.pricePerSeat * seatsToBook).toFixed(2)}
                  </span>
                </div>
                {!isAuthenticated ? (
                  <Link to="/login" className="btn-primary w-full text-center block">
                    Login to Book
                  </Link>
                ) : (
                  <button
                    onClick={handleBook}
                    disabled={booking || (isShortDistance && !user?.isStudent)}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {booking ? 'Booking...' : 'Book Now'}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-2">
                {ride.status === 'CANCELLED' ? (
                  <p className="text-red-500 text-sm font-medium">This ride has been cancelled.</p>
                ) : ride.status === 'COMPLETED' ? (
                  <p className="text-gray-500 text-sm">This ride has been completed.</p>
                ) : isFull ? (
                  <p className="text-red-500 text-sm font-medium">This ride is fully booked.</p>
                ) : (
                  <p className="text-gray-500 text-sm">Booking not available.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
