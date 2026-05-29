import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api, { getErrorMessage } from '../lib/api';
import Alert from '../components/Alert';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    university: user?.university || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);
    try {
      const { data } = await api.put('/users/profile', {
        name: form.name,
        phone: form.phone || undefined,
        university: form.university || undefined,
        bio: form.bio || undefined,
        avatar: form.avatar || undefined,
      });
      updateUser(data.user);
      setAlert({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setAlert({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const willBeStudent = form.university.trim() !== '' || user?.email.endsWith('.edu');

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account information</p>
      </div>

      {alert && (
        <div className="mb-6">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      {/* Profile header */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              {user?.isStudent ? (
                <span className="badge-student">🎓 Verified Student</span>
              ) : (
                <span className="inline-flex items-center bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  Regular User
                </span>
              )}
              <span className="text-xs text-gray-400">
                Member since {new Date(user?.createdAt || '').getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input-field"
                required
                minLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1-555-0100"
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Student Verification</h3>
          <p className="text-sm text-gray-500 mb-4">
            Add your university to unlock campus ride features.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
            <input
              type="text"
              name="university"
              value={form.university}
              onChange={handleChange}
              placeholder="e.g. University of Toronto"
              className="input-field"
            />
            {willBeStudent && !user?.isStudent && (
              <p className="text-xs text-secondary-600 mt-1">
                ✓ Adding a university will grant you student access to campus rides
              </p>
            )}
            {user?.isStudent && (
              <p className="text-xs text-secondary-600 mt-1">
                ✓ You have verified student access
              </p>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">About You</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell other riders a bit about yourself..."
                rows={3}
                className="input-field resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{form.bio.length}/500</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
              <input
                type="url"
                name="avatar"
                value={form.avatar}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
                className="input-field"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full py-2.5"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
