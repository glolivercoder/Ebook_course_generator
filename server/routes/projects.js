import express from 'express';
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const PROJECTS_DIR = './data/projects';

// Garantir que o diretório existe
async function ensureProjectsDir() {
  try {
    await fs.access(PROJECTS_DIR);
  } catch {
    await fs.mkdir(PROJECTS_DIR, { recursive: true });
  }
}

// Listar todos os projetos
router.get('/', async (req, res) => {
  try {
    await ensureProjectsDir();
    
    const files = await fs.readdir(PROJECTS_DIR);
    const projects = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const content = await fs.readFile(join(PROJECTS_DIR, file), 'utf8');
          const project = JSON.parse(content);
          projects.push({
            id: project.id,
            title: project.title,
            type: project.type,
            description: project.description,
            audience: project.audience,
            createdAt: project.metadata?.createdAt,
            chapterCount: project.chapters?.length || 0,
            status: project.status || 'draft'
          });
        } catch (error) {
          console.error(`Erro ao ler projeto ${file}:`, error);
        }
      }
    }
    
    res.json({ success: true, projects });
    
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    res.status(500).json({ 
      error: 'Falha ao listar projetos', 
      details: error.message 
    });
  }
});

// Obter projeto específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = join(PROJECTS_DIR, `${id}.json`);
    
    const content = await fs.readFile(filePath, 'utf8');
    const project = JSON.parse(content);
    
    res.json({ success: true, project });
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Projeto não encontrado' });
    } else {
      console.error('Erro ao obter projeto:', error);
      res.status(500).json({ 
        error: 'Falha ao obter projeto', 
        details: error.message 
      });
    }
  }
});

