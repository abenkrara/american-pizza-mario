const { supabase } = require('../lib/supabaseClient');
const nodemailer = require('nodemailer');

const OWNER_EMAIL = 'ayubbenkrara82@gmail.com';
const GMAIL_USER = 'ayubbenkrara82@gmail.com';
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD || 'uxlp vxek tldm sttj';

// Debug mode - disable console.log in production
const DEBUG = process.env.NODE_ENV !== 'production';
const log = (...args) => DEBUG && console.log(...args);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS
    }
});

// Simple in-memory rate limiting (for Vercel serverless)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5; // 5 requests per window

function checkRateLimit(ip) {
    const now = Date.now();
    const userRequests = requestCounts.get(ip) || [];
    const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);

    if (recentRequests.length >= MAX_REQUESTS) {
        return false;
    }
    recentRequests.push(now);
    requestCounts.set(ip, recentRequests);
    return true;
}

// --- TELEGRAM CONFIG ---
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1424186372';

async function sendTelegramNotification(booking, tables) {
    const message = `
🍕 *NUEVA RESERVA* 🍕

👤 *Cliente:* ${booking.name}
📞 *Tel:* ${booking.phone || 'No indicado'}
📧 *Email:* ${booking.email || 'No indicado'}
📅 *Fecha:* ${booking.date}
⏰ *Hora:* ${booking.time}
👥 *Personas:* ${booking.pax}
🪑 *Mesas:* ${tables}

_Revisar en el panel de administración._
    `.trim();

    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        console.log('Telegram notification sent.');
    } catch (e) {
        console.error('Error sending Telegram notification:', e);
    }
}

// UUID constant for configuration row
const CONFIG_ID = '00000000-0000-0000-0000-000000000001';

// --- CALCULATE TABLES NEEDED ---
function calculateTablesNeeded(pax) {
    if (pax <= 4) return 1;
    if (pax <= 6) return 2;
    if (pax <= 8) return 3;
    return 1 + Math.ceil((pax - 4) / 2);
}

// --- HELPER: CLIENT EMAIL TEMPLATE ---
const getClientEmailTemplate = (booking) => {
    return `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Open Sans', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  .header { background-color: #3C3B6E; padding: 30px; text-align: center; }
  .header h1 { color: #ffffff; margin: 0; font-family: 'Impact', 'Anton', Arial, sans-serif; text-transform: uppercase; letter-spacing: 2px; font-size: 28px; }
  .subheader { background-color: #B22234; color: white; text-align: center; padding: 10px; font-weight: bold; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; }
  .content { padding: 40px 30px; color: #333333; }
  .greeting { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #3C3B6E; }
  .message { line-height: 1.6; margin-bottom: 30px; color: #555; }
  .details-box { background-color: #fff9db; border: 2px solid #FFD700; border-radius: 8px; padding: 25px; margin-bottom: 30px; }
  .footer { background-color: #333; color: #999; text-align: center; padding: 20px; font-size: 12px; }
  .btn { display: inline-block; background-color: #B22234; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 10px; text-transform: uppercase; letter-spacing: 1px; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>AMERICAN PIZZA MARIO</h1>
  </div>
  <div class="subheader">¡RESERVA CONFIRMADA!</div>
  <div class="content">
    <p class="greeting">Hola ${booking.name},</p>
    <p class="message">¡Gracias por reservar con nosotros! Tu reserva en nuestro restaurante de <strong>Chiva</strong> está confirmada.</p>
    
    <div class="details-box">
      <p><strong>FECHA:</strong> ${booking.date}</p>
      <p><strong>HORA:</strong> ${booking.time}</p>
      <p><strong>PERSONAS:</strong> ${booking.pax}</p>
      <p><strong>MESAS ASIGNADAS:</strong> ${booking.tablesConsumed}</p>
    </div>

    <p style="text-align: center;">
      <a href="https://www.google.com/maps/dir/?api=1&destination=Calle+Paseo+Argentina+22+b+46370+Chiva+Valencia" class="btn" style="color: white;">📍 CÓMO LLEGAR</a>
    </p>
  </div>
  <div class="footer">
    <p>American Pizza Mario - Chiva</p>
    <p>Calle Paseo Argentina, 22 b, 46370 Chiva, Valencia</p>
  </div>
</div>
</body>
</html>
    `;
};

