const translations = {
    es: {
        'settings-title': 'Ajustes',
        'general-header': 'Ajustes generales',
        'language-label': 'Idioma',
        'language-desc': 'Selecciona el idioma de la aplicación',
        'appearance-header': 'Apariencia',
        'theme-label': 'Tema',
        'theme-desc': 'Personaliza la apariencia de FindMe',
        'dark-theme': 'Oscuro',
        'light-theme': 'Claro',
        'system-theme': 'Sistema',
        'notifications-header': 'Notificaciones',
        'location-updates-label': 'Actualizaciones de ubicación',
        'location-updates-desc': 'Recibe notificaciones cuando se actualice la ubicación',
        'sounds-label': 'Sonidos',
        'sounds-desc': 'Reproducir sonidos con las notificaciones',
        'privacy-header': 'Privacidad',
        'share-location-label': 'Compartir ubicación',
        'share-location-desc': 'Permitir que otros vean mi ubicación',
        'location-history-label': 'Historial de ubicación',
        'location-history-desc': 'Guardar historial de ubicaciones',
        'sidebar-general': 'General',
        'sidebar-appearance': 'Apariencia',
        'sidebar-notifications': 'Notificaciones',
        'sidebar-privacy': 'Privacidad'
    },
    en: {
        'settings-title': 'Settings',
        'general-header': 'General Settings',
        'language-label': 'Language',
        'language-desc': 'Select the application language',
        'appearance-header': 'Appearance',
        'theme-label': 'Theme',
        'theme-desc': 'Customize the look and feel of FindMe',
        'dark-theme': 'Dark',
        'light-theme': 'Light',
        'system-theme': 'System',
        'notifications-header': 'Notifications',
        'location-updates-label': 'Location Updates',
        'location-updates-desc': 'Receive notifications when location is updated',
        'sounds-label': 'Sounds',
        'sounds-desc': 'Play sounds with notifications',
        'privacy-header': 'Privacy',
        'share-location-label': 'Share Location',
        'share-location-desc': 'Allow others to see my location',
        'location-history-label': 'Location History',
        'location-history-desc': 'Save location history',
        'sidebar-general': 'General',
        'sidebar-appearance': 'Appearance',
        'sidebar-notifications': 'Notifications',
        'sidebar-privacy': 'Privacy'
    }
};

class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.applySettings();
        this.setupEventListeners();
        this.notificationSound = new Audio('public/sounds/notification.mp3');
    }

    loadSettings() {
        const defaultSettings = {
            language: 'es',
            theme: 'system',
            notifications: { location: false, sounds: false },
            privacy: { shareLocation: false, locationHistory: false }
        };
        const storedSettings = JSON.parse(localStorage.getItem('findme-settings') || '{}');
        return {
            ...defaultSettings,
            ...storedSettings,
            notifications: { ...defaultSettings.notifications, ...(storedSettings.notifications || {}) },
            privacy: { ...defaultSettings.privacy, ...(storedSettings.privacy || {}) }
        };
    }

    saveSettings() {
        localStorage.setItem('findme-settings', JSON.stringify(this.settings));
        this.applySettings();
    }

    applyLanguage() {
        const lang = this.settings.language;
        document.querySelectorAll('[data-translate-key]').forEach(element => {
            const key = element.getAttribute('data-translate-key');
            if (translations[lang] && translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });
        document.title = translations[lang]['settings-title'] || 'FindMe - Ajustes';
    }

    applySettings() {
            document.documentElement.lang = this.settings.language;
            this.applyTheme();
            this.applyLanguage(); // ✅ 3. Llama a la nueva función aquí
            window.dispatchEvent(new Event('settings-changed'));
        }

    applyTheme() {
        const theme = this.settings.theme === 'system'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : this.settings.theme;

        // Forzar la eliminación de ambas clases antes de aplicar la correcta
        document.documentElement.classList.remove('dark', 'light');
        document.body.classList.remove('bg-background-dark', 'bg-background-light');

        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('bg-background-dark');
        } else {
            // Asumimos que quieres un fondo claro en modo 'light'
            document.documentElement.classList.add('light');
            // Nota: Debes definir 'bg-background-light' en tu CSS si aún no lo has hecho.
            document.body.classList.add('bg-background-light'); 
        }
    }

    setupEventListeners() {
        // --- Idioma ---
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = this.settings.language;
            languageSelect.addEventListener('change', (e) => {
                this.settings.language = e.target.value;
                this.saveSettings();
            });
        }

        // --- Tema ---
        const themeButtons = document.querySelectorAll('button[data-theme]');
        themeButtons.forEach(button => {
            if (button.dataset.theme === this.settings.theme) {
                button.classList.add('border-primary');
            }
            button.addEventListener('click', () => {
                themeButtons.forEach(b => b.classList.remove('border-primary'));
                button.classList.add('border-primary');
                this.settings.theme = button.dataset.theme;
                this.saveSettings();
            });
        });

        // --- ✅ Lógica para la navegación lateral con scroll suave ---
        const navLinks = document.querySelectorAll('aside nav a.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                navLinks.forEach(navLink => {
                    navLink.classList.remove('bg-primary/10', 'text-white');
                    navLink.classList.add('text-gray-400', 'hover:bg-card-dark');
                });
                link.classList.add('bg-primary/10', 'text-white');
                link.classList.remove('text-gray-400', 'hover:bg-card-dark');

                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // --- Toggles de Notificaciones y Privacidad ---
        this.setupToggle('location-notifications', 'notifications.location', true);
        this.setupToggle('notification-sounds', 'notifications.sounds');
        this.setupToggle('share-location', 'privacy.shareLocation', true);
        this.setupToggle('location-history', 'privacy.locationHistory');

        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => this.applyTheme());
        }
    }

    setupToggle(id, settingPath, requiresPermission = false) {
        const toggle = document.getElementById(id);
        if (!toggle) return;

        const value = settingPath.split('.').reduce((obj, key) => obj[key], this.settings);
        toggle.checked = value;

        toggle.addEventListener('change', async (e) => {
            if (e.target.checked && requiresPermission) {
                const granted = await this.requestPermission(id);
                if (!granted) {
                    e.target.checked = false;
                    return;
                }
            }
            let current = this.settings;
            const keys = settingPath.split('.');
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = e.target.checked;

            if (id === 'notification-sounds' && e.target.checked) {
                this.notificationSound.play().catch(err => console.error("Error al reproducir sonido:", err));
            }
            this.saveSettings();
        });
    }

    async requestPermission(feature) {
        switch (feature) {
            case 'location-notifications':
                if (Notification.permission === 'granted') return true;
                return await Notification.requestPermission() === 'granted';
            case 'share-location':
                try {
                    await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
                    return true;
                } catch { return false; }
            default:
                return true;
        }
    }
}