// Archivo: fix_column.js

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error("Error: La variable de entorno DATABASE_URL no está definida.");
    process.exit(1);
}

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

const fixQuery = `
    ALTER TABLE people RENAME COLUMN profile_image_url TO image_url;
`;

async function runFix() {
    console.log("Iniciando corrección de columna en la tabla 'people'...");
    const client = await pool.connect();
    try {
        await client.query(fixQuery);
        console.log("¡Corrección completada con éxito! La columna ha sido renombrada a 'image_url'.");
    } catch (error) {
        // Si la columna ya se llama 'image_url', dará un error, pero eso está bien.
        if (error.message.includes('column "profile_image_url" does not exist')) {
            console.log("La columna 'profile_image_url' no existe, es posible que ya haya sido renombrada. ¡Todo bien!");
        } else if (error.message.includes('column "image_url" already exists')) {
            console.log("La columna 'image_url' ya existe. ¡No se necesita hacer nada!");
        } else {
            console.error("Error durante la corrección:", error);
            process.exit(1);
        }
    } finally {
        client.release();
        await pool.end();
        console.log("Conexión a la base de datos cerrada.");
    }
}

runFix();