import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Ride } from '../types';

interface RideCardProps {
  ride: Ride;
  showBookButton?: boolean;
}

export default function RideCard({ ride, showBookButton = true }: RideCardProps) {
  const departureDate = new Date(ride.departureDate);
  const isShortDistance = ride.rideType === 'SHORT_DISTANCE';
  const isFull = ride.seatsLeft === 0;

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isShortDistance ? (
                <span className="badge-short">🎓 Campus Ride</span>
              ) : (
                <span className="badge-long">🛣️ Long Distance</span>
              )}
              {ride.driver.isStudent && (
                <span className="badge-student">Student Driver</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <span>{ride.fromCity}</span>
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span>{ride.toCity}</span>
            </div>
            {(ride.fromAddress || ride.toAddress) && (
              <p className="text-xs text-gray-500 mt-0.5">
                {ride.fromAddress && <span>{ride.fromAddress}</span>}
                {ride.fromAddress && ride.toAddress && <span> → </span>}
                {ride.toAddress && <span>{ride.toAddress}</span>}
              </p>
            )}
          </div>
          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-primary-700">
              ${ride.pricePerSeat}
            </div>
            <div className="text-xs text-gray-500">per seat</div>
          </div>
        </div>

        {/* Details row */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{format(departureDate, 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{format(departureDate, 'h:mm a')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className={isFull ? 'text-red-500 font-medium' : 'text-secondary-600 font-medium'}>
              {isFull ? 'Full' : `${ride.seatsLeft} seat${ride.seatsLeft !== 1 ? 's' : ''} left`}
            </span>
          </div>
        </div>

        {/* Description */}
        {ride.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{ride.description}</p>
        )}

        {/* Driver + Action */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
              {ride.driver.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{ride.driver.name}</p>
              {ride.driver.university && (
                <p className="text-xs text-gray-500">{ride.driver.university}</p>
              )}
            </div>
          </div>
          {showBookButton && (
            <Link
              to={`/rides/${ride.id}`}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                isFull
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              {isFull ? 'Full' : 'View & Book'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
