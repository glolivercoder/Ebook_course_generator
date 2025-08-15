import express from 'express';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

const router = express.Router();

// Configurar clientes de IA
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Testar conexão com provedor de IA
router.post('/test', async (req, res) => {
  try {
    const { provider, apiKey, model } = req.body;
    
    let result;
    
    switch (provider) {
      case 'openai':
        const openaiClient = new OpenAI({ apiKey });
        result = await openaiClient.chat.completions.create({
          model: model || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test connection' }],
          max_tokens: 10
        });
        break;
        
      case 'anthropic':
        const anthropicClient = new Anthropic({ apiKey });
        result = await anthropicClient.messages.create({
          model: model || 'claude-3-sonnet-20240229',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Test connection' }]
        });
        break;
        
      case 'openrouter':
        result = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
          model: model || 'openai/gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test connection' }],
          max_tokens: 10
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        break;
        
      case 'google':
        result = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
          contents: [{
            parts: [{ text: 'Test connection' }]
          }]
        });
        break;
        
      default:
        return res.status(400).json({ error: 'Provedor não suportado' });
    }
    
    res.json({ success: true, message: 'Conexão testada com sucesso!' });
    
  } catch (error) {
    console.error('Erro no teste de IA:', error);
    res.status(500).json({ 
      error: 'Falha no teste de conexão', 
      details: error.message 
    });
  }
});

// Gerar conteúdo com IA
router.post('/generate', async (req, res) => {
  try {
    const { 
      provider, 
      apiKey, 
      model, 
      prompt, 
      maxTokens = 4000, 
      temperature = 0.7 
    } = req.body;
    
    let response;
    
    switch (provider) {
      case 'openai':
        const openaiClient = new OpenAI({ apiKey });
        const openaiResponse = await openaiClient.chat.completions.create({
          model: model || 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          temperature
        });
        response = openaiResponse.choices[0].message.content;
        break;
        
      case 'anthropic':
        const anthropicClient = new Anthropic({ apiKey });
        const anthropicResponse = await anthropicClient.messages.create({
          model: model || 'claude-3-sonnet-20240229',
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }],
          temperature
        });
        response = anthropicResponse.content[0].text;
        break;
        
      case 'openrouter':
        const orResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
          model: model || 'openai/gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          temperature
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        response = orResponse.data.choices[0].message.content;
        break;
        
      case 'google':
        const googleResponse = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens
          }
        });
        response = googleResponse.data.candidates[0].content.parts[0].text;
        break;
        
      default:
        return res.status(400).json({ error: 'Provedor não suportado' });
    }
    
    res.json({ success: true, content: response });
    
  } catch (error) {
    console.error('Erro na geração de conteúdo:', error);
    res.status(500).json({ 
      error: 'Falha na geração de conteúdo', 
      details: error.message 
    });
  }
});

// Gerar estrutura de projeto
router.post('/generate-outline', async (req, res) => {
  try {
    const { 
      title, 
      type, 
      topic, 
      description, 
      audience, 
      chapterCount, 
      researchData,
      aiConfig 
    } = req.body;
    
    const prompt = `Crie uma estrutura detalhada para um ${type} sobre "${topic}".

Detalhes do projeto:
- Título: ${title}
- Descrição: ${description}
- Público-alvo: ${audience}
- Número de capítulos: ${chapterCount}

${researchData ? `Dados de pesquisa coletados:\n${JSON.stringify(researchData, null, 2)}` : ''}

Gere uma estrutura JSON com:
1. Informações gerais do projeto
2. Lista de capítulos com título, descrição, tópicos principais e objetivos de aprendizagem
3. Sugestões de imagens/gráficos para cada capítulo
4. Pontos de interação para cada capítulo

Formato esperado:
{
  "title": "${title}",
  "type": "${type}",
  "description": "${description}",
  "audience": "${audience}",
  "estimatedDuration": "tempo estimado",
  "chapters": [
    {
      "id": 1,
      "title": "Título do Capítulo",
      "description": "Descrição detalhada do capítulo",
      "topics": ["tópico1", "tópico2", "tópico3"],
      "learningObjectives": ["objetivo1", "objetivo2"],
      "estimatedTime": "30 minutos",
      "suggestedMedia": {
        "images": ["descrição da imagem necessária"],
        "charts": ["tipo de gráfico sugerido"],
        "interactions": ["tipo de interação sugerida"]
      },
      "status": "pending",
      "content": ""
    }
  ],
  "metadata": {
    "createdAt": "${new Date().toISOString()}",
    "language": "pt",
    "difficulty": "${audience}",
    "tags": ["tag1", "tag2"]
  }
}

Responda APENAS com o JSON válido, sem texto adicional.`;

    const aiResponse = await axios.post('/api/ai/generate', {
      ...aiConfig,
      prompt,
      maxTokens: 6000
    });
    
    const outline = JSON.parse(aiResponse.data.content);
    
    res.json({ success: true, outline });
    
  } catch (error) {
    console.error('Erro na geração da estrutura:', error);
    res.status(500).json({ 
      error: 'Falha na geração da estrutura', 
      details: error.message 
    });
  }
});

export default router;