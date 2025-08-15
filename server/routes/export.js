import express from 'express';
import { promises as fs } from 'fs';
import { join } from 'path';

const router = express.Router();

// Exportar projeto em diferentes formatos
router.post('/:id/:format', async (req, res) => {
  try {
    const { id, format } = req.params;
    const { options = {} } = req.body;
    
    // Carregar projeto
    const projectPath = join('./data/projects', `${id}.json`);
    const content = await fs.readFile(projectPath, 'utf8');
    const project = JSON.parse(content);
    
    let result;
    
    switch (format.toLowerCase()) {
      case 'pdf':
        result = await exportToPDF(project, options);
        break;
      case 'epub':
        result = await exportToEPUB(project, options);
        break;
      case 'docx':
        result = await exportToDOCX(project, options);
        break;
      case 'html':
        result = await exportToHTML(project, options);
        break;
      case 'json':
        result = await exportToJSON(project, options);
        break;
      case 'scorm':
        result = await exportToSCORM(project, options);
        break;
      default:
        return res.status(400).json({ error: 'Formato não suportado' });
    }
    
    res.json({ 
      success: true, 
      downloadUrl: result.url,
      filename: result.filename,
      message: `Projeto exportado como ${format.toUpperCase()} com sucesso!` 
    });
    
  } catch (error) {
    console.error('Erro na exportação:', error);
    res.status(500).json({ 
      error: 'Falha na exportação', 
      details: error.message 
    });
  }
});

// Exportar para PDF (versão simplificada - gera HTML que pode ser convertido)
async function exportToPDF(project, options) {
  const filename = `${project.title.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
  const filepath = join('./data/exports', filename);
  
  // Garantir que o diretório existe
  await fs.mkdir('./data/exports', { recursive: true });
  
  // Gerar HTML otimizado para impressão/PDF
  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>${project.title}</title>
    <style>
        @media print {
            @page { margin: 2cm; }
            .page-break { page-break-before: always; }
        }
        body { font-family: Georgia, serif; line-height: 1.6; color: #333; }
        .cover { text-align: center; margin-bottom: 50px; }
        .cover h1 { font-size: 2.5em; margin-bottom: 20px; }
        .toc { margin-bottom: 50px; }
        .toc ul { list-style: none; padding: 0; }
        .toc li { margin: 10px 0; padding: 10px; background: #f8f9fa; }
        .chapter { margin-bottom: 40px; }
        .chapter h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .chapter-description { font-style: italic; color: #666; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="cover">
        <h1>${project.title}</h1>
        <p>${project.description}</p>
        ${project.metadata?.createdAt ? `<p><small>Criado em: ${new Date(project.metadata.createdAt).toLocaleDateString('pt-BR')}</small></p>` : ''}
    </div>
    
    <div class="toc page-break">
        <h2>Índice</h2>
        <ul>
            ${project.chapters.map((chapter, index) => `
                <li>Capítulo ${index + 1}: ${chapter.title}</li>
            `).join('')}
        </ul>
    </div>
    
    ${project.chapters.map((chapter, index) => `
        <div class="chapter page-break">
            <h2>Capítulo ${index + 1}: ${chapter.title}</h2>
            ${chapter.description ? `<div class="chapter-description">${chapter.description}</div>` : ''}
            <div class="chapter-content">
                ${chapter.content ? convertMarkdownToHTML(chapter.content) : '<p><em>Conteúdo não gerado ainda.</em></p>'}
            </div>
        </div>
    `).join('')}
    
    <script>
        // Instruções para o usuário
        console.log('Para converter em PDF: Ctrl+P > Salvar como PDF');
        alert('Arquivo HTML gerado! Use Ctrl+P para salvar como PDF ou imprimir.');
    </script>
</body>
</html>`;
  
  await fs.writeFile(filepath, htmlContent);
  
  return {
    url: `/api/exports/download/${filename}`,
    filename
  };
}

