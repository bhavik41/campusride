import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchParams } from '../types';

interface SearchBarProps {
  initialValues?: SearchParams;
  onSearch?: (params: SearchParams) => void;
  compact?: boolean;
}

export default function SearchBar({ initialValues, onSearch, compact = false }: SearchBarProps) {
  const navigate = useNavigate();
  const [params, setParams] = useState<SearchParams>({
    from: initialValues?.from || '',
    to: initialValues?.to || '',
    date: initialValues?.date || '',
    rideType: initialValues?.rideType || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(params);
    } else {
      const query = new URLSearchParams();
      if (params.from) query.set('from', params.from);
      if (params.to) query.set('to', params.to);
      if (params.date) query.set('date', params.date);
      if (params.rideType) query.set('rideType', params.rideType);
      navigate(`/search?${query.toString()}`);
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="From"
          value={params.from}
          onChange={(e) => setParams({ ...params, from: e.target.value })}
          className="input-field flex-1 min-w-[120px]"
        />
        <input
          type="text"
          placeholder="To"
          value={params.to}
          onChange={(e) => setParams({ ...params, to: e.target.value })}
          className="input-field flex-1 min-w-[120px]"
        />
        <input
          type="date"
          value={params.date}
          onChange={(e) => setParams({ ...params, date: e.target.value })}
          className="input-field flex-1 min-w-[140px]"
        />
        <select
          value={params.rideType}
          onChange={(e) => setParams({ ...params, rideType: e.target.value as SearchParams['rideType'] })}
          className="input-field flex-1 min-w-[140px]"
        >
          <option value="">All Ride Types</option>
          <option value="LONG_DISTANCE">Long Distance</option>
          <option value="SHORT_DISTANCE">Campus / Short</option>
        </select>
        <button type="submit" className="btn-primary whitespace-nowrap">
          Search
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-3xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              type="text"
              placeholder="Departure city"
              value={params.from}
              onChange={(e) => setParams({ ...params, from: e.target.value })}
              className="input-field pl-9"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              type="text"
              placeholder="Destination city"
              value={params.to}
              onChange={(e) => setParams({ ...params, to: e.target.value })}
              className="input-field pl-9"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={params.date}
            onChange={(e) => setParams({ ...params, date: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ride Type</label>
          <select
            value={params.rideType}
            onChange={(e) => setParams({ ...params, rideType: e.target.value as SearchParams['rideType'] })}
            className="input-field"
          >
            <option value="">All Ride Types</option>
            <option value="LONG_DISTANCE">🛣️ Long Distance (Intercity)</option>
            <option value="SHORT_DISTANCE">🎓 Campus / Short Distance</option>
          </select>
        </div>
      </div>
      <button type="submit" className="btn-primary w-full py-3 text-base">
        <span className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search Rides
        </span>
      </button>
    </form>
  );
}
