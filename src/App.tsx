import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NotesView from './pages/NotesView';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-modern-light-bg dark:bg-modern-dark-bg transition-colors duration-200">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/notes/:id" element={<NotesView />} />
          </Routes>
        </main>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
              border: '1px solid var(--toast-border)',
              borderRadius: '0.5rem',
              padding: '1rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
          }}
        />
        <style>{`
          :root {
            --toast-bg: #f8fafc;
            --toast-color: #1e293b;
            --toast-border: #e2e8f0;
          }
          
          .dark {
            --toast-bg: #1e293b;
            --toast-color: #f8fafc;
            --toast-border: #334155;
          }

          body {
            font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
          }
        `}</style>
      </div>
    </BrowserRouter>
  );
}

export default App;