import { readFileSync } from 'fs'
import { data } from 'react-router'
import { useLoaderData } from 'react-router'
import { getPool } from '../db.server'

// Read version once at server startup from the deployed node_modules
const rrVersion = (() => {
  try {
    const pkg = JSON.parse(readFileSync('./node_modules/react-router/package.json', 'utf-8'))
    return pkg.version as string
  } catch {
    return 'unknown'
  }
})()

export async function loader() {
  const pool = getPool()
  let greeting = ''
  let dbStatus = 'OK'
  let httpStatus = 200

  try {
    const result = await pool.query('SELECT message FROM greetings LIMIT 1')
    greeting = result.rows[0]?.message ?? 'Hello from Zerops!'
  } catch (err) {
    const error = err as Error
    dbStatus = `ERROR: ${error.message}`
    greeting = 'React Router on Zerops'
    httpStatus = 503
  }

  return data(
    {
      greeting,
      dbStatus,
      version: rrVersion,
      environment: process.env.NODE_ENV ?? 'production',
      time: new Date().toISOString(),
    },
    { status: httpStatus },
  )
}

// Inline SVG logo components - no external image dependencies
function ReactRouterLogo() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="React Router">
      <rect width="44" height="44" rx="10" fill="#e43b3b" />
      <text x="7" y="31" fontFamily="'Courier New', monospace" fontWeight="bold" fontSize="19" fill="white">RR</text>
    </svg>
  )
}

function ZeropsLogo() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Zerops">
      <rect width="44" height="44" rx="10" fill="#6c47ff" />
      <text x="10" y="31" fontFamily="'Courier New', monospace" fontWeight="bold" fontSize="22" fill="white">Z</text>
    </svg>
  )
}

interface RowProps {
  label: string
  value: string
  isStatus?: boolean
}

function Row({ label, value, isStatus }: RowProps) {
  const isOk = isStatus && value === 'OK'
  const isError = isStatus && value !== 'OK'

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '0.625rem 0',
      borderBottom: '1px solid #21262d',
      gap: '1rem',
    }}>
      <span style={{ color: '#8b949e', fontSize: '0.875rem', flexShrink: 0 }}>{label}</span>
      <span style={{
        color: isOk ? '#3fb950' : isError ? '#f85149' : '#e6edf3',
        fontSize: '0.875rem',
        textAlign: 'right',
        wordBreak: 'break-all',
        fontFamily: isStatus ? "'Courier New', monospace" : 'inherit',
      }}>
        {isOk ? '✓ ' : isError ? '✗ ' : ''}{value}
      </span>
    </div>
  )
}

export default function Index() {
  const { greeting, dbStatus, version, environment, time } = useLoaderData<typeof loader>()
  const isHealthy = dbStatus === 'OK'

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0d1117',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      padding: '2rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '16px',
        padding: '2.5rem',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6)',
      }}>
        {/* Logo row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '2rem',
        }}>
          <ReactRouterLogo />
          <span style={{ color: '#484f58', fontSize: '1.25rem', fontWeight: 300 }}>+</span>
          <ZeropsLogo />
        </div>

        {/* Greeting heading - dynamically read from DB */}
        <h1 style={{
          margin: '0 0 0.5rem',
          fontSize: '1.625rem',
          fontWeight: 700,
          color: '#e6edf3',
          lineHeight: 1.3,
        }}>
          {greeting}
        </h1>

        {/* Runtime subtitle */}
        <p style={{
          margin: '0 0 2rem',
          fontSize: '0.9rem',
          color: '#8b949e',
          lineHeight: 1.5,
        }}>
          React Router v8 running on Zerops SSR — Node.js at runtime.
        </p>

        {/* Status indicator badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.3rem 0.75rem',
          borderRadius: '9999px',
          backgroundColor: isHealthy ? 'rgba(63, 185, 80, 0.1)' : 'rgba(248, 81, 73, 0.1)',
          border: `1px solid ${isHealthy ? 'rgba(63, 185, 80, 0.3)' : 'rgba(248, 81, 73, 0.3)'}`,
          marginBottom: '1.5rem',
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: isHealthy ? '#3fb950' : '#f85149',
            display: 'inline-block',
          }} />
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 600,
            color: isHealthy ? '#3fb950' : '#f85149',
            letterSpacing: '0.02em',
          }}>
            {isHealthy ? 'ALL SYSTEMS OPERATIONAL' : 'DEGRADED'}
          </span>
        </div>

        {/* Details card */}
        <div style={{
          backgroundColor: '#0d1117',
          border: '1px solid #21262d',
          borderRadius: '10px',
          padding: '0 1.25rem',
        }}>
          <Row label="Framework" value="React Router v8" />
          <Row label="Version" value={`v${version}`} />
          <Row label="Environment" value={environment} />
          <Row label="Time" value={time} />
          <div style={{ borderBottom: 'none' }}>
            <Row label="Database" value={dbStatus} isStatus />
          </div>
        </div>
      </div>
    </main>
  )
}