// Salvar projeto
router.post('/', async (req, res) => {
  try {
    await ensureProjectsDir();
    
    const project = req.body;
    
    // Gerar ID se não existir
    if (!project.id) {
      project.id = uuidv4();
    }
    
    // Adicionar timestamps
    const now = new Date().toISOString();
    if (!project.metadata) {
      project.metadata = {};
    }
    
    if (!project.metadata.createdAt) {
      project.metadata.createdAt = now;
    }
    project.metadata.updatedAt = now;
    
    // Salvar arquivo
    const filePath = join(PROJECTS_DIR, `${project.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(project, null, 2));
    
    res.json({ 
      success: true, 
      message: 'Projeto salvo com sucesso!',
      projectId: project.id 
    });
    
  } catch (error) {
    console.error('Erro ao salvar projeto:', error);
    res.status(500).json({ 
      error: 'Falha ao salvar projeto', 
      details: error.message 
    });
  }
});

// Atualizar projeto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const filePath = join(PROJECTS_DIR, `${id}.json`);
    
    // Ler projeto existente
    const content = await fs.readFile(filePath, 'utf8');
    const project = JSON.parse(content);
    
    // Aplicar atualizações
    Object.assign(project, updates);
    
    // Atualizar timestamp
    if (!project.metadata) {
      project.metadata = {};
    }
    project.metadata.updatedAt = new Date().toISOString();
    
    // Salvar
    await fs.writeFile(filePath, JSON.stringify(project, null, 2));
    
    res.json({ 
      success: true, 
      message: 'Projeto atualizado com sucesso!' 
    });
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Projeto não encontrado' });
    } else {
      console.error('Erro ao atualizar projeto:', error);
      res.status(500).json({ 
        error: 'Falha ao atualizar projeto', 
        details: error.message 
      });
    }
  }
});

// Deletar projeto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = join(PROJECTS_DIR, `${id}.json`);
    
    await fs.unlink(filePath);
    
    res.json({ 
      success: true, 
      message: 'Projeto deletado com sucesso!' 
    });
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Projeto não encontrado' });
    } else {
      console.error('Erro ao deletar projeto:', error);
      res.status(500).json({ 
        error: 'Falha ao deletar projeto', 
        details: error.message 
      });
    }
  }
});

// Gerar capítulo específico
router.post('/:id/chapters/:chapterId/generate', async (req, res) => {
  try {
    const { id, chapterId } = req.params;
    const { aiConfig, ragConfig } = req.body;
    
    // Carregar projeto
    const filePath = join(PROJECTS_DIR, `${id}.json`);
    const content = await fs.readFile(filePath, 'utf8');
    const project = JSON.parse(content);
    
    // Encontrar capítulo
    const chapter = project.chapters.find(c => c.id == chapterId);
    if (!chapter) {
      return res.status(404).json({ error: 'Capítulo não encontrado' });
    }
    
    // Obter contexto do RAG se configurado
    let ragContext = '';
    if (ragConfig?.endpoint) {
      try {
        const contextResponse = await fetch(`${ragConfig.endpoint}/api/rag/get-context`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...ragConfig,
            projectId: id,
            chapterId: chapterId
          })
        });
        
        if (contextResponse.ok) {
          const contextData = await contextResponse.json();
          ragContext = contextData.context.map(c => c.content).join('\n\n');
        }
      } catch (error) {
        console.warn('Erro ao obter contexto RAG:', error);
      }
    }
    
    // Gerar prompt para o capítulo
    const prompt = `Gere o conteúdo completo para o capítulo "${chapter.title}" do ${project.type} "${project.title}".

Informações do projeto:
- Tipo: ${project.type}
- Público-alvo: ${project.audience}
- Descrição geral: ${project.description}

Informações do capítulo:
- Título: ${chapter.title}
- Descrição: ${chapter.description}
- Tópicos: ${chapter.topics.join(', ')}
- Objetivos de aprendizagem: ${chapter.learningObjectives.join(', ')}

${ragContext ? `Contexto adicional do projeto:\n${ragContext}\n` : ''}

Gere um conteúdo detalhado e educativo que:
1. Seja adequado para o público-alvo (${project.audience})
2. Cubra todos os tópicos mencionados
3. Atinja os objetivos de aprendizagem
4. Tenha uma estrutura clara com subtítulos
5. Inclua exemplos práticos quando apropriado
6. Tenha entre 1500-3000 palavras

Formate o conteúdo em markdown e inclua:
- Introdução ao capítulo
- Desenvolvimento dos tópicos com subtítulos
- Exemplos práticos
- Resumo dos pontos principais
- Exercícios ou atividades (se apropriado)

Responda APENAS com o conteúdo do capítulo em markdown.`;

    // Chamar IA para gerar conteúdo
    const aiResponse = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...aiConfig,
        prompt,
        maxTokens: 6000
      })
    });
    
    if (!aiResponse.ok) {
      throw new Error('Falha na geração de conteúdo com IA');
    }
    
    const aiData = await aiResponse.json();
    
    // Atualizar capítulo
    chapter.content = aiData.content;
    chapter.status = 'completed';
    chapter.generatedAt = new Date().toISOString();
    
    // Salvar projeto atualizado
    project.metadata.updatedAt = new Date().toISOString();
    await fs.writeFile(filePath, JSON.stringify(project, null, 2));
    
    // Salvar no RAG se configurado
    if (ragConfig?.endpoint) {
      try {
        await fetch(`${ragConfig.endpoint}/api/rag/save-chapter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...ragConfig,
            projectId: id,
            chapter
          })
        });
      } catch (error) {
        console.warn('Erro ao salvar no RAG:', error);
      }
    }
    
    res.json({ 
      success: true, 
      chapter,
      message: 'Capítulo gerado com sucesso!' 
    });
    
  } catch (error) {
    console.error('Erro ao gerar capítulo:', error);
    res.status(500).json({ 
      error: 'Falha ao gerar capítulo', 
      details: error.message 
    });
  }
});

// Adicionar mídia a um capítulo
router.post('/:id/chapters/:chapterId/media', async (req, res) => {
  try {
    const { id, chapterId } = req.params;
    const { type, url, description, position } = req.body;
    
    // Carregar projeto
    const filePath = join(PROJECTS_DIR, `${id}.json`);
    const content = await fs.readFile(filePath, 'utf8');
    const project = JSON.parse(content);
    
    // Encontrar capítulo
    const chapter = project.chapters.find(c => c.id == chapterId);
    if (!chapter) {
      return res.status(404).json({ error: 'Capítulo não encontrado' });
    }
    
    // Adicionar mídia
    if (!chapter.media) {
      chapter.media = [];
    }
    
    const mediaItem = {
      id: uuidv4(),
      type, // 'image', 'chart', 'video', 'audio'
      url,
      description,
      position: position || chapter.media.length,
      addedAt: new Date().toISOString()
    };
    
    chapter.media.push(mediaItem);
    
    // Salvar projeto
    project.metadata.updatedAt = new Date().toISOString();
    await fs.writeFile(filePath, JSON.stringify(project, null, 2));
    
    res.json({ 
      success: true, 
      mediaItem,
      message: 'Mídia adicionada com sucesso!' 
    });
    
  } catch (error) {
    console.error('Erro ao adicionar mídia:', error);
    res.status(500).json({ 
      error: 'Falha ao adicionar mídia', 
      details: error.message 
    });
  }
});

export default router;