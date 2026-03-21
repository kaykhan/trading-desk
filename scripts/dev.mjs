import net from 'node:net'
import path from 'node:path'
import process from 'node:process'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const childProcesses = new Set()

function prefixLines(chunk, label) {
  const text = chunk.toString()
  const lines = text.split(/\r?\n/)

  return lines
    .map((line, index) => {
      if (line.length === 0 && index === lines.length - 1) {
        return ''
      }

      return `[${label}] ${line}`
    })
    .join('\n')
}

function pipeOutput(stream, targetStream, label) {
  if (!stream) {
    return
  }

  stream.on('data', (chunk) => {
    targetStream.write(`${prefixLines(chunk, label)}\n`)
  })
}

function spawnLabeledProcess(label, command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: repoRoot,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  })

  childProcesses.add(child)
  pipeOutput(child.stdout, process.stdout, label)
  pipeOutput(child.stderr, process.stderr, label)

  child.on('exit', () => {
    childProcesses.delete(child)
  })

  return child
}

function terminateChildren() {
  for (const child of childProcesses) {
    if (!child.killed) {
      child.kill('SIGTERM')
    }
  }
}

async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer()

    server.once('error', () => {
      resolve(false)
    })

    server.once('listening', () => {
      server.close(() => resolve(true))
    })

    server.listen(port, '127.0.0.1')
  })
}

async function findAvailablePort(startPort) {
  let port = startPort

  while (!(await isPortAvailable(port))) {
    port += 1
  }

  return port
}

function waitForExit(child, label) {
  return new Promise((resolve, reject) => {
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`${label} exited with code ${code ?? 'null'}${signal ? ` (${signal})` : ''}`))
    })
  })
}

async function main() {
  const port = await findAvailablePort(5173)
  const rendererUrl = `http://127.0.0.1:${port}`

  if (port !== 5173) {
    process.stdout.write(`[dev] Port 5173 is busy, using ${port} instead.\n`)
  }

  const renderer = spawnLabeledProcess('dev:renderer', npxCommand, ['vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort'])
  const electronBuild = spawnLabeledProcess('dev:electron:build', npmCommand, ['run', 'dev:electron:build'])

  let shuttingDown = false

  const shutdown = (exitCode = 0) => {
    if (shuttingDown) {
      return
    }

    shuttingDown = true
    terminateChildren()
    process.exitCode = exitCode
  }

  process.on('SIGINT', () => shutdown(0))
  process.on('SIGTERM', () => shutdown(0))

  const onCriticalExit = (label) => (code, signal) => {
    if (shuttingDown) {
      return
    }

    process.stderr.write(`[dev] ${label} stopped unexpectedly (${signal ?? code ?? 'unknown'}).\n`)
    shutdown(code ?? 1)
  }

  renderer.on('exit', onCriticalExit('dev:renderer'))
  electronBuild.on('exit', onCriticalExit('dev:electron:build'))

  try {
    const waitOn = spawnLabeledProcess('dev:wait-on', npxCommand, ['wait-on', `tcp:${port}`, 'dist-electron/electron/main.js'])
    await waitForExit(waitOn, 'dev:wait-on')

    const electron = spawnLabeledProcess('dev:electron', npxCommand, ['electron', '.'], {
      env: {
        ...process.env,
        ELECTRON_RENDERER_URL: rendererUrl,
      },
    })

    electron.on('exit', onCriticalExit('dev:electron'))
    await waitForExit(electron, 'dev:electron')
    shutdown(0)
  } catch (error) {
    process.stderr.write(`[dev] ${error instanceof Error ? error.message : String(error)}\n`)
    shutdown(1)
  }
}

main().catch((error) => {
  process.stderr.write(`[dev] ${error instanceof Error ? error.stack ?? error.message : String(error)}\n`)
  terminateChildren()
  process.exit(1)
})
