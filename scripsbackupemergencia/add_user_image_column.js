// add_user_image_column.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const alterQuery = `
    ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(255);
`;

async function updateUserSchema() {
    console.log("Adding profile_image_url to users table...");
    const client = await pool.connect();
    try {
        await client.query(alterQuery);
        console.log("✅ Schema updated successfully!");
    } catch (error) {
        console.error("❌ Error updating schema:", error);
    } finally {
        await client.release();
        await pool.end();
    }
}

updateUserSchema();