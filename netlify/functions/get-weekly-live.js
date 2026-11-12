const { createClient } = require('@supabase/supabase-js');

function fallbackLive() {
  return {
    id: 'weekly-live-demo',
    title: 'Showroom semanal Yaclick',
    hostName: 'Camila',
    videoUrl: 'https://www.youtube-nocookie.com/embed/jfKfPfyJRdk',
    status: 'live',
    startsAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    timezone: 'America/Santiago',
    note: 'Transmisión actual en vivo para esta semana.'
  };
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
        body: JSON.stringify(fallbackLive())
      };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('weekly_lives')
      .select('*')
      .lte('starts_at', now)
      .gte('ends_at', now)
      .eq('is_active', true)
      .order('starts_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(fallbackLive())
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
      body: JSON.stringify(fallbackLive())
    };
  }
};
