const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 3000

// Static files directory - ROOT of the project (where index.html lives)
const STATIC_DIR = path.join(__dirname, '..')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
}

// In-memory storage
const apiRequests = []
const apiResponses = []
const apiUsers = {}

// Demo requests
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
    lon: 37.618
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
    lon: 37.625
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
    lon: 37.615
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
    lon: 37.63
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
    lon: 37.612
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
    lon: 37.62
  }
]

// Parse request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk.toString()
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (e) {
        resolve({})
      }
    })
    req.on('error', reject)
  })
}

// Handle API routes
async function handleApi(req, res, url) {
  const pathname = url.pathname
  const method = req.method

  // GET /api/requests
  if (pathname === '/api/requests' && method === 'GET') {
    const test = url.searchParams.get('test')
    const requests =
      test || apiRequests.length === 0 ? DEMO_REQUESTS : apiRequests
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ requests }))
    return
  }

  // POST /api/create_request
  if (pathname === '/api/create_request' && method === 'POST') {
    try {
      const data = await parseBody(req)
      const newRequest = {
        id: Date.now(),
        ...data,
        created: new Date().toISOString()
      }
      apiRequests.push(newRequest)
      res.writeHead(201, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ success: true, request_id: newRequest.id }))
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Invalid request' }))
    }
    return
  }

  // POST /api/help or /api/skip
  if (
    (pathname === '/api/help' || pathname === '/api/skip') &&
    method === 'POST'
  ) {
    try {
      const data = await parseBody(req)
      const action = pathname.split('/').pop()
      apiResponses.push({
        id: Date.now(),
        action,
        user_id: data.user_id,
        request_id: data.request_id,
        created: new Date().toISOString()
      })
      res.writeHead(201, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ success: true }))
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Invalid request' }))
    }
    return
  }

  // GET /api/profile
  if (pathname === '/api/profile' && method === 'GET') {
    const userId = url.searchParams.get('user_id')
    if (!apiUsers[userId]) {
      apiUsers[userId] = {
        user_id: userId,
        xp: 0,
        tokens: 0,
        helped: 0,
        streak: 7
      }
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(apiUsers[userId]))
    return
  }

  // 404 for other API routes
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const pathname = url.pathname

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    await handleApi(req, res, url)
    return
  }

  // Serve static files from STATIC_DIR (root project)
  let filePath = pathname === '/' ? '/index.html' : pathname
  filePath = path.join(STATIC_DIR, filePath.replace(/^\//, ''))

  // Security: prevent directory traversal
  if (!filePath.startsWith(STATIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/html' })
    res.end('<h1>403 Forbidden</h1>')
    return
  }

  const ext = path.extname(filePath)
  const contentType = MIME[ext] || 'application/octet-stream'

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // API routes: 404 JSON
      if (pathname.startsWith('/api/')) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Not found' }))
        return
      }
      // SPA fallback: only for HTML/JS/CSS requests
      if (ext === '' || ext === '.html' || ext === '.js' || ext === '.css') {
        const idx = path.join(STATIC_DIR, 'index.html')
        if (fs.existsSync(idx)) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
          res.end(fs.readFileSync(idx))
          return
        }
      }
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end('<h1>404 Not Found</h1>')
      return
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    })
    res.end(data)
  })
})

server.listen(PORT, () => {
  console.log(`Helpinder PWA server running on port ${PORT}`)
  console.log(`API: http://localhost:${PORT}/api/`)
  console.log(`Serving static files from: ${STATIC_DIR}`)
})
