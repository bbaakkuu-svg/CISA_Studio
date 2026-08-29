# ApkFlow - Paso 3: Sincronizacion de Recursos Web con la Plataforma Android.
param()

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigFile = Join-Path $ScriptDir "config.json"

if (-not (Test-Path $ConfigFile)) {
    Write-Error "No se encontro el archivo config.json en $ScriptDir"
    exit 1
}

$Config = Get-Content -Raw $ConfigFile | ConvertFrom-Json

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ApkFlow :: Paso 03 - Sincronizacion de Recursos Web" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$MobileDir = Resolve-Path (Join-Path $ScriptDir $Config.paths.mobileProjectDir)
$WebSourceDir = Resolve-Path (Join-Path $ScriptDir $Config.paths.webSourceDir)
$IndexHtml = Join-Path $WebSourceDir "index.html"

# 1. Validar archivos web
Write-Host -NoNewline "  Comprobando index.html en $WebSourceDir... "
if (Test-Path $IndexHtml) {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "ERROR" -ForegroundColor Red
    Write-Host "     No se encontro index.html en $WebSourceDir" -ForegroundColor Red
    exit 1
}

# 2. Ejecutar sincronizacion de Capacitor
Write-Host "  Ejecutando cap sync android..." -ForegroundColor Cyan
Set-Location $MobileDir

$capExecutable = Join-Path $MobileDir "node_modules/.bin/cap.cmd"
if (Test-Path $capExecutable) {
    & $capExecutable sync android
} else {
    npx cap sync android
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "     Recursos web sincronizados e inyectados en android/app/src/main/assets/public." -ForegroundColor Green
} else {
    Write-Host "     Error durante la sincronizacion de Capacitor." -ForegroundColor Red
    exit 1
}

Write-Host "------------------------------------------------------------" -ForegroundColor Cyan
Write-Host "Paso 03 completado exitosamente." -ForegroundColor Green
exit 0
