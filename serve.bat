@echo off
rem Lance le jeu en local : http://localhost:8080/?dev
rem "py" (lanceur Python officiel) est essayé en premier : "python" peut pointer vers le faux raccourci du Microsoft Store.
start "" http://localhost:8080/?dev
py "%~dp0tools\serve.py" 8080
if errorlevel 1 python "%~dp0tools\serve.py" 8080
pause
