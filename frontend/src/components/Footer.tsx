import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white mb-3">
              <span className="text-2xl">🚗</span>
              <span>CampusRide</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-xs">
              The ride-sharing platform built for college students and everyone. Share rides, save money, and reduce your carbon footprint.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/search" className="hover:text-white transition-colors">Find a Ride</Link></li>
              <li><Link to="/post-ride" className="hover:text-white transition-colors">Post a Ride</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Profile</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-gray-500 text-center">
          <p>© {new Date().getFullYear()} CampusRide. Built with ❤️ for students everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
