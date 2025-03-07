import React from 'react';
import { Skull } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-modern-light-card dark:bg-modern-dark-card border-t border-modern-light-border dark:border-modern-dark-border py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <p className="text-modern-light-text/70 dark:text-modern-dark-text/70 text-sm">
            Created with <Skull className="inline-block w-4 h-4 text-gray-800 dark:text-gray-200 mx-1 animate-pulse" /> by{' '}
            <a 
              href="https://github.com/Pshyco-c" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-accent-violet dark:text-accent-violet-light hover:underline font-medium"
            >
              Pshyco-c
            </a>
          </p>
          <p className="text-modern-light-text/60 dark:text-modern-dark-text/60 text-sm">
            © 2025 StudyNotes. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 