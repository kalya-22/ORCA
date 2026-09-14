@echo off
echo ==================================================================
echo   Launching BlueCurrent + ORCA Platform (ISRO Challenge 26176)
echo ==================================================================
echo.
echo Starting backend server on port 4000...
start "BlueCurrent Server" cmd /k "cd server && npm start"

echo Starting frontend Vite dev server on port 5173...
start "BlueCurrent Frontend" cmd /k "npm run dev"

echo.
echo ------------------------------------------------------------------
echo   Backend URL:  http://localhost:4000
echo   Frontend URL: http://localhost:5173
echo ------------------------------------------------------------------
echo Both services are now running in their respective command windows.
echo You can minimize this window.
echo.
pause
