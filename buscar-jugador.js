// api/buscar-jugador.js
// Función serverless de Vercel — actúa como proxy para evitar CORS.
// Se despliega automáticamente si este archivo vive en la carpeta /api de tu proyecto Vercel.

export default async function handler(req, res) {
  const { uid } = req.query;

  if (!uid || !/^\d+$/.test(uid)) {
    return res.status(400).json({ error: 'UID inválido' });
  }

  // Región fija: LATAM Norte -> código "US" en esta API
  const REGION = 'US';

  try {
    const apiUrl = `https://freefireinfo-zy9l.onrender.com/api/v1/player-profile?uid=${uid}&server=${REGION}`;

    const response = await fetch(apiUrl, {
      headers: {
        // Algunas APIs gratuitas bloquean requests sin user-agent de navegador
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    const data = await response.json();
    const nickname = data?.basicinfo?.nickname || data?.data?.basicinfo?.nickname;
    const level = data?.basicinfo?.level || data?.data?.basicinfo?.level;

    if (!nickname) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    return res.status(200).json({ nickname, level, region: 'LATAM Norte' });

  } catch (err) {
    console.error('Error consultando API de Free Fire:', err);
    return res.status(500).json({ error: 'Error al consultar el servicio. Intenta de nuevo.' });
  }
}
