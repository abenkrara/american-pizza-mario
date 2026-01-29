import { supabase } from '../lib/supabaseClient';
import nodemailer from 'nodemailer';

const OWNER_EMAIL = 'ayubbenkrara82@gmail.com';
const GMAIL_USER = 'ayubbenkrara82@gmail.com';
// Use Env var or fallback to the one found in original server.js (NOT RECOMMENDED for production repo, but kept for migration continuity if env not set)
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD || 'uxlp vxek tldm sttj'; 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS
    }
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const newBooking = req.body;
        console.log('Received booking request:', newBooking);

        // --- 1. TABLE ASSIGNMENT LOGIC ---
        const { data: slotBookings } = await supabase
            .from('bookings')
            .select('table_id')
            .eq('date', newBooking.date)
            .eq('time', newBooking.time);

        const occupiedTables = slotBookings ? slotBookings.map(b => b.table_id) : [];
        let assignedTable = null;

        if (newBooking.forceTableId) {
            const requestedId = parseInt(newBooking.forceTableId);
            if (occupiedTables.includes(requestedId)) {
                return res.status(409).json({ success: false, message: \MESA \ ocupada.\ });
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
            table_id: assignedTable
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
                await transporter.sendMail({
                    from: '"American Pizza Mario" <ayubbenkrara82@gmail.com>',
                    to: savedBooking.email,
                    subject: 'Confirmación de Reserva 🍕',
                    html: \
                        <h1>¡Reserva Confirmada! 🍕</h1>
                        <p>Hola <strong>\</strong>, te esperamos en American Pizza Mario.</p>
                        <ul>
                            <li>Fecha: \</li>
                            <li>Hora: \</li>
                            <li>Personas: \</li>
                            <li>Mesa: \</li>
                        </ul>
                    \
                });

                // Email to Owner
                await transporter.sendMail({
                    from: '"Sistema APM" <ayubbenkrara82@gmail.com>',
                    to: OWNER_EMAIL,
                    subject: \Nueva Reserva (Mesa \)\,
                    html: \
                        <h2>Nueva Reserva Confirmada</h2>
                        <p><strong>Mesa:</strong> \</p>
                        <p><strong>Cliente:</strong> \</p>
                        <p><strong>Pax:</strong> \</p>
                        <p><strong>Fecha:</strong> \ a las \</p>
                    \
                });
                console.log("Emails sent successfully");
            } catch (emailError) {
                console.error("Error sending emails:", emailError);
                // Don't fail the request if email fails, just log it.
            }
        }

        res.status(200).json({ success: true, message: 'Reserva guardada', booking: savedBooking });

    } catch (error) {
        console.error('Error processing reserve:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}
