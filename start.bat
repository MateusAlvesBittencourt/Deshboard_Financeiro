@echo off
echo ================================
echo  Dashboard Financeiro v2.0
echo  Iniciando aplicacao...
echo ================================
echo.

echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js nao encontrado!
    echo Execute setup.bat primeiro para instalar as dependencias
    pause
    exit /b 1
)

echo ✅ Node.js OK!
echo.
echo 🚀 Iniciando servidor de desenvolvimento...
echo.
echo O Dashboard abrira em: http://localhost:5173
echo Para parar, pressione Ctrl+C
echo.

pnpm run dev 2>nul || npm run dev
