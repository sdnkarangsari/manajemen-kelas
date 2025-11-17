// Template untuk sidebar yang konsisten across semua halaman
function loadSidebarTemplate(user) {
    return `
        <!-- Sidebar -->
        <div class="sidebar">
            <!-- Logo Section -->
            <div class="logo-container">
                <img src="../assets/images/logo.png" alt="Logo SDN Karangsari" class="logo-icon"
                     onerror="this.style.display='none'; document.getElementById('sidebarLogoFallback').style.display='flex';">
                <div id="sidebarLogoFallback" class="logo-fallback" style="display: none;">
                    🎓
                </div>
                <div class="logo-text">
                    <div class="logo-school">SDN KARANGSARI</div>
                    <div class="logo-subtitle">MANAJEMEN KELAS</div>
                </div>
            </div>
            
            <nav class="sidebar-nav">
                <a href="dashboard.html" class="nav-item ${window.location.pathname.includes('dashboard') ? 'active' : ''}">
                    <span>📊</span>
                    <span>Dashboard</span>
                </a>
                <a href="manajemen-kelas.html" class="nav-item ${window.location.pathname.includes('manajemen-kelas') ? 'active' : ''}">
                    <span>👥</span>
                    <span>Manajemen Kelas</span>
                </a>
                <a href="input-nilai.html" class="nav-item ${window.location.pathname.includes('input-nilai') ? 'active' : ''}">
                    <span>📝</span>
                    <span>Input Nilai</span>
                </a>
                <a href="absensi.html" class="nav-item ${window.location.pathname.includes('absensi') ? 'active' : ''}">
                    <span>✅</span>
                    <span>Absensi</span>
                </a>
                <a href="laporan.html" class="nav-item ${window.location.pathname.includes('laporan') ? 'active' : ''}">
                    <span>📋</span>
                    <span>Laporan</span>
                </a>
                <button onclick="logout()" class="nav-item logout">
                    <span>🚪</span>
                    <span>Logout</span>
                </button>
            </nav>
        </div>
    `;
}

// Template untuk header
function loadHeaderTemplate(user) {
    const pageTitles = {
        'dashboard.html': 'Dashboard Guru',
        'manajemen-kelas.html': 'Manajemen Kelas', 
        'input-nilai.html': 'Input Nilai',
        'absensi.html': 'Absensi Siswa',
        'laporan.html': 'Laporan & Analytics'
    };
    
    const currentPage = window.location.pathname.split('/').pop();
    const pageTitle = pageTitles[currentPage] || 'SDN Karangsari';
    
    return `
        <header class="header">
            <div class="header-logo">
                <img src="../assets/images/logo.png" alt="Logo SDN Karangsari" class="header-logo-icon"
                     onerror="this.style.display='none'; document.getElementById('headerLogoFallback').style.display='flex';">
                <div id="headerLogoFallback" class="header-logo-fallback" style="display: none;">
                    🎓
                </div>
                <h1>${pageTitle}</h1>
            </div>
            <div class="user-info">
                <span>${user.nama}</span>
                <span class="role-badge">${user.role}</span>
            </div>
        </header>
    `;
}

// Function untuk initialize template
function initializeTemplates() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = '../index.html';
        return;
    }
    
    // Load sidebar
    const sidebarContainer = document.querySelector('.sidebar-container');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = loadSidebarTemplate(user);
    }
    
    // Load header
    const headerContainer = document.querySelector('.header-container');
    if (headerContainer) {
        headerContainer.innerHTML = loadHeaderTemplate(user);
    }
    
    // Update active nav based on current page
    updateActiveNav();
}

// Update active navigation
function updateActiveNav() {
    const currentPage = window.location.pathname;
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') && currentPage.includes(item.getAttribute('href'))) {
            item.classList.add('active');
        }
    });
}

// Global logout function
function logout() {
    console.log('🚪 Logging out...');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    window.location.href = '../index.html';
}