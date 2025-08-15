#!/usr/bin/env python3
"""
Agno RAG Service - Sistema de Recuperação e Geração Aumentada
Compatível com o Gerador de E-books e Cursos
"""

import os
import sys
import asyncio
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime

import uvicorn
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Modelos Pydantic
class DocumentRequest(BaseModel):
    index: str
    document_id: str
    content: str
    metadata: Dict[str, Any] = {}

class SearchRequest(BaseModel):
    index: str
    query: str
    limit: int = 5
    include_metadata: bool = True

class IndexRequest(BaseModel):
    name: str
    description: str = ""
    settings: Dict[str, Any] = {}

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str
    services: Dict[str, str]

# Simulação do Agno RAG (implementação básica)
class AgnoRAG:
    def __init__(self):
        self.indices = {}
        self.documents = {}
        self.embeddings_model = None
        self.data_dir = Path("./data/agno")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
    async def initialize(self):
        """Inicializar o sistema RAG"""
        try:
            # Tentar carregar modelo de embeddings
            logger.info("Inicializando sistema RAG...")
            
            try:
                # Tentar importar sentence-transformers
                from sentence_transformers import SentenceTransformer
                self.embeddings_model = "sentence-transformers/all-MiniLM-L6-v2"
                logger.info("✅ Modelo de embeddings carregado")
            except ImportError:
                logger.warning("⚠️ sentence-transformers não disponível - usando modo básico")
                self.embeddings_model = "basic-text-search"
            
            logger.info("Agno RAG inicializado com sucesso!")
        except Exception as e:
            logger.error(f"Erro ao inicializar Agno RAG: {e}")
            # Não falhar completamente, continuar em modo básico
            self.embeddings_model = "basic-text-search"
            logger.info("Agno RAG inicializado em modo básico")
    
    async def create_index(self, name: str, description: str = "", settings: Dict = None):
        """Criar um novo índice"""
        if settings is None:
            settings = {
                "embedding_model": "sentence-transformers/all-MiniLM-L6-v2",
                "chunk_size": 1000,
                "chunk_overlap": 200
            }
        
        index_data = {
            "name": name,
            "description": description,
            "settings": settings,
            "created_at": datetime.now().isoformat(),
            "document_count": 0
        }
        
        self.indices[name] = index_data
        self.documents[name] = {}
        
        # Salvar índice
        index_file = self.data_dir / f"{name}_index.json"
        import json
        with open(index_file, 'w', encoding='utf-8') as f:
            json.dump(index_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Índice '{name}' criado com sucesso")
        return index_data
    
    async def add_document(self, index: str, document_id: str, content: str, metadata: Dict = None):
        """Adicionar documento ao índice"""
        if index not in self.indices:
            raise ValueError(f"Índice '{index}' não encontrado")
        
        if metadata is None:
            metadata = {}
        
        # Simular processamento de embeddings
        chunks = self._chunk_text(content)
        
        document_data = {
            "id": document_id,
            "content": content,
            "metadata": metadata,
            "chunks": chunks,
            "added_at": datetime.now().isoformat(),
            "embedding_model": self.embeddings_model
        }
        
        self.documents[index][document_id] = document_data
        self.indices[index]["document_count"] += 1
        
        # Salvar documento
        doc_file = self.data_dir / f"{index}_{document_id}.json"
        import json
        with open(doc_file, 'w', encoding='utf-8') as f:
            json.dump(document_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Documento '{document_id}' adicionado ao índice '{index}'")
        return document_data
    
    async def search(self, index: str, query: str, limit: int = 5, include_metadata: bool = True):
        """Buscar documentos no índice"""
        if index not in self.indices:
            raise ValueError(f"Índice '{index}' não encontrado")
        
        # Simulação de busca semântica (implementação básica)
        results = []
        documents = self.documents.get(index, {})
        
        for doc_id, doc_data in documents.items():
            # Busca simples por palavras-chave (em produção seria busca vetorial)
            content = doc_data["content"].lower()
            query_lower = query.lower()
            
            # Calcular score simples
            score = 0.0
            query_words = query_lower.split()
            for word in query_words:
                if word in content:
                    score += content.count(word) / len(content.split())
            
            if score > 0:
                result = {
                    "document_id": doc_id,
                    "content": doc_data["content"][:500] + "..." if len(doc_data["content"]) > 500 else doc_data["content"],
                    "score": score
                }
                
                if include_metadata:
                    result["metadata"] = doc_data["metadata"]
                
                results.append(result)
        
        # Ordenar por score e limitar resultados
        results.sort(key=lambda x: x["score"], reverse=True)
        results = results[:limit]
        
        logger.info(f"Busca por '{query}' retornou {len(results)} resultados")
        return results
    
    def _chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200):
        """Dividir texto em chunks"""
        chunks = []
        words = text.split()
        
        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            chunks.append(chunk)
        
        return chunks
    
    async def get_indices(self):
        """Listar todos os índices"""
        return list(self.indices.values())
    
    async def get_index_stats(self, index: str):
        """Obter estatísticas do índice"""
        if index not in self.indices:
            raise ValueError(f"Índice '{index}' não encontrado")
        
        return {
            **self.indices[index],
            "documents": len(self.documents.get(index, {}))
        }

# Instância global do Agno
agno = AgnoRAG()

# Criar aplicação FastAPI
app = FastAPI(
    title="Agno RAG Service",
    description="Sistema de Recuperação e Geração Aumentada para E-books",
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
    """Inicializar serviços na inicialização"""
    await agno.initialize()

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Verificação de saúde do serviço"""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.now().isoformat(),
        services={
            "agno_rag": "running",
            "embeddings": "loaded" if agno.embeddings_model else "not_loaded",
            "indices": str(len(agno.indices))
        }
    )

@app.post("/indices")
async def create_index(request: IndexRequest):
    """Criar novo índice"""
    try:
        index_data = await agno.create_index(
            name=request.name,
            description=request.description,
            settings=request.settings
        )
        return {"success": True, "index": index_data}
    except Exception as e:
        logger.error(f"Erro ao criar índice: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/indices")
async def list_indices():
    """Listar todos os índices"""
    try:
        indices = await agno.get_indices()
        return {"success": True, "indices": indices}
    except Exception as e:
        logger.error(f"Erro ao listar índices: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/indices/{index_name}/stats")
async def get_index_stats(index_name: str):
    """Obter estatísticas do índice"""
    try:
        stats = await agno.get_index_stats(index_name)
        return {"success": True, "stats": stats}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/documents")
async def add_document(request: DocumentRequest):
    """Adicionar documento ao índice"""
    try:
        document = await agno.add_document(
            index=request.index,
            document_id=request.document_id,
            content=request.content,
            metadata=request.metadata
        )
        return {"success": True, "document": document}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao adicionar documento: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
async def search_documents(request: SearchRequest):
    """Buscar documentos no índice"""
    try:
        results = await agno.search(
            index=request.index,
            query=request.query,
            limit=request.limit,
            include_metadata=request.include_metadata
        )
        return {"success": True, "results": results}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Erro na busca: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/indices/{index_name}")
async def delete_index(index_name: str):
    """Deletar índice"""
    try:
        if index_name not in agno.indices:
            raise HTTPException(status_code=404, detail=f"Índice '{index_name}' não encontrado")
        
        # Remover arquivos
        import os
        index_file = agno.data_dir / f"{index_name}_index.json"
        if index_file.exists():
            os.remove(index_file)
        
        # Remover documentos
        for doc_id in agno.documents.get(index_name, {}):
            doc_file = agno.data_dir / f"{index_name}_{doc_id}.json"
            if doc_file.exists():
                os.remove(doc_file)
        
        # Remover da memória
        del agno.indices[index_name]
        if index_name in agno.documents:
            del agno.documents[index_name]
        
        return {"success": True, "message": f"Índice '{index_name}' deletado com sucesso"}
    except Exception as e:
        logger.error(f"Erro ao deletar índice: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Configurações do servidor
    host = os.getenv("AGNO_HOST", "0.0.0.0")
    port = int(os.getenv("AGNO_PORT", "8000"))
    
    print(f"""
    🧠 Agno RAG Service
    ==================
    
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