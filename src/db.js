const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { usersTable } = require('./schema');

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@db:5432/demo';

const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema: { users: usersTable } });

async function initDb() {
  await client`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;
}

module.exports = { db, initDb, client };
