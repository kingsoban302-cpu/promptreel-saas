import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage setToken={setToken} setUser={setUser} />} />
      <Route path="/register" element={<RegisterPage setToken={setToken} setUser={setUser} />} />
      <Route
        path="/dashboard"
        element={
          token ? (
            <Dashboard token={token} user={user} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/generate" element={token ? <GeneratePage token={token} user={user} onLogout={logout} /> : <Navigate to="/login" replace />} />
      <Route path="/library" element={token ? <LibraryPage token={token} user={user} onLogout={logout} /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function LandingPage() {
  return (
    <div className="page-shell landing-shell">
      <header className="topbar container">
        <div className="brand-wrap">
          <div className="brand-icon">P</div>
          <span>PromptReel</span>
        </div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/#features">Features</Link>
          <Link to="/dashboard">Dashboard</Link>
        </nav>
        <div className="nav-actions">
          <Link className="ghost-button" to="/login">Login</Link>
          <Link className="primary-button" to="/register">Start free</Link>
        </div>
      </header>

      <main>
        <section className="hero container">
          <div className="hero-copy">
            <span className="pill">AI video workflow</span>
            <h1>Turn ideas into scroll-stopping short videos.</h1>
            <p>
              PromptReel helps creators, agencies, and brands turn text prompts into social-ready video concepts and automated production flows.
            </p>
            <div className="cta-row">
              <Link className="primary-button" to="/register">Get started</Link>
              <Link className="secondary-button" to="/dashboard">View demo</Link>
            </div>
            <div className="stat-row">
              <div>
                <strong>4</strong>
                <span>Platforms</span>
              </div>
              <div>
                <strong>30s</strong>
                <span>Avg. setup</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>Automation</span>
              </div>
            </div>
          </div>

          <div className="hero-card">
            <div className="preview-window">
              <div className="preview-topbar">
                <span>Preview</span>
                <span className="small-badge">Reel</span>
              </div>
              <div className="video-scene">
                <div className="scene-overlay" />
                <div className="scene-copy">
                  <span>VIRAL</span>
                  <h3>Luxury Escape</h3>
                  <em>Sunset Story</em>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="features-section">
          <div className="container section-heading">
            <span className="pill neutral">Features</span>
            <h2>Built for short-form creative teams.</h2>
          </div>

          <div className="container feature-grid">
            <article className="info-card">
              <div className="icon">✦</div>
              <h3>Prompt-to-video</h3>
              <p>Turn any idea into a structured social video brief and creative direction.</p>
            </article>
            <article className="info-card">
              <div className="icon">▣</div>
              <h3>AI brief generation</h3>
              <p>Generate hooks, edits, scenes, visual direction, and CTA outlines in seconds.</p>
            </article>
            <article className="info-card">
              <div className="icon">⏱</div>
              <h3>Save and reuse</h3>
              <p>Keep generated concepts in your dashboard, version them, and reuse winning scripts.</p>
            </article>
          </div>
        </section>

        <section className="platform-section">
          <div className="container section-heading left-align">
            <span className="pill neutral">Platforms</span>
            <h2>Launch across all major short-video channels.</h2>
          </div>
          <div className="container platform-grid">
            <div className="platform-item">
              <span className="tag ig">Instagram</span>
              <h3>Reels</h3>
            </div>
            <div className="platform-item">
              <span className="tag yt">YouTube</span>
              <h3>Shorts</h3>
            </div>
            <div className="platform-item">
              <span className="tag tk">TikTok</span>
              <h3>Viral videos</h3>
            </div>
            <div className="platform-item">
              <span className="tag fb">Facebook</span>
              <h3>Promotions</h3>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-brand">
          <div className="brand-icon">P</div>
          <span>PromptReel</span>
        </div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

function LoginPage({ setToken, setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@promptreel.io');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your video workspace.">
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          <span>Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label>
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="primary-button full-width">Login</button>
      </form>
      <div className="auth-switch">
        <span>Need an account?</span>
        <Link to="/register">Create one</Link>
      </div>
    </AuthShell>
  );
}

function RegisterPage({ setToken, setUser }) {
  const navigate = useNavigate();
  const [name, setName] = useState('Demo Creator');
  const [email, setEmail] = useState('demo@promptreel.io');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthShell title="Create your workspace" subtitle="Launch smarter short-form video production.">
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </label>
        <label>
          <span>Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label>
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </label>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="primary-button full-width">Create account</button>
      </form>
      <div className="auth-switch">
        <span>Already have an account?</span>
        <Link to="/login">Log in</Link>
      </div>
    </AuthShell>
  );
}

function Dashboard({ token, user, onLogout }) {
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, avgViews: 0 });
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_URL}/projects`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
          setProjects(data.projects || []);
          setStats({
            total: data.projects.length,
            thisWeek: data.projects.filter((p) => new Date(p.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
            avgViews: Math.round(data.projects.reduce((sum, p) => sum + (p.views || 0), 0) / Math.max(1, data.projects.length))
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProjects();
  }, [token]);

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-wrap sidebar-brand">
          <div className="brand-icon">P</div>
          <span>PromptReel</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="active">Overview</Link>
          <Link to="/generate">Generate</Link>
          <Link to="/library">Library</Link>
        </nav>

        <div className="sidebar-user">
          <div>
            <strong>{user?.name || 'Creator'}</strong>
            <span>{user?.email || 'team@promptreel.io'}</span>
          </div>
          <button className="button-small ghost-button" onClick={onLogout}>Logout</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow small">Dashboard</p>
            <h2>Welcome back</h2>
          </div>
          <Link to="/generate" className="primary-button">New project</Link>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Projects</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="stat-card">
            <span>This week</span>
            <strong>{stats.thisWeek}</strong>
          </div>
          <div className="stat-card">
            <span>Avg. views</span>
            <strong>{stats.avgViews}</strong>
          </div>
        </section>

        <section className="dashboard-panel">
          <h3>Recent projects</h3>
          <div className="project-list">
            {projects.length === 0 ? (
              <div className="empty-state">No projects yet. Generate your first video.</div>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="project-row">
                  <div>
                    <strong>{project.name}</strong>
                    <small>{new Date(project.createdAt).toLocaleDateString()}</small>
                  </div>
                  <span>{project.platform}</span>
                  <span>{project.views || 0} views</span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function GeneratePage({ token, user, onLogout }) {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('Luxury travel campaign for a boutique resort with cinematic sunset visuals and a premium lifestyle feel.');
  const [platform, setPlatform] = useState('instagram');
  const [style, setStyle] = useState('cinematic');
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('Generating...');

    try {
      const response = await fetch(`${API_URL}/projects/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prompt, platform, style })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Generation failed');

      setResult(data.project);
      setStatus('Generation complete');
      navigate('/library');
    } catch (err) {
      setStatus(err.message);
    }
  };

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-wrap sidebar-brand">
          <div className="brand-icon">P</div>
          <span>PromptReel</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard">Overview</Link>
          <Link to="/generate" className="active">Generate</Link>
          <Link to="/library">Library</Link>
        </nav>

        <div className="sidebar-user">
          <div>
            <strong>{user?.name || 'Creator'}</strong>
            <span>{user?.email || 'team@promptreel.io'}</span>
          </div>
          <button className="button-small ghost-button" onClick={onLogout}>Logout</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow small">Generate</p>
            <h2>Create a new video brief</h2>
          </div>
        </header>

        <section className="dashboard-panel generator-panel">
          <form onSubmit={handleSubmit} className="generator-form">
            <label>
              <span>Prompt</span>
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={8} />
            </label>

            <div className="two-col">
              <label>
                <span>Platform</span>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                  <option value="instagram">Instagram Reels</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube Shorts</option>
                  <option value="facebook">Facebook Reel</option>
                </select>
              </label>

              <label>
                <span>Style</span>
                <select value={style} onChange={(e) => setStyle(e.target.value)}>
                  <option value="cinematic">Cinematic</option>
                  <option value="minimal">Minimal</option>
                  <option value="travel">Travel</option>
                  <option value="neon">Neon</option>
                  <option value="business">Business</option>
                </select>
              </label>
            </div>

            <div className="generate-actions">
              <button className="primary-button" type="submit">Generate</button>
              <span className="status-text">{status}</span>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

