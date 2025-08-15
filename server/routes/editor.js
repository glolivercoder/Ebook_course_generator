import express from 'express';
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Criar novo documento para edição visual
router.post('/create-document', async (req, res) => {
  try {
    const { projectId, chapterId, template = 'default' } = req.body;
    
    const documentId = uuidv4();
    const document = {
      id: documentId,
      projectId,
      chapterId,
      template,
      pages: [],
      styles: getDefaultStyles(template),
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    };
    
    // Salvar documento
    await fs.mkdir('./data/documents', { recursive: true });
    await fs.writeFile(
      `./data/documents/${documentId}.json`, 
      JSON.stringify(document, null, 2)
    );
    
    res.json({ success: true, document });
    
  } catch (error) {
    console.error('Erro ao criar documento:', error);
    res.status(500).json({ 
      error: 'Falha ao criar documento', 
      details: error.message 
    });
  }
});

// Obter templates disponíveis
router.get('/templates', (req, res) => {
  const templates = [
    {
      id: 'kindle-standard',
      name: 'Kindle Standard',
      description: 'Layout padrão compatível com Kindle',
      preview: '/templates/kindle-standard.png',
      styles: {
        pageSize: { width: '6in', height: '9in' },
        margins: { top: '0.75in', bottom: '0.75in', left: '0.5in', right: '0.5in' },
        fonts: {
          heading: { family: 'Georgia', size: '18pt', weight: 'bold' },
          body: { family: 'Georgia', size: '11pt', lineHeight: '1.4' },
          caption: { family: 'Arial', size: '9pt', style: 'italic' }
        },
        colors: {
          text: '#000000',
          heading: '#2c3e50',
          accent: '#3498db'
        }
      }
    },
    {
      id: 'modern-ebook',
      name: 'E-book Moderno',
      description: 'Design contemporâneo para e-books',
      preview: '/templates/modern-ebook.png',
      styles: {
        pageSize: { width: '6in', height: '9in' },
        margins: { top: '1in', bottom: '1in', left: '0.75in', right: '0.75in' },
        fonts: {
          heading: { family: 'Montserrat', size: '20pt', weight: '600' },
          body: { family: 'Open Sans', size: '11pt', lineHeight: '1.5' },
          caption: { family: 'Open Sans', size: '9pt', style: 'italic' }
        },
        colors: {
          text: '#333333',
          heading: '#1a1a1a',
          accent: '#e74c3c'
        }
      }
    },
    {
      id: 'academic',
      name: 'Acadêmico',
      description: 'Layout formal para conteúdo educacional',
      preview: '/templates/academic.png',
      styles: {
        pageSize: { width: '8.5in', height: '11in' },
        margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
        fonts: {
          heading: { family: 'Times New Roman', size: '16pt', weight: 'bold' },
          body: { family: 'Times New Roman', size: '12pt', lineHeight: '1.6' },
          caption: { family: 'Arial', size: '10pt', style: 'italic' }
        },
        colors: {
          text: '#000000',
          heading: '#000000',
          accent: '#0066cc'
        }
      }
    }
  ];
  
  res.json({ success: true, templates });
});

// Salvar alterações no documento
router.put('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const filePath = `./data/documents/${id}.json`;
    const content = await fs.readFile(filePath, 'utf8');
    const document = JSON.parse(content);
    
    // Aplicar atualizações
    Object.assign(document, updates);
    document.metadata.lastModified = new Date().toISOString();
    
    await fs.writeFile(filePath, JSON.stringify(document, null, 2));
    
    res.json({ success: true, message: 'Documento atualizado' });
    
  } catch (error) {
    console.error('Erro ao atualizar documento:', error);
    res.status(500).json({ 
      error: 'Falha ao atualizar documento', 
      details: error.message 
    });
  }
});

// Exportar documento para Kindle
router.post('/documents/:id/export/kindle', async (req, res) => {
  try {
    const { id } = req.params;
    const { options = {} } = req.body;
    
    const filePath = `./data/documents/${id}.json`;
    const content = await fs.readFile(filePath, 'utf8');
    const document = JSON.parse(content);
    
    // Gerar arquivo compatível com Kindle
    const kindleContent = await generateKindleFormat(document, options);
    
    const filename = `kindle_${id}.html`;
    const exportPath = `./data/exports/${filename}`;
    
    await fs.writeFile(exportPath, kindleContent);
    
    res.json({ 
      success: true, 
      downloadUrl: `/api/exports/download/${filename}`,
      filename 
    });
    
  } catch (error) {
    console.error('Erro na exportação Kindle:', error);
    res.status(500).json({ 
      error: 'Falha na exportação Kindle', 
      details: error.message 
    });
  }
});

