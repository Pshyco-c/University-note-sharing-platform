import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NotesView from './pages/NotesView';
import VerifyEmail from './pages/VerifyEmail';
import VerificationSent from './pages/VerificationSent';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-modern-light-bg dark:bg-modern-dark-bg transition-colors duration-200 flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/notes/:id" element={<NotesView />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/verification-sent" element={<VerificationSent />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/dashboard" element={<AdminPanel />} />
          </Routes>
        </main>
        <Footer />
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