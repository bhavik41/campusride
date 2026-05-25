import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import RideCard from '../components/RideCard';
import { PageLoader } from '../components/LoadingSpinner';
import { Ride } from '../types';
import api from '../lib/api';

export default function HomePage() {
  const [featuredRides, setFeaturedRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/rides?limit=6')
      .then(({ data }) => setFeaturedRides(data.rides))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
              <span>🎓</span>
              <span>Built for college students & everyone</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Share Rides,<br />
              <span className="text-secondary-300">Save Money</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto mb-8">
              CampusRide connects drivers and passengers for both short city trips and long intercity journeys. College students can offer short-distance rides too — a feature unique to CampusRide!
            </p>
          </div>
          <div className="flex justify-center">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '10,000+', label: 'Rides Shared' },
              { value: '5,000+', label: 'Students' },
              { value: '50+', label: 'Cities' },
              { value: '$2M+', label: 'Saved by Riders' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl md:text-3xl font-bold text-primary-700">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ride Types */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Two Types of Rides</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Whether you're heading across campus or across the country, we've got you covered.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-8 border-2 border-purple-200 hover:border-purple-400 transition-colors">
              <div className="text-4xl mb-4">🏙️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Short Distance</h3>
              <p className="text-gray-600 mb-4">Within-city rides up to ~50km. Perfect for getting between campuses, to the airport, or around town.</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-center gap-2"><span className="text-purple-500">✓</span> Open to all users</li>
                <li className="flex items-center gap-2"><span className="text-purple-500">✓</span> College students get a verified badge</li>
                <li className="flex items-center gap-2"><span className="text-purple-500">✓</span> Affordable prices for quick trips</li>
              </ul>
              <Link to="/search?rideType=SHORT_DISTANCE" className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                Find Short Distance Rides
              </Link>
            </div>
            <div className="card p-8 border-2 border-primary-200 hover:border-primary-400 transition-colors">
              <div className="text-4xl mb-4">🛣️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Long Distance</h3>
              <p className="text-gray-600 mb-4">Intercity rides 50km+. Share the cost of long trips between cities with fellow travelers.</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-center gap-2"><span className="text-primary-500">✓</span> Open to all users</li>
                <li className="flex items-center gap-2"><span className="text-primary-500">✓</span> Intercity & long distance</li>
                <li className="flex items-center gap-2"><span className="text-primary-500">✓</span> Split fuel costs</li>
              </ul>
              <Link to="/search?rideType=LONG_DISTANCE" className="inline-block btn-primary text-sm">
                Find Long Distance Rides
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rides */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Available Rides</h2>
              <p className="text-gray-600 mt-1">Upcoming rides you can book right now</p>
            </div>
            <Link to="/search" className="btn-outline text-sm hidden sm:block">
              View All Rides
            </Link>
          </div>

          {loading ? (
            <PageLoader />
          ) : featuredRides.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-5xl mb-4">🚗</div>
              <p className="text-lg font-medium">No rides available yet</p>
              <p className="text-sm mt-1">Be the first to post a ride!</p>
              <Link to="/post-ride" className="btn-primary mt-4 inline-block">Post a Ride</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredRides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link to="/search" className="btn-outline">View All Rides</Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-600">Get started in minutes</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: '🔍',
                title: 'Search for a Ride',
                desc: 'Enter your departure city, destination, and travel date to find available rides.',
              },
              {
                step: '2',
                icon: '📋',
                title: 'Book Your Seat',
                desc: 'Choose a ride that fits your schedule and budget, then book your seat instantly.',
              },
              {
                step: '3',
                icon: '🚗',
                title: 'Travel Together',
                desc: 'Meet your driver at the pickup point and enjoy a shared, affordable journey.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">Step {item.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to ride?</h2>
          <p className="text-primary-100 mb-8 text-lg">
            Join thousands of students and travelers sharing rides across Canada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-700 hover:bg-primary-50 font-semibold py-3 px-8 rounded-lg transition-colors">
              Sign Up Free
            </Link>
            <Link to="/search" className="border-2 border-white text-white hover:bg-white/10 font-semibold py-3 px-8 rounded-lg transition-colors">
              Browse Rides
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
