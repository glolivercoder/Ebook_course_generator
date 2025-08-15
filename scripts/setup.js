#!/usr/bin/env node

import { promises as fs } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

console.log('🚀 Configurando Gerador de E-books e Cursos...\n');

async function setup() {
  try {
    // 1. Criar diretórios necessários
    console.log('📁 Criando diretórios...');
    const dirs = [
      'data',
      'data/projects',
      'data/exports',
      'data/media',
      'data/temp'
    ];

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log(`   ✅ ${dir}`);
      } catch (error) {
        console.log(`   ⚠️  ${dir} (já existe)`);
      }
    }

    // 2. Verificar arquivo .env
    console.log('\n🔧 Verificando configuração...');
    try {
      await fs.access('.env');
      console.log('   ✅ Arquivo .env encontrado');
    } catch {
      console.log('   ⚠️  Arquivo .env não encontrado');
      console.log('   📋 Copiando .env.example para .env...');
      await fs.copyFile('.env.example', '.env');
      console.log('   ✅ Arquivo .env criado');
      console.log('   ⚠️  IMPORTANTE: Configure suas chaves de API no arquivo .env');
    }

    // 3. Verificar dependências
    console.log('\n📦 Verificando dependências...');
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      console.log(`   ✅ Projeto: ${packageJson.name} v${packageJson.version}`);
      
      // Verificar se node_modules existe
      try {
        await fs.access('node_modules');
        console.log('   ✅ Dependências instaladas');
      } catch {
        console.log('   ⚠️  Dependências não instaladas');
        console.log('   📦 Instalando dependências...');
        execSync('npm install', { stdio: 'inherit' });
        console.log('   ✅ Dependências instaladas com sucesso');
      }
    } catch (error) {
      console.error('   ❌ Erro ao verificar package.json:', error.message);
    }

    // 4. Criar arquivo de configuração inicial
    console.log('\n⚙️  Criando configuração inicial...');
    const initialConfig = {
      version: '1.0.0',
      setupDate: new Date().toISOString(),
      features: {
        ai: true,
        rag: false,
        crawl: false,
        export: true
      },
      defaults: {
        language: 'pt',
        maxTokens: 4000,
        temperature: 0.7,
        chapterCount: 8
      }
    };

    await fs.writeFile('data/config.json', JSON.stringify(initialConfig, null, 2));
    console.log('   ✅ Configuração inicial criada');

    // 5. Criar projeto de exemplo
    console.log('\n📚 Criando projeto de exemplo...');
    const exampleProject = {
      id: 'example-project',
      title: 'Projeto de Exemplo - Marketing Digital',
      type: 'ebook',
      description: 'Um e-book completo sobre estratégias de marketing digital para pequenas empresas.',
      audience: 'intermediate',
      estimatedDuration: '2-3 horas',
      chapters: [
        {
          id: 1,
          title: 'Introdução ao Marketing Digital',
          description: 'Conceitos fundamentais e importância do marketing digital.',
          topics: ['Definição', 'Benefícios', 'Tendências'],
          learningObjectives: ['Compreender o marketing digital', 'Identificar oportunidades'],
          status: 'pending',
          content: ''
        },
        {
          id: 2,
          title: 'Estratégias de Conteúdo',
          description: 'Como criar e distribuir conteúdo relevante.',
          topics: ['Content Marketing', 'SEO', 'Blog'],
          learningObjectives: ['Criar estratégia de conteúdo', 'Otimizar para SEO'],
          status: 'pending',
          content: ''
        }
      ],
      metadata: {
        createdAt: new Date().toISOString(),
        language: 'pt',
        tags: ['marketing', 'digital', 'exemplo']
      }
    };

    await fs.writeFile('data/projects/example-project.json', JSON.stringify(exampleProject, null, 2));
    console.log('   ✅ Projeto de exemplo criado');

    // 6. Verificar serviços externos (opcional)
    console.log('\n🔗 Verificando serviços externos...');
    
    // Agno
    try {
      const response = await fetch('http://localhost:8000/health');
      if (response.ok) {
        console.log('   ✅ Agno (RAG) disponível em localhost:8000');
      }
    } catch {
      console.log('   ⚠️  Agno (RAG) não disponível - configure se necessário');
    }

    // Crawl4AI
    try {
      const response = await fetch('http://localhost:8001/health');
      if (response.ok) {
        console.log('   ✅ Crawl4AI disponível em localhost:8001');
      }
    } catch {
      console.log('   ⚠️  Crawl4AI não disponível - configure se necessário');
    }

    // 7. Instruções finais
    console.log('\n🎉 Configuração concluída com sucesso!\n');
    console.log('📋 Próximos passos:');
    console.log('   1. Configure suas chaves de API no arquivo .env');
    console.log('   2. Inicie o servidor: npm run server');
    console.log('   3. Inicie o frontend: npm run dev');
    console.log('   4. Acesse: http://localhost:3000');
    console.log('\n💡 Dicas:');
    console.log('   • Use a aba "Configurações" para testar as conexões');
    console.log('   • Comece com o projeto de exemplo');
    console.log('   • Consulte o README.md para mais informações');
    console.log('\n🆘 Suporte: Consulte a documentação ou abra uma issue no GitHub');

  } catch (error) {
    console.error('\n❌ Erro durante a configuração:', error.message);
    process.exit(1);
  }
}

setup();