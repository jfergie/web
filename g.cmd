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
echo GULP [arg1 arg2 arg3 ]The first argument is exanded as follows:
echo    m=mobile, d=desktop, p=pagespeed, b=build, t=test
echo    c=clean,  i=images,  j=jscs,      l=lint,  o=open
echo    c=compile-jade,     bs=browser-sync
echo.   
echo Example: "gulp b" will expand to "gulp build"
echo =============================================
echo.  
echo Executing the following gulp 
echo gulp %a1% %2 %3 %4 %5 %5 %7 %8 %9
gulp %a1% %2 %3 %4 %5 %5 %7 %8 %9
set a1=
REM endlocal


REM setlocal enableDelayedExpansion

REM set x=1
REM set /a counter=0
REM for /l %%x in (1, 1, %argCount%) do (
REM set /a counter=!counter!+1
 
REM echo %%%x%
REM set x = %x% + 1
REM call echo %%!counter! 
REM )

REM call echo %1
REM set %1="this"
REM call echo %1