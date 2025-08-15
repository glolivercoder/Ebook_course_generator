#!/usr/bin/env node

import { spawn } from 'child_process';
import { promises as fs } from 'fs';

console.log('🚀 Iniciando ambiente de desenvolvimento...\n');

async function startDev() {
  try {
    // Verificar se a configuração foi feita
    try {
      await fs.access('.env');
      await fs.access('data');
    } catch {
      console.log('⚠️  Configuração não encontrada. Execute: npm run setup');
      process.exit(1);
    }

    console.log('🔧 Iniciando servidor backend...');
    const server = spawn('node', ['server/index.js'], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });

    console.log('🎨 Iniciando servidor frontend...');
    const frontend = spawn('npx', ['vite'], {
      stdio: 'inherit'
    });

    // Handlers para encerramento
    process.on('SIGINT', () => {
      console.log('\n🛑 Encerrando servidores...');
      server.kill();
      frontend.kill();
      process.exit(0);
    });

    server.on('error', (error) => {
      console.error('❌ Erro no servidor backend:', error);
    });

    frontend.on('error', (error) => {
      console.error('❌ Erro no servidor frontend:', error);
    });

    console.log('\n✅ Servidores iniciados!');
    console.log('📱 Frontend: http://localhost:3000');
    console.log('🔧 Backend: http://localhost:3001');
    console.log('\n💡 Pressione Ctrl+C para parar os servidores');

  } catch (error) {
    console.error('❌ Erro ao iniciar desenvolvimento:', error.message);
    process.exit(1);
  }
}

startDev();