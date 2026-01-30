// app.js - Aplikasi utama
const SUPABASE_URL = 'https://bazqhalruuhykwdxljjq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhenFoYWxydXVoeWt3ZHhsampxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDEzOTcsImV4cCI6MjA4NTMxNzM5N30.dktfTq3uH2nZvknv4Ms7l7qn0RAa6eSbkeEeT4oeWRw';

// Inisialisasi Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State aplikasi
const AppState = {
    currentUser: null,
    currentPage: 'dashboard',
    schoolData: null
};

// Inisialisasi aplikasi
async function initApp() {
    // Cek user dari localStorage
    const savedUser = localStorage.getItem('school_user');
    if (savedUser) {
        AppState.currentUser = JSON.parse(savedUser);
    }
    
    // Load school identity
    try {
        const { data, error } = await supabase
            .from('school_identity')
            .select('*')
            .limit(1)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        AppState.schoolData = data || {};
    } catch (error) {
        console.error('Error loading school data:', error);
    }
    
    render();
}

// Render aplikasi
function render() {
    const app = document.getElementById('app');
    
    if (!AppState.currentUser) {
        app.innerHTML = renderLoginPage();
        attachLoginListeners();
    } else {
        app.innerHTML = renderMainLayout();
        loadPageContent();
    }
}

// Render login page
function renderLoginPage() {
    return `
        <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div class="w-full max-w-md">
                <div class="text-center mb-8">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl mb-4">
                        <i class="fas fa-school"></i>
                    </div>
                    <h1 class="text-3xl font-bold text-gray-800">Sistem Manajemen Sekolah</h1>
                    <p class="text-gray-600 mt-2">${AppState.schoolData?.school_name || 'SD Negeri'}</p>
                </div>
                
                <div class="card">
                    <form id="loginForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input type="email" 
                                   id="loginEmail" 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="admin@sd.id"
                                   required>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input type="password" 
                                   id="loginPassword" 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   placeholder="••••••••"
                                   required>
                        </div>
                        
                        <button type="submit" class="btn btn-primary w-full">
                            <i class="fas fa-sign-in-alt mr-2"></i>
                            Masuk ke Sistem
                        </button>
                    </form>
                    
                    <div class="mt-6 pt-6 border-t border-gray-200">
                        <p class="text-sm text-gray-600 text-center font-medium mb-2">Akun Demo:</p>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-700">Super Admin:</span>
                                <span class="font-mono text-blue-600">superadmin@sd.id</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-700">Admin:</span>
                                <span class="font-mono text-blue-600">admin@sd.id</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-700">Guru:</span>
                                <span class="font-mono text-blue-600">guru1a@sd.id</span>
                            </div>
                            <div class="text-center text-gray-500 text-xs mt-2">
                                Password: <span class="font-mono">admin123</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Login function
async function login(email, password) {
    try {
        // Query untuk cek user
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('password', password) // Note: In production, use proper auth
            .single();
        
        if (error || !data) {
            showToast('Email atau password salah', 'error');
            return false;
        }
        
        if (data.status !== 'active') {
            showToast('Akun tidak aktif', 'error');
            return false;
        }
        
        AppState.currentUser = data;
        localStorage.setItem('school_user', JSON.stringify(data));
        
        showToast(`Selamat datang, ${data.name}!`);
        render();
        return true;
        
    } catch (error) {
        showToast('Terjadi kesalahan saat login', 'error');
        console.error('Login error:', error);
        return false;
    }
}

// Toast notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle text-green-500' :
                 type === 'error' ? 'fas fa-exclamation-circle text-red-500' :
                 'fas fa-info-circle text-yellow-500';
    
    toast.innerHTML = `
        <i class="${icon} text-lg"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Event listeners
function attachLoginListeners() {
    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        await login(email, password);
    });
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', initApp);

// Export untuk debugging
window.AppState = AppState;
window.supabase = supabase;