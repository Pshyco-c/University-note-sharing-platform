import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Users,
  FileText,
  School,
  Trash2,
  Edit,
  Search,
  Shield,
  BarChart3,
  BookOpen,
  GraduationCap,
  Settings,
  Key,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  username: string;
  university: string;
  created_at: string;
}

interface Note {
  id: string;
  title: string;
  university: string;
  course: string;
  professor: string;
  created_at: string;
  user_id: string;
  is_public: boolean;
}

interface Stats {
  totalUsers: number;
  totalNotes: number;
  totalUniversities: number;
  publicNotes: number;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'notes' | 'settings'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalNotes: 0,
    totalUniversities: 0,
    publicNotes: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    if (activeTab === 'overview') {
      fetchStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'notes') {
      fetchNotes();
    }
  }, [activeTab]);

  const checkAdminAccess = async () => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/admin/login');
      toast.error('Unauthorized access');
      return;
    }
  };

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [usersCount, notesCount, universitiesCount, publicNotesCount] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('notes').select('id', { count: 'exact' }),
        supabase.from('notes').select('university', { count: 'exact', head: true }).neq('university', ''),
        supabase.from('notes').select('id', { count: 'exact' }).eq('is_public', true),
      ]);

      setStats({
        totalUsers: usersCount.count || 0,
        totalNotes: notesCount.count || 0,
        totalUniversities: universitiesCount.count || 0,
        publicNotes: publicNotesCount.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      setNotes(notes.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.university.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const StatCard = ({ icon: Icon, title, value, className }: any) => (
    <div className="bg-modern-light-card dark:bg-modern-dark-card border border-modern-light-border dark:border-modern-dark-border rounded-xl p-6 flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${className}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-modern-light-text/60 dark:text-modern-dark-text/60 text-sm">{title}</p>
        <p className="text-2xl font-semibold text-modern-light-text dark:text-modern-dark-text">{value}</p>
      </div>
    </div>
  );

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Password updated successfully');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-accent-violet dark:text-accent-violet-light" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-violet to-accent-teal bg-clip-text text-transparent">
            Admin Panel
          </h1>
        </div>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="flex items-center px-4 py-2 rounded-lg font-medium text-modern-light-text/70 dark:text-modern-dark-text/70 hover:bg-modern-light-card dark:hover:bg-modern-dark-card"
        >
          <Key className="w-4 h-4 mr-2" />
          Change Password
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'overview'
              ? 'bg-accent-violet text-white dark:bg-accent-violet-light'
              : 'text-modern-light-text/70 dark:text-modern-dark-text/70 hover:bg-modern-light-card dark:hover:bg-modern-dark-card'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline-block mr-2" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'users'
              ? 'bg-accent-violet text-white dark:bg-accent-violet-light'
              : 'text-modern-light-text/70 dark:text-modern-dark-text/70 hover:bg-modern-light-card dark:hover:bg-modern-dark-card'
          }`}
        >
          <Users className="w-4 h-4 inline-block mr-2" />
          Users
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === 'notes'
              ? 'bg-accent-violet text-white dark:bg-accent-violet-light'
              : 'text-modern-light-text/70 dark:text-modern-dark-text/70 hover:bg-modern-light-card dark:hover:bg-modern-dark-card'
          }`}
        >
          <FileText className="w-4 h-4 inline-block mr-2" />
          Notes
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Users"
            value={stats.totalUsers}
            className="bg-blue-500"
          />
          <StatCard
            icon={FileText}
            title="Total Notes"
            value={stats.totalNotes}
            className="bg-green-500"
          />
          <StatCard
            icon={School}
            title="Universities"
            value={stats.totalUniversities}
            className="bg-purple-500"
          />
          <StatCard
            icon={BookOpen}
            title="Public Notes"
            value={stats.publicNotes}
            className="bg-orange-500"
          />
        </div>
      )}

      {(activeTab === 'users' || activeTab === 'notes') && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-modern-light-text/50 dark:text-modern-dark-text/50" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-modern-light-border dark:border-modern-dark-border bg-modern-light-card dark:bg-modern-dark-card text-modern-light-text dark:text-modern-dark-text placeholder-modern-light-text/50 dark:placeholder-modern-dark-text/50"
            />
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-modern-light-card dark:bg-modern-dark-card border border-modern-light-border dark:border-modern-dark-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-modern-light-border dark:border-modern-dark-border">
                  <th className="px-6 py-3 text-left text-xs font-medium text-modern-light-text/60 dark:text-modern-dark-text/60 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-modern-light-text/60 dark:text-modern-dark-text/60 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-modern-light-text/60 dark:text-modern-dark-text/60 uppercase tracking-wider">
                    University
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-modern-light-text/60 dark:text-modern-dark-text/60 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-modern-light-text/60 dark:text-modern-dark-text/60 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-modern-light-border dark:divide-modern-dark-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-modern-light-text dark:text-modern-dark-text">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-modern-light-text dark:text-modern-dark-text">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-modern-light-text dark:text-modern-dark-text">
                      {user.university}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-modern-light-text/70 dark:text-modern-dark-text/70">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="bg-modern-light-card dark:bg-modern-dark-card border border-modern-light-border dark:border-modern-dark-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-modern-light-border dark:border-modern-dark-border">
                  <th className="px-6 py-3 text-left text-xs font-medium text-modern-light-text/60 dark:text-modern-dark-text/60 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-modern-light-text/60 dark:text-modern-dark-text/60 uppercase tracking-wider">
                    University
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-modern-light-text/60 dark:text-modern-dark-text/60 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-modern-light-text/60 dark:text-modern-dark-text/60 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-modern-light-text/60 dark:text-modern-dark-text/60 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-modern-light-text/60 dark:text-modern-dark-text/60 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-modern-light-border dark:divide-modern-dark-border">
                {filteredNotes.map((note) => (
                  <tr key={note.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-modern-light-text dark:text-modern-dark-text">
                      {note.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-modern-light-text dark:text-modern-dark-text">
                      {note.university}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-modern-light-text dark:text-modern-dark-text">
                      {note.course}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          note.is_public
                            ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'
                        }`}
                      >
                        {note.is_public ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-modern-light-text/70 dark:text-modern-dark-text/70">
                      {new Date(note.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-modern-light-card dark:bg-modern-dark-card rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-modern-light-text dark:text-modern-dark-text mb-4">
              Change Admin Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-modern-light-text/70 dark:text-modern-dark-text/70 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-modern-light-border dark:border-modern-dark-border bg-modern-light-bg dark:bg-modern-dark-bg text-modern-light-text dark:text-modern-dark-text"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-modern-light-text/70 dark:text-modern-dark-text/70 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-modern-light-border dark:border-modern-dark-border bg-modern-light-bg dark:bg-modern-dark-bg text-modern-light-text dark:text-modern-dark-text"
                  required
                  minLength={8}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="px-4 py-2 rounded-lg font-medium text-modern-light-text/70 dark:text-modern-dark-text/70 hover:bg-modern-light-bg dark:hover:bg-modern-dark-bg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2 rounded-lg font-medium text-white bg-accent-violet hover:bg-accent-violet-dark dark:bg-accent-violet-light dark:hover:bg-accent-violet disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 