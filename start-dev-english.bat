@echo off
chcp 65001 >nul 2>&1
set LANG=en_US.UTF-8
set LC_ALL=en_US.UTF-8
cd /d "C:\Users\Ayden\mega-ui"
powershell -Command "& {[System.Threading.Thread]::CurrentThread.CurrentUICulture = 'en-US'; [System.Threading.Thread]::CurrentThread.CurrentCulture = 'en-US'; npm run dev}" 