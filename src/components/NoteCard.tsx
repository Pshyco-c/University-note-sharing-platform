import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Lock, Globe, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Note } from '../lib/supabase';

interface NoteCardProps {
  note: Note;
}

export default function NoteCard({ note }: NoteCardProps) {
  return (
    <Link
      to={`/notes/${note.id}`}
      className="block p-6 bg-modern-light-card dark:bg-modern-dark-card border border-modern-light-border dark:border-modern-dark-border rounded-xl shadow-sm hover:shadow-md hover:border-accent-violet/50 dark:hover:border-accent-violet-light/50 transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-modern-light-text dark:text-modern-dark-text mb-2 line-clamp-2">
            {note.title}
          </h3>
          <div className="space-y-1">
            <p className="text-sm text-modern-light-text/70 dark:text-modern-dark-text/70 flex items-center gap-1">
              {note.university} • {note.course}
            </p>
            <p className="text-sm text-modern-light-text/60 dark:text-modern-dark-text/60">
              Prof. {note.professor}
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-2 ml-4">
          {note.file_url && (
            <FileText className="w-4 h-4 text-accent-violet dark:text-accent-violet-light" />
          )}
          {note.is_public ? (
            <Globe className="w-4 h-4 text-accent-teal dark:text-accent-teal-light" />
          ) : (
            <Lock className="w-4 h-4 text-accent-amber dark:text-accent-amber-light" />
          )}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {note.tags?.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-full bg-accent-violet/10 dark:bg-accent-violet-light/10 text-accent-violet dark:text-accent-violet-light"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center text-xs text-modern-light-text/50 dark:text-modern-dark-text/50">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
        </div>
      </div>
    </Link>
  );
} 