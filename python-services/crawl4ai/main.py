#!/usr/bin/env python3
"""
Crawl4AI Service - Sistema de Web Scraping Inteligente
Compatível com o Gerador de E-books e Cursos
"""

import os
import sys
import asyncio
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import time

import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, HttpUrl
import requests
from bs4 import BeautifulSoup
import aiohttp
import asyncio

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Modelos Pydantic
class CrawlRequest(BaseModel):
    url: HttpUrl
    depth: int = Field(default=1, ge=1, le=5)
    delay: int = Field(default=1000, ge=500, le=10000)  # milliseconds
    extract_content: bool = True
    extract_links: bool = True
    extract_images: bool = True
    follow_redirects: bool = True
    timeout: int = Field(default=30, ge=5, le=120)  # seconds

class CrawlResponse(BaseModel):
    url: str
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: str
    processing_time: float

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str
    services: Dict[str, str]

class ExtractRequest(BaseModel):
    url: HttpUrl
    selectors: Dict[str, str] = {}

class AnalyzeRequest(BaseModel):
    url: HttpUrl

# Sistema de Web Scraping
class Crawl4AI:
    def __init__(self):
        self.session = None
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ]
        
    async def initialize(self):
        """Inicializar o sistema de scraping"""
        try:
            # Verificar dependências disponíveis
            try:
                import aiohttp
                # Criar sessão HTTP
                connector = aiohttp.TCPConnector(limit=100, limit_per_host=10)
                timeout = aiohttp.ClientTimeout(total=30)
                self.session = aiohttp.ClientSession(
                    connector=connector,
                    timeout=timeout,
                    headers={'User-Agent': self.user_agents[0]}
                )
                logger.info("✅ Crawl4AI inicializado com aiohttp")
            except ImportError:
                logger.warning("⚠️ aiohttp não disponível - usando requests como fallback")
                self.session = None
            
            # Verificar Playwright
            try:
                from playwright.async_api import async_playwright
                logger.info("✅ Playwright disponível")
            except ImportError:
                logger.warning("⚠️ Playwright não disponível - usando BeautifulSoup apenas")
            
            logger.info("Crawl4AI inicializado com sucesso!")
        except Exception as e:
            logger.error(f"Erro ao inicializar Crawl4AI: {e}")
            # Não falhar completamente
            self.session = None
            logger.info("Crawl4AI inicializado em modo básico")
    
    async def cleanup(self):
        """Limpar recursos"""
        if self.session:
            await self.session.close()
    
    async def crawl_url(self, url: str, depth: int = 1, delay: int = 1000, 
                       extract_content: bool = True, extract_links: bool = True, 
                       extract_images: bool = True, timeout: int = 30):
        """Fazer crawling de uma URL"""
        start_time = time.time()
        
        try:
            # Fazer request HTTP
            headers = {
                'User-Agent': self.user_agents[0],
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
            }
            
            # Usar aiohttp se disponível, senão usar requests
            if self.session:
                async with self.session.get(url, headers=headers, timeout=timeout) as response:
                    if response.status != 200:
                        raise Exception(f"HTTP {response.status}: {response.reason}")
                    
                    html_content = await response.text()
                    content_type = response.headers.get('content-type', '')
            else:
                # Fallback para requests
                import requests
                response = requests.get(url, headers=headers, timeout=timeout)
                if response.status_code != 200:
                    raise Exception(f"HTTP {response.status_code}: {response.reason}")
                
                html_content = response.text
                content_type = response.headers.get('content-type', '')
                
                # Parse HTML
                soup = BeautifulSoup(html_content, 'html.parser')
                
                # Extrair dados
                result = {
                    'url': url,
                    'status_code': response.status,
                    'content_type': content_type,
                    'title': '',
                    'text': '',
                    'html': html_content,
                    'links': [],
                    'images': [],
                    'meta': {},
                    'headings': [],
                    'word_count': 0,
                    'processing_time': 0
                }
                
                # Extrair título
                title_tag = soup.find('title')
                if title_tag:
                    result['title'] = title_tag.get_text().strip()
                
                # Extrair conteúdo de texto
                if extract_content:
                    # Remover scripts e estilos
                    for script in soup(["script", "style", "nav", "footer", "aside"]):
                        script.decompose()
                    
                    # Extrair texto principal
                    main_content = soup.find('main') or soup.find('article') or soup.find(class_='content') or soup.body
                    if main_content:
                        result['text'] = main_content.get_text().strip()
                        result['word_count'] = len(result['text'].split())
                
                # Extrair links
                if extract_links:
                    links = []
                    for link in soup.find_all('a', href=True):
                        href = link['href']
                        text = link.get_text().strip()
                        if href and text:
                            # Converter URLs relativas em absolutas
                            if href.startswith('/'):
                                from urllib.parse import urljoin
                                href = urljoin(url, href)
                            links.append({
                                'url': href,
                                'text': text,
                                'title': link.get('title', '')
                            })
                    result['links'] = links[:50]  # Limitar a 50 links
                
                # Extrair imagens
                if extract_images:
                    images = []
                    for img in soup.find_all('img', src=True):
                        src = img['src']
                        if src.startswith('/'):
                            from urllib.parse import urljoin
                            src = urljoin(url, src)
                        images.append({
                            'src': src,
                            'alt': img.get('alt', ''),
                            'title': img.get('title', ''),
                            'width': img.get('width', ''),
                            'height': img.get('height', '')
                        })
                    result['images'] = images[:20]  # Limitar a 20 imagens
                
                # Extrair meta tags
                meta_tags = {}
                for meta in soup.find_all('meta'):
                    name = meta.get('name') or meta.get('property')
                    content = meta.get('content')
                    if name and content:
                        meta_tags[name] = content
                result['meta'] = meta_tags
                
                # Extrair headings
                headings = []
                for i in range(1, 7):
                    for heading in soup.find_all(f'h{i}'):
                        headings.append({
                            'level': i,
                            'text': heading.get_text().strip(),
                            'id': heading.get('id', '')
                        })
                result['headings'] = headings
                
                # Tempo de processamento
                result['processing_time'] = time.time() - start_time
                
                # Delay entre requests
                if delay > 0:
                    await asyncio.sleep(delay / 1000.0)
                
                return result
                
        except Exception as e:
            logger.error(f"Erro no crawling de {url}: {e}")
            return {
                'url': url,
                'error': str(e),
                'processing_time': time.time() - start_time
            }
    
    async def extract_with_selectors(self, url: str, selectors: Dict[str, str]):
        """Extrair conteúdo específico usando seletores CSS"""
        try:
            if self.session:
                async with self.session.get(url) as response:
                    if response.status != 200:
                        raise Exception(f"HTTP {response.status}")
                    
                    html_content = await response.text()
            else:
                import requests
                response = requests.get(url)
                if response.status_code != 200:
                    raise Exception(f"HTTP {response.status_code}")
                
                html_content = response.text
            
            soup = BeautifulSoup(html_content, 'html.parser')
            
            result = {}
            for key, selector in selectors.items():
                elements = soup.select(selector)
                if len(elements) == 1:
                    result[key] = elements[0].get_text().strip()
                elif len(elements) > 1:
                    result[key] = [el.get_text().strip() for el in elements]
                else:
                    result[key] = None
            
            return result
                
        except Exception as e:
            logger.error(f"Erro na extração de {url}: {e}")
            raise
    
    async def analyze_page(self, url: str):
        """Analisar estrutura de uma página"""
        try:
            if self.session:
                async with self.session.get(url) as response:
                    if response.status != 200:
                        raise Exception(f"HTTP {response.status}")
                    
                    html_content = await response.text()
            else:
                import requests
                response = requests.get(url)
                if response.status_code != 200:
                    raise Exception(f"HTTP {response.status_code}")
                
                html_content = response.text
            
            soup = BeautifulSoup(html_content, 'html.parser')
                
                # Análise estrutural
                analysis = {
                    'url': url,
                    'title': soup.find('title').get_text() if soup.find('title') else '',
                    'headings': {
                        'h1': len(soup.find_all('h1')),
                        'h2': len(soup.find_all('h2')),
                        'h3': len(soup.find_all('h3')),
                        'h4': len(soup.find_all('h4')),
                        'h5': len(soup.find_all('h5')),
                        'h6': len(soup.find_all('h6'))
                    },
                    'elements': {
                        'paragraphs': len(soup.find_all('p')),
                        'links': len(soup.find_all('a')),
                        'images': len(soup.find_all('img')),
                        'lists': len(soup.find_all(['ul', 'ol'])),
                        'tables': len(soup.find_all('table')),
                        'forms': len(soup.find_all('form'))
                    },
                    'word_count': len(soup.get_text().split()),
                    'meta': {},
                    'structure': []
                }
                
                # Meta tags
                for meta in soup.find_all('meta'):
                    name = meta.get('name') or meta.get('property')
                    content = meta.get('content')
                    if name and content:
                        analysis['meta'][name] = content
                
                # Estrutura hierárquica
                for heading in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
                    analysis['structure'].append({
                        'level': int(heading.name[1]),
                        'text': heading.get_text().strip(),
                        'id': heading.get('id', '')
                    })
                
                return analysis
                
        except Exception as e:
            logger.error(f"Erro na análise de {url}: {e}")
            raise

