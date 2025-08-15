# 🚨 SOLUÇÃO RÁPIDA DE PROBLEMAS

## ❌ **Problema: Ambientes virtuais não encontrados**

### Sintomas:
- "❌ Ambiente virtual do Agno NÃO encontrado"
- "❌ Ambiente virtual do Crawl4AI NÃO encontrado"

### Solução Rápida:
```bash
# Execute a configuração de emergência
scripts\emergency-setup.bat
```

### Solução Completa:
```bash
# Execute o setup completo
scripts\setup-python-services.bat
```

---

## ❌ **Problema: Python não encontrado**

### Sintomas:
- "'python' não é reconhecido como comando"
- "Python não encontrado no PATH"

### Solução:
1. **Baixe Python**: https://python.org/downloads/
2. **Durante a instalação**: ✅ Marque "Add Python to PATH"
3. **Reinicie o computador**
4. **Execute**: `scripts\emergency-setup.bat`

---

## ❌ **Problema: Node.js não encontrado**

### Sintomas:
- "'node' não é reconhecido como comando"
- "Node.js não encontrado"

### Solução:
1. **Baixe Node.js**: https://nodejs.org/
2. **Instale a versão LTS**
3. **Reinicie o computador**
4. **Execute**: `npm install`

---

## ❌ **Problema: Dependências não instalam**

### Sintomas:
- "ERROR: No matching distribution found"
- "Failed building wheel"
- "Microsoft Visual C++ 14.0 is required"

### Solução:
```bash
# Use a configuração de emergência (dependências mínimas)
scripts\emergency-setup.bat
```

---

## ❌ **Problema: Portas em uso**

### Sintomas:
- "Port already in use"
- "EADDRINUSE"

### Solução:
```bash
# Verificar quais processos estão usando as portas
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :8000
netstat -ano | findstr :8001

# Matar processo específico (substitua <PID>)
taskkill /PID <PID> /F

# Ou reinicie o computador
```

---

## ❌ **Problema: Permissões negadas**

### Sintomas:
- "Permission denied"
- "Access is denied"

### Solução:
1. **Execute como Administrador**:
   - Clique com botão direito no `INICIAR.bat`
   - Escolha "Executar como administrador"

2. **Ou desative temporariamente o antivírus**

---

## 🚀 **SOLUÇÃO UNIVERSAL**

Se nada funcionar, execute esta sequência:

### 1. Diagnóstico
```bash
# Execute para identificar problemas
scripts\diagnose.bat
```

### 2. Limpeza
```bash
# Limpe tudo e reinstale
scripts\clean-install.bat
```

### 3. Configuração de Emergência
```bash
# Configure apenas o essencial
scripts\emergency-setup.bat
```

### 4. Teste
```bash
# Verifique se funciona
scripts\test-services-simple.bat
```

---

## 🎯 **MODO MÍNIMO (Sempre Funciona)**

Se você só quer que funcione, use apenas:

1. **Execute**: `scripts\emergency-setup.bat`
2. **Execute**: `INICIAR.bat`
3. **Escolha**: "INICIAR ESSENCIAL"
4. **Acesse**: http://localhost:3000

Isso dará:
- ✅ Interface web completa
- ✅ Backend Node.js funcionando
- ⚠️ Sem RAG avançado
- ⚠️ Sem web scraping avançado

---

## 📞 **Ainda com Problemas?**

### Informações para Suporte:
1. **Execute**: `scripts\diagnose.bat`
2. **Copie toda a saída**
3. **Inclua**:
   - Versão do Windows
   - Mensagens de erro completas
   - O que você estava tentando fazer

### Contato:
- Abra uma issue no GitHub
- Inclua o resultado do diagnóstico
- Descreva o problema detalhadamente

---

## 💡 **Dicas Importantes**

### ✅ **Faça Sempre**:
- Execute como administrador se houver problemas
- Reinicie o computador após instalar Python/Node.js
- Use `scripts\diagnose.bat` para identificar problemas
- Mantenha antivírus atualizado mas considere exceções

### ❌ **Nunca Faça**:
- Não instale Python/Node.js em pastas com espaços ou acentos
- Não use versões muito antigas do Python (< 3.8)
- Não execute múltiplas instâncias do INICIAR.bat
- Não modifique arquivos sem fazer backup

---

**🎉 Na dúvida, use sempre `scripts\emergency-setup.bat` - ele resolve 90% dos problemas!**