function LibraryPage({ token, user, onLogout }) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setProjects(data.projects || []))
      .catch(() => setProjects([]));
  }, [token]);

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-wrap sidebar-brand">
          <div className="brand-icon">P</div>
          <span>PromptReel</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard">Overview</Link>
          <Link to="/generate">Generate</Link>
          <Link to="/library" className="active">Library</Link>
        </nav>

        <div className="sidebar-user">
          <div>
            <strong>{user?.name || 'Creator'}</strong>
            <span>{user?.email || 'team@promptreel.io'}</span>
          </div>
          <button className="button-small ghost-button" onClick={onLogout}>Logout</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow small">Library</p>
            <h2>Saved video projects</h2>
          </div>
          <Link to="/generate" className="primary-button">New brief</Link>
        </header>

        <section className="dashboard-panel">
          <div className="project-grid">
            {projects.length === 0 ? (
              <div className="empty-state full-width">No saved projects yet.</div>
            ) : (
              projects.map((project) => (
                <article key={project.id} className="library-card">
                  <div className="library-thumb" style={{ background: 'linear-gradient(135deg, #7c5cff, #26d0ce)' }} />
                  <div className="library-copy">
                    <strong>{project.name}</strong>
                    <span>{project.platform}</span>
                    <p>{project.prompt}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
