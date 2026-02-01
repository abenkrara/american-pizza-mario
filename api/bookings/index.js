const { supabase } = require('../../lib/supabaseClient');

module.exports = async (req, res) => {
    // Enable CORS
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

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        let query = supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        let data, error;

        // Filter by date if provided
        if (req.query.date) {
            ({ data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('date', req.query.date)
                .order('created_at', { ascending: false }));
        } else {
            // No date filter -> full history
            ({ data, error } = await supabase
                .from('bookings')
                .select('*')
                .order('created_at', { ascending: false }));
        }

        if (error) throw error;

        // Map data to ensure tablesConsumed is present
        // Stored in DB as 'tableId' (or table_id depending on DB convention, checking both)
        const mappedData = (data || []).map(b => ({
            ...b,
            tablesConsumed: b.tableId || b.table_id || 1, // Default to 1 if missing
            // Ensure pax is integer
            pax: parseInt(b.pax) || 0
        }));

        res.status(200).json(mappedData);

    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: error.message });
    }
};
