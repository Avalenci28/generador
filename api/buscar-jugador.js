// api/buscar-jugador.js
// Función serverless de Vercel — actúa como proxy para evitar CORS.

export default async function handler(req, res) {
  const { uid } = req.query;

  if (!uid || !/^\d+$/.test(uid)) {
    return res.status(400).json({ error: 'UID inválido' });
  }

  const apiKey = process.env.FF_API_KEY;
  if (!apiKey) {
    console.error('Falta configurar FF_API_KEY en las variables de entorno de Vercel');
    return res.status(500).json({ error: 'Servicio no configurado. Intenta más tarde.' });
  }

  const REGIONS = ['br', 'ind', 'sg'];

  for (const region of REGIONS) {
    try {
      const apiUrl = `https://developers.freefirecommunity.com/api/v1/info?region=${region}&uid=${uid}`;

      const response = await fetch(apiUrl, {
        headers: { 'x-api-key': apiKey }
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Región ${region} - respuesta no ok:`, response.status, errText);
        continue;
      }

      const data = await response.json();
      const nickname = data?.basicInfo?.nickname || data?.data?.basicInfo?.nickname;
      const level = data?.basicInfo?.level || data?.data?.basicInfo?.level;

      if (nickname) {
        return res.status(200).json({ nickname, level, region });
      }

      console.error(`Región ${region} - sin nickname:`, JSON.stringify(data));
    } catch (err) {
      console.error(`Región ${region} - error:`, err);
    }
  }

  return res.status(404).json({ error: 'Cuenta no encontrada en ninguna región' });
}