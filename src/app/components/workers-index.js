// Cloudflare Worker usando Modules y KV Storage

export default {
  async fetch(request, env) {
    try {
      // Variables de entorno y KV
      const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, TOKEN_STORAGE } = env;

      // Validación de configuración
      if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !TOKEN_STORAGE) {
        return new Response('Error: Variables de entorno o KV no configurados.', { status: 500 });
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

      // Respuesta para preflight (CORS)
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Ruta: Obtener token de acceso de Mercado Libre
      if (path === '/token') {
        const tokenKey = 'access_token';
        let accessToken = await TOKEN_STORAGE.get(tokenKey);

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
          await TOKEN_STORAGE.put(tokenKey, accessToken, { expirationTtl: 21600 }); // 6 horas
        }

        return new Response(JSON.stringify({ access_token: accessToken }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Ruta: Productos del usuario
      if (path === '/productos') {
        const accessToken = await TOKEN_STORAGE.get('access_token');
        const response = await fetch('https://api.mercadolibre.com/users/461242361/items/search?status=active', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data = await response.json();
        const ids = data.results.slice(0, 20);

        if (!ids.length) {
          return new Response(JSON.stringify([]), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const itemsResponse = await fetch(`https://api.mercadolibre.com/items?ids=${ids.join(',')}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
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

      // Ruta: Categorías
      if (path === '/categorias') {
        const response = await fetch('https://api.mercadolibre.com/sites/MLA/categories');
        const data = await response.json();

        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Ruta: Relevamientos - menor precio
      if (path === '/relevamientos/menorprecio') {
        const query = url.searchParams.get('q') || '';
        const limit = url.searchParams.get('limit') || '50';
        const offset = url.searchParams.get('offset') || '0';

        const apiUrl = `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`;
        const response = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${await TOKEN_STORAGE.get('access_token')}` },
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Ruta: Relevamientos - tendencias
      if (path === '/relevamientos/tendencia') {
        const category = url.searchParams.get('category') || 'MLA';
        const apiUrl = `https://api.mercadolibre.com/trends/${category}`;
        const response = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${await TOKEN_STORAGE.get('access_token')}` },
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Ruta: Relevamientos - más vendidos
      if (path === '/relevamientos/masvendidos') {
        const category = url.searchParams.get('category') || 'MLA5725';
        const highlightsUrl = `https://api.mercadolibre.com/highlights/MLA/category/${category}`;
        const highlightsResponse = await fetch(highlightsUrl, {
          headers: { Authorization: `Bearer ${await TOKEN_STORAGE.get('access_token')}` },
        });

        const highlightsData = await highlightsResponse.json();
        const productIds = highlightsData.content.map(item => item.id).join(',');

        if (!productIds) {
          return new Response(JSON.stringify({ error: 'No se encontraron productos' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const productsUrl = `https://api.mercadolibre.com/items?ids=${productIds}`;
        const productsResponse = await fetch(productsUrl, {
          headers: { Authorization: `Bearer ${await TOKEN_STORAGE.get('access_token')}` },
        });

        const productsData = await productsResponse.json();

        return new Response(JSON.stringify(productsData), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Ruta no encontrada
      return new Response(JSON.stringify({ message: 'Ruta no encontrada' }), {
        status: 404,
        headers: corsHeaders,
      });

    } catch (error) {
      return new Response(`Error interno: ${error.message}`, { status: 500 });
    }
  }
};
