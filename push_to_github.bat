@echo off
set /p username="Enter your GitHub Username: "
echo Adding remote origin...
git remote remove origin 2>nul
git remote add origin https://github.com/%username%/prank.git
echo Pushing to main branch...
git branch -M main
git push -u origin main
pause