// Exportar para HTML
async function exportToHTML(project, options) {
  const filename = `${project.title.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
  const filepath = join('./data/exports', filename);
  
  await fs.mkdir('./data/exports', { recursive: true });
  
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.title}</title>
    <style>
        body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        .cover {
            text-align: center;
            margin-bottom: 50px;
            padding: 50px 0;
            border-bottom: 2px solid #eee;
        }
        .cover h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
            color: #2c3e50;
        }
        .cover p {
            font-size: 1.2em;
            color: #666;
        }
        .toc {
            margin-bottom: 50px;
        }
        .toc h2 {
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .toc ul {
            list-style: none;
            padding: 0;
        }
        .toc li {
            margin: 10px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        .toc a {
            text-decoration: none;
            color: #2c3e50;
            font-weight: bold;
        }
        .chapter {
            margin-bottom: 50px;
            page-break-before: always;
        }
        .chapter h2 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        .chapter-description {
            font-style: italic;
            color: #666;
            margin-bottom: 20px;
        }
        .chapter-content {
            text-align: justify;
        }
        .chapter-content h3 {
            color: #34495e;
            margin-top: 30px;
        }
        .chapter-content p {
            margin-bottom: 15px;
        }
        .chapter-content ul, .chapter-content ol {
            margin-bottom: 15px;
            padding-left: 30px;
        }
        .chapter-content blockquote {
            border-left: 4px solid #3498db;
            padding-left: 20px;
            margin: 20px 0;
            font-style: italic;
            color: #666;
        }
        .chapter-content code {
            background: #f4f4f4;
            padding: 2px 5px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        .chapter-content pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        @media print {
            .chapter {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    <div class="cover">
        <h1>${project.title}</h1>
        <p>${project.description}</p>
        ${project.metadata?.createdAt ? `<p><small>Criado em: ${new Date(project.metadata.createdAt).toLocaleDateString('pt-BR')}</small></p>` : ''}
    </div>
    
    <div class="toc">
        <h2>Índice</h2>
        <ul>
            ${project.chapters.map((chapter, index) => `
                <li>
                    <a href="#chapter-${chapter.id}">
                        Capítulo ${index + 1}: ${chapter.title}
                    </a>
                </li>
            `).join('')}
        </ul>
    </div>
    
    ${project.chapters.map((chapter, index) => `
        <div class="chapter" id="chapter-${chapter.id}">
            <h2>Capítulo ${index + 1}: ${chapter.title}</h2>
            ${chapter.description ? `<div class="chapter-description">${chapter.description}</div>` : ''}
            <div class="chapter-content">
                ${chapter.content ? convertMarkdownToHTML(chapter.content) : '<p><em>Conteúdo não gerado ainda.</em></p>'}
            </div>
        </div>
    `).join('')}
</body>
</html>`;
  
  await fs.writeFile(filepath, html);
  
  return {
    url: `/api/exports/download/${filename}`,
    filename
  };
}

// Exportar para JSON (API)
async function exportToJSON(project, options) {
  const filename = `${project.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
  const filepath = join('./data/exports', filename);
  
  await fs.mkdir('./data/exports', { recursive: true });
  
  // Criar estrutura otimizada para API
  const apiFormat = {
    id: project.id,
    title: project.title,
    type: project.type,
    description: project.description,
    audience: project.audience,
    estimatedDuration: project.estimatedDuration,
    metadata: project.metadata,
    chapters: project.chapters.map(chapter => ({
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      topics: chapter.topics,
      learningObjectives: chapter.learningObjectives,
      estimatedTime: chapter.estimatedTime,
      content: chapter.content,
      media: chapter.media || [],
      status: chapter.status
    })),
    stats: {
      totalChapters: project.chapters.length,
      completedChapters: project.chapters.filter(c => c.status === 'completed').length,
      totalWords: project.chapters.reduce((total, chapter) => {
        return total + (chapter.content ? chapter.content.split(/\s+/).length : 0);
      }, 0)
    }
  };
  
  await fs.writeFile(filepath, JSON.stringify(apiFormat, null, 2));
  
  return {
    url: `/api/exports/download/${filename}`,
    filename
  };
}

// Função auxiliar para converter markdown básico para HTML
function convertMarkdownToHTML(markdown) {
  return markdown
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, '<p>$1</p>')
    .replace(/<p><h/g, '<h')
    .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
    .replace(/<p><ul>/g, '<ul>')
    .replace(/<\/ul><\/p>/g, '</ul>')
    .replace(/<p><blockquote>/g, '<blockquote>')
    .replace(/<\/blockquote><\/p>/g, '</blockquote>');
}

// Exportar para EPUB (versão simplificada)
async function exportToEPUB(project, options) {
  const filename = `${project.title.replace(/[^a-zA-Z0-9]/g, '_')}_epub.html`;
  const filepath = join('./data/exports', filename);
  
  await fs.mkdir('./data/exports', { recursive: true });
  
  const epubHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>${project.title}</title>
    <style>
        body { font-family: Georgia, serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; }
        .chapter { margin-bottom: 40px; page-break-before: always; }
        h1, h2 { color: #2c3e50; }
    </style>
</head>
<body>
    <h1>${project.title}</h1>
    <p>${project.description}</p>
    ${project.chapters.map((chapter, index) => `
        <div class="chapter">
            <h2>Capítulo ${index + 1}: ${chapter.title}</h2>
            ${chapter.content ? convertMarkdownToHTML(chapter.content) : '<p>Conteúdo não gerado ainda.</p>'}
        </div>
    `).join('')}
    <script>alert('Para EPUB real, use ferramentas como Calibre para converter este HTML.');</script>
</body>
</html>`;
  
  await fs.writeFile(filepath, epubHTML);
  return { url: `/api/exports/download/${filename}`, filename };
}

