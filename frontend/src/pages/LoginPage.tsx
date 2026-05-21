import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Alert from '../components/Alert';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string })?.from || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch {
      setError('Invalid email or password. Please try again.');
    }
  };

  const fillDemo = (email: string) => {
    setForm({ email, password: 'password123' });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-primary-700">🚗 CampusRide</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Welcome back</h1>
          <p className="text-gray-600 mt-1">Sign in to your account</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-5">
              <Alert type="error" message={error} onClose={() => setError(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="input-field"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="input-field"
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-2.5"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-3">Demo accounts (password: password123)</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fillDemo('alice@university.edu')}
                className="text-xs bg-secondary-50 hover:bg-secondary-100 text-secondary-700 py-2 px-3 rounded-lg transition-colors"
              >
                🎓 Student (Alice)
              </button>
              <button
                onClick={() => fillDemo('bob@gmail.com')}
                className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-3 rounded-lg transition-colors"
              >
                👤 Regular (Bob)
              </button>
              <button
                onClick={() => fillDemo('carol@college.edu')}
                className="text-xs bg-secondary-50 hover:bg-secondary-100 text-secondary-700 py-2 px-3 rounded-lg transition-colors"
              >
                🎓 Student (Carol)
              </button>
              <button
                onClick={() => fillDemo('emma@mit.edu')}
                className="text-xs bg-secondary-50 hover:bg-secondary-100 text-secondary-700 py-2 px-3 rounded-lg transition-colors"
              >
                🎓 Student (Emma)
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
