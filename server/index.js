import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Importar rotas
import aiRoutes from './routes/ai.js';
import ragRoutes from './routes/rag.js';
import crawlRoutes from './routes/crawl.js';
import projectRoutes from './routes/projects.js';
import exportRoutes from './routes/export.js';
import editorRoutes from './routes/editor.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir arquivos estáticos
app.use(express.static(join(__dirname, '../dist')));

// Rotas da API
app.use('/api/ai', aiRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/crawl', crawlRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/editor', editorRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      ai: 'configured',
      rag: process.env.AGNO_ENDPOINT ? 'configured' : 'not configured',
      crawl: process.env.CRAWL4AI_ENDPOINT ? 'configured' : 'not configured'
    }
  });
});

// Fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Interface: http://localhost:${PORT}`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
});