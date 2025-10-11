# FindMe App

Aplicación web para el seguimiento y gestión de información de personas a cargo.

## Características

- Registro y autenticación de usuarios
- Gestión de personas a cargo
- Seguimiento de ubicación en tiempo real
- Almacenamiento de información médica y de contacto
- Interfaz responsiva y moderna

## Tecnologías

- Frontend: HTML, TailwindCSS, JavaScript
- Backend: Node.js, Express
- Base de datos: PostgreSQL
- Hosting: Render

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/juanburgosi-glitch/findme-app.git
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear archivo `.env` con:
```
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
PORT=10000
```

4. Iniciar servidor:
```bash
npm start
```

## Estructura del Proyecto

```
findme-app/
├── public/           # Archivos estáticos
│   ├── css/         # Estilos
│   ├── js/          # Scripts
│   ├── images/      # Imágenes
│   └── sounds/      # Sonidos
├── index.html       # Página principal
├── dashboard.html   # Panel de control
├── profile.html     # Perfil de usuario
├── settings.html    # Configuración
├── registro.html    # Registro
├── server.js        # Servidor Node.js
└── package.json     # Dependencias
```

## Licencia

ISC
