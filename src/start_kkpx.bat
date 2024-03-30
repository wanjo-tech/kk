title kk server (proxy-mode)

set PXSVR=http://127.0.0.1:7777

@rem "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --proxy-server="%PXSVR%" --host-resolver-rules="MAP * 0.0.0.0, EXCLUDE 127.0.0.1" --test-type --disable-web-security --user-data-dir="%TMP%\%date%" --remote-debugging-port=9222 --remote-allow-origins=* --disable-features=Translate --no-first-run file://%cd%/cdp_backend.html
@rem "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --proxy-server="%PXSVR%" --host-resolver-rules="MAP * 0.0.0.0, EXCLUDE 127.0.0.1" --test-type --disable-web-security --user-data-dir="%TMP%\%date%" --remote-allow-origins=* --disable-features=Translate --no-first-run -app=file://%cd%/cdp_kk.html

start "KKBACK" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --proxy-server="%PXSVR%" --host-resolver-rules="MAP * 0.0.0.0, EXCLUDE 127.0.0.1" --test-type --disable-web-security --user-data-dir="%TMP%\kkback" --remote-debugging-port=9222 --remote-allow-origins=* --disable-features=Translate --no-first-run file://%cd%/cdp_backend.html

start "KKFRONT" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --proxy-server="%PXSVR%" --host-resolver-rules="MAP * 0.0.0.0, EXCLUDE 127.0.0.1" --test-type --disable-web-security --user-data-dir="%TMP%\kkfront" --remote-allow-origins=* --disable-features=Translate --no-first-run -app=file://%cd%/cdp_kk.html

:st
node server.js /app=kk /port=17777 /proxy=%PXSVR% %*
goto st
