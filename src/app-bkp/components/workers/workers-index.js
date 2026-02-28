// Cloudflare Worker (Modules) - Mercado Libre + Mercado Pago

export default {
  async fetch(request, env) {
    try {
      const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, TOKEN_STORAGE, MP_ACCESS_TOKEN } = env;

      // Validar variables requeridas
      if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !TOKEN_STORAGE || !MP_ACCESS_TOKEN) {
        return new Response('❌ Variables de entorno faltantes', { status: 500 });
      }

      const url = new URL(request.url);
      const path = url.pathname;

      // CORS
      const allowedOrigins = ['https://integrales.com.ar', 'http://localhost:4200'];
      const origin = request.headers.get('Origin');
      const corsHeaders = {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      };

      // Preflight CORS
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // 🔹 Ruta: Obtener token de Mercado Libre
      if (path === '/token') {
        const tokenKey = 'access_token';
        let accessToken = await TOKEN_STORAGE.get(tokenKey);

        if (!accessToken) {
          const tokenRes = await fetch('https://api.mercadolibre.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              grant_type: 'refresh_token',
              client_id: CLIENT_ID,
              client_secret: CLIENT_SECRET,
              refresh_token: REFRESH_TOKEN
            })
          });

          if (!tokenRes.ok) {
            const errorText = await tokenRes.text();
            return new Response(`❌ Error al obtener token: ${errorText}`, { status: 500, headers: corsHeaders });
          }

          const tokenData = await tokenRes.json();
          accessToken = tokenData.access_token;
          await TOKEN_STORAGE.put(tokenKey, accessToken, { expirationTtl: 21600 }); // 6h
        }

        return new Response(JSON.stringify({ access_token: accessToken }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // 🔹 Ruta: Productos
      if (path === '/productos') {
        const accessToken = await TOKEN_STORAGE.get('access_token');
        if (!accessToken) {
          return new Response('❌ Token no disponible', { status: 401, headers: corsHeaders });
        }

        const response = await fetch('https://api.mercadolibre.com/users/461242361/items/search?status=active', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        const data = await response.json();
        const ids = data.results.slice(0, 20);

        if (!ids.length) {
          return new Response(JSON.stringify([]), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const itemsResponse = await fetch(`https://api.mercadolibre.com/items?ids=${ids.join(',')}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        const itemsData = await itemsResponse.json();
        const productos = itemsData
          .filter(item => item.body && typeof item.body.price === 'number')
          .map(item => ({
            id: item.body.id,
            title: item.body.title,
            thumbnail: item.body.thumbnail,
            price: item.body.price,
            permalink: item.body.permalink,
            available_quantity: item.body.available_quantity,
          }));

        return new Response(JSON.stringify(productos), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // 🔹 Ruta: Crear preferencia Mercado Pago
      if (path === '/crear-preferencia' && request.method === 'POST') {
        const body = await request.json();

        const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            items: [
              {
                title: body.title,
                quantity: 1,
                unit_price: body.price,
                currency_id: 'ARS'
              }
            ],
            back_urls: {
              success: "https://integrales.com.ar/success",
              failure: "https://integrales.com.ar/failure",
              pending: "https://integrales.com.ar/pending"
            },
            auto_return: "approved"
          })
        });

        const data = await mpRes.json();

        return new Response(JSON.stringify({ id: data.id }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // 🔹 Ruta no encontrada
      return new Response(JSON.stringify({ error: 'Ruta no encontrada' }), {
        status: 404,
        headers: corsHeaders
      });

    } catch (err) {
      return new Response(`❌ Error interno: ${err.message}`, { status: 500 });
    }
  }
};
