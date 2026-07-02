import { useState } from 'react';
import './BuscadorUID.css';

export default function BuscadorUID({ onConfirmar }) {
  const [uid, setUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [player, setPlayer] = useState(null);
  const [error, setError] = useState('');

  const buscarJugador = async () => {
    setError('');
    setPlayer(null);

    if (!uid.trim() || !/^\d+$/.test(uid.trim())) {
      setError('Ingresa un UID válido (solo números).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/buscar-jugador?uid=${uid.trim()}`);
      const data = await res.json();

      if (!res.ok || !data.nickname) {
        throw new Error(data.error || 'not_found');
      }

      setPlayer(data);
    } catch (err) {
      setError('No se encontró esa cuenta en LATAM Norte. Verifica el UID e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') buscarJugador();
  };

  return (
    <div className="buscador-card">
      <div className="diamond-field">
        {Array.from({ length: 18 }).map((_, i) => (
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
        <div className="gem">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M4 8L8 3H16L20 8L12 21L4 8Z"
              fill="url(#g1)"
              stroke="#bdf3ff"
              strokeWidth="0.6"
            />
            <path d="M4 8H20L12 21L4 8Z" fill="#ffffff" fillOpacity="0.12" />
            <path d="M8 3L6.5 8H4L8 3Z" fill="#ffffff" fillOpacity="0.25" />
            <defs>
              <linearGradient
                id="g1"
                x1="4"
                y1="3"
                x2="20"
                y2="21"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#8fe9ff" />
                <stop offset="1" stopColor="#1c7fc4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div>
          <div className="eyebrow">Diamand-Go · Verificación</div>
          <h1>Buscar jugador</h1>
        </div>
      </div>

      <p className="sub">
        Ingresa tu UID para confirmar la cuenta antes de activar la generación de diamantes.
      </p>

      <div className="region-pill">📍 Región fija: LATAM Norte</div>

      <input
        type="text"
        inputMode="numeric"
        placeholder="Ingresa tu ID (UID)"
        value={uid}
        onChange={(e) => setUid(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button onClick={buscarJugador} disabled={loading}>
        <span className="btn-gem">◆</span> {loading ? 'Buscando...' : 'Buscar jugador'}
      </button>

      {player && (
        <div className="result show">
          <div className="name-row">
            <div className="avatar">
              {player.nickname.trim().charAt(0).toUpperCase() || '★'}
            </div>
            <div>
              <div className="name">{player.nickname}</div>
              <div className="meta">
                {player.level ? `Nivel ${player.level} · LATAM Norte` : 'LATAM Norte'}
              </div>
            </div>
          </div>
          <span className="badge">✓ Cuenta encontrada</span>

          {onConfirmar && (
            <button className="confirm-btn" onClick={() => onConfirmar(player)}>
              Confirmar y continuar
            </button>
          )}
        </div>
      )}

      {error && <div className="error show">{error}</div>}

      <p className="note">Región fija LATAM Norte (server US).</p>
    </div>
  );
}

