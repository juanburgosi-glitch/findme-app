document.addEventListener('DOMContentLoaded', () => {
    // Cargar y mostrar el header reutilizable
    fetch('_header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            // Inserta el header al principio del body
            document.body.insertAdjacentHTML('afterbegin', data);
            
            // Una vez que el header está en la página, le damos su funcionalidad
            const userMenuButton = document.getElementById('user-menu-button');
            const userMenu = document.getElementById('user-menu');
            const logoutBtn = document.getElementById('logout-btn');
            const logoutModal = document.getElementById('logout-modal');
            const cancelLogoutBtn = document.getElementById('cancel-logout-btn');
            const confirmLogoutBtn = document.getElementById('confirm-logout-btn');
            const toastNotification = document.getElementById('toast-notification');

            if (userMenuButton) {
                userMenuButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    userMenu.classList.toggle('hidden');
                });
            }

            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    userMenu.classList.add('hidden');
                    logoutModal.classList.remove('hidden');
                });
            }

            if (cancelLogoutBtn) {
                cancelLogoutBtn.addEventListener('click', () => {
                    logoutModal.classList.add('hidden');
                });
            }

            if (confirmLogoutBtn) {
                confirmLogoutBtn.addEventListener('click', () => {
                    logoutModal.classList.add('hidden');
                    localStorage.removeItem('token');
                    toastNotification.classList.remove('hidden');
                    setTimeout(() => {
                        toastNotification.classList.add('hidden');
                        window.location.href = 'index.html';
                    }, 2000);
                });
            }
        })
        .catch(error => {
            console.error('Failed to fetch header:', error);
        });
        
    // Cerrar el menú si se hace clic fuera
    window.addEventListener('click', () => {
        const userMenu = document.getElementById('user-menu');
        if (userMenu && !userMenu.classList.contains('hidden')) {
            userMenu.classList.add('hidden');
        }
    });
});