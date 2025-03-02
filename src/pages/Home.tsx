import React from 'react';
import { Link } from 'react-router-dom';
import NoteSearch from '../components/NoteSearch';
import { BookOpen, Share, Search, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-accent-violet to-accent-teal bg-clip-text text-transparent mb-4">
          Welcome to StudyNotes
        </h1>
        <p className="text-xl text-modern-light-text/70 dark:text-modern-dark-text/70 mb-8">
          Share and discover university lecture notes with students worldwide
        </p>
        <Link
          to="/register"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-accent-violet hover:bg-accent-violet-dark dark:bg-accent-violet-light dark:hover:bg-accent-violet focus:outline-none transition-colors duration-200"
        >
          Get Started
        </Link>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-modern-light-text dark:text-modern-dark-text mb-6">
          Browse Public Notes
        </h2>
        <NoteSearch />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-6 bg-modern-light-card dark:bg-modern-dark-card border border-modern-light-border dark:border-modern-dark-border rounded-xl shadow-sm transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <Share className="w-5 h-5 text-accent-violet dark:text-accent-violet-light" />
            <h3 className="text-lg font-semibold text-modern-light-text dark:text-modern-dark-text">
              Share Your Notes
            </h3>
          </div>
          <p className="text-modern-light-text/70 dark:text-modern-dark-text/70">
            Upload and organize your lecture notes by university, course, and professor.
          </p>
        </div>

        <div className="p-6 bg-modern-light-card dark:bg-modern-dark-card border border-modern-light-border dark:border-modern-dark-border rounded-xl shadow-sm transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <Search className="w-5 h-5 text-accent-teal dark:text-accent-teal-light" />
            <h3 className="text-lg font-semibold text-modern-light-text dark:text-modern-dark-text">
              Discover Resources
            </h3>
          </div>
          <p className="text-modern-light-text/70 dark:text-modern-dark-text/70">
            Find high-quality notes from students at universities around the world.
          </p>
        </div>

        <div className="p-6 bg-modern-light-card dark:bg-modern-dark-card border border-modern-light-border dark:border-modern-dark-border rounded-xl shadow-sm transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-accent-amber dark:text-accent-amber-light" />
            <h3 className="text-lg font-semibold text-modern-light-text dark:text-modern-dark-text">
              Collaborate
            </h3>
          </div>
          <p className="text-modern-light-text/70 dark:text-modern-dark-text/70">
            Connect with fellow students and share knowledge across institutions.
          </p>
        </div>
      </div>
    </div>
  );
}