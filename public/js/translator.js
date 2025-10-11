const translations = {
    es: {
        // General
        'findme-title': 'FindMe',
        'logout': 'Cerrar Sesión', 'cancel': 'Cancelar', 'confirm': 'Confirmar',
        'save-changes': 'Guardar Cambios', 'my-profile': 'Mi Perfil', 'settings': 'Ajustes',

        // index.html (Login)
        'login-title': 'FindMe - Iniciar Sesión', 'login-welcome': 'Bienvenido de nuevo',
        'login-prompt': 'Inicia sesión para acceder a tu panel.', 'email-placeholder': 'Correo electrónico',
        'password-placeholder': 'Contraseña', 'login-button': 'Iniciar Sesión',
        'no-account-text': '¿No tienes una cuenta?', 'signup-link': 'Registrarme',

        // registro.html
        'register-title': 'FindMe - Crear Cuenta', 'create-account-header': 'Crea tu cuenta',
        'create-account-prompt': 'Únete a FindMe para compartir información médica y tu ubicación en emergencias.',
        'email-label': 'Dirección de correo', 'password-label': 'Contraseña', 'create-account-button': 'Crear Cuenta',

        // dashboard.html
        'dashboard-title': 'FindMe - Panel de Control', 'my-people-header': 'Mis Personas a Cargo',
        'add-person-button': 'Agregar Persona', 'table-header-name': 'Nombre', 'table-header-actions': 'Acciones',
        'edit-person-modal-title': 'Editar Información', 'delete-person-modal-title': 'Confirmar Eliminación',
        'delete-person-prompt': '¿Estás seguro de que deseas eliminar a', 'delete-button': 'Eliminar',
        'undo-toast-message': 'Se eliminó a', 'undo-button': 'Deshacer',

        // añadir.html
        'add-person-title': 'FindMe - Añadir Persona', 'add-new-person-header': 'Añadir Nueva Persona',
        'profile-photo-label': 'Foto de Perfil', 'full-name-label': 'Nombre Completo',
        'contact-number-label': 'Número de Contacto', 'preferred-hospital-label': 'Hospital de Preferencia',
        'medical-conditions-label': 'Condiciones Médicas',

        // profile.html
        'profile-page-title': 'FindMe - Ficha Médica', 'back-to-list': 'Volver al listado',
        'medical-record': 'Ficha Médica', 'pin-device-button': 'Anclar este Dispositivo',
        'personal-info-header': 'Información Personal', 'real-time-location-header': 'Ubicación en Tiempo Real',
        'update-location-button': 'Actualizar', 'current-location-status': 'Ubicación actual',
        'last-updated-label': 'Última vez:', 'logout-modal-prompt': '¿Estás seguro de que deseas cerrar sesión?',

        // edit-profile.html
        'edit-profile-title': 'FindMe - Editar Perfil', 'edit-profile-header': 'Editar Perfil',
        'edit-profile-prompt': 'Actualiza tu información personal.', 'first-name-label': 'Primer Nombre',
        'middle-name-label': 'Segundo Nombre', 'last-name-label': 'Apellido Paterno',
        'second-last-name-label': 'Apellido Materno', 'phone-number-label': 'Número de Teléfono',
        'email-cant-change': 'El email no se puede modificar.',

        // settings.html
        'settings-title': 'Ajustes', 'general-header': 'Ajustes generales', 'language-label': 'Idioma',
        'language-desc': 'Selecciona el idioma de la aplicación', 'appearance-header': 'Apariencia',
        'theme-label': 'Tema', 'theme-desc': 'Personaliza la apariencia de FindMe', 'dark-theme': 'Oscuro',
        'light-theme': 'Claro', 'system-theme': 'Sistema', 'notifications-header': 'Notificaciones',
        'location-updates-label': 'Actualizaciones de ubicación',
        'location-updates-desc': 'Recibe notificaciones cuando se actualice la ubicación',
        'sounds-label': 'Sonidos', 'sounds-desc': 'Reproducir sonidos con las notificaciones',
        'privacy-header': 'Privacidad', 'share-location-label': 'Compartir ubicación',
        'share-location-desc': 'Permitir que otros vean mi ubicación',
        'location-history-label': 'Historial de ubicación', 'location-history-desc': 'Guardar historial de ubicaciones',
        'sidebar-general': 'General', 'sidebar-appearance': 'Apariencia',
        'sidebar-notifications': 'Notificaciones', 'sidebar-privacy': 'Privacidad'
    },
    en: {
        'findme-title': 'FindMe', 'logout': 'Log Out', 'cancel': 'Cancel', 'confirm': 'Confirm',
        'save-changes': 'Save Changes', 'my-profile': 'My Profile', 'settings': 'Settings',
        'login-title': 'FindMe - Log In', 'login-welcome': 'Welcome back',
        'login-prompt': 'Log in to access your dashboard.', 'email-placeholder': 'Email address',
        'password-placeholder': 'Password', 'login-button': 'Log In', 'no-account-text': "Don't have an account?",
        'signup-link': 'Sign up', 'register-title': 'FindMe - Create Account',
        'create-account-header': 'Create your account',
        'create-account-prompt': 'Join FindMe to share medical info and your location in emergencies.',
        'email-label': 'Email address', 'password-label': 'Password', 'create-account-button': 'Create Account',
        'dashboard-title': 'FindMe - Dashboard', 'my-people-header': 'My People in Care',
        'add-person-button': 'Add Person', 'table-header-name': 'Name', 'table-header-actions': 'Actions',
        'edit-person-modal-title': 'Edit Information', 'delete-person-modal-title': 'Confirm Deletion',
        'delete-person-prompt': 'Are you sure you want to delete', 'delete-button': 'Delete',
        'undo-toast-message': 'Deleted', 'undo-button': 'Undo', 'add-person-title': 'FindMe - Add Person',
        'add-new-person-header': 'Add New Person', 'profile-photo-label': 'Profile Photo',
        'full-name-label': 'Full Name', 'contact-number-label': 'Contact Number',
        'preferred-hospital-label': 'Preferred Hospital', 'medical-conditions-label': 'Medical Conditions',
        'profile-page-title': 'FindMe - Medical Record', 'back-to-list': 'Back to list',
        'medical-record': 'Medical Record', 'pin-device-button': 'Pin this Device',
        'personal-info-header': 'Personal Information', 'real-time-location-header': 'Real-Time Location',
        'update-location-button': 'Update', 'current-location-status': 'Current location',
        'last-updated-label': 'Last updated:', 'logout-modal-prompt': 'Are you sure you want to log out?',
        'edit-profile-title': 'FindMe - Edit Profile', 'edit-profile-header': 'Edit Profile',
        'edit-profile-prompt': 'Update your personal information.', 'first-name-label': 'First Name',
        'middle-name-label': 'Middle Name', 'last-name-label': 'Last Name',
        'second-last-name-label': 'Second Last Name', 'phone-number-label': 'Phone Number',
        'email-cant-change': 'The email cannot be modified.', 'settings-title': 'Settings',
        'general-header': 'General Settings', 'language-label': 'Language',
        'language-desc': 'Select the application language', 'appearance-header': 'Appearance',
        'theme-label': 'Theme', 'theme-desc': 'Customize the look and feel of FindMe',
        'dark-theme': 'Dark', 'light-theme': 'Light', 'system-theme': 'System',
        'notifications-header': 'Notifications', 'location-updates-label': 'Location Updates',
        'location-updates-desc': 'Receive notifications when location is updated', 'sounds-label': 'Sounds',
        'sounds-desc': 'Play sounds with notifications', 'privacy-header': 'Privacy',
        'share-location-label': 'Share Location', 'share-location-desc': 'Allow others to see my location',
        'location-history-label': 'Location History', 'location-history-desc': 'Save location history',
        'sidebar-general': 'General', 'sidebar-appearance': 'Appearance',
        'sidebar-notifications': 'Notifications', 'sidebar-privacy': 'Privacy'
    }
};

function applyLanguage() {
    const settings = JSON.parse(localStorage.getItem('findme-settings') || '{"language": "es"}');
    const lang = settings.language || 'es';
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-translate-key]').forEach(element => {
        const key = element.getAttribute('data-translate-key');
        const property = element.getAttribute('data-translate-property');

        if (translations[lang] && translations[lang][key]) {
            const translation = translations[lang][key];
            if (property) {
                element[property] = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', applyLanguage);
window.addEventListener('storage', (event) => {
    if (event.key === 'findme-settings') {
        applyLanguage();
    }
});