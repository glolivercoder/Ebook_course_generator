// Editor Visual Integrado - Similar ao Kindle Create
class VisualEditor {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      template: 'kindle-standard',
      enableDragDrop: true,
      enableRealTimePreview: true,
      ...options
    };
    
    this.document = null;
    this.currentPage = 0;
    this.selectedElement = null;
    
    this.init();
  }
  
  async init() {
    await this.loadTemplates();
    this.createInterface();
    this.bindEvents();
  }
  
  async loadTemplates() {
    try {
      const response = await fetch('/api/editor/templates');
      const data = await response.json();
      this.templates = data.templates;
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      this.templates = [];
    }
  }
  
  createInterface() {
    this.container.innerHTML = `
      <div class="visual-editor">
        <!-- Toolbar -->
        <div class="editor-toolbar">
          <div class="toolbar-group">
            <button class="btn-tool" data-action="add-text" title="Adicionar Texto">
              <i class="icon-text">T</i>
            </button>
            <button class="btn-tool" data-action="add-image" title="Adicionar Imagem">
              <i class="icon-image">🖼️</i>
            </button>
            <button class="btn-tool" data-action="add-heading" title="Adicionar Título">
              <i class="icon-heading">H</i>
            </button>
          </div>
          
          <div class="toolbar-group">
            <select class="template-selector">
              ${this.templates.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
            </select>
          </div>
          
          <div class="toolbar-group">
            <button class="btn-tool" data-action="preview" title="Visualizar">
              <i class="icon-preview">👁️</i>
            </button>
            <button class="btn-tool" data-action="export-kindle" title="Exportar para Kindle">
              <i class="icon-kindle">📱</i>
            </button>
          </div>
        </div>
        
        <!-- Editor Area -->
        <div class="editor-main">
          <!-- Sidebar -->
          <div class="editor-sidebar">
            <div class="sidebar-section">
              <h3>Páginas</h3>
              <div class="pages-list" id="pagesList">
                <!-- Páginas serão listadas aqui -->
              </div>
              <button class="btn-add-page">+ Nova Página</button>
            </div>
            
            <div class="sidebar-section">
              <h3>Propriedades</h3>
              <div class="properties-panel" id="propertiesPanel">
                <!-- Propriedades do elemento selecionado -->
              </div>
            </div>
          </div>
          
          <!-- Canvas -->
          <div class="editor-canvas">
            <div class="canvas-container">
              <div class="page-canvas" id="pageCanvas">
                <!-- Conteúdo da página atual -->
              </div>
            </div>
          </div>
          
          <!-- Preview -->
          <div class="editor-preview" id="editorPreview" style="display: none;">
            <div class="preview-container">
              <iframe id="previewFrame" src="about:blank"></iframe>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.addEditorStyles();
  }
  
  addEditorStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .visual-editor {
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: #f5f5f5;
      }
      
      .editor-toolbar {
        background: white;
        border-bottom: 1px solid #ddd;
        padding: 10px;
        display: flex;
        gap: 20px;
        align-items: center;
      }
      
      .toolbar-group {
        display: flex;
        gap: 5px;
        align-items: center;
      }
      
      .btn-tool {
        padding: 8px 12px;
        border: 1px solid #ddd;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-tool:hover {
        background: #f0f0f0;
        border-color: #999;
      }
      
      .btn-tool.active {
        background: #007cba;
        color: white;
        border-color: #007cba;
      }
      
      .template-selector {
        padding: 6px 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
      }
      
      .editor-main {
        flex: 1;
        display: flex;
        overflow: hidden;
      }
      
      .editor-sidebar {
        width: 250px;
        background: white;
        border-right: 1px solid #ddd;
        overflow-y: auto;
      }
      
      .sidebar-section {
        padding: 15px;
        border-bottom: 1px solid #eee;
      }
      
      .sidebar-section h3 {
        margin: 0 0 10px 0;
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }
      
      .pages-list {
        max-height: 200px;
        overflow-y: auto;
      }
      
      .page-item {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 5px;
        cursor: pointer;
        background: white;
        transition: all 0.2s;
      }
      
      .page-item:hover {
        background: #f0f0f0;
      }
      
      .page-item.active {
        background: #007cba;
        color: white;
        border-color: #007cba;
      }
      
      .btn-add-page {
        width: 100%;
        padding: 8px;
        border: 2px dashed #ddd;
        background: transparent;
        border-radius: 4px;
        cursor: pointer;
        color: #666;
        margin-top: 10px;
      }
      
      .btn-add-page:hover {
        border-color: #007cba;
        color: #007cba;
      }
      
      .editor-canvas {
        flex: 1;
        background: #e5e5e5;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding: 20px;
        overflow: auto;
      }
      
      .canvas-container {
        background: white;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        border-radius: 8px;
        overflow: hidden;
      }
      
      .page-canvas {
        width: 600px;
        min-height: 800px;
        padding: 60px 45px;
        position: relative;
        font-family: Georgia, serif;
        font-size: 14px;
        line-height: 1.4;
      }
      
      .editor-element {
        position: relative;
        margin-bottom: 15px;
        padding: 5px;
        border: 2px solid transparent;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .editor-element:hover {
        border-color: #007cba;
        background: rgba(0, 124, 186, 0.05);
      }
      
      .editor-element.selected {
        border-color: #007cba;
        background: rgba(0, 124, 186, 0.1);
      }
      
      .element-controls {
        position: absolute;
        top: -30px;
        right: 0;
        display: none;
        gap: 5px;
      }
      
      .editor-element.selected .element-controls {
        display: flex;
      }
      
      .control-btn {
        width: 24px;
        height: 24px;
        border: none;
        background: #007cba;
        color: white;
        border-radius: 3px;
        cursor: pointer;
        font-size: 12px;
      }
      
      .properties-panel {
        display: none;
      }
      
      .properties-panel.active {
        display: block;
      }
      
      .property-group {
        margin-bottom: 15px;
      }
      
      .property-label {
        display: block;
        margin-bottom: 5px;
        font-size: 12px;
        font-weight: 500;
        color: #333;
      }
      
      .property-input {
        width: 100%;
        padding: 6px 8px;
        border: 1px solid #ddd;
        border-radius: 3px;
        font-size: 12px;
      }
      
      .editor-preview {
        flex: 1;
        background: white;
      }
      
      .preview-container {
        height: 100%;
        padding: 20px;
      }
      
      #previewFrame {
        width: 100%;
        height: 100%;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  bindEvents() {
    // Toolbar events
    this.container.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action) {
        this.handleToolbarAction(action);
      }
    });
    
    // Template change
    const templateSelector = this.container.querySelector('.template-selector');
    templateSelector?.addEventListener('change', (e) => {
      this.changeTemplate(e.target.value);
    });
    
    // Add page button
    const addPageBtn = this.container.querySelector('.btn-add-page');
    addPageBtn?.addEventListener('click', () => {
      this.addPage();
    });
  }
  
  handleToolbarAction(action) {
    switch (action) {
      case 'add-text':
        this.addTextElement();
        break;
      case 'add-image':
        this.addImageElement();
        break;
      case 'add-heading':
        this.addHeadingElement();
        break;
      case 'preview':
        this.togglePreview();
        break;
      case 'export-kindle':
        this.exportToKindle();
        break;
    }
  }
  
  addTextElement() {
    const element = {
      id: this.generateId(),
      type: 'paragraph',
      content: 'Clique para editar este texto...',
      styles: {
        fontSize: '14px',
        fontFamily: 'Georgia',
        lineHeight: '1.4',
        textAlign: 'justify'
      }
    };
    
    this.addElementToCurrentPage(element);
  }
  
  addImageElement() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const element = {
            id: this.generateId(),
            type: 'image',
            src: e.target.result,
            alt: file.name,
            caption: '',
            styles: {
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              margin: '1em auto'
            }
          };
          
          this.addElementToCurrentPage(element);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }
  
  addHeadingElement() {
    const element = {
      id: this.generateId(),
      type: 'heading',
      level: 2,
      content: 'Novo Título',
      styles: {
        fontSize: '18px',
        fontFamily: 'Georgia',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '15px'
      }
    };
    
    this.addElementToCurrentPage(element);
  }
  
  addElementToCurrentPage(element) {
    if (!this.document) {
      this.createNewDocument();
    }
    
    if (!this.document.pages[this.currentPage]) {
      this.addPage();
    }
    
    if (!this.document.pages[this.currentPage].elements) {
      this.document.pages[this.currentPage].elements = [];
    }
    
    this.document.pages[this.currentPage].elements.push(element);
    this.renderCurrentPage();
    this.selectElement(element.id);
  }
  
  createNewDocument() {
    this.document = {
      id: this.generateId(),
      title: 'Novo Documento',
      template: this.options.template,
      pages: [],
      styles: this.getTemplateStyles(this.options.template),
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    };
  }
  
  addPage() {
    if (!this.document) {
      this.createNewDocument();
    }
    
    const page = {
      id: this.generateId(),
      elements: []
    };
    
    this.document.pages.push(page);
    this.updatePagesList();
    this.currentPage = this.document.pages.length - 1;
    this.renderCurrentPage();
  }
  
  renderCurrentPage() {
    const canvas = this.container.querySelector('#pageCanvas');
    if (!canvas || !this.document || !this.document.pages[this.currentPage]) {
      return;
    }
    
    const page = this.document.pages[this.currentPage];
    canvas.innerHTML = '';
    
    if (page.elements) {
      page.elements.forEach(element => {
        const elementDiv = this.createElement(element);
        canvas.appendChild(elementDiv);
      });
    }
  }
  
  createElement(element) {
    const div = document.createElement('div');
    div.className = 'editor-element';
    div.dataset.elementId = element.id;
    
    // Controls
    div.innerHTML = `
      <div class="element-controls">
        <button class="control-btn" data-action="edit" title="Editar">✏️</button>
        <button class="control-btn" data-action="delete" title="Excluir">🗑️</button>
      </div>
    `;
    
    // Content
    const content = document.createElement('div');
    content.className = 'element-content';
    
    switch (element.type) {
      case 'paragraph':
        content.innerHTML = `<p>${element.content}</p>`;
        break;
      case 'heading':
        content.innerHTML = `<h${element.level}>${element.content}</h${element.level}>`;
        break;
      case 'image':
        content.innerHTML = `
          <img src="${element.src}" alt="${element.alt}" style="max-width: 100%; height: auto;" />
          ${element.caption ? `<div class="caption">${element.caption}</div>` : ''}
        `;
        break;
    }
    
    div.appendChild(content);
    
    // Apply styles
    if (element.styles) {
      Object.assign(content.style, element.styles);
    }
    
    // Events
    div.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectElement(element.id);
    });
    
    return div;
  }
  
  selectElement(elementId) {
    // Remove previous selection
    this.container.querySelectorAll('.editor-element.selected').forEach(el => {
      el.classList.remove('selected');
    });
    
    // Select new element
    const elementDiv = this.container.querySelector(`[data-element-id="${elementId}"]`);
    if (elementDiv) {
      elementDiv.classList.add('selected');
      this.selectedElement = elementId;
      this.showElementProperties(elementId);
    }
  }
  
  showElementProperties(elementId) {
    const element = this.findElement(elementId);
    if (!element) return;
    
    const panel = this.container.querySelector('#propertiesPanel');
    panel.className = 'properties-panel active';
    
    panel.innerHTML = `
      <div class="property-group">
        <label class="property-label">Conteúdo</label>
        <textarea class="property-input" id="elementContent" rows="3">${element.content || ''}</textarea>
      </div>
      
      ${element.type === 'heading' ? `
        <div class="property-group">
          <label class="property-label">Nível</label>
          <select class="property-input" id="headingLevel">
            ${[1,2,3,4,5,6].map(n => `<option value="${n}" ${element.level === n ? 'selected' : ''}>H${n}</option>`).join('')}
          </select>
        </div>
      ` : ''}
      
      ${element.type === 'image' ? `
        <div class="property-group">
          <label class="property-label">Legenda</label>
          <input type="text" class="property-input" id="imageCaption" value="${element.caption || ''}" />
        </div>
      ` : ''}
      
      <div class="property-group">
        <label class="property-label">Tamanho da Fonte</label>
        <input type="text" class="property-input" id="fontSize" value="${element.styles?.fontSize || '14px'}" />
      </div>
      
      <div class="property-group">
        <label class="property-label">Alinhamento</label>
        <select class="property-input" id="textAlign">
          <option value="left" ${element.styles?.textAlign === 'left' ? 'selected' : ''}>Esquerda</option>
          <option value="center" ${element.styles?.textAlign === 'center' ? 'selected' : ''}>Centro</option>
          <option value="right" ${element.styles?.textAlign === 'right' ? 'selected' : ''}>Direita</option>
          <option value="justify" ${element.styles?.textAlign === 'justify' ? 'selected' : ''}>Justificado</option>
        </select>
      </div>
      
      <button class="btn-tool" onclick="visualEditor.updateElement('${elementId}')">Aplicar Alterações</button>
    `;
  }
  
  updateElement(elementId) {
    const element = this.findElement(elementId);
    if (!element) return;
    
    // Update content
    const contentInput = document.getElementById('elementContent');
    if (contentInput) {
      element.content = contentInput.value;
    }
    
    // Update heading level
    const levelSelect = document.getElementById('headingLevel');
    if (levelSelect) {
      element.level = parseInt(levelSelect.value);
    }
    
    // Update image caption
    const captionInput = document.getElementById('imageCaption');
    if (captionInput) {
      element.caption = captionInput.value;
    }
    
    // Update styles
    const fontSize = document.getElementById('fontSize')?.value;
    const textAlign = document.getElementById('textAlign')?.value;
    
    if (!element.styles) element.styles = {};
    if (fontSize) element.styles.fontSize = fontSize;
    if (textAlign) element.styles.textAlign = textAlign;
    
    // Re-render
    this.renderCurrentPage();
    this.selectElement(elementId);
  }
  
  findElement(elementId) {
    if (!this.document || !this.document.pages[this.currentPage]) return null;
    
    return this.document.pages[this.currentPage].elements?.find(el => el.id === elementId);
  }
  
  updatePagesList() {
    const pagesList = this.container.querySelector('#pagesList');
    if (!pagesList || !this.document) return;
    
    pagesList.innerHTML = this.document.pages.map((page, index) => `
      <div class="page-item ${index === this.currentPage ? 'active' : ''}" 
           onclick="visualEditor.switchToPage(${index})">
        Página ${index + 1}
      </div>
    `).join('');
  }
  
  switchToPage(pageIndex) {
    this.currentPage = pageIndex;
    this.renderCurrentPage();
    this.updatePagesList();
    
    // Clear selection
    this.selectedElement = null;
    const panel = this.container.querySelector('#propertiesPanel');
    panel.className = 'properties-panel';
  }
  
  togglePreview() {
    const canvas = this.container.querySelector('.editor-canvas');
    const preview = this.container.querySelector('.editor-preview');
    
    if (preview.style.display === 'none') {
      canvas.style.display = 'none';
      preview.style.display = 'block';
      this.generatePreview();
    } else {
      canvas.style.display = 'flex';
      preview.style.display = 'none';
    }
  }
  
  generatePreview() {
    if (!this.document) return;
    
    const iframe = this.container.querySelector('#previewFrame');
    const previewContent = this.generatePreviewHTML();
    
    iframe.srcdoc = previewContent;
  }
  
  generatePreviewHTML() {
    const styles = this.document.styles || {};
    
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${this.document.title}</title>
    <style>
        body {
            font-family: ${styles.fonts?.body?.family || 'Georgia'};
            font-size: ${styles.fonts?.body?.size || '11pt'};
            line-height: ${styles.fonts?.body?.lineHeight || '1.4'};
            margin: ${styles.margins?.top || '0.75in'} ${styles.margins?.right || '0.5in'} 
                    ${styles.margins?.bottom || '0.75in'} ${styles.margins?.left || '0.5in'};
            color: ${styles.colors?.text || '#000000'};
        }
        h1, h2, h3, h4, h5, h6 {
            font-family: ${styles.fonts?.heading?.family || 'Georgia'};
            color: ${styles.colors?.heading || '#2c3e50'};
        }
        img { max-width: 100%; height: auto; }
        .caption { font-style: italic; text-align: center; margin-top: 0.5em; }
    </style>
</head>
<body>
    ${this.document.pages.map(page => 
      page.elements?.map(element => {
        switch (element.type) {
          case 'paragraph':
            return `<p>${element.content}</p>`;
          case 'heading':
            return `<h${element.level}>${element.content}</h${element.level}>`;
          case 'image':
            return `<img src="${element.src}" alt="${element.alt}" />
                    ${element.caption ? `<div class="caption">${element.caption}</div>` : ''}`;
          default:
            return `<div>${element.content}</div>`;
        }
      }).join('') || ''
    ).join('<div style="page-break-before: always;"></div>')}
</body>
</html>`;
  }
  
  async exportToKindle() {
    if (!this.document) {
      alert('Nenhum documento para exportar');
      return;
    }
    
    try {
      const response = await fetch(`/api/editor/documents/${this.document.id}/export/kindle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          options: {
            includeImages: true,
            optimizeForKindle: true
          }
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Download file
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = result.filename;
        link.click();
        
        alert('Documento exportado para Kindle com sucesso!');
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('Erro na exportação:', error);
      alert('Erro ao exportar: ' + error.message);
    }
  }
  
  getTemplateStyles(templateId) {
    const template = this.templates.find(t => t.id === templateId);
    return template ? template.styles : {};
  }
  
  changeTemplate(templateId) {
    if (this.document) {
      this.document.template = templateId;
      this.document.styles = this.getTemplateStyles(templateId);
      this.renderCurrentPage();
    }
  }
  
  generateId() {
    return 'el_' + Math.random().toString(36).substr(2, 9);
  }
  
  async saveDocument() {
    if (!this.document) return;
    
    try {
      const response = await fetch('/api/editor/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.document)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Documento salvo com sucesso');
      }
      
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
    }
  }
}

// Instância global
let visualEditor;