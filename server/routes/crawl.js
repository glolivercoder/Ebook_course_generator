import express from 'express';
import axios from 'axios';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

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
        
        // Se falhar, usar Puppeteer como fallback
        if (!scraped) {
          scraped = await scrapeWithPuppeteer(url, useHeadless);
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

// Função para usar Puppeteer como fallback
async function scrapeWithPuppeteer(url, useHeadless = true) {
  let browser;
  
  try {
    browser = await puppeteer.launch({ 
      headless: useHeadless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Configurar user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // Navegar para a página
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Extrair conteúdo
    const content = await page.evaluate(() => {
      // Remover scripts e estilos
      const scripts = document.querySelectorAll('script, style, nav, footer, aside');
      scripts.forEach(el => el.remove());
      
      // Extrair texto principal
      const mainContent = document.querySelector('main, article, .content, #content, .post, .entry') || document.body;
      
      // Extrair links
      const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
        text: a.textContent.trim(),
        href: a.href
      })).filter(link => link.text && link.href);
      
      // Extrair imagens
      const images = Array.from(document.querySelectorAll('img[src]')).map(img => ({
        src: img.src,
        alt: img.alt || '',
        title: img.title || ''
      }));
      
      // Extrair headings
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
        level: parseInt(h.tagName.charAt(1)),
        text: h.textContent.trim()
      }));
      
      return {
        title: document.title,
        text: mainContent.textContent.trim(),
        html: mainContent.innerHTML,
        links: links.slice(0, 20), // Limitar links
        images: images.slice(0, 10), // Limitar imagens
        headings,
        meta: {
          description: document.querySelector('meta[name="description"]')?.content || '',
          keywords: document.querySelector('meta[name="keywords"]')?.content || '',
          author: document.querySelector('meta[name="author"]')?.content || ''
        }
      };
    });
    
    return content;
    
  } catch (error) {
    console.error('Erro no Puppeteer:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Extrair conteúdo específico de uma URL
router.post('/extract', async (req, res) => {
  try {
    const { url, selectors = {} } = req.body;
    
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    const extracted = await page.evaluate((selectors) => {
      const result = {};
      
      for (const [key, selector] of Object.entries(selectors)) {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 1) {
          result[key] = elements[0].textContent.trim();
        } else if (elements.length > 1) {
          result[key] = Array.from(elements).map(el => el.textContent.trim());
        } else {
          result[key] = null;
        }
      }
      
      return result;
    }, selectors);
    
    await browser.close();
    
    res.json({ success: true, data: extracted });
    
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