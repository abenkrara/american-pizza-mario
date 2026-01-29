import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const results = {
        check_time: new Date().toISOString(),
        env: {
            url_exists: !!url,
            key_exists: !!key,
            // Show first 5 chars for verification (safe-ish)
            url_prefix: url ? url.substring(0, 15) + '...' : 'MISSING',
            key_prefix: key ? key.substring(0, 5) + '...' : 'MISSING'
        },
        connection: {
            success: false,
            error: null
        }
    };

    if (url && key) {
        try {
            const supabase = createClient(url, key);
            // Try to fetch 0 rows just to test connection
            const { data, error } = await supabase.from('bookings').select('*').limit(1);
            
            if (error) throw error;
            
            results.connection.success = true;
            results.connection.data_sample = data;
        } catch (e) {
            results.connection.error = e.message;
            results.connection.details = JSON.stringify(e);
        }
    } else {
        results.connection.error = "Cannot test connection: Missing keys";
    }

    res.status(200).json(results);
}
