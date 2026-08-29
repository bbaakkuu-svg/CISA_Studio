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

$RawMobileDir = Join-Path $ScriptDir $Config.paths.mobileProjectDir
if (-not (Test-Path $RawMobileDir)) {
    Write-Host "ERROR: El directorio móvil no existe. Ejecuta primero 01_Init_Capacitor.ps1" -ForegroundColor Red
    exit 1
}
$MobileDir = (Resolve-Path $RawMobileDir).Path

$RawWebSourceDir = Join-Path $ScriptDir $Config.paths.webSourceDir
if (-not (Test-Path $RawWebSourceDir)) {
    Write-Host "ERROR: No se encontró el directorio de distribución web en $RawWebSourceDir. Ejecuta 'npm run build' primero." -ForegroundColor Red
    exit 1
}
$WebSourceDir = (Resolve-Path $RawWebSourceDir).Path
$IndexHtml = Join-Path $WebSourceDir "index.html"

# 1. Validar archivos web
Write-Host -NoNewline "  Comprobando index.html en $WebSourceDir... "
if (Test-Path $IndexHtml) {
    Write-Host "OK" -ForegroundColor Green
} else {
    Write-Host "ERROR" -ForegroundColor Red
    Write-Host "     No se encontro index.html en $WebSourceDir. Por favor ejecuta 'npm run build'." -ForegroundColor Red
    exit 1
}

# 2. Copiar assets a www en el proyecto móvil para garantizar sincronización perfecta
$TargetWww = Join-Path $MobileDir "www"
if (-not (Test-Path $TargetWww)) {
    New-Item -ItemType Directory -Path $TargetWww -Force | Out-Null
}
Copy-Item -Path (Join-Path $WebSourceDir "*") -Destination $TargetWww -Recurse -Force
Write-Host "  Assets web sincronizados en $TargetWww" -ForegroundColor Gray

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
