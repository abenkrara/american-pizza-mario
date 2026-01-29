@echo off
title Reparar Login Vercel
echo ==========================================
echo   REPARANDO SESION DE VERCEL
echo ==========================================
echo.
echo Esto abrira el navegador para que inicies sesion de nuevo.
echo Por favor, sigue los pasos en el navegador.
echo.

call npx vercel login

echo.
echo ==========================================
echo   !LISTO! Ahora cierra esta ventana
echo   y vuelve a ejecutar deploy.bat
echo ==========================================
pause
