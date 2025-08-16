import express from 'express';
import axios from 'axios';

const router = express.Router();

// Testar conexão com Crawl4AI
router.post('/test', async (req, res) => {
  try {
    const { endpoint } = req.body;
    
    const response = await axios.get(`${endpoint}/health`);
    
    res.json({ 
      success: true, 
      message: 'Conexão com Crawl4AI estabelecida!',
      status: response.data 
    });
    
  } catch (error) {
    console.error('Erro no teste do Crawl4AI:', error);
    res.status(500).json({ 
      error: 'Falha na conexão com Crawl4AI', 
      details: error.message 
    });
  }
});

// Realizar web scraping
router.post('/scrape', async (req, res) => {
  try {
    const { urls, depth = 2, delay = 1000, useHeadless = true } = req.body;
    
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: 'URLs devem ser fornecidas como array' });
    }
    
    const results = [];
    
    for (const url of urls) {
      try {
        console.log(`Fazendo scraping de: ${url}`);
        
        // Tentar usar Crawl4AI primeiro
        let scraped = await scrapeWithCrawl4AI(url, depth, delay);
        
        // Se falhar, usar axios como fallback
        if (!scraped) {
          scraped = await scrapeWithAxios(url);
        }
        
        if (scraped) {
          results.push({
            url,
            success: true,
            data: scraped
          });
        } else {
          results.push({
            url,
            success: false,
            error: 'Falha no scraping'
          });
        }
        
        // Delay entre requests
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
      } catch (error) {
        console.error(`Erro no scraping de ${url}:`, error);
        results.push({
          url,
          success: false,
          error: error.message
        });
      }
    }
    
    res.json({ 
      success: true, 
      results,
      summary: {
        total: urls.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
    
  } catch (error) {
    console.error('Erro geral no scraping:', error);
    res.status(500).json({ 
      error: 'Falha no web scraping', 
      details: error.message 
    });
  }
});

// Função para usar Crawl4AI
async function scrapeWithCrawl4AI(url, depth, delay) {
  try {
    const crawl4aiEndpoint = process.env.CRAWL4AI_ENDPOINT || 'http://localhost:8001';
    
    const response = await axios.post(`${crawl4aiEndpoint}/crawl`, {
      url,
      depth,
      delay,
      extract_content: true,
      extract_links: true,
      extract_images: true
    }, {
      timeout: 30000
    });
    
    return response.data;
    
  } catch (error) {
    console.warn('Crawl4AI não disponível, usando fallback:', error.message);
    return null;
  }
}

// Função para usar axios como fallback
async function scrapeWithAxios(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    });
    
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    // Usar cheerio para parsing básico
    const cheerio = await import('cheerio');
    const $ = cheerio.load(response.data);
    
    // Remover scripts e estilos
    $('script, style, nav, footer, aside').remove();
    
    // Extrair conteúdo
    const mainContent = $('main, article, .content, #content, .post, .entry').first();
    const contentElement = mainContent.length ? mainContent : $('body');
    
    // Extrair links
    const links = [];
    $('a[href]').each((i, el) => {
      const $el = $(el);
      const href = $el.attr('href');
      const text = $el.text().trim();
      if (href && text && links.length < 20) {
        links.push({ text, href });
      }
    });
    
    // Extrair imagens
    const images = [];
    $('img[src]').each((i, el) => {
      const $el = $(el);
      if (images.length < 10) {
        images.push({
          src: $el.attr('src'),
          alt: $el.attr('alt') || '',
          title: $el.attr('title') || ''
        });
      }
    });
    
    // Extrair headings
    const headings = [];
    $('h1, h2, h3, h4, h5, h6').each((i, el) => {
      const $el = $(el);
      headings.push({
        level: parseInt(el.tagName.charAt(1)),
        text: $el.text().trim()
      });
    });
    
    return {
      title: $('title').text() || '',
      text: contentElement.text().trim(),
      html: contentElement.html() || '',
      links,
      images,
      headings,
      meta: {
        description: $('meta[name="description"]').attr('content') || '',
        keywords: $('meta[name="keywords"]').attr('content') || '',
        author: $('meta[name="author"]').attr('content') || ''
      }
    };
    
  } catch (error) {
    console.error('Erro no scraping com axios:', error);
    throw error;
  }
}

// Extrair conteúdo específico de uma URL
router.post('/extract', async (req, res) => {
  try {
    const { url, selectors = {} } = req.body;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const cheerio = await import('cheerio');
    const $ = cheerio.load(response.data);
    
    const result = {};
    
    for (const [key, selector] of Object.entries(selectors)) {
      const elements = $(selector);
      if (elements.length === 1) {
        result[key] = elements.text().trim();
      } else if (elements.length > 1) {
        result[key] = elements.map((i, el) => $(el).text().trim()).get();
      } else {
        result[key] = null;
      }
    }
    
    res.json({ success: true, data: result });
    
  } catch (error) {
    console.error('Erro na extração:', error);
    res.status(500).json({ 
      error: 'Falha na extração de conteúdo', 
      details: error.message 
    });
  }
});

// Analisar estrutura de uma página
router.post('/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    
    const response = await axios.get(url);
    const cheerio = await import('cheerio');
    const $ = cheerio.load(response.data);
    
    const analysis = {
      title: $('title').text(),
      headings: {
        h1: $('h1').length,
        h2: $('h2').length,
        h3: $('h3').length,
        h4: $('h4').length,
        h5: $('h5').length,
        h6: $('h6').length
      },
      paragraphs: $('p').length,
      links: $('a').length,
      images: $('img').length,
      lists: $('ul, ol').length,
      tables: $('table').length,
      forms: $('form').length,
      wordCount: $('body').text().split(/\s+/).length,
      meta: {
        description: $('meta[name="description"]').attr('content') || '',
        keywords: $('meta[name="keywords"]').attr('content') || '',
        author: $('meta[name="author"]').attr('content') || '',
        viewport: $('meta[name="viewport"]').attr('content') || ''
      },
      structure: []
    };
    
    // Analisar estrutura hierárquica
    $('h1, h2, h3, h4, h5, h6').each((i, el) => {
      analysis.structure.push({
        level: parseInt(el.tagName.charAt(1)),
        text: $(el).text().trim(),
        id: $(el).attr('id') || ''
      });
    });
    
    res.json({ success: true, analysis });
    
  } catch (error) {
    console.error('Erro na análise:', error);
    res.status(500).json({ 
      error: 'Falha na análise da página', 
      details: error.message 
    });
  }
});

export default router;