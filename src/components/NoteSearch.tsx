import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Note } from '../lib/supabase';
import NoteCard from './NoteCard';

export default function NoteSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchNotes = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('notes')
          .select('*')
          .eq('is_public', true);

        if (searchQuery) {
          query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
        }
        if (university) {
          query = query.eq('university', university);
        }
        if (course) {
          query = query.eq('course', course);
        }

        const { data, error } = await query;
        if (error) throw error;
        setNotes(data || []);
      } catch (error) {
        console.error('Error searching notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(searchNotes, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, university, course]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="pl-10 pr-4 py-2 w-full rounded-md border border-modern-light-border dark:border-modern-dark-border bg-modern-light-card dark:bg-modern-dark-card text-modern-light-text dark:text-modern-dark-text placeholder-modern-light-text/50 dark:placeholder-modern-dark-text/50 shadow-sm hover:border-accent-violet/50 dark:hover:border-accent-violet-light/50 focus:border-accent-violet dark:focus:border-accent-violet-light focus:outline-none transition-colors duration-200"
          />
        </div>

        <div>
          <input
            type="text"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder="Filter by university..."
            className="w-full px-4 py-2 rounded-md border border-modern-light-border dark:border-modern-dark-border bg-modern-light-card dark:bg-modern-dark-card text-modern-light-text dark:text-modern-dark-text placeholder-modern-light-text/50 dark:placeholder-modern-dark-text/50 shadow-sm hover:border-accent-violet/50 dark:hover:border-accent-violet-light/50 focus:border-accent-violet dark:focus:border-accent-violet-light focus:outline-none transition-colors duration-200"
          />
        </div>

        <div>
          <input
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="Filter by course..."
            className="w-full px-4 py-2 rounded-md border border-modern-light-border dark:border-modern-dark-border bg-modern-light-card dark:bg-modern-dark-card text-modern-light-text dark:text-modern-dark-text placeholder-modern-light-text/50 dark:placeholder-modern-dark-text/50 shadow-sm hover:border-accent-violet/50 dark:hover:border-accent-violet-light/50 focus:border-accent-violet dark:focus:border-accent-violet-light focus:outline-none transition-colors duration-200"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No notes found. Try adjusting your search criteria.
        </div>
      )}
    </div>
  );
} 