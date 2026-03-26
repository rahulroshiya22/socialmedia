import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Download, Link as LinkIcon, Zap, Check, AlertCircle, Search, Film, Music, HardDrive } from 'lucide-react';

/* ═══════ REAL SVG PLATFORM ICONS ═══════ */
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" className="platform-svg-icon" fill="white">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="platform-svg-icon" fill="white">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

const TiktokIcon = () => (
  <svg viewBox="0 0 24 24" className="platform-svg-icon" fill="white">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="platform-svg-icon" fill="white">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="platform-svg-icon" fill="white">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="platform-svg-icon" fill="white">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
);

const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" className="platform-svg-icon" fill="white">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/>
  </svg>
);

const PLATFORMS = [
  { name: 'YouTube', Icon: YoutubeIcon, color: 'platform-youtube', formats: 'MP4, MP3, WebM' },
  { name: 'Instagram', Icon: InstagramIcon, color: 'platform-instagram', formats: 'Reels, Stories, Posts' },
  { name: 'TikTok', Icon: TiktokIcon, color: 'platform-tiktok', formats: 'Videos, Audio' },
  { name: 'Twitter / X', Icon: TwitterIcon, color: 'platform-twitter', formats: 'Videos, GIFs' },
  { name: 'Facebook', Icon: FacebookIcon, color: 'platform-facebook', formats: 'Videos, Reels' },
  { name: 'Reddit', Icon: RedditIcon, color: 'platform-reddit', formats: 'Videos, GIFs' },
];

const SUPPORTED_SITES = [
  'YouTube', 'Instagram', 'TikTok', 'Twitter / X', 'Facebook', 'Reddit',
  'Vimeo', 'Dailymotion', 'Twitch', 'SoundCloud', 'Bandcamp', 'Mixcloud',
  'Pinterest', 'Tumblr', 'LinkedIn', 'VK', 'OK.ru', 'Bilibili',
  'Niconico', 'Rumble', 'Bitchute', 'Odysee', 'PeerTube', 'Streamable',
  'Flickr', 'Imgur', 'Giphy', 'Coub', 'Ted.com', '9GAG',
  'Snapchat', 'Likee', 'Triller', 'Dubsmash', 'Loom', 'Vidyard',
];

