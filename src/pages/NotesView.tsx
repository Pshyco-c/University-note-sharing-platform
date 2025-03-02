import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Note } from '../lib/supabase';
import { Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function NotesView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) {
          toast.error('Note not found');
          navigate('/');
          return;
        }

        // Check if user has access to this note
        if (!data.is_public && (!user || user.id !== data.user_id)) {
          toast.error('You do not have access to this note');
          navigate('/');
          return;
        }

        setNote(data);
      } catch (error) {
        console.error('Error fetching note:', error);
        toast.error('Failed to load note');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, navigate]);

  const handleDownload = async () => {
    if (!note?.file_url) return;

    try {
      const { data, error } = await supabase.storage
        .from('notes')
        .download(note.file_url);

      if (error) throw error;

      // Create a download link
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = note.file_url.split('/').pop() || 'note-file';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!note) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{note.title}</h1>
          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            <span>{note.university}</span>
            <span>•</span>
            <span>{note.course}</span>
            <span>•</span>
            <span>Prof. {note.professor}</span>
          </div>
        </div>

        {note.content && (
          <div className="prose max-w-none mb-6">
            <p className="whitespace-pre-wrap">{note.content}</p>
          </div>
        )}

        {note.tags && note.tags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {note.file_url && (
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Attachment
          </button>
        )}
      </div>
    </div>
  );
} 