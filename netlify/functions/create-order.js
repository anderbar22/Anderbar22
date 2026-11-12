const { createClient } = require('@supabase/supabase-js');

function validateCart(cart) {
  if (!Array.isArray(cart) || cart.length === 0) {
    throw new Error('El carrito no puede estar vacío.');
  }

  for (const item of cart) {
    if (!item.id || !item.quantity || item.quantity < 1) {
      throw new Error('Cada producto debe incluir una cantidad válida.');
    }
  }
}

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
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método no permitido' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const { cart, buyerEmail, buyerName } = body;

    validateCart(cart);

    const total = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

    const order = {
      id: `ord-${Date.now()}`,
      status: 'pending_payment',
      buyer_email: buyerEmail || 'demo@yaclick.test',
      buyer_name: buyerName || 'Comprador demo',
      total,
      created_at: new Date().toISOString(),
      items: cart
    };

    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      const { data: orderCreateResult, error: orderError } = await supabase
        .from('orders')
        .insert({
          external_id: order.id,
          buyer_email: order.buyer_email,
          buyer_name: order.buyer_name,
          status: order.status,
          total: order.total,
          created_at: order.created_at
        })
        .select()
        .single();

      if (!orderError && orderCreateResult) {
        const orderItems = cart.map(item => ({
          order_id: orderCreateResult.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: Number(item.price),
          subtotal: Number(item.price) * Number(item.quantity)
        }));

        await supabase.from('order_items').insert(orderItems);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        order,
        payment: {
          status: 'pending',
          provider: 'demo',
          message: 'Pago debe confirmarse en backend y no desde navegador.'
        }
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
