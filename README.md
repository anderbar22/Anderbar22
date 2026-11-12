# Yaclick

Este repositorio deja armada la base para un marketplace de live commerce para Yaclick, con flujo de venta semanal, simulive del resto de la semana, catálogo y protección del comprador.

## Estructura

- `index.html` — frontend de la aplicación
- `netlify.toml` — configuración de Netlify
- `package.json` — dependencias mínimas
- `.env.example` — variables de entorno
- `netlify/functions/` — funciones serverless del backend
- `supabase/schema.sql` — esquema de base de datos
- `README.md` — documentación

## Cómo funciona

- El vendedor publica un live semanal y un catálogo.
- El backend guarda ese contenido en Supabase.
- El frontend consulta el live vigente y los productos activos.
- El comprador agrega productos al carrito y paga desde la plataforma.
- Los fondos quedan retenidos hasta la confirmación de entrega.
- El vendedor recibe el payout una vez confirmada la recepción o resuelta la disputa.

## Seguridad del comprador

La plataforma debe operar así:

- El comprador paga a la plataforma, no al vendedor.
- Los fondos quedan retenidos por la plataforma.
- El vendedor solo recibe el dinero después de la confirmación de entrega.
- Si el pedido llega dañado o no llega, el comprador puede abrir disputa.
- La plataforma revisa evidencia y decide si devuelve o paga.

## Zona horaria

Usa siempre `America/Santiago` para el horario del live semanal.

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores reales:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `JWT_SECRET`
- `APP_URL`

## Despliegue en Netlify

1. Conecta este repo a Netlify.
2. Establece el comando de build: `npm run build`
3. Usa el directorio raíz.
4. Agrega las variables de entorno en Netlify.
5. Haz deploy.

## Base de datos

Importa el archivo `supabase/schema.sql` en Supabase para crear tablas y políticas.

## Flujo comercial real

- Estados del pedido: `pending_payment`, `paid`, `packed`, `shipped`, `delivered`, `disputed`, `completed`, `refunded`.
- El pago es validado en backend por webhook o verificación del proveedor.
- El payout al vendedor debe ejecutarse solo al completar la entrega.

## APIs base

- `/.netlify/functions/get-weekly-live`
- `/.netlify/functions/get-products`
- `/.netlify/functions/create-order`
- `/.netlify/functions/verify-payment`
- `/.netlify/functions/confirm-delivery`
- `/.netlify/functions/payout-seller`

## Observación legal / financiera

Mercado Pago no ofrece un escrow clásico totalmente automatizado para todas las operaciones. En la práctica, el marketplace debe mantener la lógica de retención de fondos, confirmación de entrega y payout diferido en backend para proteger a comprador y vendedor.

## Siguiente paso recomendado

1. Crear la base de datos en Supabase.
2. Configurar las variables de entorno en Netlify.
3. Conectar paso de pago real.
4. Probar el flujo completo con un pedido de prueba.
5. Conectar un panel privado para el vendedor.

