const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 8080;

// UUID constant for configuration row
const CONFIG_ID = '00000000-0000-0000-0000-000000000001';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '.'))); // Serve static files from root

// Database File
const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');

// Helper to read bookings
function readBookings() {
    if (!fs.existsSync(BOOKINGS_FILE)) {
        return [];
    }
    const data = fs.readFileSync(BOOKINGS_FILE, 'utf8');
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error("Error reading bookings.json:", e);
        return [];
    }
}

// Helper to write bookings
function writeBookings(bookings) {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

// --- TERRACE BUSINESS LOGIC ---

// Calculate tables needed based on pax
function calculateTablesNeeded(pax) {
    if (pax <= 4) return 1;
    if (pax <= 6) return 2;
    if (pax <= 8) return 3;

    // For > 8: 1 table for first 4, then +1 for every 2 additional people
    // Logic: 1 + ceil((pax - 4) / 2)
    return 1 + Math.ceil((pax - 4) / 2);
}

// EMAIL CONFIGURATION
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ayubbenkrara82@gmail.com',
        pass: 'uxlp vxek tldm sttj'
    }
});

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

// API Routes

// GET /api/bookings
app.get('/api/bookings', (req, res) => {
    let bookings = readBookings();

    // Filter out config booking info
    bookings = bookings.filter(b => b.id !== CONFIG_ID);

    // Date Filter logic (Optimization)
    if (req.query.date) {
        bookings = bookings.filter(b => b.date === req.query.date);
    }

    res.json(bookings);
});

// GET /api/config
app.get('/api/config', (req, res) => {
    const bookings = readBookings();
    const config = bookings.find(b => b.id === CONFIG_ID);

    // Default totalChairs to 50 if not set
    const totalChairs = config ? (config.totalChairs || 50) : 50;

    res.json({ success: true, totalChairs });
});

// POST /api/config
app.post('/api/config', (req, res) => {
    const { totalChairs } = req.body;
    if (!totalChairs || isNaN(totalChairs)) {
        return res.status(400).json({ success: false, message: 'Invalid totalChairs' });
    }

    let bookings = readBookings();
    const configIndex = bookings.findIndex(b => b.id === CONFIG_ID);

    const newConfig = {
        id: CONFIG_ID,
        name: 'CONFIG',
        totalChairs: parseInt(totalChairs),
        date: '2099-01-01',
        time: '00:00',
        tableId: 0
    };

    if (configIndex >= 0) {
        // Preserve other config fields if we add more in future, but for now just overwrite
        bookings[configIndex] = { ...bookings[configIndex], ...newConfig };
    } else {
        bookings.push(newConfig);
    }

    writeBookings(bookings);
    res.json({ success: true, message: 'Config updated', totalChairs: parseInt(totalChairs) });
});

// POST /api/reserve
app.post('/api/reserve', async (req, res) => {
    try {
        const newBooking = req.body;
        const bookings = readBookings();

        // Basic validation
        if (!newBooking.name || !newBooking.date || !newBooking.time) {
            return res.status(400).json({ success: false, message: 'Faltan datos requeridos' });
        }

        const requestedPax = parseInt(newBooking.pax || 2);

        // --- 0. GET CONFIG (INVENTORY) ---
        const config = bookings.find(b => b.id === CONFIG_ID);
        const totalChairs = config ? (config.totalChairs || 50) : 50;

        // --- 1. CALCULATE AVAILABILITY ---
        // Get all bookings for this specific slot (Date + Time)
        // Filter out config row
        const slotBookings = bookings.filter(b =>
            b.date === newBooking.date &&
            b.time === newBooking.time &&
            b.id !== CONFIG_ID
        );

        // Sum currently occupied chairs
        const occupiedChairs = slotBookings.reduce((sum, b) => sum + (parseInt(b.pax) || 0), 0);

        // Check if there is enough space
        if (occupiedChairs + requestedPax > totalChairs) {
            const seatsLeft = totalChairs - occupiedChairs;
            return res.status(409).json({
                success: false,
                message: `No hay suficientes sillas. Quedan ${seatsLeft > 0 ? seatsLeft : 0} libres.`
            });
        }

        // --- 2. CALCULATE TABLES NEEDED ---
        const tablesNeeded = calculateTablesNeeded(requestedPax);

        // Create booking object
        const booking = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            ...newBooking,
            pax: requestedPax,
            tablesConsumed: tablesNeeded,
            createdByAdmin: newBooking.createdByAdmin || false
        };

        // Save
        bookings.push(booking);
        writeBookings(bookings);

        // Send Email
        try {
            // Owner Email (ONLY IF NOT CREATED BY ADMIN)
            if (!booking.createdByAdmin) {
                await transporter.sendMail({
                    from: '"Sistema APM" <ayubbenkrara82@gmail.com>',
                    to: 'ayubbenkrara82@gmail.com',
                    subject: `Nueva Reserva (${booking.pax} pax - ${tablesNeeded} mesas)`,
                    html: getOwnerEmailTemplate(booking)
                });
                console.log("Owner email sent.");
            } else {
                console.log("Owner email skipped (admin booking).");
            }

            // Client Email (IF EXISTS)
            if (booking.email && booking.email.includes('@')) {
                await transporter.sendMail({
                    from: '"American Pizza Mario" <ayubbenkrara82@gmail.com>',
                    to: booking.email,
                    subject: 'Confirmación de Reserva - American Pizza Mario',
                    html: getClientEmailTemplate(booking)
                });
                console.log(`Client email sent for ${booking.email}`);
            }
        } catch (emailError) {
            console.error("Error sending email:", emailError);
        }

        console.log(`Booking confirmed for ${booking.name}: ${booking.pax} pax (${tablesNeeded} tables)`);

        res.json({ success: true, message: 'Reserva guardada', booking });

    } catch (error) {
        console.error('Error processing reserve:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE /api/bookings/:id
app.delete('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    let bookings = readBookings();
    const initialLength = bookings.length;
    bookings = bookings.filter(b => b.id !== id);

    if (bookings.length === initialLength) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    writeBookings(bookings);
    res.json({ success: true, message: 'Booking deleted' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin Panel: http://localhost:${PORT}/admin.html`);
});