// --- HELPER: OWNER EMAIL TEMPLATE ---
const getOwnerEmailTemplate = (booking) => {
    return `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Open Sans', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-top: 5px solid #3C3B6E; }
  .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #eee; }
  .header h1 { color: #3C3B6E; margin: 0; font-size: 22px; text-transform: uppercase; }
  .content { padding: 30px; color: #333333; }
  .booking-card { background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 0; overflow: hidden; }
  .card-header { background-color: #B22234; color: white; padding: 15px; font-weight: bold; text-align: center; text-transform: uppercase; }
  .card-body { padding: 20px; }
  .row { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: 10px 0; }
  .row:last-child { border-bottom: none; }
  .label { color: #666; font-size: 14px; }
  .value { color: #000; font-weight: bold; font-size: 16px; }
  .footer { background-color: #eee; color: #777; text-align: center; padding: 15px; font-size: 11px; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Nueva Reserva Recibida</h1>
  </div>
  <div class="content">
    <div class="booking-card">
      <div class="card-header">Detalles de la Reserva</div>
      <div class="card-body">
        <div class="row"><span class="label">Cliente:</span> <span class="value">${booking.name}</span></div>
        <div class="row"><span class="label">Teléfono:</span> <span class="value">${booking.phone || 'No indicado'}</span></div>
        <div class="row"><span class="label">Email:</span> <span class="value">${booking.email || 'No indicado'}</span></div>
        <div class="row"><span class="label">Fecha:</span> <span class="value">${booking.date}</span></div>
        <div class="row"><span class="label">Hora:</span> <span class="value">${booking.time}</span></div>
        <div class="row"><span class="label">Personas:</span> <span class="value">${booking.pax}</span></div>
        <div class="row"><span class="label">Mesas Consumidas:</span> <span class="value" style="color: #B22234;">${booking.tablesConsumed}</span></div>
      </div>
    </div>
  </div>
  <div class="footer">
    <p>Sistema de Reservas - American Pizza Mario</p>
    <p>Aforo gestionado por Sillas</p>
  </div>
</div>
</body>
</html>
    `;
};

module.exports = async (req, res) => {
    // Enable CORS for Vercel
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Sanitize inputs
        const sanitize = (str) => String(str || '').replace(/[<>"'`]/g, '').trim().slice(0, 500);
        const sanitizePhone = (phone) => String(phone || '').replace(/[^0-9+\s()-]/g, '').slice(0, 20);
        const sanitizeEmail = (email) => {
            const e = String(email || '').trim().toLowerCase().slice(0, 100);
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
        };

        const rawBooking = req.body;
        const newBooking = {
            name: sanitize(rawBooking.name),
            phone: sanitizePhone(rawBooking.phone),
            email: sanitizeEmail(rawBooking.email),
            date: rawBooking.date,
            time: rawBooking.time,
            pax: parseInt(rawBooking.pax) || 2,
            createdByAdmin: rawBooking.createdByAdmin || false
        };

        // --- 0. GET CONFIG (Total Chairs) ---
        let totalChairs = 100; // Default
        const { data: configData } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', CONFIG_ID)
            .single();

        if (configData) {
            totalChairs = configData.pax; // We use 'pax' field to store totalChairs
        }

        // --- 1. CAPACITY LOGIC ---
        // Fetch all bookings for this slot to sum occupancy
        const { data: slotBookings, error: fetchError } = await supabase
            .from('bookings')
            .select('*')
            .eq('date', newBooking.date)
            // .eq('time', newBooking.time) Removed for Daily Total Mode
            .neq('id', CONFIG_ID);

        if (fetchError) throw fetchError;

        const occupiedChairs = slotBookings ? slotBookings.reduce((sum, b) => sum + (parseInt(b.pax) || 0), 0) : 0;

        // Check availability
        if (occupiedChairs + newBooking.pax > totalChairs) {
            const seatsLeft = totalChairs - occupiedChairs;
            return res.status(409).json({
                success: false,
                message: `Aforo diario completo. Quedan ${seatsLeft > 0 ? seatsLeft : 0} libres.`
            });
        }

        const tablesConsumed = calculateTablesNeeded(newBooking.pax);

        // --- 2. INSERT INTO SUPABASE ---
        // Repurposing 'tableId' to store 'tablesConsumed'
        const dbBooking = {
            name: newBooking.name,
            phone: newBooking.phone,
            email: newBooking.email,
            date: newBooking.date,
            time: newBooking.time,
            pax: newBooking.pax,
            tableId: tablesConsumed // storing count here
        };

        const { data, error } = await supabase
            .from('bookings')
            .insert([dbBooking])
            .select();

        if (error) throw error;

        const savedBooking = data[0];
        // Inject property for email function context (it expects tablesConsumed)
        savedBooking.tablesConsumed = tablesConsumed;

        // --- 3. SEND EMAIL & TELEGRAM ---
        try {
            // Email to Owner
            if (!newBooking.createdByAdmin) {
                await transporter.sendMail({
                    from: '"Sistema APM" <ayubbenkrara82@gmail.com>',
                    to: OWNER_EMAIL,
                    subject: `Nueva Reserva (${savedBooking.pax} pax - ${tablesConsumed} mesas)`,
                    html: getOwnerEmailTemplate(savedBooking)
                });
            }

            // Email to Client
            if (savedBooking.email && savedBooking.email.includes('@')) {
                await transporter.sendMail({
                    from: '"American Pizza Mario" <ayubbenkrara82@gmail.com>',
                    to: savedBooking.email,
                    subject: 'Confirmación de Reserva - American Pizza Mario',
                    html: getClientEmailTemplate(savedBooking)
                });
            }

            // Telegram Notification
                        if (!newBooking.createdByAdmin) { await sendTelegramNotification(savedBooking, tablesConsumed); }

        } catch (postSaveError) {
            console.error("Error sending notifications:", postSaveError);
        }

        res.status(200).json({ success: true, message: 'Reserva guardada', booking: savedBooking });

    } catch (error) {
        console.error('Error processing reserve:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

