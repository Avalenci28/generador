import { useEffect, useMemo, useRef, useState } from 'react';
import './GeneradorDiamantes.css';

const USAGE_KEY = 'diamand_usage';
const DAILY_LIMIT = 3;

function normalizeUsage(raw) {
  try {
    if (!raw) return { date: '', count: 0 };
    const parsed = JSON.parse(raw);
    const date = typeof parsed?.date === 'string' ? parsed.date : '';
    const count = Number.isFinite(parsed?.count) ? parsed.count : 0;
    return { date, count: Math.max(0, count | 0) };
  } catch {
    return { date: '', count: 0 };
  }
}

function getTodayString() {
  return new Date().toDateString();
}

function getDailyUsage() {
  if (typeof window === 'undefined') return { date: '', count: 0, todayCount: 0, hasLimit: false };

  const raw = window.localStorage.getItem(USAGE_KEY);
  const usage = normalizeUsage(raw);
  const today = getTodayString();
  const todayCount = usage.date === today ? usage.count : 0;
  const hasLimit = todayCount >= DAILY_LIMIT;
  return { ...usage, todayCount, hasLimit };
}

function bumpUsage() {
  if (typeof window === 'undefined') return;

  const raw = window.localStorage.getItem(USAGE_KEY);
  const usage = normalizeUsage(raw);
  const today = getTodayString();

  let nextCount = DAILY_LIMIT;
  if (usage.date === today) {
    nextCount = (usage.count | 0) + 1;
  } else {
    nextCount = 1;
  }

  window.localStorage.setItem(USAGE_KEY, JSON.stringify({ date: today, count: nextCount }));
}

export default function GeneradorDiamantes({ player, onNuevoJugador }) {
  const [step, setStep] = useState('cantidad');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [errorLimit, setErrorLimit] = useState('');

  const [progress, setProgress] = useState(0);
  const [generatedAmount, setGeneratedAmount] = useState(null);

  const timerRef = useRef(null);

  const amounts = useMemo(
    () => [
      { value: 100, bonusLabel: null, sub: 'Sin bono' },
      { value: 310, bonusLabel: '+10% bonus', sub: 'Bono por cantidad' },
      { value: 520, bonusLabel: '+15% bonus', sub: 'Bono por cantidad' },
      { value: 1060, bonusLabel: '+20% bonus', sub: 'Bono por cantidad' },
    ],
    [],
  );

  useEffect(() => {
    if (step === 'cantidad') {
      setProgress(0);
      setGeneratedAmount(null);
      // Recalcular límite en cada entrada al paso cantidad
      const usage = getDailyUsage();
      if (usage.hasLimit) {
        setErrorLimit('Ya usaste tus 3 intentos de hoy, vuelve mañana.');
      } else {
        setErrorLimit('');
      }
    }
  }, [step]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startGenerating = () => {
    const usage = getDailyUsage();
    if (usage.hasLimit) {
      setErrorLimit('Ya usaste tus 3 intentos de hoy, vuelve mañana.');
      return;
    }

    if (!selectedAmount) return;

    setErrorLimit('');
    setStep('generando');
    setProgress(0);
    setGeneratedAmount(null);

    const totalMs = 17500; // ~15-20s
    const tickMs = 120;
    const ticks = Math.ceil(totalMs / tickMs);
    const increment = 100 / ticks;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + increment);
        return next;
      });
    }, tickMs);
  };

  useEffect(() => {
    if (step !== 'generando') return;
    if (progress >= 100) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;

      bumpUsage();
      setGeneratedAmount(selectedAmount);
      setStep('resultado');
    }
  }, [progress, selectedAmount, step]);

  const avatarLetter = (player?.nickname || '').trim().charAt(0).toUpperCase() || '★';
  const level = player?.level;

  const resetToCantidadSamePlayer = () => {
    setSelectedAmount(null);
    setStep('cantidad');
    setProgress(0);
    setGeneratedAmount(null);
  };

  const handleNuevoJugador = () => {
    // Dejar el componente padre resetear player a null (volver a BuscadorUID)
    onNuevoJugador?.();
  };

  return (
    <div className="generador-card">
      <div className="diamond-field">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="fd"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${7 + Math.random() * 6}s`,
              opacity: 0.08 + Math.random() * 0.18,
            }}
          />
        ))}
      </div>

      <div className="top">
        <div className="chip" aria-label="Jugador confirmado">
          <div className="avatar">{avatarLetter}</div>
          <div className="chip-title">
            <div className="chip-name">{player?.nickname || ''}</div>
            <div className="chip-meta">Nivel {level ?? '—'}</div>
          </div>
        </div>
      </div>

      <div className="section">
        {step === 'cantidad' && (
          <>
            <h1>Genera diamantes</h1>
            <p className="sub">Selecciona una cantidad y presiona Generar.</p>

            {errorLimit ? (
              <div className="error">{errorLimit}</div>
            ) : (
              <>
                <div className="cards">
                  {amounts.map((a) => (
                    <div
                      key={a.value}
                      className={`amount-card ${selectedAmount === a.value ? 'selected' : ''}`}
                      onClick={() => setSelectedAmount(a.value)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') setSelectedAmount(a.value);
                      }}
                      aria-pressed={selectedAmount === a.value}
                    >
                      <div className="amount-top">
                        <div className="amount">{a.value}</div>
                        {a.bonusLabel ? <div className="bonus">{a.bonusLabel}</div> : <div />}
                      </div>
                      <div className="amount-sub">{a.sub}</div>
                    </div>
                  ))}
                </div>

                <button disabled={!selectedAmount} onClick={startGenerating}>
                  <span className="btn-gem">◆</span> Generar
                </button>

                <div className="hint">Máximo 3 intentos por día.</div>
              </>
            )}
          </>
        )}

        {step === 'generando' && (
          <>
            <h1>Generando...</h1>
            <p className="sub">Procesando tu solicitud.</p>

            <div className="progress-wrap">
              <div className="bar" aria-label="Progreso">
                <span style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-text">Procesando tu solicitud... {Math.round(progress)}%</div>
            </div>
          </>
        )}

        {step === 'resultado' && (
          <>
            <h1>Listo</h1>
            <div className="result-box">
              <div className="generador-celebration">🎉</div>
              <div className="result-title">¡Diamantes añadidos!</div>
              <div className="result-amount">{generatedAmount ?? 0}</div>
              <div className="hint">Disfruta tu recompensa.</div>

              <button className="gold-btn" onClick={resetToCantidadSamePlayer}>
                Generar de nuevo
              </button>
              <button className="secondary-btn" onClick={handleNuevoJugador}>
                Buscar otro jugador
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

