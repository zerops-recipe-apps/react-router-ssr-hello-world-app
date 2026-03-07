import pg from 'pg'

const { Pool } = pg

// Module-level singleton - one pool per server process
let pool: InstanceType<typeof Pool> | null = null

export function getPool(): InstanceType<typeof Pool> {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    })
  }
  return pool
}
