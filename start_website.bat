@echo off
echo Starting Love Calculator Prank...
cd backend
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
start http://localhost:5000
npm start
pause
