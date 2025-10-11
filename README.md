# FindMe App

[![Node.js](https://img.shields.io/badge/Node.js-v18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.x-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14.x-blue.svg)](https://www.postgresql.org/)

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

## Testing

Para ejecutar las pruebas:
```bash
npm test
```

## API Endpoints

La API proporciona los siguientes endpoints:

```
POST   /api/auth/register    # Registro de usuarios
POST   /api/auth/login       # Inicio de sesión
GET    /api/people          # Obtener lista de personas
POST   /api/people          # Añadir nueva persona
PUT    /api/people/:id      # Actualizar persona
DELETE /api/people/:id      # Eliminar persona
```

## Estructura del Proyecto

```
findme-app\
├── src\                # Código fuente
│   ├── config\        # Configuraciones
│   ├── controllers\   # Controladores
│   ├── middleware\    # Middleware
│   ├── models\        # Modelos de datos
│   ├── routes\        # Rutas de la API
│   ├── services\      # Servicios
│   └── utils\         # Utilidades
├── public\            # Archivos estáticos
│   ├── css\          # Estilos
│   ├── js\           # Scripts
│   ├── images\       # Imágenes
│   └── sounds\       # Archivos de audio
├── views\            # Archivos HTML
├── tests\            # Pruebas unitarias
├── logs\             # Archivos de registro
└── server.js         # Punto de entrada
```

## Licencia

ISC
