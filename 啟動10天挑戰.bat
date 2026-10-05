@echo off
chcp 65001 >nul
title 10天・6個量測挑戰
echo 正在啟動 10天・6個量測挑戰 本機伺服器...
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
