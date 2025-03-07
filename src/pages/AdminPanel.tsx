import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  School,
  BarChart3,
  Shield,
  Key,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdminAuth } from '../hooks/useAdminAuth';

// Mock data for demonstration
const mockUsers = [
  {
    id: '1',
    email: 'user1@example.com',
    username: 'user1',
    university: 'University A',
    created_at: '2024-01-01'
  },
  {
    id: '2',
    email: 'user2@example.com',
    username: 'user2',
    university: 'University B',
    created_at: '2024-01-02'
  }
];

const mockNotes = [
  {
    id: '1',
    title: 'Introduction to Computer Science',
    university: 'University A',
    course: 'CS101',
    professor: 'Dr. Smith',
    created_at: '2024-01-01',
    user_id: '1',
    is_public: true
  },
  {
    id: '2',
    title: 'Advanced Mathematics',
    university: 'University B',
    course: 'MATH201',
    professor: 'Dr. Johnson',
    created_at: '2024-01-02',
    user_id: '2',
    is_public: false
  }
];

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
  const { isAdmin, isLoading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'notes'>('overview');
  const [users] = useState<User[]>(mockUsers);
  const [notes] = useState<Note[]>(mockNotes);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate stats from mock data
  const stats: Stats = {
    totalUsers: mockUsers.length,
    totalNotes: mockNotes.length,
    totalUniversities: [...new Set(mockNotes.map(note => note.university))].length,
    publicNotes: mockNotes.filter(note => note.is_public).length
  };

  const handleDeleteUser = async (userId: string) => {
    toast.error('Delete functionality is not implemented in demo mode');
  };

  const handleDeleteNote = async (noteId: string) => {
    toast.error('Delete functionality is not implemented in demo mode');
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

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-violet"></div>
    </div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-accent-violet dark:text-accent-violet-light" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-violet to-accent-teal bg-clip-text text-transparent">
            Admin Panel
          </h1>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
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
            icon={FileText}
            title="Public Notes"
            value={stats.publicNotes}
            className="bg-orange-500"
          />
        </div>
      )}

      {(activeTab === 'users' || activeTab === 'notes') && (
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-modern-light-border dark:border-modern-dark-border bg-modern-light-card dark:bg-modern-dark-card text-modern-light-text dark:text-modern-dark-text"
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
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-modern-light-border dark:border-modern-dark-border">
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
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
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
              <tbody>
                {filteredNotes.map((note) => (
                  <tr key={note.id} className="border-b border-modern-light-border dark:border-modern-dark-border">
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
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

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