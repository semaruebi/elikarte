@echo off
chcp 65001 >nul
echo 精鋭画像リストを更新するわよ💉
echo.
node "%~dp0update-elite-images.js"
echo.
pause

