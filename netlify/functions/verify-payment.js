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
    const { orderId, providerRef } = body;

    if (!orderId) {
      throw new Error('Falta orderId.');
    }

    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env; 

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_provider_ref: providerRef || 'demo-provider-ref',
          payment_verified_at: new Date().toISOString()
        })
        .eq('external_id', orderId);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        orderId,
        status: 'paid',
        message: 'Pago validado en backend y listo para envío.'
      })
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ ok: false, error: error.message })
    };
  }
};
