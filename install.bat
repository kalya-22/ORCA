@echo off
echo ==================================================================
echo   Installing BlueCurrent + ORCA Dependencies...
echo ==================================================================
echo.
echo [1/2] Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Frontend npm install failed.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Installing backend dependencies...
cd server
call npm install
cd ..
if %errorlevel% neq 0 (
    echo [ERROR] Backend npm install failed.
    pause
    exit /b %errorlevel%
)

echo.
echo ==================================================================
echo   SUCCESS! All dependencies installed cleanly.
echo   You can now double-click start.bat to launch the application.
echo ==================================================================
echo.
pause

