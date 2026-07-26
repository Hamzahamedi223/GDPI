@echo off
title GDPI Launcher

echo Starting GDPI Backend...
cd /d "%~dp0Backend"
start "GDPI Backend" cmd /k npm run dev

echo Starting GDPI Frontend...
cd /d "%~dp0Frontend"
start "GDPI Frontend" cmd /k npm run dev

echo Waiting for servers to come up...
timeout /t 6 /nobreak >nul

start "" "http://localhost:3000"
