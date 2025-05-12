export default {
  async fetch(request, env) {
    try {
      const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, MY_KV_NAMESPACE } = env;

      if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !MY_KV_NAMESPACE) {
        return new Response('Error: Variables de entorno o KV no configurados.', { status: 500 });
      }

      const allowedOrigins = ['https://integrales.com.ar', 'http://localhost:4200'];
      const origin = request.headers.get('Origin');
      const corsHeaders = {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      const tokenKey = 'access_token';
      let accessToken = await MY_KV_NAMESPACE.get(tokenKey);

      if (!accessToken) {
        const tokenResponse = await fetch('https://api.mercadolibre.com/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grant_type: 'refresh_token',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: REFRESH_TOKEN,
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          return new Response(`Error al obtener el token: ${tokenResponse.statusText} - ${errorText}`, { status: 500, headers: corsHeaders });
        }

        const tokenData = await tokenResponse.json();
        accessToken = tokenData.access_token;

        await MY_KV_NAMESPACE.put(tokenKey, accessToken, { expirationTtl: 21600 });
      }

      return new Response(JSON.stringify({ access_token: accessToken }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (error) {
      return new Response(`Error interno: ${error.message}`, { status: 500 });
    }
  },
};
