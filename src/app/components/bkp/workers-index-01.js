// Exportamos el manejador del Worker
export default {
  async fetch(request, env) {
    try {
      // Extraemos las variables de entorno y el namespace de KV
      const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, MY_KV_NAMESPACE } = env;

      // Verificamos que todas las variables de entorno estén configuradas
      if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !MY_KV_NAMESPACE) {
        return new Response('Error: Variables de entorno o KV no configurados.', { status: 500 });
      }

      // Parseamos la URL de la petición
      const url = new URL(request.url);
      const path = url.pathname;

      // Definimos los orígenes permitidos para CORS
      const allowedOrigins = ['https://integrales.com.ar', 'http://localhost:4200'];
      const origin = request.headers.get('Origin');
      const corsHeaders = {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      };

      // Manejamos las solicitudes OPTIONS para CORS
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Ruta para obtener el token de acceso de Mercado Libre
      if (path === '/token') {
        const tokenKey = 'access_token';
        let accessToken = await MY_KV_NAMESPACE.get(tokenKey);

        // Si no hay token almacenado, obtenemos uno nuevo
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

          // Si la solicitud falla, devolvemos un error
          if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            return new Response(`Error al obtener el token: ${tokenResponse.statusText} - ${errorText}`, { status: 500, headers: corsHeaders });
          }

          // Parseamos la respuesta y guardamos el nuevo token
          const tokenData = await tokenResponse.json();
          accessToken = tokenData.access_token;
          await MY_KV_NAMESPACE.put(tokenKey, accessToken, { expirationTtl: 21600 });
        }

        // Devolvemos el token en la respuesta
        return new Response(JSON.stringify({ access_token: accessToken }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Ruta para obtener productos de Mercado Libre
      if (path === '/productos') {
        const response = await fetch('https://api.mercadolibre.com/sites/MLA/search?nickname=INTEGRALES', {
          headers: { Authorization: `Bearer ${await MY_KV_NAMESPACE.get('access_token')}` },
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Ruta para obtener categorías de Mercado Libre
      if (path === '/categorias') {
        const response = await fetch('https://api.mercadolibre.com/sites/MLA/categories');
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Ruta para obtener relevamientos desde la API de Mercado Libre
      if (path === '/relevamientos/menorprecio') {
        const query = url.searchParams.get('q') || '';
        const limit = url.searchParams.get('limit') || '50';
        const offset = url.searchParams.get('offset') || '0';

        // Construimos la URL de la API con los parámetros recibidos
        const apiUrl = `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`;

        // Realizamos la petición a la API de Mercado Libre
        const response = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${await MY_KV_NAMESPACE.get('access_token')}` },
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Ruta para obtener tendencias desde la API de Mercado Libre
      if (path === '/relevamientos/tendencia') {
        const category = url.searchParams.get('category') || 'MLA';

        // Construimos la URL de la API para obtener tendencias
        const apiUrl = `https://api.mercadolibre.com/trends/${category}`;

        const response = await fetch(apiUrl, {
          headers: { Authorization: `Bearer ${await MY_KV_NAMESPACE.get('access_token')}` },
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Ruta para obtener mas vendidos desde la API de Mercado Libre
      if (path === '/relevamientos/masvendidos') {
        const category = url.searchParams.get('category') || 'MLA5725';

        // 1. Obtener los productos más vendidos
        const highlightsUrl = `https://api.mercadolibre.com/highlights/MLA/category/${category}`;
        const highlightsResponse = await fetch(highlightsUrl, {
          headers: { Authorization: `Bearer ${await MY_KV_NAMESPACE.get('access_token')}` },
        });

        const highlightsData = await highlightsResponse.json();

        // Extraer los IDs de los productos
        const productIds = highlightsData.content.map(item => item.id).join(',');

        if (!productIds) {
          return new Response(JSON.stringify({ error: 'No products found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // 2. Obtener detalles de los productos
        const productsUrl = `https://api.mercadolibre.com/items?ids=${productIds}`;
        const productsResponse = await fetch(productsUrl, {
          headers: { Authorization: `Bearer ${await MY_KV_NAMESPACE.get('access_token')}` },
        });

        const productsData = await productsResponse.json();

        return new Response(JSON.stringify(productsData), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Si la ruta no existe, devolvemos un error 404
      return new Response(JSON.stringify({ message: 'Ruta no encontrada' }), { status: 404, headers: corsHeaders });

    } catch (error) {
      return new Response(`Error interno: ${error.message}`, { status: 500 });
    }
  },

};
