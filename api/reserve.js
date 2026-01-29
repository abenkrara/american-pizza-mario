const { supabase } = require('../lib/supabaseClient');
const nodemailer = require('nodemailer');

const OWNER_EMAIL = 'ayubbenkrara82@gmail.com';
const GMAIL_USER = 'ayubbenkrara82@gmail.com';
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD || 'uxlp vxek tldm sttj';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS
    }
});

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const newBooking = req.body;
        console.log('Received booking request:', newBooking);

        // --- 1. TABLE ASSIGNMENT LOGIC ---
        const { data: slotBookings } = await supabase
            .from('bookings')
            .select('*')
            .eq('date', newBooking.date)
            .eq('time', newBooking.time);

        const occupiedTables = slotBookings ? slotBookings.map(b => b.tableId || b.table_id) : [];
        let assignedTable = null;

        if (newBooking.forceTableId) {
            const requestedId = parseInt(newBooking.forceTableId);
            if (occupiedTables.includes(requestedId)) {
                return res.status(409).json({ success: false, message: 'MESA ocupada.' });
            }
            assignedTable = requestedId;
        } else {
            for (let i = 1; i <= 6; i++) {
                if (!occupiedTables.includes(i)) {
                    assignedTable = i;
                    break;
                }
            }
        }

        if (!assignedTable) {
            return res.status(200).json({ success: false, message: 'No hay mesas libres.' });
        }

        // --- 2. INSERT INTO SUPABASE ---
        const dbBooking = {
            name: newBooking.name,
            phone: newBooking.phone,
            email: newBooking.email,
            date: newBooking.date,
            time: newBooking.time,
            pax: parseInt(newBooking.pax || 2),
            tableId: assignedTable
        };

        const { data, error } = await supabase
            .from('bookings')
            .insert([dbBooking])
            .select();

        if (error) throw error;

        const savedBooking = data[0];

        // --- 3. SEND EMAILS ---
        if (savedBooking.email && savedBooking.email.includes('@')) {
             try {
                // Email to Client
                const clientHtml = '<h1>Reserva Confirmada</h1><p>Hola ' + savedBooking.name + ', mesa ' + savedBooking.tableId + '</p>';
                await transporter.sendMail({
                    from: '"American Pizza Mario" <ayubbenkrara82@gmail.com>',
                    to: savedBooking.email,
                    subject: 'Confirmación de Reserva',
                    html: clientHtml
                });

                // Email to Owner
                const ownerHtml = '<h2>Nueva Reserva</h2><p>Mesa: ' + savedBooking.tableId + '</p><p>Cliente: ' + savedBooking.name + '</p>';
                await transporter.sendMail({
                    from: '"Sistema APM" <ayubbenkrara82@gmail.com>',
                    to: OWNER_EMAIL,
                    subject: 'Nueva Reserva (Mesa ' + savedBooking.tableId + ')',
                    html: ownerHtml
                });
            } catch (emailError) {
                console.error("Error sending emails:", emailError);
            }
        }

        res.status(200).json({ success: true, message: 'Reserva guardada', booking: savedBooking });

    } catch (error) {
        console.error('Error processing reserve:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
