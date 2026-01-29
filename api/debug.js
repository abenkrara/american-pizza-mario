module.exports = async (req, res) => {
    // 1. Check Environment Variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const results = {
        status: "alive", 
        check_time: new Date().toISOString(),
        env: {
            url_set: !!url,
            key_set: !!key,
            url_prefix: url ? url.substring(0, 8) + '...' : 'MISSING'
        },
        modules: {
            supabase_loaded: false,
            error: null
        },
        connection: {
            success: false,
            error: null
        }
    };

    // 2. Try loading Supabase (try/catch for missing deps)
    let createClient;
    try {
        const supabaseModule = require('@supabase/supabase-js');
        createClient = supabaseModule.createClient;
        results.modules.supabase_loaded = true;
    } catch (e) {
        results.modules.error = e.message;
        // If module missing, return 200 with error info
        return res.status(200).json(results); 
    }

    // 3. Connection Test
    if (url && key && createClient) {
        try {
            const supabase = createClient(url, key);
            // Lightweight HEAD request
            const { data, error } = await supabase.from('bookings').select('count', { count: 'exact', head: true });
            
            if (error) throw error;
            results.connection.success = true;
        } catch (e) {
            results.connection.error = e.message;
        }
    } else {
        results.connection.error = "Skipped connection: Missing Env Vars";
    }

    res.status(200).json(results);
};
