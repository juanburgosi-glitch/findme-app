// main.js - VERSIÓN CORREGIDA

document.addEventListener('DOMContentLoaded', () => {
    // Ya no se usa fetch. Asumimos que el header está en el HTML.
    const userMenuButton = document.getElementById('user-menu-button');
    const userMenu = document.getElementById('user-menu');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    const cancelLogoutBtn = document.getElementById('cancel-logout-btn');
    const confirmLogoutBtn = document.getElementById('confirm-logout-btn');
    const toastNotification = document.getElementById('toast-notification');

    if (userMenuButton && userMenu) {
        userMenuButton.addEventListener('click', (event) => {
            event.stopPropagation();
            userMenu.classList.toggle('hidden');
        });
    }

    if (logoutBtn && logoutModal) {
        logoutBtn.addEventListener('click', () => {
            if (userMenu) userMenu.classList.add('hidden');
            logoutModal.classList.remove('hidden');
        });
    }

    if (cancelLogoutBtn && logoutModal) {
        cancelLogoutBtn.addEventListener('click', () => {
            logoutModal.classList.add('hidden');
        });
    }

    if (confirmLogoutBtn && logoutModal) {
        confirmLogoutBtn.addEventListener('click', () => {
            logoutModal.classList.add('hidden');
            localStorage.removeItem('token');
            if (toastNotification) {
                toastNotification.classList.remove('hidden');
            }
            setTimeout(() => {
                if (toastNotification) toastNotification.classList.add('hidden');
                window.location.href = 'index.html';
            }, 2000);
        });
    }
    
    // Cierra el menú si se hace clic fuera
    window.addEventListener('click', (event) => {
        if (userMenu && !userMenu.classList.contains('hidden')) {
            if (!userMenu.contains(event.target)) {
                userMenu.classList.add('hidden');
            }
        }
    });
});