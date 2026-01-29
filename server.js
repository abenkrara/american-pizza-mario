const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const PORT = 8080;
const DB_FILE = './bookings.json';

// --- CONFIGURACIÓN DE CORREO ---
const EMAIL_CONFIG = {
    service: 'gmail',
    auth: {
        user: 'ayubbenkrara82@gmail.com',
        pass: 'uxlp vxek tldm sttj'
    }
};

const OWNER_EMAIL = 'ayubbenkrara82@gmail.com';

// --- DATABASE FUNCTIONS ---
function loadBookings() {
    try {
        if (!fs.existsSync(DB_FILE)) return [];
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.error("Error loading DB:", e);
        return [];
    }
}

function saveBookings(bookings) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(bookings, null, 2));
    } catch (e) {
        console.error("Error saving DB:", e);
    }
}

// --- SERVIDOR ---
http.createServer(async function (request, response) {
    console.log(`${request.method} ${request.url}`);

    // CORS Headers
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        response.writeHead(204);
        response.end();
        return;
    }

    // API: OBTENER RESERVAS (GET)
    if (request.url === '/api/bookings' && request.method === 'GET') {
        const bookings = loadBookings();
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(bookings));
        return;
    }

    // API: BORRAR RESERVA (DELETE)
    // Matches /api/bookings/123456789
    if (request.url.startsWith('/api/bookings/') && request.method === 'DELETE') {
        const id = request.url.split('/').pop();
        let bookings = loadBookings();
        const initialLength = bookings.length;
        bookings = bookings.filter(b => b.id !== id);

        if (bookings.length !== initialLength) {
            saveBookings(bookings);
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: true }));
        } else {
            response.writeHead(404, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ success: false, message: 'Reserva no encontrada' }));
        }
        return;
    }

    // API: NUEVA RESERVA / BLOQUEO (POST)
    if (request.url === '/api/reserve' && request.method === 'POST') {
        let body = '';
        request.on('data', chunk => { body += chunk.toString(); });
        request.on('end', async () => {
            try {
                const newBooking = JSON.parse(body);
                const bookings = loadBookings();

                // --- Lógica de Mesas (1 al 6) ---
                const MAX_TABLES = 6;
                // Filtrar reservas que coinciden en FECHA y HORA
                const slotBookings = bookings.filter(b => b.date === newBooking.date && b.time === newBooking.time);

                // Mesas ya ocupadas
                const occupiedTables = slotBookings.map(b => b.tableId).filter(id => id);

                let assignedTable = null;

                // 1. Caso: Admin fuerza una mesa (para bloquear o walk-in específico)
                if (newBooking.forceTableId) {
                    const requestedId = parseInt(newBooking.forceTableId);
                    if (occupiedTables.includes(requestedId)) {
                        response.writeHead(409, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify({ success: false, message: `La MESA ${requestedId} ya está ocupada.` }));
                        return;
                    }
                    assignedTable = requestedId;
                }
                // 2. Caso: Reserva normal (asignar primera libre)
                else {
                    for (let i = 1; i <= MAX_TABLES; i++) {
                        if (!occupiedTables.includes(i)) {
                            assignedTable = i;
                            break;
                        }
                    }
                }

                if (!assignedTable) {
                    response.writeHead(200, { 'Content-Type': 'application/json' }); // 200 OK but success: false
                    response.end(JSON.stringify({ success: false, message: 'Lo sentimos, no quedan mesas disponibles para esa hora.' }));
                    return;
                }

                // Crear Objeto Final
                const finalBooking = {
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                    name: newBooking.name,
                    phone: newBooking.phone,
                    email: newBooking.email,
                    date: newBooking.date,
                    time: newBooking.time,
                    pax: newBooking.pax,
                    tableId: assignedTable
                };

                bookings.push(finalBooking);
                saveBookings(bookings);

                // Enviar Email solo si hay email válido
                if (finalBooking.email && finalBooking.email.includes('@')) {
                    await handleReservationEmail(finalBooking);
                }

                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ success: true, message: 'Reserva guardada', booking: finalBooking }));

            } catch (error) {
                console.error('Error procesando reserva:', error);
                response.writeHead(500, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ success: false, message: 'Error interno del servidor' }));
            }
        });
        return;
    }

    // Static Files Handling
    let filePath = '.' + request.url;
    if (filePath == './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const MIME_TYPES = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
    };
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, function (error, content) {
        if (error) {
            if (error.code == 'ENOENT') {
                response.writeHead(404);
                response.end('404 Not Found');
            }
            else {
                response.writeHead(500);
                response.end('Server Error: ' + error.code);
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });

}).listen(PORT, '0.0.0.0');

console.log(`Server running at http://192.168.0.3:${PORT}/`);


// --- EMAIL FUNCTION ---
async function handleReservationEmail(booking) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: EMAIL_CONFIG.auth
    });

    const clientHtml = `
        <h1>¡Reserva Confirmada! 🍕</h1>
        <p>Hola <strong>${booking.name}</strong>, te esperamos en American Pizza Mario.</p>
        <ul>
            <li>Fecha: ${booking.date}</li>
            <li>Hora: ${booking.time}</li>
            <li>Personas: ${booking.pax}</li>
            <li>Mesa: ${booking.tableId}</li>
        </ul>
        <a href="https://maps.app.goo.gl/example">Ver Ubicación</a>
    `;

    const ownerHtml = `
        <h2>Nueva Reserva</h2>
        <p>Mesa: ${booking.tableId}</p>
        <p>Cliente: ${booking.name}</p>
        <p>Fecha: ${booking.date} a las ${booking.time}</p>
    `;

    try {
        await transporter.sendMail({
            from: '"American Pizza Mario" <ayubbenkrara82@gmail.com>',
            to: booking.email,
            subject: 'Confirmación de Reserva 🍕',
            html: clientHtml
        });

        await transporter.sendMail({
            from: '"Sistema Limitless" <ayubbenkrara82@gmail.com>',
            to: OWNER_EMAIL,
            subject: `Nueva Reserva (Mesa ${booking.tableId})`,
            html: ownerHtml
        });
    } catch (e) {
        console.error("Error enviando email:", e);
    }
}