async function exportToDOCX(project, options) {
  const filename = `${project.title.replace(/[^a-zA-Z0-9]/g, '_')}_docx.html`;
  const filepath = join('./data/exports', filename);
  
  await fs.mkdir('./data/exports', { recursive: true });
  
  const docxHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>${project.title}</title>
    <style>
        body { font-family: 'Times New Roman', serif; line-height: 1.5; margin: 2cm; }
        .chapter { margin-bottom: 30px; }
        h1, h2 { color: #000; }
    </style>
</head>
<body>
    <h1>${project.title}</h1>
    <p>${project.description}</p>
    ${project.chapters.map((chapter, index) => `
        <div class="chapter">
            <h2>Capítulo ${index + 1}: ${chapter.title}</h2>
            ${chapter.content ? convertMarkdownToHTML(chapter.content) : '<p>Conteúdo não gerado ainda.</p>'}
        </div>
    `).join('')}
    <script>alert('Para DOCX real, abra este HTML no Word e salve como .docx');</script>
</body>
</html>`;
  
  await fs.writeFile(filepath, docxHTML);
  return { url: `/api/exports/download/${filename}`, filename };
}

async function exportToSCORM(project, options) {
  const filename = `${project.title.replace(/[^a-zA-Z0-9]/g, '_')}_scorm.html`;
  const filepath = join('./data/exports', filename);
  
  await fs.mkdir('./data/exports', { recursive: true });
  
  const scormHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>${project.title}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
        .chapter { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; }
        .progress { background: #f0f0f0; height: 20px; border-radius: 10px; margin: 10px 0; }
        .progress-bar { background: #4CAF50; height: 100%; border-radius: 10px; width: 0%; }
    </style>
</head>
<body>
    <h1>${project.title}</h1>
    <div class="progress"><div class="progress-bar" id="progress"></div></div>
    ${project.chapters.map((chapter, index) => `
        <div class="chapter" id="chapter-${index}">
            <h2>Capítulo ${index + 1}: ${chapter.title}</h2>
            ${chapter.content ? convertMarkdownToHTML(chapter.content) : '<p>Conteúdo não gerado ainda.</p>'}
            <button onclick="completeChapter(${index})">Marcar como Concluído</button>
        </div>
    `).join('')}
    <script>
        let completed = 0;
        function completeChapter(index) {
            document.getElementById('chapter-' + index).style.opacity = '0.7';
            completed++;
            document.getElementById('progress').style.width = (completed / ${project.chapters.length} * 100) + '%';
        }
        alert('SCORM básico gerado! Para SCORM completo, use ferramentas especializadas.');
    </script>
</body>
</html>`;
  
  await fs.writeFile(filepath, scormHTML);
  return { url: `/api/exports/download/${filename}`, filename };
}

// Rota para download de arquivos exportados
router.get('/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = join('./data/exports', filename);
    
    // Verificar se o arquivo existe
    await fs.access(filepath);
    
    res.download(filepath, filename);
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Arquivo não encontrado' });
    } else {
      console.error('Erro no download:', error);
      res.status(500).json({ 
        error: 'Falha no download', 
        details: error.message 
      });
    }
  }
});

export default router;