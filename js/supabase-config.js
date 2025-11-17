// Supabase Configuration - Enhanced Version
const SUPABASE_URL = 'https://bdayrrfcvpxnxxlpyzes.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkYXlycmZjdnB4bnh4bHB5emVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNDc1NzYsImV4cCI6MjA3ODkyMzU3Nn0.jRCEWh5UEp1ACwyKKWpPRlSUVg6BbxPmtWSU70K223w';

console.log('🔧 Initializing Supabase with URL:', SUPABASE_URL);

// Initialize Supabase client dengan error handling
let supabase;

try {
    if (typeof window !== 'undefined' && window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            },
            realtime: {
                params: {
                    eventsPerSecond: 10
                }
            }
        });
        console.log('✅ Supabase initialized successfully with enhanced config');
    } else {
        console.error('❌ Supabase SDK not found in window object');
        throw new Error('Supabase SDK not loaded');
    }
} catch (error) {
    console.error('💥 Failed to initialize Supabase:', error);
    
    // Fallback: Create simple supabase object
    supabase = {
        from: () => ({
            select: () => Promise.resolve({ data: null, error: new Error('Supabase not initialized') }),
            insert: () => Promise.resolve({ data: null, error: new Error('Supabase not initialized') }),
            update: () => Promise.resolve({ data: null, error: new Error('Supabase not initialized') }),
            delete: () => Promise.resolve({ data: null, error: new Error('Supabase not initialized') })
        })
    };
}

// Enhanced connection test dengan retry mechanism
async function testSupabaseConnection(maxRetries = 3) {
    let retries = 0;
    
    while (retries < maxRetries) {
        try {
            console.log(`🔗 Testing Supabase connection (attempt ${retries + 1}/${maxRetries})...`);
            
            const { data, error } = await supabase
                .from('guru')
                .select('count')
                .limit(1);

            if (error) {
                console.error(`❌ Supabase connection attempt ${retries + 1} failed:`, error);
                retries++;
                
                if (retries < maxRetries) {
                    console.log(`⏳ Retrying in 2 seconds...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                } else {
                    console.error('💥 All connection attempts failed');
                    showConnectionError();
                    return false;
                }
            } else {
                console.log('✅ Supabase connected successfully');
                showConnectionSuccess();
                return true;
            }
        } catch (err) {
            console.error(`❌ Connection test error (attempt ${retries + 1}):`, err);
            retries++;
            
            if (retries < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
    
    return false;
}

// Function untuk menampilkan error connection
function showConnectionError() {
    console.error('🚨 CRITICAL: Cannot connect to Supabase database');
    
    // Hanya tampilkan error di console untuk avoid disturbing users
    // Dalam production, bisa ditambahkan modal error atau fallback mechanism
}

function showConnectionSuccess() {
    console.log('🎉 Supabase connection established and ready');
}

// Enhanced query functions dengan error handling
async function safeSupabaseQuery(queryFunction, operationName = 'Unknown operation') {
    try {
        console.log(`📊 Executing: ${operationName}`);
        const result = await queryFunction();
        
        if (result.error) {
            console.error(`❌ ${operationName} failed:`, result.error);
            return {
                success: false,
                error: result.error,
                data: null
            };
        }
        
        console.log(`✅ ${operationName} successful, data count:`, result.data ? result.data.length : 0);
        return {
            success: true,
            data: result.data,
            error: null
        };
        
    } catch (error) {
        console.error(`💥 ${operationName} exception:`, error);
        return {
            success: false,
            error: error,
            data: null
        };
    }
}

// Utility functions untuk common operations
const supabaseUtils = {
    // Query single table
    async selectAll(table) {
        return await safeSupabaseQuery(
            () => supabase.from(table).select('*'),
            `SELECT ALL FROM ${table}`
        );
    },
    
    // Query dengan filter
    async selectWhere(table, column, value) {
        return await safeSupabaseQuery(
            () => supabase.from(table).select('*').eq(column, value),
            `SELECT FROM ${table} WHERE ${column} = ${value}`
        );
    },
    
    // Insert data
    async insertData(table, data) {
        return await safeSupabaseQuery(
            () => supabase.from(table).insert([data]),
            `INSERT INTO ${table}`
        );
    },
    
    // Update data
    async updateData(table, updates, column, value) {
        return await safeSupabaseQuery(
            () => supabase.from(table).update(updates).eq(column, value),
            `UPDATE ${table} WHERE ${column} = ${value}`
        );
    },
    
    // Delete data
    async deleteData(table, column, value) {
        return await safeSupabaseQuery(
            () => supabase.from(table).delete().eq(column, value),
            `DELETE FROM ${table} WHERE ${column} = ${value}`
        );
    },
    
    // Check if data exists
    async checkExists(table, column, value) {
        const result = await safeSupabaseQuery(
            () => supabase.from(table).select('id').eq(column, value).limit(1),
            `CHECK EXISTS IN ${table} WHERE ${column} = ${value}`
        );
        
        return result.success && result.data && result.data.length > 0;
    }
};

// Export untuk penggunaan di module lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { supabase, supabaseUtils, testSupabaseConnection };
}

// Global availability
window.supabaseClient = supabase;
window.supabaseUtils = supabaseUtils;

// Test connection on load dengan delay
window.addEventListener('load', () => {
    console.log('🚀 Supabase config loaded, testing connection...');
    setTimeout(() => {
        testSupabaseConnection().then(success => {
            if (success) {
                console.log('🎊 Supabase ready for use!');
                
                // Dispatch custom event untuk notify other scripts
                window.dispatchEvent(new CustomEvent('supabaseReady', {
                    detail: { timestamp: new Date() }
                }));
            } else {
                console.error('💀 Supabase failed to initialize');
                
                // Dispatch error event
                window.dispatchEvent(new CustomEvent('supabaseError', {
                    detail: { error: 'Connection failed' }
                }));
            }
        });
    }, 1000);
});

// Connection status monitoring
let connectionStatus = 'unknown';

// Periodic health check (setiap 5 menit)
setInterval(() => {
    testSupabaseConnection(1).then(success => {
        connectionStatus = success ? 'connected' : 'disconnected';
        console.log(`❤️ Supabase health check: ${connectionStatus}`);
    });
}, 300000); // 5 menit

// Function untuk mendapatkan status koneksi
function getConnectionStatus() {
    return connectionStatus;
}

// Function untuk mengecek apakah Supabase ready
function isSupabaseReady() {
    return connectionStatus === 'connected';
}

console.log('🔧 Supabase configuration completed');