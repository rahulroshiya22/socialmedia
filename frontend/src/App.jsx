import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Download, Sun, Moon, Check, AlertCircle, Zap } from 'lucide-react'
import { translations } from './i18n'

/* ═══════ CONTEXTS ═══════ */
const ThemeContext = createContext();
const LangContext = createContext();
const ToastContext = createContext();

export const useTheme = () => useContext(ThemeContext);
export const useLang = () => useContext(LangContext);
export const useToast = () => useContext(ToastContext);

/* ═══════ CONFETTI COMPONENT ═══════ */
const CONFETTI_COLORS = ['#f97316','#fb923c','#fbbf24','#34d399','#60a5fa','#a78bfa','#f472b6','#ff6b6b'];
export function Confetti({ active }) {
  if (!active) return null;
  return (
    <div className="confetti-container">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            background: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            width: `${6 + Math.random() * 10}px`,
            height: `${6 + Math.random() * 10}px`,
            animationDuration: `${2 + Math.random() * 2}s`,
            animationDelay: `${Math.random() * 0.8}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════ TOAST SYSTEM ═══════ */
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.type} ${t.exiting ? 'toast-exit' : ''}`}
        >
          <span className="toast-icon">
            {t.type === 'success' ? <Check size={18} /> : t.type === 'error' ? <AlertCircle size={18} /> : <Zap size={18} />}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  // ═══════ DARK MODE ═══════
  const [theme, setTheme] = useState(() => localStorage.getItem('sg-theme') || 'light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sg-theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  // ═══════ LANGUAGE ═══════
  const [lang, setLang] = useState(() => localStorage.getItem('sg-lang') || 'en');
  useEffect(() => { localStorage.setItem('sg-lang', lang); }, [lang]);
  const t = translations[lang] || translations.en;

  // ═══════ TOAST NOTIFICATIONS ═══════
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t2 => t2.id === id ? { ...t2, exiting: true } : t2));
      setTimeout(() => {
        setToasts(prev => prev.filter(t2 => t2.id !== id));
      }, 350);
    }, 3500);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <LangContext.Provider value={{ lang, setLang, t }}>
        <ToastContext.Provider value={{ addToast }}>
          <div className="app-wrapper">
            {/* Animated Background Blobs */}
            <div className="bg-animated">
              <div className="blob blob-1"></div>
              <div className="blob blob-2"></div>
              <div className="blob blob-3"></div>
              <div className="blob blob-4"></div>
              <div className="blob blob-5"></div>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="particle"
                  style={{
                    width: `${Math.random() * 8 + 4}px`,
                    height: `${Math.random() * 8 + 4}px`,
                    background: `hsl(${25 + Math.random() * 20}, ${80 + Math.random() * 20}%, ${70 + Math.random() * 15}%)`,
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${15 + Math.random() * 20}s`,
                    animationDelay: `${Math.random() * 10}s`,
                    opacity: 0.5 + Math.random() * 0.3,
                  }}
                />
              ))}
            </div>

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} />

            {/* Navigation */}
            <nav className="clay-nav">
              <div className="container">
                <Link to="/" className="nav-brand">
                  <div className="nav-brand-icon">
                    <Download size={20} />
                  </div>
                  SnapGrab
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <ul className="nav-links" style={{ marginRight: '0.5rem' }}>
                    <li>
                      <Link to="/" className={`nav-link ${!isAdmin ? 'nav-link-active' : ''}`}>
                        {t.nav.home}
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin" className={`nav-link nav-link-admin ${isAdmin ? 'nav-link-active' : ''}`}>
                        ⚙️ {t.nav.admin}
                      </Link>
                    </li>
                  </ul>
                  <div className="nav-extras">
                    {/* Language Selector */}
                    <select
                      className="lang-select"
                      value={lang}
                      onChange={(e) => setLang(e.target.value)}
                      title={t.nav.language}
                    >
                      <option value="en">🇬🇧 EN</option>
                      <option value="hi">🇮🇳 HI</option>
                    </select>
                    {/* Dark Mode Toggle */}
                    <button
                      className="theme-toggle"
                      data-active={theme === 'dark' ? 'true' : 'false'}
                      onClick={toggleTheme}
                      title={t.nav.darkMode}
                    >
                      <span className="theme-toggle-knob">
                        {theme === 'light' ? <Sun size={13} color="#fff" /> : <Moon size={13} color="#fff" />}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
              <Outlet />
            </main>

            {/* Footer */}
            <footer className="clay-footer">
              <div className="container">
                <p>🍊 SnapGrab — Download anything from any social media. Free & fast.</p>
              </div>
            </footer>
          </div>
        </ToastContext.Provider>
      </LangContext.Provider>
    </ThemeContext.Provider>
  )
}

export default App
