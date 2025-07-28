# 🚀 Guia de Instalação - Dashboard Financeiro v2.0

## ❌ Problema Identificado
O Node.js não está instalado no sistema ou não está configurado no PATH.

## ✅ Solução: Instalar Node.js

### Passo 1: Baixar e Instalar Node.js

1. **Acesse**: https://nodejs.org/
2. **Baixe** a versão LTS (recomendada)
3. **Execute** o instalador `.msi`
4. **Siga** o assistente de instalação
5. **Marque** a opção "Add to PATH" (adicionar ao PATH)

### Passo 2: Verificar Instalação

Após a instalação, **feche e reabra** o terminal/cmd e execute:

```cmd
node --version
npm --version
```

Deve aparecer as versões instaladas, exemplo:
```
v20.11.0
10.2.4
```

### Passo 3: Instalar Dependências do Projeto

```cmd
# Navegar para o diretório (se não estiver)
cd c:\Users\10087622\Downloads\git\Deshboard_Financeiro

# Instalar dependências
npm install
```

### Passo 4: Executar o Projeto

```cmd
# Iniciar servidor de desenvolvimento
npm run dev
```

### Passo 5: Acessar no Navegador

Abra: http://localhost:5173

## 🎯 Instalação Alternativa com PNPM (Opcional)

Se quiser usar PNPM (mais rápido):

```cmd
# Instalar PNPM globalmente
npm install -g pnpm

# Instalar dependências do projeto
pnpm install

# Executar projeto
pnpm run dev
```

## 🛠️ Script de Instalação Automática

Criei um script que faz tudo automaticamente após instalar o Node.js:

### Windows (setup.bat)
```batch
@echo off
echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js nao encontrado! 
    echo Por favor, instale o Node.js em: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js encontrado! Instalando dependencias...
npm install

echo Iniciando Dashboard Financeiro...
npm run dev
pause
```

## 🚨 Troubleshooting

### Erro: "node não é reconhecido"
- Reinicie o terminal após instalar Node.js
- Verifique se foi marcada a opção "Add to PATH"
- Reinstale o Node.js se necessário

### Erro: "Permission denied"
- Execute o terminal como Administrador
- Use `npm install --no-optional` se houver problemas

### Erro: "Module not found"
- Delete `node_modules` e `package-lock.json`
- Execute `npm install` novamente

### Erro: "Port 5173 already in use"
- Feche outras aplicações usando a porta
- Ou use: `npm run dev -- --port 3000`

## 📋 Checklist Pós-Instalação

- [ ] Node.js instalado (v18+)
- [ ] npm funcionando
- [ ] Dependências instaladas (`npm install`)
- [ ] Projeto rodando (`npm run dev`)
- [ ] Navegador abrindo em localhost:5173
- [ ] Interface carregando corretamente

## 🎉 Resultado Esperado

Após seguir os passos, você verá:

```
  VITE v6.3.5  ready in 542 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

E a interface do Dashboard Financeiro abrirá no navegador!

## 📞 Suporte

Se ainda houver problemas:
1. Verifique se tem Windows 10/11
2. Execute como Administrador
3. Desative antivírus temporariamente
4. Verifique conexão com internet
