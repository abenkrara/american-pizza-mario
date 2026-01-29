@echo off
title Despliegue American Pizza Mario
echo ==========================================
echo   LANZANDO DESPLIEGUE A VERCEL (CMD)
echo ==========================================
echo.
echo 1. Intentando ejecutar Vercel (PRODUCCION)...
echo.

call npx vercel --prod

echo.
echo ==========================================
echo   SI VES UN ERROR ARRIBA:
echo   Es posible que tengas que iniciar sesion.
echo   Sigue las instrucciones en pantalla.
echo ==========================================
pause
