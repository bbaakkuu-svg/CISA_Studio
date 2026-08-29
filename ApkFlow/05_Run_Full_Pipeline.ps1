# ApkFlow - Orquestador Maestro "One-Click Pipeline" (Web a APK Android Firmado).
param(
    [switch]$NonInteractive
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigFile = Join-Path $ScriptDir "config.json"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ApkFlow :: SUITE DE AUTOMATIZACION WEB A APK ANDROID" -ForegroundColor Cyan
Write-Host "  Motor Hibrido: Capacitor 8 | SDK 36 (Android 16 Ready) | APK v2" -ForegroundColor Gray
Write-Host "============================================================" -ForegroundColor Cyan

if (-not (Test-Path $ConfigFile)) {
    Write-Host "Error: config.json no encontrado." -ForegroundColor Red
    exit 1
}

$Config = Get-Content -Raw $ConfigFile | ConvertFrom-Json
Write-Host "  Proyecto:  $($Config.project.appName) ($($Config.project.appId))" -ForegroundColor White
Write-Host "  Version:   v$($Config.project.versionName) (code $($Config.project.versionCode))" -ForegroundColor White
Write-Host "  Web Dir:   $($Config.paths.webSourceDir)" -ForegroundColor White
Write-Host "------------------------------------------------------------" -ForegroundColor Cyan

$Stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

function Execute-Step {
    param(
        [string]$ScriptName,
        [string]$StepTitle
    )
    Write-Host "`n>>> [EJECUTANDO] $StepTitle..." -ForegroundColor Cyan
    $ScriptPath = Join-Path $ScriptDir $ScriptName
    & $ScriptPath
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`nError critico durante: $StepTitle ($ScriptName)" -ForegroundColor Red
        exit 1
    }
}

# Ejecucion secuencial de los 6 pasos
Execute-Step -ScriptName "00_Check_Environment.ps1"       -StepTitle "Paso 0: Verificacion del Entorno"
Execute-Step -ScriptName "01_Init_Capacitor.ps1"           -StepTitle "Paso 1: Inicializacion de Capacitor 8"
Execute-Step -ScriptName "02_Setup_Keystore.ps1"          -StepTitle "Paso 2: Criptografia y Configuracion Gradle"
Execute-Step -ScriptName "02b_Apply_Custom_App_Icon.ps1"   -StepTitle "Paso 2b: Branding & Generacion de Iconos Nativos"
Execute-Step -ScriptName "03_Sync_Web_Assets.ps1"         -StepTitle "Paso 3: Sincronizacion de Recursos Web"
Execute-Step -ScriptName "04_Build_Signed_APK.ps1"        -StepTitle "Paso 4: Compilacion y Exportacion de APK Firmado"

$Stopwatch.Stop()
$Elapsed = $Stopwatch.Elapsed.ToString("mm\:ss")

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "  PIPELINE DE APKFLOW COMPLETADO EXITOSAMENTE EN $Elapsed!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
$FinalApk = Join-Path $ScriptDir "$($Config.paths.outputDir)/$($Config.project.appName)-v$($Config.project.versionName)-signed.apk"
Write-Host "  Tu aplicacion movil nativa esta lista para descargar e instalar:" -ForegroundColor White
Write-Host "     $FinalApk" -ForegroundColor Yellow
Write-Host "============================================================`n" -ForegroundColor Green
exit 0
