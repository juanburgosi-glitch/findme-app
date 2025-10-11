class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.applyInitialState();
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
        // Dispara manualmente un evento para que translator.js actualice el idioma al instante
        window.dispatchEvent(new StorageEvent('storage', { key: 'findme-settings' }));
        this.applyTheme();
    }

    applyInitialState() {
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) languageSelect.value = this.settings.language;

        document.querySelectorAll('button[data-theme]').forEach(button => {
            button.classList.remove('border-primary');
            if (button.dataset.theme === this.settings.theme) {
                button.classList.add('border-primary');
            }
        });
        this.applyTheme();
    }

    applyTheme() {
        const theme = this.settings.theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : this.settings.theme;
        document.documentElement.classList.remove('dark', 'light');
        document.body.classList.remove('bg-background-dark', 'bg-background-light');
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('bg-background-dark');
        } else {
            document.documentElement.classList.add('light');
            document.body.classList.add('bg-background-light');
        }
    }

    setupEventListeners() {
        document.getElementById('language-select')?.addEventListener('change', (e) => {
            this.settings.language = e.target.value;
            this.saveSettings();
        });

        document.querySelectorAll('button[data-theme]').forEach(button => {
            button.addEventListener('click', () => {
                this.settings.theme = button.dataset.theme;
                this.saveSettings();
                this.applyInitialState(); // Actualiza los bordes de los botones
            });
        });

        this.setupToggle('location-notifications', 'notifications.location', true);
        this.setupToggle('notification-sounds', 'notifications.sounds');
        this.setupToggle('share-location', 'privacy.shareLocation', true);
        this.setupToggle('location-history', 'privacy.locationHistory');

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => this.applyTheme());
    }

    setupToggle(id, settingPath, requiresPermission = false) {
        const toggle = document.getElementById(id);
        if (!toggle) return;
        const value = settingPath.split('.').reduce((obj, key) => obj[key], this.settings);
        toggle.checked = value;
        toggle.addEventListener('change', async (e) => {
            if (e.target.checked && requiresPermission) {
                const granted = await this.requestPermission(id);
                if (!granted) { e.target.checked = false; return; }
            }
            let current = this.settings;
            const keys = settingPath.split('.');
            for (let i = 0; i < keys.length - 1; i++) { current = current[keys[i]]; }
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