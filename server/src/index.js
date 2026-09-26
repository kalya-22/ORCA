import 'dotenv/config';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { api } from './api.js';
import { Simulator } from './simulator.js';

const PORT = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../../dist');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', api);

// Serve static frontend build if dist folder exists
app.use(express.static(distPath));

// Fallback to index.html for client-side SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }, // dev-friendly; tighten in production
});

const simulator = new Simulator(io);
simulator.start();

io.on('connection', (socket) => {
  console.log('[socket] client connected', socket.id);
  socket.on('disconnect', () => console.log('[socket] client disconnected', socket.id));
});

server.listen(PORT, () => {
  console.log(`ORCA Marine Platform listening on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