# Instância global
crawl4ai = Crawl4AI()

# Criar aplicação FastAPI
app = FastAPI(
    title="Crawl4AI Service",
    description="Sistema de Web Scraping Inteligente para E-books",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Inicializar serviços"""
    await crawl4ai.initialize()

@app.on_event("shutdown")
async def shutdown_event():
    """Limpar recursos"""
    await crawl4ai.cleanup()

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Verificação de saúde"""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.now().isoformat(),
        services={
            "crawl4ai": "running",
            "session": "active" if crawl4ai.session else "inactive"
        }
    )

@app.post("/crawl")
async def crawl_url(request: CrawlRequest):
    """Fazer crawling de uma URL"""
    try:
        result = await crawl4ai.crawl_url(
            url=str(request.url),
            depth=request.depth,
            delay=request.delay,
            extract_content=request.extract_content,
            extract_links=request.extract_links,
            extract_images=request.extract_images,
            timeout=request.timeout
        )
        
        return CrawlResponse(
            url=str(request.url),
            success='error' not in result,
            data=result if 'error' not in result else None,
            error=result.get('error'),
            timestamp=datetime.now().isoformat(),
            processing_time=result.get('processing_time', 0)
        )
        
    except Exception as e:
        logger.error(f"Erro no crawling: {e}")
        return CrawlResponse(
            url=str(request.url),
            success=False,
            error=str(e),
            timestamp=datetime.now().isoformat(),
            processing_time=0
        )

@app.post("/extract")
async def extract_content(request: ExtractRequest):
    """Extrair conteúdo específico"""
    try:
        result = await crawl4ai.extract_with_selectors(
            url=str(request.url),
            selectors=request.selectors
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Erro na extração: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze")
async def analyze_page(request: AnalyzeRequest):
    """Analisar estrutura da página"""
    try:
        analysis = await crawl4ai.analyze_page(str(request.url))
        return {"success": True, "analysis": analysis}
    except Exception as e:
        logger.error(f"Erro na análise: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Configurações do servidor
    host = os.getenv("CRAWL4AI_HOST", "0.0.0.0")
    port = int(os.getenv("CRAWL4AI_PORT", "8001"))
    
    print(f"""
    🕷️  Crawl4AI Service
    ===================
    
    🚀 Iniciando servidor em: http://{host}:{port}
    📚 Documentação: http://{host}:{port}/docs
    ❤️  Health Check: http://{host}:{port}/health
    
    """)
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )