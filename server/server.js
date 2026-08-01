const http = require('http')
const fs = require('fs')
const path = require('path')
const os = require('os')

const PORT = process.env.PORT || 3000
const HOST = '0.0.0.0'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
}

// --- In-memory storage ---
const apiRequests = []
const apiResponses = []
const apiUsers = {}

// --- Demo requests ---
const DEMO_REQUESTS = [
  {
    id: 1,
    category: '🍞 Продукты',
    urgency: '⚡ Прямо сейчас',
    description: 'Бабушке 78 лет, хлеб и молоко, 3 этаж без лифта',
    author: 'Елена К.',
    created: new Date().toISOString(),
    dist: '0.8 km',
    lat: 55.756,
    lon: 37.618,
  },
  {
    id: 2,
    category: '🐕 Выгул',
    urgency: '🕐 Сегодня',
    description: 'Выгулять лабрадора Ричи, 30 минут, парк рядом',
    author: 'Алексей',
    created: new Date().toISOString(),
    dist: '1.2 km',
    lat: 55.752,
    lon: 37.625,
  },
  {
    id: 3,
    category: '💊 Аптека',
    urgency: '📅 На неделе',
    description: 'Купить лекарства по списку, рецепт прилагается',
    author: 'Мария П.',
    created: new Date().toISOString(),
    dist: '0.5 km',
    lat: 55.76,
    lon: 37.615,
  },
  {
    id: 4,
    category: '💻 IT-помощь',
    urgency: '🕐 Сегодня',
    description: 'Настроить роутер, не могу подключить принтер',
    author: 'Иван',
    created: new Date().toISOString(),
    dist: '2.1 km',
    lat: 55.758,
    lon: 37.63,
  },
  {
    id: 5,
    category: '📦 Перенести',
    urgency: '📅 На неделе',
    description: 'Помочь с переездом: 2 коробки и стул, 2 этаж',
    author: 'Ольга',
    created: new Date().toISOString(),
    dist: '0.3 km',
    lat: 55.754,
    lon: 37.612,
  },
  {
    id: 6,
    category: '👴 Пожилому',
    urgency: '🕐 Сегодня',
    description: 'Посидеть с дедушкой 2 часа, почитать газету',
    author: 'Анна В.',
    created: new Date().toISOString(),
    dist: '1.5 km',
    lat: 55.762,
    lon: 37.62,
  },
]

// --- Valid categories for input validation ---
const VALID_CATEGORIES = [
  '🍞 Продукты',
  '💊 Аптека',
  '🧹 Уборка',
  '🐕 Выгул',
  '🛠 Ремонт',
  '💻 IT-помощь',
  '📦 Перенести',
  '👴 Пожилому',
  '🚗 Подвезти',
  '📝 Документы',
  '🤝 Другое',
]

const VALID_URGENCIES = ['⚡ Прямо сейчас', '🕐 Сегодня', '📅 На неделе']

// --- Helpers ---

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(data))
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    let tooLarge = false
    req.on('data', (chunk) => {
      body += chunk.toString()
      // Limit body size to 1 MB
      if (body.length > 1e6) {
        tooLarge = true
        req.destroy()
      }
    })
    req.on('end', () => {
      if (tooLarge) return resolve(null)
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        resolve(null)
      }
    })
    req.on('error', reject)
  })
}

// Get local network IPs for display
function getLocalIPs() {
  const interfaces = os.networkInterfaces()
  const ips = []
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4
      if (!iface.internal && iface.family === 'IPv4') {
        ips.push(iface.address)
      }
    }
  }
  return ips
}

// --- API routes ---

