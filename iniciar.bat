@echo off
echo ================================
echo  DASHBOARD FINANCEIRO v2.0
echo  Iniciando projeto...
echo ================================
echo.
echo Corrigindo vulnerabilidades...
npm audit fix --force
echo.
echo Iniciando servidor de desenvolvimento...
echo Acesse: http://localhost:5173
echo Para parar: Ctrl + C
echo.
npm run dev
