@echo off
title Despliegue American Pizza Mario
echo ==========================================
echo   LANZANDO DESPLIEGUE A VERCEL (PROD)
echo ==========================================
echo.
echo Ejecutando: npx vercel --prod
echo.

call npx vercel --prod

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ==========================================
    echo   ERROR: EL DESPLIEGUE FALLO
    echo   Tu sesion podria haber caducado.
    echo   Ejecuta 'reparar_login.bat' primero.
    echo ==========================================
    color 47
) else (
    echo.
    echo ==========================================
    echo   EXITO: DESPLIEGUE COMPLETADO
    echo   Ya puedes cerrar esta ventana.
    echo ==========================================
    color 27
)
pause
