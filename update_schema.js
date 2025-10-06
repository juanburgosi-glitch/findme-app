// update_schema.js

require('dotenv').config();
const { Pool } = require('pg');

// 1. Configuración de la Conexión (igual que en tu server.js)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// 2. Comandos SQL para actualizar la tabla 'users'
const updateQuery = `
    ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS second_last_name VARCHAR(100);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_number VARCHAR(50);
`;

// 3. Función para ejecutar la actualización
async function updateSchema() {
    console.log("Iniciando actualización del esquema de la base de datos...");
    const client = await pool.connect();
    try {
        await client.query(updateQuery);
        console.log("✅ ¡Esquema actualizado con éxito! Las columnas han sido añadidas a la tabla 'users'.");
    } catch (error) {
        console.error("❌ Error durante la actualización del esquema:", error);
        process.exit(1); // Salir con un código de error para detener el proceso
    } finally {
        await client.release(); // Liberar la conexión
        await pool.end(); // Cerrar todas las conexiones
        console.log("Proceso de actualización finalizado.");
        process.exit(0); // Salir exitosamente
    }
}

// 4. Ejecutar la función
updateSchema();