async function handleApi(req, res, url) {
  const pathname = url.pathname
  const method = req.method

  // GET /api/requests — list requests (demo + user-created)
  if (pathname === '/api/requests' && method === 'GET') {
    const test = url.searchParams.get('test')
    // If test=1 or no user requests yet, merge demo with user-created
    const base = test || apiRequests.length === 0 ? [...DEMO_REQUESTS] : []
    const all = [...base, ...apiRequests]
    sendJSON(res, 200, { requests: all })
    return
  }

  // POST /api/create_request — create a new help request
  if (pathname === '/api/create_request' && method === 'POST') {
    const data = await parseBody(req)
    if (!data) {
      sendJSON(res, 413, { error: 'Request body too large' })
      return
    }

    // Input validation
    if (!data.category || !VALID_CATEGORIES.includes(data.category)) {
      sendJSON(res, 400, { error: 'Invalid or missing category' })
      return
    }
    if (!data.urgency || !VALID_URGENCIES.includes(data.urgency)) {
      sendJSON(res, 400, { error: 'Invalid or missing urgency' })
      return
    }
    if (!data.description || typeof data.description !== 'string' || data.description.trim().length < 5) {
      sendJSON(res, 400, { error: 'Description must be at least 5 characters' })
      return
    }

    const newRequest = {
      id: Date.now(),
      category: data.category,
      urgency: data.urgency,
      description: data.description.trim().slice(0, 500),
      author: data.author || 'Аноним',
      user_id: data.user_id || null,
      created: new Date().toISOString(),
      dist: data.dist || '—',
      lat: data.lat || null,
      lon: data.lon || null,
    }
    apiRequests.push(newRequest)
    sendJSON(res, 201, { success: true, request_id: newRequest.id })
    return
  }

  // POST /api/help or /api/skip — record user response
  if ((pathname === '/api/help' || pathname === '/api/skip') && method === 'POST') {
    const data = await parseBody(req)
    if (!data) {
      sendJSON(res, 413, { error: 'Request body too large' })
      return
    }
    if (!data.user_id || !data.request_id) {
      sendJSON(res, 400, { error: 'Missing user_id or request_id' })
      return
    }

    const action = pathname.split('/').pop()
    apiResponses.push({
      id: Date.now(),
      action,
      user_id: data.user_id,
      request_id: data.request_id,
      created: new Date().toISOString(),
    })

    // Update user stats on help
    if (action === 'help' && apiUsers[data.user_id]) {
      apiUsers[data.user_id].xp += 10
      apiUsers[data.user_id].tokens += 5
      apiUsers[data.user_id].helped += 1
    }

    sendJSON(res, 201, { success: true })
    return
  }

  // GET /api/profile — get or create user profile
  if (pathname === '/api/profile' && method === 'GET') {
    const userId = url.searchParams.get('user_id')
    if (!userId) {
      sendJSON(res, 400, { error: 'Missing user_id parameter' })
      return
    }
    if (!apiUsers[userId]) {
      apiUsers[userId] = {
        user_id: userId,
        xp: 0,
        tokens: 0,
        helped: 0,
        streak: 7,
      }
    }
    sendJSON(res, 200, apiUsers[userId])
    return
  }

  // 404 for unknown API routes
  sendJSON(res, 404, { error: 'Not found' })
}

// --- HTTP server ---

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const pathname = url.pathname

  // CORS headers for local network access
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  // API routes
  if (pathname.startsWith('/api/')) {
    await handleApi(req, res, url)
    return
  }

  // Security: prevent path traversal
  const requestedPath = pathname === '/' ? '/index.html' : pathname
  const filePath = path.join(__dirname, requestedPath)
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end('<h1>403 Forbidden</h1>')
    return
  }

  const ext = path.extname(filePath)
  const contentType = MIME[ext] || 'application/octet-stream'

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end('<h1>404 Not Found</h1>')
      return
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    })
    res.end(data)
  })
})

server.listen(PORT, HOST, () => {
  const ips = getLocalIPs()
  console.log('')
  console.log('  ┌──────────────────────────────────────────────┐')
  console.log('  │           Helpinder PWA Server               │')
  console.log('  └──────────────────────────────────────────────┘')
  console.log('')
  console.log(`  📦 Локально:       http://localhost:${PORT}`)
  ips.forEach((ip) => {
    console.log(`  🌐 В сети:         http://${ip}:${PORT}`)
  })
  console.log(`  🔌 API:            http://localhost:${PORT}/api/`)
  console.log('')
  console.log('  💡 Поделись ссылкой "В сети" с другими устройствами')
  console.log('')
})