const STEPS = [
  { num: 1, title: 'Paste the Link', desc: 'Copy any social media video URL and paste it into the input box above.' },
  { num: 2, title: 'Pick Quality', desc: 'Choose your preferred video quality from the available options.' },
  { num: 3, title: 'Download & Save', desc: 'Watch live progress, then save the file directly to your device.' },
];

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function formatDuration(seconds) {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [fetching, setFetching] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(null); // { percent, speed, eta, status, message }
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);

  const handleFetchInfo = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setFetching(true);
    setVideoInfo(null);
    setSelectedFormat(null);
    setResult(null);
    setError(null);
    setProgress(null);

    try {
      const response = await axios.post('/api/download/info', { url });
      setVideoInfo(response.data);
      if (response.data.formats && response.data.formats.length > 0) {
        setSelectedFormat(response.data.formats[0].formatId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch video info. The link might be private or unsupported.');
    } finally {
      setFetching(false);
    }
  };

  const handleDownload = () => {
    if (!url.trim()) return;

    setDownloading(true);
    setResult(null);
    setError(null);
    setProgress({ percent: 0, status: 'downloading', message: 'Connecting...' });

    // Use SSE for real-time progress
    const params = new URLSearchParams({ url });
    if (selectedFormat) params.append('formatId', selectedFormat);

    const es = new EventSource(`/api/download/progress?${params.toString()}`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.status === 'done') {
          setProgress({ percent: 100, status: 'done', message: 'Download complete!' });
          setResult({
            success: true,
            message: '🎉 Download Ready!',
            fileUrl: data.fileUrl
          });
          setDownloading(false);
          es.close();
        } else if (data.status === 'error') {
          setProgress(null);
          setResult({
            success: false,
            message: data.message || 'Download failed.'
          });
          setDownloading(false);
          es.close();
        } else {
          setProgress({
            percent: data.percent || 0,
            speed: data.speed,
            eta: data.eta,
            status: data.status,
            message: data.message
          });
        }
      } catch (e) {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setProgress(null);
      setResult({
        success: false,
        message: 'Connection lost. Please try again.'
      });
      setDownloading(false);
      es.close();
    };
  };

  const handleReset = () => {
    if (eventSourceRef.current) eventSourceRef.current.close();
    setUrl('');
    setVideoInfo(null);
    setSelectedFormat(null);
    setResult(null);
    setError(null);
    setProgress(null);
    setDownloading(false);
  };

  return (
    <div>
      {/* ══════ HERO ══════ */}
      <section className="hero">
        <div className="hero-badge">
          <Zap size={14} /> Free • Fast • No Login Required
        </div>
        <h1 className="hero-title">
          Download from <span className="gradient-text">Any Social Media</span>
        </h1>
        <p className="hero-subtitle">
          Grab videos, reels, stories & audio from YouTube, Instagram, TikTok, Twitter, Facebook and more — choose your quality, download instantly.
        </p>
      </section>

      {/* ══════ DOWNLOAD FORM ══════ */}
      <section className="download-section">
        <div className="clay-card clay-card-orange download-card">
          
          {/* URL Input */}
          <form onSubmit={handleFetchInfo} className="download-form" id="download-form">
            <div className="download-input-row">
              <div className="input-icon-wrapper" style={{ flex: 1 }}>
                <div className="input-icon">
                  <LinkIcon size={20} />
                </div>
                <input
                  id="url-input"
                  type="url"
                  className="clay-input clay-input-lg clay-input-with-icon"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); if (videoInfo) handleReset(); }}
                  placeholder="Paste any social media link here..."
                  required
                  disabled={fetching || downloading}
                />
              </div>
              <button
                id="fetch-btn"
                type="submit"
                className="clay-btn clay-btn-primary clay-btn-lg"
                disabled={fetching || !url.trim() || downloading}
                style={{ minWidth: '170px' }}
              >
                {fetching ? (
                  <><div className="clay-loader"></div> Fetching...</>
                ) : (
                  <><Search size={20} /> Get Qualities</>
                )}
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--warm-gray-400)', fontWeight: 500, textAlign: 'center' }}>
              Supports 100+ platforms • Concurrent downloads for max speed • No registration needed
            </p>
          </form>

          {/* Error */}
          {error && (
            <div className="result-card result-error" style={{ marginTop: '1.25rem' }}>
              <div className="result-message">
                <div className="result-icon"><AlertCircle size={20} /></div>
                <div>{error}</div>
              </div>
            </div>
          )}

          {/* Video Info + Quality Selection */}
          {videoInfo && (
            <div style={{ marginTop: '1.5rem', animation: 'pop-in 0.4s cubic-bezier(0.68,-0.55,0.27,1.55) both' }}>
              
              {/* Video Preview */}
              <div className="clay-card" style={{ display: 'flex', gap: '1.25rem', padding: '1.25rem', marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {videoInfo.thumbnail && (
                  <div style={{ width: '160px', height: '100px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, boxShadow: 'var(--clay-shadow)' }}>
                    <img src={videoInfo.thumbnail} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--warm-gray-700)', lineHeight: 1.3, marginBottom: '0.3rem' }}>
                    {videoInfo.title || 'Untitled Video'}
                  </h3>
                  {videoInfo.duration && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--warm-gray-400)', fontWeight: 600 }}>
                      <Film size={14} /> {formatDuration(videoInfo.duration)}
                    </span>
                  )}
                </div>
              </div>

              {/* Quality Picker */}
              {!downloading && !result && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--warm-gray-600)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <HardDrive size={16} /> Select Quality
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.6rem' }}>
                    {videoInfo.formats.map((fmt) => (
                      <button
                        key={fmt.formatId}
                        type="button"
                        onClick={() => setSelectedFormat(fmt.formatId)}
                        className="clay-card"
                        style={{
                          padding: '0.8rem 1rem', cursor: 'pointer', textAlign: 'left',
                          border: selectedFormat === fmt.formatId ? '2px solid var(--orange-400)' : '2px solid transparent',
                          background: selectedFormat === fmt.formatId ? 'linear-gradient(135deg, rgba(255,237,213,0.9), rgba(255,255,255,0.9))' : 'rgba(255,255,255,0.6)',
                          transition: 'all 0.25s ease',
                          transform: selectedFormat === fmt.formatId ? 'scale(1.02)' : 'scale(1)',
                        }}
                        id={`quality-${fmt.formatId}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {fmt.resolution === 'Audio only' ? <Music size={16} color="var(--lavender)" /> : <Film size={16} color="var(--orange-500)" />}
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--warm-gray-700)' }}>{fmt.label}</span>
                        </div>
                        {fmt.fileSize > 0 && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--warm-gray-400)', marginTop: '0.2rem', marginLeft: '1.5rem' }}>~{formatBytes(fmt.fileSize)}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Download Button */}
              {!downloading && !result && (
                <button
                  id="download-btn"
                  type="button"
                  onClick={handleDownload}
                  className="clay-btn clay-btn-primary clay-btn-full clay-btn-lg"
                  disabled={!selectedFormat}
                >
                  <Download size={22} /> Download Now
                </button>
              )}

              {/* ══════ PROGRESS BAR ══════ */}
              {progress && downloading && (
                <div className="progress-container">
                  <div className="progress-header">
                    <span className="progress-status">
                      {progress.status === 'merging' ? '🔀 Merging audio & video...' :
                       progress.status === 'downloading' ? '⬇️ Downloading...' : '⏳ Processing...'}
                    </span>
                    <span className="progress-percent">{Math.round(progress.percent)}%</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${Math.min(progress.percent, 100)}%` }}></div>
                  </div>
                  <div className="progress-details">
                    <span>{progress.speed ? `Speed: ${progress.speed}` : ''}</span>
                    <span>{progress.eta ? `ETA: ${progress.eta}` : ''}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`result-card ${result.success ? 'result-success' : 'result-error'}`} style={{ marginTop: '1.25rem' }}>
              <div className="result-message">
                <div className="result-icon">
                  {result.success ? <Check size={20} /> : <AlertCircle size={20} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{result.message}</div>
                  {result.success && result.fileUrl && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <a href={result.fileUrl} download className="clay-btn clay-btn-success" id="save-file-btn" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                        <Download size={18} /> Save File
                      </a>
                      <button className="clay-btn clay-btn-secondary" onClick={handleReset} style={{ display: 'inline-flex' }}>
                        Download Another
                      </button>
                    </div>
                  )}
                  {!result.success && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <button className="clay-btn clay-btn-secondary" onClick={handleReset} style={{ display: 'inline-flex' }}>
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════ SUPPORTED PLATFORMS ══════ */}
      <section className="platforms-section">
        <h2 className="section-title">🌐 Supported Platforms</h2>
        <p className="section-subtitle">Download from all major social media platforms</p>
        <div className="platforms-grid">
          {PLATFORMS.map((p) => (
            <div key={p.name} className="clay-card platform-card" id={`platform-${p.name.toLowerCase().replace(/\s/g, '-')}`}>
              <div className={`platform-icon ${p.color}`}>
                <p.Icon />
              </div>
              <div className="platform-name">{p.name}</div>
              <div className="platform-formats">{p.formats}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section className="steps-section">
        <h2 className="section-title">⚡ How It Works</h2>
        <p className="section-subtitle">Three simple steps to download any content</p>
        <div className="steps-grid">
          {STEPS.map((s) => (
            <div key={s.num} className="clay-card step-card" id={`step-${s.num}`}>
              <div className="step-number">{s.num}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ SUPPORTED SITES LIST ══════ */}
      <section className="sites-section">
        <h2 className="section-title">📋 All Supported Sites</h2>
        <p className="section-subtitle">We support 100+ platforms — here are the most popular ones</p>
        <div className="clay-card" style={{ padding: '1.5rem' }}>
          <div className="sites-grid">
            {SUPPORTED_SITES.map((site) => (
              <div key={site} className="site-item">
                <div className="site-dot"></div>
                {site}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ DISCLAIMER ══════ */}
      <section className="disclaimer-section">
        <div className="disclaimer-card">
          <p>
            <strong>⚠️ Educational Purpose Only</strong><br />
            This tool is built for <strong>educational and personal use only</strong>. 
            Please respect copyright laws and the terms of service of each platform. 
            Do not use this tool to redistribute or commercially exploit downloaded content. 
            The developers are not responsible for any misuse.
          </p>
        </div>
      </section>
    </div>
  );
}
