import { supabase } from '../lib/supabaseClient';

export default async function handler(req, res) {
    const envCheck = {
        URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'MISSING',
        ANON: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'OK' : 'MISSING',
        SERVICE: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING'
    };

    let dbStatus = 'UNKNOWN';
    let dbError = null;

    try {
        const { data, error } = await supabase.from('bookings').select('count', { count: 'exact', head: true });
        if (error) throw error;
        dbStatus = 'CONNECTED';
    } catch (e) {
        dbStatus = 'FAILED';
        dbError = e.message;
    }

    res.status(200).json({
        setup: 'American Pizza Mario API',
        timestamp: new Date().toISOString(),
        env: envCheck,
        database: {
            status: dbStatus,
            error: dbError
        }
    });
}
