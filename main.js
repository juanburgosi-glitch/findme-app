document.addEventListener('DOMContentLoaded', () => {
    // Ya no usamos fetch. Asumimos que el header está en el HTML,
    // así que vamos directamente a darle su funcionalidad.

    const userMenuButton = document.getElementById('user-menu-button');
    const userMenu = document.getElementById('user-menu');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    const cancelLogoutBtn = document.getElementById('cancel-logout-btn');
    const confirmLogoutBtn = document.getElementById('confirm-logout-btn');
    
    // Este elemento es para la notificación de 'sesión cerrada'.
    // Si no lo tienes en tu _header.html, puedes eliminar las líneas que lo usan.
    const toastNotification = document.getElementById('toast-notification');

    if (userMenuButton && userMenu) {
        userMenuButton.addEventListener('click', (event) => {
            // Evita que el clic en el botón se propague al 'window' y cierre el menú inmediatamente.
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

            // Muestra la notificación de que la sesión se cerró
            if (toastNotification) {
                toastNotification.classList.remove('hidden');
            }

            // Espera 2 segundos antes de redirigir al inicio de sesión
            setTimeout(() => {
                if (toastNotification) {
                   toastNotification.classList.add('hidden');
                }
                window.location.href = 'index.html';
            }, 2000);
        });
    }
    
    // --- Lógica para cerrar el menú si se hace clic fuera de él ---
    window.addEventListener('click', (event) => {
        // Si el menú existe y no está oculto
        if (userMenu && !userMenu.classList.contains('hidden')) {
             // Y si el clic NO fue dentro del propio menú
            if (!userMenu.contains(event.target)) {
                userMenu.classList.add('hidden');
            }
        }
    });
});