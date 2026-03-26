import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Download, LogOut, Link as LinkIcon, AlertCircle, Check, Activity, Zap, Shield, Wrench, HardDrive, Film, Music } from 'lucide-react';

export default function Dashboard() {
  const [url, setUrl] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState(null);
  const [maintenance, setMaintenance] = useState(false);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    // Fetch maintenance status
    axios.get('/api/download/maintenance', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setMaintenance(res.data.maintenanceMode);
    }).catch(() => {});
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const toggleMaintenance = async () => {
    setLoadingMaintenance(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.post('/api/download/maintenance', 
        { enabled: !maintenance },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMaintenance(res.data.maintenanceMode);
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
    } finally {
      setLoadingMaintenance(false);
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setDownloading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post('/api/download', 
        { url },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult({ success: true, message: '🎉 Download Successful!', fileUrl: response.data.fileUrl });
      setUrl('');
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setResult({ success: false, message: err.response?.data?.message || 'Failed to download.' });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Admin Header */}
      <div className="admin-header" style={{ animation: 'slide-up 0.5s ease-out both' }}>
        <div>
          <h2 className="admin-title">
            <Shield size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />
            Admin Panel
          </h2>
          <p style={{ color: 'var(--warm-gray-400)', fontSize: '0.9rem', fontWeight: 500 }}>
            Manage downloads, controls, and system settings
          </p>
        </div>
        <button id="admin-logout-btn" onClick={handleLogout} className="clay-btn clay-btn-danger" style={{ gap: '0.4rem' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Status Cards */}
      <div className="admin-stats" style={{ animation: 'slide-up 0.5s ease-out 0.1s both' }}>
        <div className="clay-card clay-card-orange stat-card">
          <Activity size={24} color="var(--orange-500)" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
          <div className="stat-value">Active</div>
          <div className="stat-label">System Status</div>
        </div>
        <div className="clay-card clay-card-mint stat-card">
          <Download size={24} color="#00b894" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
          <div className="stat-value" style={{ background: 'linear-gradient(135deg, #55efc4, #00b894)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>8x Fast</div>
          <div className="stat-label">Concurrent Fragments</div>
        </div>
        <div className="clay-card stat-card" style={{ background: maintenance ? 'linear-gradient(135deg, rgba(255,107,107,0.15), rgba(255,255,255,0.7))' : 'linear-gradient(135deg, rgba(85,239,196,0.15), rgba(255,255,255,0.7))' }}>
          <Wrench size={24} color={maintenance ? 'var(--coral)' : '#00b894'} style={{ margin: '0 auto 0.5rem', display: 'block' }} />
          <div className="stat-value" style={{ background: maintenance ? 'linear-gradient(135deg, var(--coral), #e17055)' : 'linear-gradient(135deg, #55efc4, #00b894)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {maintenance ? 'ON' : 'OFF'}
          </div>
          <div className="stat-label">Maintenance Mode</div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="clay-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', animation: 'slide-up 0.5s ease-out 0.15s both' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warm-gray-700)' }}>
          <Wrench size={18} color="var(--orange-500)" /> System Controls
        </h3>

        <div className="admin-control-row">
          <div>
            <div className="admin-control-label">🔧 Maintenance Mode</div>
            <div className="admin-control-desc">When enabled, public downloads are disabled with a maintenance message</div>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={maintenance} 
              onChange={toggleMaintenance}
              disabled={loadingMaintenance}
              id="maintenance-toggle"
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="admin-control-row">
          <div>
            <div className="admin-control-label">⚡ Concurrent Fragments</div>
            <div className="admin-control-desc">Downloads use 8 parallel fragments for maximum speed</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={true} readOnly id="concurrent-toggle" />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="admin-control-row">
          <div>
            <div className="admin-control-label">🌐 Proxy Rotation</div>
            <div className="admin-control-desc">Configure proxies in appsettings.json for geo-restricted content</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={false} readOnly id="proxy-toggle" />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Admin Download Form */}
      <div className="clay-card" style={{ padding: '1.75rem', marginBottom: '1.5rem', animation: 'slide-up 0.5s ease-out 0.2s both' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warm-gray-700)' }}>
          <Download size={18} color="var(--orange-500)" /> Admin Download (Best Quality)
        </h3>
        
        <form onSubmit={handleDownload}>
          <div className="form-group">
            <label className="form-label">Social Media Link</label>
            <div className="input-icon-wrapper">
              <div className="input-icon"><LinkIcon size={18} /></div>
              <input
                id="admin-url-input"
                type="url"
                className="clay-input clay-input-lg clay-input-with-icon"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                required
              />
            </div>
          </div>

          <button id="admin-download-btn" type="submit" className="clay-btn clay-btn-primary clay-btn-full clay-btn-lg" disabled={downloading || !url.trim()}>
            {downloading ? (<><div className="clay-loader"></div> Processing...</>) : (<><Download size={20} /> Download Video</>)}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div className={`result-card ${result.success ? 'result-success' : 'result-error'}`} style={{ marginBottom: '2rem' }}>
          <div className="result-message">
            <div className="result-icon">
              {result.success ? <Check size={20} /> : <AlertCircle size={20} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{result.message}</div>
              {result.success && result.fileUrl && (
                <div style={{ marginTop: '0.75rem' }}>
                  <a href={result.fileUrl} download className="clay-btn clay-btn-success" id="admin-save-btn" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                    <Download size={18} /> Save File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
