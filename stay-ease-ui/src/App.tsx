import React, { useMemo, useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import Home from './pages/Home'
import HotelsList from './pages/HotelsList'
import HotelDetail from './pages/HotelDetail'
import BookingPage from './pages/BookingPage'
import LoginRegister from './pages/LoginRegister'
import MyStays from './pages/MyStays'
import ManagerDashboard from './pages/ManagerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import { useToast } from './contexts/ToastContext'

function NavBar({ navigate }: { navigate: (hash: string) => void }) {
  const { user, logout } = useAuth();
  const { show } = useToast();
  return (
    <header className="nav">
      <div className="brand" onClick={() => navigate('#/')}>StayEase (Mock)</div>
      <nav>
        <button className="link-button" onClick={() => navigate('#/')}>Home</button>
        <button className="link-button" onClick={() => navigate('#/mystays')}>My Stays</button>
        {user?.role === 'MANAGER' && <button className="link-button" onClick={() => navigate('#/manager')}>Manager</button>}
        {user?.role === 'ADMIN' && <button className="link-button" onClick={() => navigate('#/admin')}>Admin</button>}
      </nav>
      <div className="account">
        {user ? (
          <>
            <span className="muted">{user.name}</span>
            <button className="small-button" onClick={() => { logout(); show('Logged out', 'info'); navigate('#/'); }}>Logout</button>
          </>
        ) : (
          <button className="primary-button" onClick={() => navigate('#/login')}>Login / Register</button>
        )}
      </div>
    </header>
  );
}

function RouterView({ navigate, tick }: { navigate: (hash: string) => void; tick: number }) {
  // use tick to recompute hash when navigate changes it
  const hash = useMemo(() => window.location.hash || '#/', [tick]);

  // simple hash-based routing without extra deps
  if (hash.startsWith('#/hotels')) {
    const qp = new URLSearchParams(hash.split('?')[1]);
    return <HotelsList query={qp} navigate={navigate} />;
  }
  if (hash.startsWith('#/hotel/')) {
    const [_, __, idpart] = hash.split('/');
    const [hotelId] = idpart.split('?');
    const qp = new URLSearchParams(hash.split('?')[1]);
    return <HotelDetail hotelId={hotelId} query={qp} navigate={navigate} />;
  }
  if (hash.startsWith('#/book')) {
    const qp = new URLSearchParams(hash.split('?')[1]);
    return <BookingPage query={qp} navigate={navigate} />;
  }
  if (hash.startsWith('#/login')) {
    return <LoginRegister navigate={navigate} />;
  }
  if (hash.startsWith('#/mystays')) {
    return <MyStays navigate={navigate} />;
  }
  if (hash.startsWith('#/manager')) {
    return <ManagerDashboard />;
  }
  if (hash.startsWith('#/admin')) {
    return <AdminDashboard />;
  }

  // default home
  return <Home navigate={navigate} />;
}

function AppContent() {
  const [tick, setTick] = useState(0);
  const navigate = (hash: string) => { window.location.hash = hash; setTick((t) => t + 1); };

  return (
    <AuthProvider>
      <ToastProvider>
        <NavBar navigate={navigate} />
        <main className="app-shell">
          <RouterView navigate={navigate} tick={tick} />
        </main>
      </ToastProvider>
    </AuthProvider>
  );
}

export default function App() {
  return <AppContent />;
}