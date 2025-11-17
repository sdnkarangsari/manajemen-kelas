// Authentication functions dengan debug lengkap
async function login(username, password) {
    console.log('🔐 Attempting login for:', username);
    
    // Validasi input
    if (!username || !password) {
        console.log('❌ Username atau password kosong');
        return { 
            success: false, 
            message: 'Username dan password harus diisi' 
        };
    }

    try {
        // Step 1: Query data guru berdasarkan username
        console.log('📊 Querying user...');
        const { data: users, error } = await supabase
            .from('guru')
            .select('*')
            .eq('username', username)
            .limit(1);

        if (error) {
            console.error('❌ Error querying user:', error);
            return { 
                success: false, 
                message: 'Error database: ' + error.message 
            };
        }

        console.log('📋 User query result:', users);
        
        // Step 2: Cek apakah user ditemukan
        if (!users || users.length === 0) {
            console.log('❌ User tidak ditemukan:', username);
            
            // Debug: Tampilkan semua user yang ada
            const { data: allUsers } = await supabase
                .from('guru')
                .select('username, nama');
                
            console.log('👥 Available usernames:', allUsers?.map(u => u.username) || []);
            
            return { 
                success: false, 
                message: 'Username tidak ditemukan. User yang tersedia: ' + (allUsers?.map(u => u.username).join(', ') || 'tidak ada')
            };
        }

        const user = users[0];
        console.log('🔍 Found user:', user.nama);
        console.log('🔑 Password check - Input:', password, 'Database:', user.password);

        // Step 3: Verifikasi password
        if (user.password !== password) {
            console.log('❌ Password tidak cocok');
            return { 
                success: false, 
                message: 'Password salah' 
            };
        }

        console.log('✅ Login successful:', user.nama);
        
        // Step 4: Prepare user data untuk disimpan
        const userData = {
            id_guru: user.id_guru,
            username: user.username,
            nama: user.nama,
            role: user.role,
            kelas_dipegang: user.kelas_dipegang || null,
            mapel_dipegang: user.mapel_dipegang || null,
            created_at: user.created_at,
            updated_at: user.updated_at
        };
        
        console.log('💾 Storing user data:', userData);
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        
        return { 
            success: true, 
            user: userData,
            message: `Login berhasil! Selamat datang ${user.nama}`
        };
        
    } catch (error) {
        console.error('💥 Login error:', error);
        return { 
            success: false, 
            message: 'Terjadi kesalahan sistem: ' + error.message 
        };
    }
}

function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userData = localStorage.getItem('user');
    
    console.log('🔒 Auth check - Logged in:', isLoggedIn);
    console.log('👤 User data exists:', !!userData);
    
    if (!isLoggedIn || !userData) {
        console.log('🚫 Not authenticated - Redirecting to login');
        // Cek jika sudah di halaman login, jangan redirect
        if (!window.location.href.includes('index.html')) {
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
        }
        return null;
    }
    
    try {
        const user = JSON.parse(userData);
        console.log('✅ User authenticated:', user.nama, '- Role:', user.role);
        return user;
    } catch (e) {
        console.error('❌ Error parsing user data:', e);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        
        if (!window.location.href.includes('index.html')) {
            window.location.href = '../index.html';
        }
        return null;
    }
}

function getCurrentUser() {
    return checkAuth();
}

function isAuthenticated() {
    return localStorage.getItem('isLoggedIn') === 'true' && localStorage.getItem('user') !== null;
}

function getUserRole() {
    const user = checkAuth();
    return user ? user.role : null;
}

function getUserName() {
    const user = checkAuth();
    return user ? user.nama : 'Guest';
}

function logout() {
    console.log('🚪 Logging out...');
    
    const user = getCurrentUser();
    if (user) {
        console.log(`👋 Goodbye ${user.nama}`);
    }
    
    // Clear all auth data
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    
    // Redirect to login page
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 500);
}

// Auto-check auth on page load untuk protected pages
function initializeAuth() {
    console.log('🔐 Initializing authentication system...');
    
    // Cek jika di halaman protected (bukan index.html)
    const isLoginPage = window.location.href.includes('index.html');
    
    if (!isLoginPage) {
        console.log('🛡️ Protected page - Checking authentication...');
        const user = checkAuth();
        
        if (!user) {
            console.log('🚫 Access denied - Not authenticated');
            showNotification('⚠️ Silakan login terlebih dahulu', 'error', 3000);
            return null;
        }
        
        console.log('✅ Access granted for:', user.nama);
        return user;
    }
    
    return null;
}

// Function untuk menampilkan notifikasi (fallback jika tidak ada di page)
function showNotification(message, type = 'info', duration = 4000) {
    // Cek jika function showNotification sudah ada di global scope
    if (window.showNotification && typeof window.showNotification === 'function') {
        window.showNotification(message, type, duration);
        return;
    }
    
    // Fallback notification
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
    // Buat simple notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        cursor: pointer;
    `;
    
    // Set warna berdasarkan type
    const colors = {
        success: '#48bb78',
        error: '#e53e3e',
        warning: '#ed8936',
        info: '#4299e1'
    };
    
    notification.style.background = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove setelah duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, duration);
    
    // Click to close
    notification.addEventListener('click', () => {
        if (notification.parentNode) {
            notification.remove();
        }
    });
}

// Tambahkan CSS untuk animation jika belum ada
if (!document.getElementById('auth-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'auth-notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Initialize auth ketika file loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Auth.js loaded successfully');
    initializeAuth();
});