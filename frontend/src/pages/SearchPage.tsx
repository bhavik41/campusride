import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import RideCard from '../components/RideCard';
import { PageLoader } from '../components/LoadingSpinner';
import { Ride, SearchParams, PaginationInfo } from '../types';
import api from '../lib/api';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const params: SearchParams = {
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    date: searchParams.get('date') || '',
    rideType: (searchParams.get('rideType') as SearchParams['rideType']) || '',
  };

  const fetchRides = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (params.from) query.set('from', params.from);
      if (params.to) query.set('to', params.to);
      if (params.date) query.set('date', params.date);
      if (params.rideType) query.set('rideType', params.rideType);
      query.set('page', String(page));
      query.set('limit', '12');

      const { data } = await api.get(`/rides?${query.toString()}`);
      setRides(data.rides);
      setPagination(data.pagination);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [params.from, params.to, params.date, params.rideType]);

  useEffect(() => {
    fetchRides(1);
  }, [fetchRides]);

  const handleSearch = (newParams: SearchParams) => {
    const query = new URLSearchParams();
    if (newParams.from) query.set('from', newParams.from);
    if (newParams.to) query.set('to', newParams.to);
    if (newParams.date) query.set('date', newParams.date);
    if (newParams.rideType) query.set('rideType', newParams.rideType);
    window.history.pushState({}, '', `/search?${query.toString()}`);
    fetchRides(1);
  };

  const hasFilters = params.from || params.to || params.date || params.rideType;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search bar */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Find a Ride</h1>
        <SearchBar initialValues={params} onSearch={handleSearch} compact />
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          {!loading && (
            <p className="text-gray-600 text-sm">
              {pagination?.total === 0
                ? 'No rides found'
                : `${pagination?.total} ride${pagination?.total !== 1 ? 's' : ''} found`}
              {hasFilters && (
                <span className="text-gray-400">
                  {params.from && ` from ${params.from}`}
                  {params.to && ` to ${params.to}`}
                  {params.date && ` on ${params.date}`}
                </span>
              )}
            </p>
          )}
        </div>
        {params.rideType && (
          <span className={params.rideType === 'SHORT_DISTANCE' ? 'badge-short' : 'badge-long'}>
            {params.rideType === 'SHORT_DISTANCE' ? '🎓 Campus Rides' : '🛣️ Long Distance'}
          </span>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <PageLoader />
      ) : rides.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No rides found</h3>
          <p className="text-gray-500 mb-6">
            {hasFilters
              ? 'Try adjusting your search filters or check back later.'
              : 'No rides are currently available. Check back soon!'}
          </p>
          {hasFilters && (
            <button
              onClick={() => {
                window.history.pushState({}, '', '/search');
                fetchRides(1);
              }}
              className="btn-outline"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rides.map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => fetchRides(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-outline text-sm disabled:opacity-40"
              >
                ← Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => fetchRides(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => fetchRides(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="btn-outline text-sm disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
