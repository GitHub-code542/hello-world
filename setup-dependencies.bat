@echo off
REM Setup script to download local copies of JavaScript dependencies
REM This allows the application to work offline and ensures version consistency

echo.
echo 🚀 Setting up local dependencies for Interactive Financial Planning App...
echo.

REM Create directories
if not exist "js" mkdir js
if not exist "css" mkdir css

echo 📁 Created js\ and css\ directories
echo.

REM Download Chart.js v4.4.0
echo ⬇️  Downloading Chart.js v4.4.0...
curl -L -o js\chart.umd.min.js https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js

if %ERRORLEVEL% EQU 0 (
    echo ✅ Chart.js downloaded successfully
) else (
    echo ❌ Failed to download Chart.js
    echo    Please download manually from: https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js
    echo    Save to: js\chart.umd.min.js
)

echo.

REM Download chartjs-plugin-dragdata v2.2.5
echo ⬇️  Downloading chartjs-plugin-dragdata v2.2.5...
curl -L -o js\chartjs-plugin-dragdata.min.js https://cdn.jsdelivr.net/npm/chartjs-plugin-dragdata@2.2.5/dist/chartjs-plugin-dragdata.min.js

if %ERRORLEVEL% EQU 0 (
    echo ✅ chartjs-plugin-dragdata downloaded successfully
) else (
    echo ❌ Failed to download chartjs-plugin-dragdata
    echo    Please download manually from: https://cdn.jsdelivr.net/npm/chartjs-plugin-dragdata@2.2.5/dist/chartjs-plugin-dragdata.min.js
    echo    Save to: js\chartjs-plugin-dragdata.min.js
)

echo.
echo 📊 Checking downloaded files...
dir js\

echo.
echo ✨ Setup complete!
echo.
echo 📝 Note: If downloads failed due to network restrictions, you can:
echo    1. Download the files manually using the URLs above
echo    2. Or keep using CDN links (works fine for most users)
echo.
echo 🎯 Your application will automatically use local files if they exist in js\ folder
echo.

pause
