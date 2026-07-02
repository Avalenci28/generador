// api/buscar-jugador.js
// Función serverless de Vercel — actúa como proxy para evitar CORS.
// Se despliega automáticamente si este archivo vive en la carpeta /api de tu proyecto Vercel.

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

  // Prueba varias regiones automáticamente, sin que el usuario tenga que elegir
  const REGIONS = ['br', 'ind', 'sg'];

  for (const region of REGIONS) {
    try {
      const apiUrl = `https://developers.freefirecommunity.com/api/v1/info?region=${region}&uid=${uid}`;

      const response = await fetch(apiUrl, {
        headers: {
          'x-api-key': apiKey,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Región ${region} - respuesta no ok:`, response.status, errText);
        continue; // prueba la siguiente región
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

  // Ninguna región encontró la cuenta
  return res.status(404).json({ error: 'Cuenta no encontrada en ninguna región' });
}