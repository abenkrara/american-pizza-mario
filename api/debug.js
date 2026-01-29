export default async function handler(req, res) {
    // 1. Check Environment Variables (Safe check, no dependencies)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const results = {
        status: "alive", 
        check_time: new Date().toISOString(),
        env: {
            url_set: !!url,
            key_set: !!key,
            url_preview: url ? url.substring(0, 10) + '...' : null
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

    // 2. Dynamic Import of Supabase (Prevents crash if missing)
    let createClient;
    try {
        const supabaseModule = await import('@supabase/supabase-js');
        createClient = supabaseModule.createClient;
        results.modules.supabase_loaded = true;
    } catch (e) {
        results.modules.error = e.message;
        // Return immediately if module is missing, but with 200 OK so we see the error
        return res.status(200).json(results); 
    }

    // 3. Connection Test
    if (url && key && createClient) {
        try {
            const supabase = createClient(url, key);
            const { data, error } = await supabase.from('bookings').select('count', { count: 'exact', head: true });
            
            if (error) throw error;
            results.connection.success = true;
        } catch (e) {
            results.connection.error = e.message;
        }
    } else {
        results.connection.error = "Skipped connections test: Missing Env Vars";
    }

    res.status(200).json(results);
}
