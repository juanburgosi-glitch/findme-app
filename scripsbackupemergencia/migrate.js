// Archivo: migrate.js

const { Pool } = require('pg');
require('dotenv').config(); // Para que funcione en tu PC si lo necesitas

// Usará la variable de entorno DATABASE_URL que Render ya tiene configurada
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error("Error: La variable de entorno DATABASE_URL no está definida.");
    process.exit(1);
}

const pool = new Pool({
    connectionString: connectionString,
    // En Render, es posible que necesites SSL
    ssl: {
        rejectUnauthorized: false
    }
});

const migrationQuery = `
    -- Borra las tablas si ya existen, para empezar de cero sin errores
    DROP TABLE IF EXISTS people;
    DROP TABLE IF EXISTS users;

    -- Tabla para almacenar los datos de los usuarios que se registran
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabla para almacenar los datos de las personas a cargo de cada usuario
    CREATE TABLE people (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        full_name VARCHAR(255) NOT NULL,
        contact_number VARCHAR(50),
        preferred_hospital VARCHAR(255),
        medical_conditions TEXT,
        profile_image_url VARCHAR(255),
        last_lat NUMERIC(10, 7),
        last_lon NUMERIC(10, 7),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMP WITH TIME ZONE
    );

    -- Opcional: Crear un índice para buscar personas por usuario más rápido
    CREATE INDEX idx_people_user_id ON people(user_id);
`;

async function runMigration() {
    console.log("Iniciando migración de la base de datos...");
    const client = await pool.connect();
    try {
        await client.query(migrationQuery);
        console.log("¡Migración completada con éxito! Las tablas 'users' y 'people' han sido creadas.");
    } catch (error) {
        console.error("Error durante la migración:", error);
        process.exit(1); // Salir con un código de error
    } finally {
        client.release();
        await pool.end();
        console.log("Conexión a la base de datos cerrada.");
    }
}

runMigration();