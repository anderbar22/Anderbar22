const { createClient } = require('@supabase/supabase-js');

exports.handler = async function handler(event, context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { orderId, buyerConfirmed } = body;

    if (!orderId) {
      throw new Error('Falta orderId.');
    }

    const newStatus = buyerConfirmed ? 'delivered' : 'disputed';

    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('external_id', orderId);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, orderId, status: newStatus })
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ ok: false, error: error.message })
    };
  }
};
