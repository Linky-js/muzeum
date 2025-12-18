import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuid } from 'uuid'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())

// Путь к базе
const DB_FILE = path.join(__dirname, 'db', 'users.json')

// CORS middleware — добавляем обработку OPTIONS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Если это preflight-запрос — сразу ответить 200
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }

  next()
})

// Сохранение результата
app.post('/api/save', (req, res) => {
  const data = req.body
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'))

  const record = {
    id: uuid(),
    timestamp: Date.now(),
    ...data,
  }

  db.push(record)

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
  res.json({ ok: true })
})

// Чтение всего
app.get('/api/all', (req, res) => {
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'))
  res.json(db)
})
app.get('/api/statistics/attitude', (req, res) => {
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'))

  if (db.length === 0) {
    return res.json({})
  }

  const counts = {}
  db.forEach((item) => {
    const att = item.attitude?.name || 'Неизвестно'
    counts[att] = (counts[att] || 0) + 1
  })

  // Считаем проценты
  const total = db.length
  const percentages = {}
  for (const key in counts) {
    percentages[key] = Math.round((counts[key] / total) * 100)
  }

  res.json(percentages)
})
app.get('/api/statistics/sphere', (req, res) => {
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'))

  if (db.length === 0) {
    return res.json({})
  }

  const counts = {}
  db.forEach((item) => {
    const sphere = item.sphere || 'Неизвестно'
    counts[sphere] = (counts[sphere] || 0) + 1
  })

  // Считаем проценты
  const total = db.length
  const percentages = {}
  for (const key in counts) {
    percentages[key] = Math.round((counts[key] / total) * 100)
  }

  res.json(percentages)
})
app.get('/api/statistics/hero', (req, res) => {
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'))

  if (db.length === 0) {
    return res.json({})
  }

  const counts = {}
  db.forEach((item) => {
    const hero = item.ai.name || 'Неизвестно'
    counts[hero] = (counts[hero] || 0) + 1
  })

  // Считаем проценты
  const total = db.length
  const percentages = {}
  for (const key in counts) {
    percentages[key] = Math.round((counts[key] / total) * 100)
  }

  res.json(percentages)
})

app.listen(3001, () => console.log('DB server running on :3001'))
