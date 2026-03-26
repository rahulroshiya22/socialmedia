import { Outlet, Link, useLocation } from 'react-router-dom'
import { Download } from 'lucide-react'

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="app-wrapper">
      {/* Animated Background Blobs */}
      <div className="bg-animated">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
        <div className="blob blob-5"></div>
        {/* Floating particles */}
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

      {/* Navigation */}
      <nav className="clay-nav">
        <div className="container">
          <Link to="/" className="nav-brand">
            <div className="nav-brand-icon">
              <Download size={20} />
            </div>
            SnapGrab
          </Link>
          <ul className="nav-links">
            <li>
              <Link to="/" className={`nav-link ${!isAdmin ? 'nav-link-active' : ''}`}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/admin" className={`nav-link nav-link-admin ${isAdmin ? 'nav-link-active' : ''}`}>
                ⚙️ Admin
              </Link>
            </li>
          </ul>
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
  )
}

export default App
