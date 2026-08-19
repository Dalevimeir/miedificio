@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === העלאת עדכון ===
git add -A
git commit -m "update %date% %time%"
if errorlevel 1 echo (אין שינויים לשמור)
git push
echo.
echo נשלח. נטליפיי מפרסמת תוך כדקה.
pause
