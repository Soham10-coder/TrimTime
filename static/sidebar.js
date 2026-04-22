document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem('role');
    const userName = localStorage.getItem('userName') || 'User';

    let navLinks = '';

    if (role === 'lawyer') {
        navLinks = `
            <a href="3.lawyer_dashboard.html" class="nav-link" data-page="3.lawyer_dashboard.html">
                <i class="fas fa-home"></i> Dashboard
            </a>
            <a href="9.manage_cases.html" class="nav-link" data-page="9.manage_cases.html">
                <i class="fas fa-folder-open"></i> Manage Cases
            </a>
            <a href="8.lawyer_appointment.html" class="nav-link" data-page="8.lawyer_appointment.html">
                <i class="fas fa-calendar-check"></i> Appointments
            </a>
            <a href="6.lawyer_clientmg.html" class="nav-link" data-page="6.lawyer_clientmg.html">
                <i class="fas fa-users"></i> My Clients
            </a>
            <a href="7.lawyer_message.html" class="nav-link" data-page="7.lawyer_message.html">
                <i class="fas fa-comments"></i> Messages
            </a>
            <a href="4.lawyer_profile.html" class="nav-link" data-page="4.lawyer_profile.html">
                <i class="fas fa-user-edit"></i> Edit Profile
            </a>
            <a href="5.view_profile.html" class="nav-link" data-page="5.view_profile.html">
                <i class="fas fa-user-tie"></i> View Profile
            </a>
        `;
    } else if (role === 'client') {
        navLinks = `
            <a href="cdash.html" class="nav-link" data-page="cdash.html">
                <i class="fas fa-home"></i> Dashboard
            </a>
            <a href="clawyers.html" class="nav-link" data-page="clawyers.html">
                <i class="fas fa-gavel"></i> Find Lawyers
            </a>
            <a href="cappointments.html" class="nav-link" data-page="cappointments.html">
                <i class="fas fa-calendar-alt"></i> Appointments
            </a>
            <a href="cmessage.html" class="nav-link" data-page="cmessage.html">
                <i class="fas fa-comments"></i> Messages
            </a>
            <a href="cprofile.html" class="nav-link" data-page="cprofile.html">
                <i class="fas fa-user"></i> Profile
            </a>
        `;
    } else {
        // Fallback or not logged in
        navLinks = `
            <a href="1.user_login.html" class="nav-link">
                <i class="fas fa-sign-in-alt"></i> Login
            </a>
        `;
    }

    const sidebarHTML = `
        <div class="sidebar" id="sidebar">
            <div class="brand">
                <i class="fas fa-balance-scale" style="color: var(--secondary);"></i>
                <span style="color: var(--secondary);">LegalConnect</span>
            </div>
            <div style="padding: 0 1.5rem 1rem 1.5rem; color: rgba(255,255,255,0.6); font-size: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 1rem;">
                Welcome, ${userName}
            </div>
            <nav class="sidebar-nav">
                ${navLinks}
                <a href="#" class="nav-link" style="margin-top: 2rem; color: var(--danger);" onclick="handleLogout(event)">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            </nav>
        </div>
    `;

    // Insert sidebar at the beginning of the body
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

    // Make FontAwesome available if not already present
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
        document.head.appendChild(faLink);
    }

    // Highlight active link
    const currentPage = window.location.pathname.split('/').pop();
    const links = document.querySelectorAll('.sidebar-nav .nav-link');
    links.forEach(link => {
        if (link.getAttribute('data-page') === currentPage) {
            link.classList.add('active');
        }
    });
});

window.handleLogout = function(e) {
    if(e) e.preventDefault();
    localStorage.clear();
    window.location.href = '1.user_login.html';
};

window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
};
