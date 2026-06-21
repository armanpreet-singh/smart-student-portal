export const injectGlobalStyles = () => {
  const id = "ltsu-global-styles";
  if (document.getElementById(id)) return;

  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── LTSU Brand Colors from real seal logo ── */
    :root {
      --primary:       #1B3A6B;
      --primary-light: #2A52A0;
      --primary-dark:  #0F2247;
      --accent:        #C9A84C;
      --accent-light:  #F0C96B;
      --accent-dark:   #A07830;

      --bg-card:        rgba(255,255,255,0.88);
      --bg-card-hover:  rgba(255,255,255,0.96);
      --text-primary:   #0F1B35;
      --text-secondary: #3A4F72;
      --text-muted:     #7A8FAA;
      --border:         rgba(27,58,107,0.12);

      --shadow:    0 4px 6px -1px rgba(27,58,107,0.08);
      --shadow-lg: 0 10px 20px -4px rgba(27,58,107,0.12);
      --shadow-xl: 0 20px 40px -8px rgba(27,58,107,0.18);

      --glass-bg:     rgba(255,255,255,0.75);
      --glass-border: rgba(201,168,76,0.25);
      --nav-bg:       rgba(255,255,255,0.92);

      --progress-track: rgba(27,58,107,0.1);
    }

    [data-theme="dark"] {
      --bg-card:        rgba(10,18,35,0.90);
      --bg-card-hover:  rgba(15,26,50,0.96);
      --text-primary:   #E8EEF8;
      --text-secondary: #94A8C8;
      --text-muted:     #5A7298;
      --border:         rgba(201,168,76,0.12);

      --shadow:    0 4px 6px -1px rgba(0,0,0,0.5);
      --shadow-lg: 0 10px 20px -4px rgba(0,0,0,0.5);
      --shadow-xl: 0 20px 40px -8px rgba(0,0,0,0.6);

      --glass-bg:     rgba(10,18,35,0.82);
      --glass-border: rgba(201,168,76,0.18);
      --nav-bg:       rgba(6,12,24,0.95);

      --progress-track: rgba(201,168,76,0.1);
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: var(--text-primary);
      line-height: 1.6;
      overflow-x: hidden;
      transition: color 0.3s ease;
      background: #f0f4fa;
    }

    [data-theme="dark"] body { background: #060c18; }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #1B3A6B, #C9A84C);
      border-radius: 3px;
    }

    /* ── Glass Card ── */
    .glass-card {
      background: var(--glass-bg);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(27,58,107,0.1);
    }

    /* ── Gradient Text ── */
    .gradient-text {
      background: linear-gradient(135deg, #1B3A6B 0%, #2A52A0 45%, #C9A84C 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .gradient-text-gold {
      background: linear-gradient(135deg, #C9A84C 0%, #F0C96B 50%, #C9A84C 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* ── Buttons ── */
    .btn-primary {
      background: linear-gradient(135deg, #0F2247, #1B3A6B);
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 18px rgba(27,58,107,0.35);
      font-family: inherit;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(27,58,107,0.45);
      background: linear-gradient(135deg, #1B3A6B, #2A52A0);
    }

    .btn-accent {
      background: linear-gradient(135deg, #A07830, #C9A84C);
      color: #0F2247;
      border: none;
      padding: 14px 32px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 18px rgba(201,168,76,0.38);
      font-family: inherit;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .btn-accent:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(201,168,76,0.52);
    }

    .btn-secondary {
      background: rgba(255,255,255,0.7);
      color: #1B3A6B;
      border: 2px solid rgba(27,58,107,0.4);
      padding: 12px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: inherit;
      backdrop-filter: blur(8px);
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .btn-secondary:hover {
      background: rgba(27,58,107,0.08);
      border-color: #1B3A6B;
      transform: translateY(-2px);
    }
    [data-theme="dark"] .btn-secondary {
      background: rgba(10,18,35,0.7);
      color: #93c5fd;
      border-color: rgba(147,197,253,0.3);
    }

    .btn-outline-white {
      background: rgba(255,255,255,0.12);
      color: white;
      border: 1.5px solid rgba(255,255,255,0.3);
      padding: 12px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: inherit;
      backdrop-filter: blur(8px);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
    }
    .btn-outline-white:hover {
      background: rgba(255,255,255,0.22);
      transform: translateY(-2px);
    }

    /* ── Section Tag ── */
    .section-tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(27,58,107,0.1);
      color: #1B3A6B;
      padding: 6px 16px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      border: 1px solid rgba(27,58,107,0.2);
      margin-bottom: 20px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    [data-theme="dark"] .section-tag {
      background: rgba(201,168,76,0.12);
      color: #C9A84C;
      border-color: rgba(201,168,76,0.25);
    }

    /* ── Typography ── */
    .section-heading {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 800;
      line-height: 1.2;
      letter-spacing: -0.5px;
      color: var(--text-primary);
    }
    .section-subheading {
      font-size: 1.05rem;
      color: var(--text-secondary);
      line-height: 1.75;
      max-width: 600px;
    }

    /* ── Cards ── */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      transition: all 0.3s ease;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }
    .card:hover {
      box-shadow: var(--shadow-xl);
      transform: translateY(-4px);
      background: var(--bg-card-hover);
      border-color: rgba(27,58,107,0.22);
    }

    /* ── Tab Buttons ── */
    .tab-btn {
      padding: 10px 22px;
      border-radius: 10px;
      border: none;
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      background: transparent;
      color: var(--text-secondary);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .tab-btn.active {
      background: linear-gradient(135deg, #0F2247, #1B3A6B);
      color: white;
      box-shadow: 0 4px 14px rgba(27,58,107,0.32);
    }
    .tab-btn:hover:not(.active) {
      background: rgba(27,58,107,0.08);
      color: #1B3A6B;
    }
    [data-theme="dark"] .tab-btn:hover:not(.active) {
      background: rgba(201,168,76,0.08);
      color: #C9A84C;
    }

    /* ── Nav Links ── */
    .nav-link {
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 500;
      transition: color 0.2s;
      cursor: pointer;
      background: none;
      border: none;
      font-family: inherit;
      padding: 8px 16px;
      border-radius: 8px;
    }
    .nav-link:hover { color: #1B3A6B; background: rgba(27,58,107,0.06); }
    [data-theme="dark"] .nav-link:hover { color: #C9A84C; background: rgba(201,168,76,0.08); }

    /* ── Footer Links ── */
    .footer-link {
      color: rgba(255,255,255,0.48);
      text-decoration: none;
      font-size: 13.5px;
      transition: color 0.2s;
      cursor: pointer;
      display: block;
      margin-bottom: 9px;
    }
    .footer-link:hover { color: #C9A84C; }

    /* ── Progress Bar ── */
    .progress-bar {
      height: 6px;
      border-radius: 3px;
      background: var(--progress-track);
      overflow: hidden;
    }

    /* ── Tab Container ── */
    .tab-container {
      background: var(--bg-card);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 6px;
    }

    /* ── Animations ── */
    .animate-float       { animation: float 3s ease-in-out infinite; }
    .animate-float-delay { animation: float 3s ease-in-out 1.5s infinite; }
    .animate-pulse-dot   { animation: pulse-dot 2s ease-in-out infinite; }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50%      { transform: translateY(-10px); }
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%      { opacity: 0.5; transform: scale(1.4); }
    }

    /* ── Accessibility ── */
    .sr-only {
      position: absolute;
      width: 1px; height: 1px;
      padding: 0; margin: -1px;
      overflow: hidden;
      clip: rect(0,0,0,0);
      white-space: nowrap;
      border: 0;
    }

    /* ── Responsive ── */
    @media (max-width: 1024px) {
      .grid-5-col { grid-template-columns: repeat(3, 1fr) !important; }
    }
    @media (max-width: 768px) {
      .hide-mobile  { display: none !important; }
      .hero-grid    { grid-template-columns: 1fr !important; }
      .grid-2-col   { grid-template-columns: 1fr !important; }
      .grid-3-col   { grid-template-columns: 1fr !important; }
      .grid-4-col   { grid-template-columns: repeat(2, 1fr) !important; }
      .grid-5-col   { grid-template-columns: repeat(2, 1fr) !important; }
    }
    @media (min-width: 769px) {
      .show-mobile { display: none !important; }
    }
  `;
  document.head.appendChild(style);
};