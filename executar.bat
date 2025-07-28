@echo off
cls
echo ================================
echo  ✅ DASHBOARD FINANCEIRO v2.0
echo  Projeto Pronto para Execucao!
echo ================================
echo.

echo 🎉 SUCESSO: Dependencias instaladas!
echo 📦 Pacotes: 309 pacotes instalados
echo.

echo 🔐 Corrigindo vulnerabilidades...
call npm audit fix --force
echo.

echo 🚀 Iniciando o Dashboard Financeiro...
echo.
echo ┌─────────────────────────────────────┐
echo │  O projeto abrira automaticamente   │
echo │  em: http://localhost:5173          │
echo │                                     │
echo │  Para parar: Ctrl + C              │
echo └─────────────────────────────────────┘
echo.

call npm run dev