// Função para obter estilos padrão
function getDefaultStyles(template) {
  const templates = {
    'kindle-standard': {
      pageSize: { width: '6in', height: '9in' },
      margins: { top: '0.75in', bottom: '0.75in', left: '0.5in', right: '0.5in' },
      fonts: {
        heading: { family: 'Georgia', size: '18pt', weight: 'bold' },
        body: { family: 'Georgia', size: '11pt', lineHeight: '1.4' }
      }
    },
    'default': {
      pageSize: { width: '6in', height: '9in' },
      margins: { top: '1in', bottom: '1in', left: '0.75in', right: '0.75in' },
      fonts: {
        heading: { family: 'Arial', size: '16pt', weight: 'bold' },
        body: { family: 'Arial', size: '11pt', lineHeight: '1.5' }
      }
    }
  };
  
  return templates[template] || templates['default'];
}

// Função para gerar formato Kindle
async function generateKindleFormat(document, options) {
  const { styles, pages } = document;
  
  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8"/>
    <title>${document.title || 'E-book'}</title>
    <style type="text/css">
        @page {
            margin: ${styles.margins?.top || '0.75in'} ${styles.margins?.right || '0.5in'} 
                    ${styles.margins?.bottom || '0.75in'} ${styles.margins?.left || '0.5in'};
        }
        
        body {
            font-family: ${styles.fonts?.body?.family || 'Georgia'};
            font-size: ${styles.fonts?.body?.size || '11pt'};
            line-height: ${styles.fonts?.body?.lineHeight || '1.4'};
            color: ${styles.colors?.text || '#000000'};
            text-align: justify;
        }
        
        h1, h2, h3, h4, h5, h6 {
            font-family: ${styles.fonts?.heading?.family || 'Georgia'};
            font-weight: ${styles.fonts?.heading?.weight || 'bold'};
            color: ${styles.colors?.heading || '#2c3e50'};
            page-break-after: avoid;
        }
        
        h1 { font-size: ${styles.fonts?.heading?.size || '18pt'}; }
        h2 { font-size: calc(${styles.fonts?.heading?.size || '18pt'} * 0.9); }
        h3 { font-size: calc(${styles.fonts?.heading?.size || '18pt'} * 0.8); }
        
        p {
            margin-bottom: 1em;
            text-indent: 1.5em;
        }
        
        .chapter-start {
            page-break-before: always;
            text-indent: 0;
        }
        
        .no-indent {
            text-indent: 0;
        }
        
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 1em auto;
        }
        
        .caption {
            font-family: ${styles.fonts?.caption?.family || 'Arial'};
            font-size: ${styles.fonts?.caption?.size || '9pt'};
            font-style: ${styles.fonts?.caption?.style || 'italic'};
            text-align: center;
            margin-top: 0.5em;
        }
        
        blockquote {
            margin: 1em 2em;
            font-style: italic;
            border-left: 3px solid ${styles.colors?.accent || '#3498db'};
            padding-left: 1em;
        }
        
        .toc {
            page-break-after: always;
        }
        
        .toc ul {
            list-style: none;
            padding: 0;
        }
        
        .toc li {
            margin: 0.5em 0;
            padding: 0.5em;
            border-bottom: 1px dotted #ccc;
        }
        
        .toc a {
            text-decoration: none;
            color: ${styles.colors?.text || '#000000'};
        }
    </style>
</head>
<body>
    ${generateKindleContent(pages)}
</body>
</html>`;
}

function generateKindleContent(pages) {
  if (!pages || pages.length === 0) {
    return '<p>Conteúdo não disponível</p>';
  }
  
  return pages.map(page => {
    return `<div class="page">
      ${page.elements?.map(element => {
        switch (element.type) {
          case 'heading':
            return `<h${element.level || 2}>${element.content}</h${element.level || 2}>`;
          case 'paragraph':
            return `<p class="${element.isChapterStart ? 'chapter-start' : ''}">${element.content}</p>`;
          case 'image':
            return `<img src="${element.src}" alt="${element.alt || ''}" />
                    ${element.caption ? `<div class="caption">${element.caption}</div>` : ''}`;
          case 'blockquote':
            return `<blockquote>${element.content}</blockquote>`;
          default:
            return `<div>${element.content}</div>`;
        }
      }).join('') || ''}
    </div>`;
  }).join('');
}

export default router;