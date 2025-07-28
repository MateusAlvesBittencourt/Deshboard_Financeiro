@echo off
echo ====================================
echo  DASHBOARD FINANCEIRO v2.0
echo ====================================
echo.
echo Iniciando o servidor de desenvolvimento...
echo.
cd /d "%~dp0"
npm run dev
echo.
echo Se o servidor nao iniciar automaticamente,
echo abra seu navegador em: http://localhost:5173
echo.
pause
