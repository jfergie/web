@echo off

set a1=%1
if "%a1%"=="m" set a1="mobile"
if "%a1%"=="d" set a1="desktop"
if "%a1%"=="p" set a1="pagespeed"
if "%a1%"=="b" set a1="build"
if "%a1%"=="t" set a1="test"
if "%a1%"=="c" set a1="clean"
if "%a1%"=="i" set a1="images"
if "%a1%"=="j" set a1="jscs"
if "%a1%"=="l" set a1="lint"
if "%a1%"=="bs" set a1="browser-sync"
if "%a1%"=="o" set a1="open"
if "%a1%"=="c" set a1="compile-jade"

echo =============================================
echo GAC.cmd - GAC = Git Add and Commit
echo Example use: GAC "This is the commit description" [optional arge 2 will be used as the file spec for Git Add and Arg3 will be appended to the Git Commit command.
echo .
echo    Examples: 
echo		GAC "commit description" 
echo    results in: git add -A . && git commit -m "commit description"
echo.   
echo		GAC "commit description" *.js 
echo    results in: git add -A *.js && git commit -m "commit description"
echo.  
echo		GAC "commit description" *.js -D
echo    results in: git add -A *.js && git commit -m -D "commit description"
echo.  
echo Executed the following commands
echo set fspec = %2
echo if :fspec:=:: then set fspec=.
echo git add -A %fspec%
echo git add -A %fspec%
echo git commit %3 -m %1
echo git commit %3 -m %1


