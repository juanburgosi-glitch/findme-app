class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.applySettings(); // Aplicar ajustes iniciales al cargar
        this.setupEventListeners();
        this.notificationSound = new Audio('/public/sounds/notification.mp3'); // Corregir ruta del sonido
    }

    loadSettings() {
        // Objeto con la estructura por defecto completa
        const defaultSettings = {
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
        };

        // Cargar las configuraciones guardadas
        const storedSettings = JSON.parse(localStorage.getItem('findme-settings') || '{}');

        // Combinar los valores por defecto con los guardados, asegurando que todas las claves existan
        const finalSettings = {
            ...defaultSettings,
            ...storedSettings,
            notifications: {
                ...defaultSettings.notifications,
                ...(storedSettings.notifications || {})
            },
            privacy: {
                ...defaultSettings.privacy,
                ...(storedSettings.privacy || {})
            }
        };

        return finalSettings;
    }

    saveSettings() {
        localStorage.setItem('findme-settings', JSON.stringify(this.settings));
        this.applySettings();
    }

    applySettings() {
        document.documentElement.lang = this.settings.language;
        this.applyTheme();
        window.dispatchEvent(new Event('settings-changed'));
    }

    applyTheme() {
        const theme = this.settings.theme === 'system' 
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : this.settings.theme;

        document.documentElement.classList.toggle('dark', theme === 'dark');
    }

    setupEventListeners() {
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = this.settings.language;
            languageSelect.addEventListener('change', (e) => {
                this.settings.language = e.target.value;
                this.saveSettings();
            });
        }

        const themeButtons = document.querySelectorAll('[data-theme]');
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
        
        // Las llamadas ahora funcionarán porque `this.settings` tiene la estructura completa
        this.setupToggle('location-notifications', 'notifications.location', true);
        this.setupToggle('notification-sounds', 'notifications.sounds');
        this.setupToggle('share-location', 'privacy.shareLocation', true);
        this.setupToggle('location-history', 'privacy.locationHistory');

        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)')
                .addEventListener('change', () => this.applyTheme());
        }
    }

    setupToggle(id, settingPath, requiresPermission = false) {
        const toggle = document.getElementById(id);
        if (!toggle) return;

        const keys = settingPath.split('.');
        const value = keys.reduce((obj, key) => obj[key], this.settings);
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
                    await navigator.geolocation.getCurrentPosition(() => {}, () => {});
                    return true;
                } catch {
                    return false;
                }
            default:
                return true;
        }
    }
}