class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.setupEventListeners();
        this.notificationSound = new Audio('/sounds/notification.mp3');
    }

    loadSettings() {
        return JSON.parse(localStorage.getItem('findme-settings') || JSON.stringify({
            language: 'es',
            theme: 'system',
            notifications: {
                location: false,
                sounds: false
            },
            privacy: {
                shareLocation: false,
                locationHistory: false
            }
        }));
    }

    saveSettings() {
        localStorage.setItem('findme-settings', JSON.stringify(this.settings));
        this.applySettings();
    }

    applySettings() {
        // Aplicar idioma
        document.documentElement.lang = this.settings.language;

        // Aplicar tema
        this.applyTheme();

        // Notificar a otras páginas del cambio
        window.dispatchEvent(new Event('settings-changed'));
    }

    applyTheme() {
        const theme = this.settings.theme === 'system' 
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : this.settings.theme;

        document.documentElement.classList.toggle('dark', theme === 'dark');
        document.body.classList.toggle('bg-background-dark', theme === 'dark');
    }

    setupEventListeners() {
        // Idioma
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = this.settings.language;
            languageSelect.addEventListener('change', (e) => {
                this.settings.language = e.target.value;
                this.saveSettings();
            });
        }

        // Tema
        const themeButtons = document.querySelectorAll('[data-theme]');
        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                themeButtons.forEach(b => b.classList.remove('border-primary'));
                button.classList.add('border-primary');
                this.settings.theme = button.dataset.theme;
                this.saveSettings();
            });
        });

        // Notificaciones
        this.setupToggle('location-notifications', 'notifications.location', true);
        this.setupToggle('notification-sounds', 'notifications.sounds');

        // Privacidad
        this.setupToggle('share-location', 'privacy.shareLocation', true);
        this.setupToggle('location-history', 'privacy.locationHistory');

        // Escuchar cambios del sistema
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)')
                .addEventListener('change', () => this.applyTheme());
        }
    }

    setupToggle(id, settingPath, requiresPermission = false) {
        const toggle = document.getElementById(id);
        if (!toggle) return;

        // Establecer estado inicial
        const value = settingPath.split('.').reduce((obj, key) => obj[key], this.settings);
        toggle.checked = value;

        toggle.addEventListener('change', async (e) => {
            if (requiresPermission) {
                const granted = await this.requestPermission(id);
                if (!granted) {
                    e.target.checked = false;
                    return;
                }
            }

            // Actualizar configuración
            const keys = settingPath.split('.');
            let current = this.settings;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = e.target.checked;

            // Reproducir sonido de prueba si es necesario
            if (id === 'notification-sounds' && e.target.checked) {
                this.notificationSound.play();
            }

            this.saveSettings();
        });
    }

    async requestPermission(feature) {
        switch (feature) {
            case 'location-notifications':
                return await this.requestNotificationPermission();
            case 'share-location':
                return await this.requestLocationPermission();
            default:
                return true;
        }
    }

    async requestNotificationPermission() {
        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch {
            return false;
        }
    }

    async requestLocationPermission() {
        try {
            await navigator.geolocation.getCurrentPosition(() => {});
            return true;
        } catch {
            return false;
        }
    }
}
