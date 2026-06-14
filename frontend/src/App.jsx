import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import CSVImporter from './components/CSVImporter';
import Ledger from './components/Ledger';
import Settlements from './components/Settlements';
import Login from './components/Login';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('ledgerMateUser');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const membersRes = await fetch(`${API_BASE}/api/members`);
      const membersData = await membersRes.json();
      setMembers(membersData);

      const ledgerRes = await fetch(`${API_BASE}/api/ledger`);
      const ledgerData = await ledgerRes.json();
      setLedger(ledgerData);

      const statsRes = await fetch(`${API_BASE}/api/settlements`);
      const statsData = await statsRes.json();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading API data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleLogin = (profile) => {
    setUser(profile);
    if (profile.remember) {
      localStorage.setItem('ledgerMateUser', JSON.stringify(profile));
    } else {
      localStorage.removeItem('ledgerMateUser');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ledgerMateUser');
    setActiveTab('dashboard');
  };

  const handleAddMember = async (memberData) => {
    try {
      const res = await fetch(`${API_BASE}/api/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData)
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      } else {
        alert('Failed to save member: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend.');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/expenses/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordPayment = async (paymentData) => {
    const res = await fetch(`${API_BASE}/api/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    const data = await res.json();
    if (data.success) {
      await fetchData();
    } else {
      throw new Error(data.error);
    }
  };

  const renderContent = () => {
    if (!user) {
      return <Login onLogin={handleLogin} />;
    }

    if (loading && !stats) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
          <div className="upload-icon" style={{ animation: 'bounce 1s infinite' }}>⏳</div>
          <p className="subtitle">Syncing Flat Ledger Data...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            stats={stats}
            members={members}
            onAddMember={handleAddMember}
            onRefresh={fetchData}
          />
        );
      case 'import':
        return (
          <CSVImporter 
            members={members}
            onImportSuccess={fetchData}
          />
        );
      case 'ledger':
        return (
          <Ledger 
            stats={stats}
            members={members}
            ledger={ledger}
            onDeleteExpense={handleDeleteExpense}
          />
        );
      case 'settlements':
        return (
          <Settlements 
            stats={stats}
            onRecordPayment={handleRecordPayment}
          />
        );
      default:
        return <div>Tab not found</div>;
    }
  };

  if (!user) {
    return <div className="app-login-view">{renderContent()}</div>;
  }

  return (
    <div className="app-container">
      <aside className="sidebar" aria-label="Application navigation">
        <div>
          <div className="brand-section">
            <span style={{ fontSize: '1.8rem' }}>⚖️</span>
            <span className="brand-logo">LedgerMate</span>
          </div>

          <div className="sidebar-user-card" aria-label="Signed in user profile">
            <div className="sidebar-user-name">Welcome, {user.name}</div>
            <div className="sidebar-user-email">{user.email}</div>
          </div>

          <nav className="nav-links" aria-label="Primary app sections">
            <button
              type="button"
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="nav-icon">📊</span> Dashboard
            </button>
            <button
              type="button"
              className={`nav-item ${activeTab === 'import' ? 'active' : ''}`}
              onClick={() => setActiveTab('import')}
            >
              <span className="nav-icon">📥</span> CSV Importer
            </button>
            <button
              type="button"
              className={`nav-item ${activeTab === 'ledger' ? 'active' : ''}`}
              onClick={() => setActiveTab('ledger')}
            >
              <span className="nav-icon">📖</span> Detailed Ledgers
            </button>
            <button
              type="button"
              className={`nav-item ${activeTab === 'settlements' ? 'active' : ''}`}
              onClick={() => setActiveTab('settlements')}
            >
              <span className="nav-icon">🤝</span> Settlements P2P
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <button type="button" className="btn-secondary" onClick={handleLogout}>Sign out</button>
          <div>Co-Living sharing tracker</div>
          <div style={{ color: 'var(--primary)', fontWeight: 600, marginTop: '0.25rem' }}>v1.0.0</div>
        </div>
      </aside>

      <main className="main-workspace">{renderContent()}</main>
    </div>
  );
}
