import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Testar conexão com Agno
router.post('/test', async (req, res) => {
  try {
    const { endpoint, apiKey } = req.body;
    
    const response = await axios.get(`${endpoint}/health`, {
      headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}
    });
    
    res.json({ 
      success: true, 
      message: 'Conexão com Agno estabelecida!',
      status: response.data 
    });
    
  } catch (error) {
    console.error('Erro no teste do Agno:', error);
    res.status(500).json({ 
      error: 'Falha na conexão com Agno', 
      details: error.message 
    });
  }
});

// Inicializar índice RAG
router.post('/initialize', async (req, res) => {
  try {
    const { endpoint, apiKey, indexName } = req.body;
    
    // Criar índice se não existir
    const createIndexResponse = await axios.post(`${endpoint}/indices`, {
      name: indexName,
      description: 'Índice para projetos de e-books e cursos',
      settings: {
        embedding_model: 'sentence-transformers/all-MiniLM-L6-v2',
        chunk_size: 1000,
        chunk_overlap: 200
      }
    }, {
      headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}
    });
    
    res.json({ 
      success: true, 
      message: 'Índice RAG inicializado com sucesso!',
      index: createIndexResponse.data 
    });
    
  } catch (error) {
    // Se o índice já existir, não é um erro
    if (error.response?.status === 409) {
      res.json({ 
        success: true, 
        message: 'Índice RAG já existe e está pronto para uso!' 
      });
    } else {
      console.error('Erro na inicialização do RAG:', error);
      res.status(500).json({ 
        error: 'Falha na inicialização do RAG', 
        details: error.message 
      });
    }
  }
});

// Salvar projeto no RAG
router.post('/save-project', async (req, res) => {
  try {
    const { endpoint, apiKey, indexName, project } = req.body;
    
    const documentId = `project_${uuidv4()}`;
    
    const response = await axios.post(`${endpoint}/documents`, {
      index: indexName,
      document_id: documentId,
      content: JSON.stringify(project, null, 2),
      metadata: {
        type: 'project',
        title: project.title,
        topic: project.topic || '',
        audience: project.audience || '',
        created_at: new Date().toISOString(),
        chapter_count: project.chapters?.length || 0
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
      }
    });
    
    res.json({ 
      success: true, 
      documentId,
      message: 'Projeto salvo no RAG com sucesso!' 
    });
    
  } catch (error) {
    console.error('Erro ao salvar no RAG:', error);
    res.status(500).json({ 
      error: 'Falha ao salvar no RAG', 
      details: error.message 
    });
  }
});

// Buscar no RAG
router.post('/search', async (req, res) => {
  try {
    const { endpoint, apiKey, indexName, query, limit = 5 } = req.body;
    
    const response = await axios.post(`${endpoint}/search`, {
      index: indexName,
      query,
      limit,
      include_metadata: true
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
      }
    });
    
    res.json({ 
      success: true, 
      results: response.data.results 
    });
    
  } catch (error) {
    console.error('Erro na busca RAG:', error);
    res.status(500).json({ 
      error: 'Falha na busca RAG', 
      details: error.message 
    });
  }
});

// Salvar capítulo no RAG
router.post('/save-chapter', async (req, res) => {
  try {
    const { endpoint, apiKey, indexName, projectId, chapter } = req.body;
    
    const documentId = `chapter_${projectId}_${chapter.id}`;
    
    const response = await axios.post(`${endpoint}/documents`, {
      index: indexName,
      document_id: documentId,
      content: `Capítulo ${chapter.id}: ${chapter.title}\n\n${chapter.description}\n\nConteúdo:\n${chapter.content || 'Conteúdo não gerado ainda'}`,
      metadata: {
        type: 'chapter',
        project_id: projectId,
        chapter_id: chapter.id,
        title: chapter.title,
        status: chapter.status,
        created_at: new Date().toISOString()
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
      }
    });
    
    res.json({ 
      success: true, 
      documentId,
      message: 'Capítulo salvo no RAG com sucesso!' 
    });
    
  } catch (error) {
    console.error('Erro ao salvar capítulo no RAG:', error);
    res.status(500).json({ 
      error: 'Falha ao salvar capítulo no RAG', 
      details: error.message 
    });
  }
});

// Obter contexto do RAG para geração de capítulo
router.post('/get-context', async (req, res) => {
  try {
    const { endpoint, apiKey, indexName, projectId, chapterId } = req.body;
    
    // Buscar contexto relacionado ao projeto e capítulo
    const searchQueries = [
      `project_id:${projectId}`,
      `chapter_id:${chapterId}`,
      `type:project`
    ];
    
    const contextResults = [];
    
    for (const query of searchQueries) {
      try {
        const response = await axios.post(`${endpoint}/search`, {
          index: indexName,
          query,
          limit: 3,
          include_metadata: true
        }, {
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
          }
        });
        
        contextResults.push(...response.data.results);
      } catch (searchError) {
        console.warn('Erro em busca específica:', searchError.message);
      }
    }
    
    res.json({ 
      success: true, 
      context: contextResults 
    });
    
  } catch (error) {
    console.error('Erro ao obter contexto do RAG:', error);
    res.status(500).json({ 
      error: 'Falha ao obter contexto do RAG', 
      details: error.message 
    });
  }
});

export default router;