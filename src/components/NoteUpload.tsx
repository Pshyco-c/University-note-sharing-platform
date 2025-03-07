import React, { useState } from 'react';
import { Upload, X, Tag as TagIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['application/pdf'];

interface UploadProgressEvent {
  loaded: number;
  total: number;
}

export default function NoteUpload() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [professor, setProfessor] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file: File) => {
    if (!file) return 'Please select a file';
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Only PDF files are allowed';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const error = validateFile(selectedFile);
    if (error) {
      toast.error(error);
      e.target.value = ''; // Reset file input
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !university || !course || !professor) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!file) {
      toast.error('Please select a PDF file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create a unique file name to prevent collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload the file
      const { data: fileData, error: fileError } = await supabase.storage
        .from('notes')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (fileError) throw fileError;

      // Create the note record
      const { error: noteError } = await supabase.from('notes').insert({
        title,
        content,
        university,
        course,
        professor,
        is_public: isPublic,
        tags,
        file_url: fileData?.path,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      });

      if (noteError) throw noteError;

      toast.success('Note uploaded successfully!');
      
      // Reset form
      setTitle('');
      setContent('');
      setUniversity('');
      setCourse('');
      setProfessor('');
      setIsPublic(false);
      setTags([]);
      setFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error uploading note:', error);
      toast.error('Failed to upload note. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        e.currentTarget.value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const inputClasses = "mt-1 block w-full rounded-md border border-modern-light-border dark:border-modern-dark-border bg-modern-light-card dark:bg-modern-dark-card text-modern-light-text dark:text-modern-dark-text placeholder-modern-light-text/50 dark:placeholder-modern-dark-text/50 shadow-sm hover:border-accent-violet/50 dark:hover:border-accent-violet-light/50 focus:border-accent-violet dark:focus:border-accent-violet-light focus:outline-none transition-colors duration-200 px-4 py-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-modern-light-text dark:text-modern-dark-text">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClasses}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-modern-light-text dark:text-modern-dark-text">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className={inputClasses}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-modern-light-text dark:text-modern-dark-text">
            University *
          </label>
          <input
            type="text"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-modern-light-text dark:text-modern-dark-text">
            Course *
          </label>
          <input
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-modern-light-text dark:text-modern-dark-text">
            Professor *
          </label>
          <input
            type="text"
            value={professor}
            onChange={(e) => setProfessor(e.target.value)}
            className={inputClasses}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-modern-light-text dark:text-modern-dark-text mb-1">
          Tags
        </label>
        <div className="space-y-2">
          <div className="flex items-center">
            <TagIcon className="w-4 h-4 text-modern-light-text/50 dark:text-modern-dark-text/50 absolute ml-3" />
            <input
              type="text"
              onKeyDown={handleTagInput}
              placeholder="Press Enter to add tags"
              className={`${inputClasses} pl-10`}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-accent-violet/10 dark:bg-accent-violet-light/10 text-accent-violet dark:text-accent-violet-light"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 hover:text-accent-violet-dark dark:hover:text-accent-violet transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-modern-light-text dark:text-modern-dark-text">
          PDF File *
        </label>
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-modern-light-text/70 dark:text-modern-dark-text/70
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-medium
            file:bg-accent-violet/10 file:text-accent-violet
            dark:file:bg-accent-violet-light/10 dark:file:text-accent-violet-light
            hover:file:bg-accent-violet/20 dark:hover:file:bg-accent-violet-light/20
            transition-all duration-200"
        />
        <p className="mt-1 text-sm text-modern-light-text/50 dark:text-modern-dark-text/50">
          Only PDF files up to 10MB are allowed
        </p>
      </div>

      {isUploading && uploadProgress > 0 && (
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div className="text-sm text-modern-light-text/70 dark:text-modern-dark-text/70">
              Uploading... {uploadProgress}%
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-accent-violet/10 dark:bg-accent-violet-light/10">
            <div 
              style={{ width: `${uploadProgress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-accent-violet dark:bg-accent-violet-light transition-all duration-200"
            />
          </div>
        </div>
      )}

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="h-4 w-4 text-accent-violet dark:text-accent-violet-light focus:ring-0 focus:ring-offset-0 border-modern-light-border dark:border-modern-dark-border rounded transition-colors duration-200"
        />
        <label className="ml-2 block text-sm text-modern-light-text dark:text-modern-dark-text">
          Make this note public
        </label>
      </div>

      <button
        type="submit"
        disabled={isUploading}
        className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-violet hover:bg-accent-violet-dark dark:bg-accent-violet-light dark:hover:bg-accent-violet focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {isUploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload Note
          </>
        )}
      </button>
    </form>
  );
} 