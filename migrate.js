import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
})

async function migrate() {
  console.log('Running migrations...')

  await pool.query(`
    CREATE TABLE IF NOT EXISTS greetings (
      id      INTEGER PRIMARY KEY,
      message TEXT    NOT NULL
    )
  `)

  await pool.query(`
    INSERT INTO greetings (id, message)
    VALUES (1, 'Hello from Zerops!')
    ON CONFLICT (id) DO NOTHING
  `)

  console.log('Migrations complete.')
  await pool.end()
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
