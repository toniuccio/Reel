@echo off
REM Doppio clic per avviare Vels Reel Studio su Windows
cd /d "%~dp0"
where node >nul 2>nul || (echo Installa Node.js da https://nodejs.org & pause & exit /b)
where ffmpeg >nul 2>nul || (echo Installa FFmpeg:  winget install Gyan.FFmpeg & pause & exit /b)
start "" http://localhost:4747
node server.js
pause
