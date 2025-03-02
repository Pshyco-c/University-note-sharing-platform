import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Note } from '../lib/supabase';
import NoteCard from '../components/NoteCard';
import NoteUpload from '../components/NoteUpload';
import { Notebook } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
    };

    const fetchUserNotes = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotes(data || []);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
    fetchUserNotes();
  }, [navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Notebook className="w-8 h-8 text-accent-violet dark:text-accent-violet-light" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-violet to-accent-teal bg-clip-text text-transparent">
            My Dashboard
          </h1>
        </div>
      </div>

      <div className="bg-modern-light-card dark:bg-modern-dark-card border border-modern-light-border dark:border-modern-dark-border rounded-xl p-6 shadow-sm transition-all duration-200">
        <h2 className="text-xl font-semibold text-modern-light-text dark:text-modern-dark-text mb-4">
          Upload New Note
        </h2>
        <NoteUpload />
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-modern-light-text dark:text-modern-dark-text mb-6 flex items-center gap-2">
          My Notes
          {notes.length > 0 && (
            <span className="text-sm font-normal px-2 py-1 rounded-full bg-accent-violet/10 dark:bg-accent-violet-light/10 text-accent-violet dark:text-accent-violet-light">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </span>
          )}
        </h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-violet dark:border-accent-violet-light mx-auto"></div>
          </div>
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-modern-light-card dark:bg-modern-dark-card border border-modern-light-border dark:border-modern-dark-border rounded-xl">
            <p className="text-modern-light-text/60 dark:text-modern-dark-text/60">
              You haven't created any notes yet. Use the form above to create your first note!
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 