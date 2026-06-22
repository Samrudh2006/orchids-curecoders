import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Search, History, ChevronDown, Bookmark, Users, GitCompare, Crown, Lock, Mail, User as UserIcon, LogOut, Settings, Key, Shield } from './Icons';
import { Logo } from '../assets/logo';
import { useAppContext } from '../hooks/useAppContext';
import { useTheme } from '../context/ThemeContext';
import { useVoiceFeatures } from '../hooks/useVoiceFeatures';
import getApiUrl, { getAuthHeaders } from '../services/apiConfig';

const navItems = [
  { path: '/architecture', label: 'Architecture', icon: '🏗️' },
  { path: '/samples', label: 'Sample Outputs', icon: '📊' },
  { path: '/apis', label: 'Mock APIs', icon: '🔌' },
  { path: '/queries', label: 'Strategic Queries', icon: '🔍' },
  { path: '/journey', label: 'Product Journey', icon: '🚀' },
  { path: '/reports', label: 'Reports Demo', icon: '📄' },
];

interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenBookmarks?: () => void;
  onOpenComparison?: () => void;
  onOpenCollaboration?: () => void;
  onOpenLogin?: () => void;
}

// ─── Profile Panel (inline, no separate page) ──────────────────────────────
function ProfilePanel({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAppContext();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [displayName, setDisplayName] = useState(user?.email?.split('@')[0] || '');
  const [role, setRole] = useState('Researcher');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Fetch profile on mount
  useEffect(() => {
    fetch(`${getApiUrl()}/api/profile`, { headers: getAuthHeaders() })
      .then(r => r.json())
      .then(data => {
        if (data.email) setDisplayName(data.email.split('@')[0]);
        if (data.role) setRole(data.role);
      })
      .catch(() => {});
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${getApiUrl()}/api/profile/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setMessage('Profile updated successfully!');
      setMessageType('success');
    } catch (e: any) {
      setMessage(e.message);
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      setMessageType('error');
      return;
    }
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      setMessageType('error');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${getApiUrl()}/api/profile/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      setMessage('Password changed successfully!');
      setMessageType('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setMessage(e.message);
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const avatarInitials = user?.email?.split('@')[0]?.substring(0, 2).toUpperCase() || '??';

  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-[340px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[60] overflow-hidden"
      style={{ animation: 'slideDown 0.18s ease-out' }}
    >
      <style>{`@keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Profile header */}
      <div className="bg-gradient-to-br from-primary/90 to-cyan-500/90 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold border-2 border-white/40 shadow-lg">
            {avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base truncate">{displayName}</p>
            <p className="text-white/80 text-xs truncate">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-semibold">
              {role}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => { setActiveTab('profile'); setMessage(''); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === 'profile'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" /> Profile
        </button>
        <button
          onClick={() => { setActiveTab('security'); setMessage(''); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === 'security'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Shield className="w-3.5 h-3.5" /> Security
        </button>
      </div>

      {/* Tab content */}
      <div className="p-4 space-y-3">
        {message && (
          <div className={`text-xs p-2.5 rounded-lg ${messageType === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
            {message}
          </div>
        )}

        {activeTab === 'profile' && (
          <>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Email</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Role / Title</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary outline-none"
              >
                <option>Researcher</option>
                <option>Analyst</option>
                <option>Manager</option>
                <option>Executive</option>
                <option>Consultant</option>
              </select>
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full py-2 bg-primary text-white font-semibold rounded-lg text-sm hover:bg-primary-light transition disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </>
        )}

        {activeTab === 'security' && (
          <>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={saving}
              className="w-full py-2 bg-primary text-white font-semibold rounded-lg text-sm hover:bg-primary-light transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              {saving ? 'Updating…' : 'Change Password'}
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <button
          onClick={() => { logout(); onClose(); }}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-red-500 hover:text-red-600 border border-red-200 dark:border-red-900/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── Main Header ────────────────────────────────────────────────────────────
const Header: React.FC<HeaderProps> = ({ 
  onOpenSearch, 
  onOpenBookmarks, 
  onOpenComparison, 
  onOpenCollaboration,
  onOpenLogin
}) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { isOrchestrating, user } = useAppContext();
  const { isDark, toggleTheme } = useTheme();
  const { explainFeature } = useVoiceFeatures();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
          <div className="h-12 w-40 overflow-hidden flex items-center justify-center relative">
            <Logo className="h-28 max-w-none w-auto" />
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setIsNavOpen(!isNavOpen)}
              onBlur={() => setTimeout(() => setIsNavOpen(false), 200)}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Documentation
              <ChevronDown className={`w-4 h-4 transition-transform ${isNavOpen ? 'rotate-180' : ''}`} />
            </button>

            {isNavOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center gap-3 pl-4 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-transparent hover:border-primary/50 transition text-left"
          >
            <Search className="w-5 h-5 text-slate-400" />
            <span className="flex-1 text-slate-400 text-sm">Search queries... (Ctrl+K)</span>
            <kbd className="hidden sm:block px-2 py-1 text-xs font-medium text-slate-400 bg-slate-200 dark:bg-slate-700 rounded">⌘K</kbd>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Mobile Nav Toggle */}
          <div className="lg:hidden relative">
            <button
              onClick={() => setIsNavOpen(!isNavOpen)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>

            {isNavOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsNavOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onOpenCollaboration}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors hidden sm:block"
            title="Team Collaboration"
          >
            <Users className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenComparison}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors hidden sm:block"
            title="Compare Results"
          >
            <GitCompare className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenBookmarks}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            title="Bookmarks (Ctrl+B)"
          >
            <Bookmark className="w-5 h-5" />
          </button>

          <Link
            to="/history"
            onMouseEnter={() => explainFeature('history')}
            className={`p-2 rounded-lg transition-colors ${
              location.pathname === '/history'
                ? 'bg-primary/10 text-primary'
                : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
            aria-label="View history"
          >
            <History className="w-5 h-5" />
          </Link>

          <Link
            to="/payment"
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium rounded-lg transition-all mr-1"
          >
            <Crown className="w-4 h-4" />
            <span>Upgrade</span>
          </Link>

          {/* Auth: avatar+profile dropdown OR login button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfile(p => !p)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                title="Profile & Settings"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-cyan-500 text-white font-bold flex items-center justify-center text-xs shadow-md group-hover:shadow-primary/30 transition-shadow">
                  {user.email.split('@')[0].substring(0, 2).toUpperCase()}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showProfile ? 'rotate-180' : ''}`} />
              </button>

              {showProfile && (
                <ProfilePanel onClose={() => setShowProfile(false)} />
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-light transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              Login
            </button>
          )}

          <button
            onClick={() => {
              toggleTheme();
              explainFeature('theme-toggle');
            }}
            onMouseEnter={() => explainFeature('theme-toggle')}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;