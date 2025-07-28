@echo off
echo ================================
echo  DIAGNOSTICO DO SISTEMA
echo  Dashboard Financeiro v2.0
echo ================================
echo.

echo 🔍 Verificando ambiente...
echo.

echo --- SISTEMA OPERACIONAL ---
ver
echo.

echo --- NODE.JS ---
node --version 2>nul && (
    echo ✅ Node.js encontrado: 
    node --version
) || (
    echo ❌ Node.js NAO encontrado
    echo 📋 Solucao: Instale em https://nodejs.org/
)
echo.

echo --- NPM ---
npm --version 2>nul && (
    echo ✅ npm encontrado:
    npm --version
) || (
    echo ❌ npm NAO encontrado
)
echo.

echo --- PNPM ---
pnpm --version 2>nul && (
    echo ✅ pnpm encontrado:
    pnpm --version
) || (
    echo ℹ️ pnpm nao instalado (opcional)
)
echo.

echo --- DIRETORIO ATUAL ---
echo %CD%
echo.

echo --- ARQUIVOS DO PROJETO ---
if exist package.json (
    echo ✅ package.json encontrado
) else (
    echo ❌ package.json NAO encontrado
)

if exist src\App.jsx (
    echo ✅ src\App.jsx encontrado
) else (
    echo ❌ src\App.jsx NAO encontrado
)

if exist node_modules (
    echo ✅ node_modules existe
) else (
    echo ❌ node_modules NAO existe - execute 'npm install'
)
echo.

echo --- DEPENDENCIAS DO PROJETO ---
if exist package.json (
    echo Verificando package.json...
    type package.json | findstr "react"
    type package.json | findstr "vite"
) else (
    echo package.json nao encontrado
)
echo.

echo --- RECOMENDACOES ---
node --version >nul 2>&1 || (
    echo 🚨 CRITICO: Instale Node.js primeiro
    echo    URL: https://nodejs.org/
    echo.
)

if not exist node_modules (
    echo 🔧 Execute: npm install
    echo.
)

echo --- PROXIMOS PASSOS ---
echo 1. Se Node.js nao estiver instalado: baixe em https://nodejs.org/
echo 2. Se node_modules nao existir: execute 'npm install'
echo 3. Para iniciar o projeto: execute 'npm run dev'
echo 4. Acesse: http://localhost:5173
echo.

pause
