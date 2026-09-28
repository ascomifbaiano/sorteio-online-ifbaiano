@echo off
chcp 65001 > nul
cd /d "%~dp0"
title IF Baiano - Sorteio Online
echo ========================================================
echo   Abrindo Interface Web: Sorteio Online
echo ========================================================
start "" "%~dp0index.html"
