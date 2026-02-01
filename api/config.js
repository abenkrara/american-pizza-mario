const { supabase } = require('../lib/supabaseClient');

// UUID constant for configuration row (Supabase requires UUID type for ID)
const CONFIG_ID = '00000000-0000-0000-0000-000000000001';

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

    try {
        if (req.method === 'GET') {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('id', CONFIG_ID)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is 'Row not found'
                // If ID format error or other, log it but default to 50
                console.error("Config fetch error:", error);
            }

            // Default config if not found
            // We reuse 'pax' column to store totalChairs
            const totalChairs = data ? data.pax : 50;
            return res.status(200).json({ success: true, totalChairs });
        }

        if (req.method === 'POST') {
            const { totalChairs } = req.body;

            if (!totalChairs || isNaN(totalChairs)) {
                return res.status(400).json({ success: false, message: 'Invalid totalChairs value' });
            }

            // Store totalChairs in the 'pax' column
            const { data, error } = await supabase
                .from('bookings')
                .upsert({
                    id: CONFIG_ID,
                    name: 'CONFIG',
                    pax: parseInt(totalChairs),
                    date: '2099-01-01', // Dummy date so it doesn't interfere
                    time: '00:00',      // Dummy time
                    tableId: 0          // Dummy table
                })
                .select();

            if (error) throw error;

            return res.status(200).json({ success: true, message: 'Config updated', totalChairs: parseInt(totalChairs) });
        }

        return res.status(405).json({ message: 'Method not allowed' });

    } catch (error) {
        console.error('Config API Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
