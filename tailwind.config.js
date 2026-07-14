import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        '3.75': '0.9375rem',
        '7.5': '1.875rem',
      },
      colors: {
        ink: {
          950: '#020617',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
        card: '0 12px 35px rgba(15, 23, 42, 0.10)',
        cardHover: '0 18px 40px rgba(15, 23, 42, 0.14)',
        glow: '0 20px 60px rgba(59, 130, 246, 0.18)',
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents, theme }) {
      addComponents({
        '.app-shell': {
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          color: theme('colors.slate.900'),
        },

        '.app-shell-bg': {
          position: 'absolute',
          inset: '0',
          pointerEvents: 'none',
          backgroundImage:
            'radial-gradient(circle at top left, rgba(59,130,246,0.16), transparent 26%), radial-gradient(circle at top right, rgba(16,185,129,0.13), transparent 22%), radial-gradient(circle at bottom left, rgba(168,85,247,0.10), transparent 24%)',
        },

        '.app-shell-content': {
          position: 'relative',
          zIndex: '1',
          width: '100%',
          maxWidth: theme('maxWidth.7xl'),
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          paddingTop: theme('spacing.6'),
          paddingBottom: theme('spacing.8'),
        },

        '.hero-panel': {
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '1.75rem',
          borderWidth: '1px',
          borderColor: 'rgba(148, 163, 184, 0.25)',
          background:
            'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.94) 52%, rgba(14,116,144,0.92))',
          color: theme('colors.white'),
          boxShadow: theme('boxShadow.glow'),
        },

        '.hero-panel::before': {
          content: '""',
          position: 'absolute',
          inset: '0',
          background:
            'radial-gradient(circle at top right, rgba(255,255,255,0.14), transparent 25%), radial-gradient(circle at bottom left, rgba(255,255,255,0.10), transparent 22%)',
          pointerEvents: 'none',
        },

        '.hero-badge': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: theme('spacing.2'),
          paddingLeft: theme('spacing.3'),
          paddingRight: theme('spacing.3'),
          paddingTop: theme('spacing.1'),
          paddingBottom: theme('spacing.1'),
          borderRadius: theme('borderRadius.full'),
          fontSize: theme('fontSize.xs')[0],
          lineHeight: theme('fontSize.xs')[1].lineHeight,
          fontWeight: theme('fontWeight.semibold'),
          backgroundColor: 'rgba(255,255,255,0.10)',
          borderWidth: '1px',
          borderColor: 'rgba(255,255,255,0.12)',
          color: theme('colors.white'),
        },

        '.hero-title': {
          fontSize: 'clamp(2rem, 3vw, 3.2rem)',
          lineHeight: '1.1',
          fontWeight: theme('fontWeight.black'),
          letterSpacing: '-0.03em',
        },

        '.hero-subtitle': {
          color: 'rgba(241,245,249,0.82)',
          maxWidth: '42rem',
          fontSize: theme('fontSize.base')[0],
          lineHeight: theme('fontSize.base')[1].lineHeight,
        },

        '.nav-shell': {
          display: 'flex',
          flexWrap: 'wrap',
          gap: theme('spacing.2'),
        },

        '.nav-chip': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme('spacing.2'),
          minHeight: '2.75rem',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          borderRadius: theme('borderRadius.full'),
          borderWidth: '1px',
          borderColor: 'rgba(148,163,184,0.18)',
          backgroundColor: 'rgba(15,23,42,0.40)',
          color: 'rgba(248,250,252,0.86)',
          fontSize: theme('fontSize.sm')[0],
          lineHeight: theme('fontSize.sm')[1].lineHeight,
          fontWeight: theme('fontWeight.semibold'),
          transitionProperty: 'all',
          transitionDuration: '180ms',
          backdropFilter: 'blur(16px)',
        },
        '.nav-chip:hover': {
          transform: 'translateY(-1px)',
          backgroundColor: 'rgba(255,255,255,0.12)',
          borderColor: 'rgba(255,255,255,0.22)',
          color: theme('colors.white'),
        },
        '.nav-chip-active': {
          backgroundImage: 'linear-gradient(135deg, #38bdf8, #2563eb)',
          borderColor: 'rgba(255,255,255,0.20)',
          color: theme('colors.white'),
          boxShadow: theme('boxShadow.soft'),
        },

        '.surface': {
          backgroundColor: 'rgba(255,255,255,0.84)',
          backdropFilter: 'blur(18px)',
          borderWidth: '1px',
          borderColor: 'rgba(148,163,184,0.18)',
          borderRadius: '1.5rem',
          boxShadow: theme('boxShadow.soft'),
        },

        '.app-card': {
          backgroundColor: 'rgba(255,255,255,0.86)',
          backdropFilter: 'blur(16px)',
          padding: theme('spacing.5'),
          borderRadius: '1.5rem',
          borderWidth: '1px',
          borderColor: 'rgba(148,163,184,0.16)',
          boxShadow: theme('boxShadow.card'),
        },

        '.stats-bar': {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: theme('spacing.3'),
          marginBottom: theme('spacing.5'),
        },

        '.stat-tile': {
          padding: theme('spacing.4'),
          borderRadius: '1.25rem',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.82))',
          borderWidth: '1px',
          borderColor: 'rgba(148,163,184,0.14)',
          boxShadow: theme('boxShadow.soft'),
        },

        '.stat-value': {
          fontSize: theme('fontSize.3xl')[0],
          lineHeight: theme('fontSize.3xl')[1].lineHeight,
          fontWeight: theme('fontWeight.bold'),
          color: theme('colors.slate.900'),
          letterSpacing: '-0.03em',
        },
        '.stat-label': {
          fontSize: theme('fontSize.sm')[0],
          lineHeight: theme('fontSize.sm')[1].lineHeight,
          color: theme('colors.slate.500'),
        },

        '.app-input': {
          width: '100%',
          borderWidth: '1px',
          borderColor: 'rgba(148,163,184,0.28)',
          borderRadius: '1rem',
          backgroundColor: 'rgba(255,255,255,0.90)',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          paddingTop: theme('spacing.3'),
          paddingBottom: theme('spacing.3'),
          fontSize: theme('fontSize.base')[0],
          lineHeight: theme('fontSize.base')[1].lineHeight,
          outline: 'none',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
          transitionProperty: 'all',
          transitionDuration: '180ms',
        },
        '.app-input:focus': {
          borderColor: theme('colors.sky.500'),
          boxShadow: '0 0 0 4px rgba(56, 189, 248, 0.16)',
        },

        '.pill': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme('spacing.2'),
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          paddingTop: theme('spacing.2.5'),
          paddingBottom: theme('spacing.2.5'),
          borderRadius: theme('borderRadius.full'),
          fontSize: theme('fontSize.sm')[0],
          lineHeight: theme('fontSize.sm')[1].lineHeight,
          fontWeight: theme('fontWeight.semibold'),
          transitionProperty: 'all',
          transitionDuration: '180ms',
          borderWidth: '1px',
        },
        '.pill-active': {
          backgroundImage: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
          color: theme('colors.white'),
          borderColor: 'transparent',
          boxShadow: theme('boxShadow.soft'),
        },
        '.pill-inactive': {
          backgroundColor: 'rgba(255,255,255,0.78)',
          color: theme('colors.slate.700'),
          borderColor: 'rgba(148,163,184,0.18)',
        },
        '.pill-inactive:hover': {
          borderColor: theme('colors.sky.500'),
          color: theme('colors.sky.700'),
          transform: 'translateY(-1px)',
        },

        '.btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme('spacing.2'),
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4'),
          paddingTop: theme('spacing.2.5'),
          paddingBottom: theme('spacing.2.5'),
          borderRadius: theme('borderRadius.full'),
          cursor: 'pointer',
          transitionProperty: 'all',
          transitionDuration: '180ms',
          fontSize: theme('fontSize.sm')[0],
          lineHeight: theme('fontSize.sm')[1].lineHeight,
          fontWeight: theme('fontWeight.semibold'),
          boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
        },
        '.btn:disabled': {
          opacity: '0.6',
          cursor: 'not-allowed',
        },
        '.btn-blue': {
          backgroundImage: 'linear-gradient(135deg, #38bdf8, #2563eb)',
          color: theme('colors.white'),
          boxShadow: '0 10px 25px rgba(37,99,235,0.20)',
        },
        '.btn-blue:hover': {
          transform: 'translateY(-1px)',
        },
        '.btn-orange': {
          backgroundImage: 'linear-gradient(135deg, #fb923c, #f97316)',
          color: theme('colors.white'),
          boxShadow: '0 10px 25px rgba(249,115,22,0.18)',
        },
        '.btn-orange:hover': {
          transform: 'translateY(-1px)',
        },
        '.btn-red': {
          backgroundImage: 'linear-gradient(135deg, #f87171, #e11d48)',
          color: theme('colors.white'),
          boxShadow: '0 10px 25px rgba(225,29,72,0.18)',
        },
        '.btn-red:hover': {
          transform: 'translateY(-1px)',
        },
        '.btn-green': {
          backgroundImage: 'linear-gradient(135deg, #34d399, #059669)',
          color: theme('colors.white'),
          boxShadow: '0 10px 25px rgba(5,150,105,0.18)',
        },
        '.btn-green:hover': {
          transform: 'translateY(-1px)',
        },
        '.btn-gray': {
          backgroundColor: 'rgba(248,250,252,0.96)',
          color: theme('colors.slate.700'),
          borderWidth: '1px',
          borderColor: 'rgba(148,163,184,0.18)',
        },
        '.btn-gray:hover': {
          backgroundColor: 'rgba(241,245,249,0.96)',
          transform: 'translateY(-1px)',
        },

        '.sentence-card': {
          backgroundColor: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(18px)',
          padding: theme('spacing.5'),
          borderRadius: '1.5rem',
          borderWidth: '1px',
          borderColor: 'rgba(148,163,184,0.14)',
          boxShadow: theme('boxShadow.card'),
          transitionProperty: 'all',
          transitionDuration: '200ms',
          borderRightWidth: '4px',
        },
        '.sentence-card-normal': {
          borderRightColor: theme('colors.sky.500'),
        },
        '.sentence-card-normal:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme('boxShadow.cardHover'),
        },
        '.sentence-card-learned': {
          background: 'linear-gradient(180deg, rgba(240,253,250,0.95), rgba(255,255,255,0.92))',
          borderRightColor: theme('colors.emerald.500'),
          boxShadow: '0 18px 35px rgba(16,185,129,0.10)',
        },

        '.empty-state': {
          padding: theme('spacing.8'),
          textAlign: 'center',
          borderRadius: '1.5rem',
          borderWidth: '1px',
          borderColor: 'rgba(148,163,184,0.14)',
          backgroundColor: 'rgba(255,255,255,0.82)',
          color: theme('colors.slate.600'),
        },
      });
    }),
  ],
}