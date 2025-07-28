@echo off
echo ================================
echo  Dashboard Financeiro v2.0
echo  Script de Instalacao e Execucao
echo ================================
echo.

echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js nao encontrado!
    echo.
    echo 📋 INSTRUCOES:
    echo 1. Acesse: https://nodejs.org/
    echo 2. Baixe a versao LTS (recomendada^)
    echo 3. Execute o instalador .msi
    echo 4. Marque "Add to PATH" durante a instalacao
    echo 5. Reinicie este terminal apos a instalacao
    echo 6. Execute este script novamente
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado!
node --version
echo.

echo Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm nao encontrado!
    echo Reinstale o Node.js com a opcao "npm package manager"
    pause
    exit /b 1
)

echo ✅ npm encontrado!
npm --version
echo.

echo 📦 Instalando dependencias do projeto...
npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependencias!
    echo Tente executar como Administrador
    pause
    exit /b 1
)

echo.
echo ✅ Dependencias instaladas com sucesso!
echo.
echo 🚀 Iniciando Dashboard Financeiro...
echo.
echo O navegador abrira automaticamente em:
echo http://localhost:5173
echo.
echo Para parar o servidor, pressione Ctrl+C
echo.

npm run dev
