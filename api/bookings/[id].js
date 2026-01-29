import { supabase } from '../lib/supabaseClient';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id } = req.query; // matches api/bookings?id=... or we can use dynamic route

    if (!id) {
        return res.status(400).json({ message: 'Missing ID' });
    }

    try {
        const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ error: error.message });
    }
}
