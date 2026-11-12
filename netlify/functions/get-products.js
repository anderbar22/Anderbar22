const { createClient } = require('@supabase/supabase-js');

function fallbackProducts() {
  return [
    {
      id: 'p1',
      name: 'Vestido casual de verano',
      price: 24990,
      description: 'Tela fresca · Tallas S, M y L',
      photos: [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800',
        'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800'
      ]
    },
    {
      id: 'p2',
      name: 'Blazer ejecutivo',
      price: 32500,
      description: 'Corte sastre · Disponible en 3 colores',
      photos: [
        'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800',
        'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800',
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800'
      ]
    }
  ];
}

exports.handler = async function handler(event, context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(fallbackProducts())
      };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(fallbackProducts())
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(fallbackProducts())
    };
  }
};
