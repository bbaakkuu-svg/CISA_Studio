# ApkFlow - Paso 1: Inicializacion de Capacitor y Configuracion del Contenedor Android.
param()

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigFile = Join-Path $ScriptDir "config.json"

if (-not (Test-Path $ConfigFile)) {
    Write-Error "No se encontro el archivo config.json en $ScriptDir"
    exit 1
}

$Config = Get-Content -Raw $ConfigFile | ConvertFrom-Json

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ApkFlow :: Paso 01 - Inicializacion de Capacitor 8" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$RawMobileDir = Join-Path $ScriptDir $Config.paths.mobileProjectDir
if (-not (Test-Path $RawMobileDir)) {
    New-Item -ItemType Directory -Path $RawMobileDir -Force | Out-Null
}
$MobileDir = (Resolve-Path $RawMobileDir).Path

$RawWebSourceDir = Join-Path $ScriptDir $Config.paths.webSourceDir
if (-not (Test-Path $RawWebSourceDir)) {
    New-Item -ItemType Directory -Path $RawWebSourceDir -Force | Out-Null
}
$WebSourceDir = (Resolve-Path $RawWebSourceDir).Path

$AndroidDir = Join-Path $MobileDir "android"
$TemplateFile = Join-Path $ScriptDir "templates/capacitor.config.template.json"

Write-Host "  Directorio Movil: $MobileDir" -ForegroundColor Gray
Write-Host "  Directorio Web:   $WebSourceDir" -ForegroundColor Gray

# 1. Asegurar package.json
$PackageJsonPath = Join-Path $MobileDir "package.json"
if (-not (Test-Path $PackageJsonPath)) {
    Write-Host "  Creando package.json base..." -ForegroundColor Yellow
    Set-Location $MobileDir
    npm init -y | Out-Null
}

# 2. Instalar Capacitor 8
Write-Host "  Instalando dependencias de Capacitor 8..." -ForegroundColor Cyan
Set-Location $MobileDir
npm install "@capacitor/core@$($Config.capacitor.coreVersion)" "@capacitor/android@$($Config.capacitor.androidVersion)" --save
npm install "@capacitor/cli@$($Config.capacitor.cliVersion)" --save-dev

# 3. Generar capacitor.config.json desde template sin BOM
Write-Host "  Generando capacitor.config.json..." -ForegroundColor Cyan
$CapacitorTemplate = Get-Content -Raw $TemplateFile
$CapacitorConfig = $CapacitorTemplate `
    -replace '\{\{APP_ID\}\}', $Config.project.appId `
    -replace '\{\{APP_NAME\}\}', $Config.project.appName `
    -replace '\{\{SERVER_SCHEME\}\}', $Config.capacitor.serverScheme `
    -replace '\{\{CLEARTEXT\}\}', ($Config.capacitor.cleartext.ToString().ToLower()) `
    -replace '\{\{SPLASH_DURATION\}\}', $Config.capacitor.splashScreen.launchShowDuration `
    -replace '\{\{SPLASH_BG\}\}', $Config.capacitor.splashScreen.backgroundColor `
    -replace '\{\{STATUSBAR_STYLE\}\}', $Config.capacitor.statusBar.style `
    -replace '\{\{STATUSBAR_BG\}\}', $Config.capacitor.statusBar.backgroundColor

$TargetCapConfig = Join-Path $MobileDir "capacitor.config.json"
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($TargetCapConfig, $CapacitorConfig, $Utf8NoBom)
Write-Host "     capacitor.config.json generado con exito (UTF-8 No-BOM)." -ForegroundColor Green

# 4. Anadir plataforma Android si no existe
if (-not (Test-Path $AndroidDir)) {
    Write-Host "  Anadiendo plataforma nativa Android (npx cap add android)..." -ForegroundColor Cyan
    npx cap add android
} else {
    Write-Host "  La carpeta nativa android/ ya existe. Omitiendo 'add android'." -ForegroundColor Gray
}

Write-Host "------------------------------------------------------------" -ForegroundColor Cyan
Write-Host "Paso 01 completado exitosamente." -ForegroundColor Green
exit 0
