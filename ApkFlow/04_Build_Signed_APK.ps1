# ApkFlow - Paso 4: Compilacion del Binario Nativo y Generacion de APK Firmado.
param()

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigFile = Join-Path $ScriptDir "config.json"

if (-not (Test-Path $ConfigFile)) {
    Write-Error "No se encontro el archivo config.json en $ScriptDir"
    exit 1
}

$Config = Get-Content -Raw $ConfigFile | ConvertFrom-Json

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ApkFlow :: Paso 04 - Compilacion de APK Firmado" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$AndroidDir = Resolve-Path (Join-Path $ScriptDir $Config.paths.androidDir)
$OutputDir = Join-Path $ScriptDir $Config.paths.outputDir
$DistDir = Resolve-Path (Join-Path $ScriptDir $Config.paths.distDir)
$RepoRoot = Resolve-Path (Join-Path $ScriptDir "..")

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$GradlewBat = Join-Path $AndroidDir "gradlew.bat"

if (-not (Test-Path $GradlewBat)) {
    Write-Host "  Error: No se encontro gradlew.bat en $AndroidDir" -ForegroundColor Red
    exit 1
}

# 1. Compilacion con Gradle Wrapper
Write-Host "  Compilando release con Gradle Wrapper (assembleRelease)..." -ForegroundColor Cyan
Write-Host "     (Espere mientras se empaqueta el binario DEX y se firman los bloques v1/v2)" -ForegroundColor Gray

Set-Location $AndroidDir

if ($IsWindows -or $env:OS -like "*Windows*") {
    & ".\gradlew.bat" assembleRelease
} else {
    chmod +x ./gradlew
    & "./gradlew" assembleRelease
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "     Error en la compilacion de Gradle." -ForegroundColor Red
    exit 1
}

# 2. Localizar el APK generado
$GeneratedApkPath = Join-Path $AndroidDir "app/build/outputs/apk/release/app-release.apk"

if (-not (Test-Path $GeneratedApkPath)) {
    Write-Host "     Error: No se encontro el APK generado en: $GeneratedApkPath" -ForegroundColor Red
    exit 1
}

# 3. Exportar con nombre versionado
$FinalApkName = "$($Config.project.appName)-v$($Config.project.versionName)-signed.apk"
$TargetOutputApk = Join-Path $OutputDir $FinalApkName
$TargetDistApk = Join-Path $DistDir $FinalApkName
$TargetRootApk = Join-Path $RepoRoot $FinalApkName

Copy-Item -Path $GeneratedApkPath -Destination $TargetOutputApk -Force
Copy-Item -Path $GeneratedApkPath -Destination $TargetDistApk -Force
Copy-Item -Path $GeneratedApkPath -Destination $TargetRootApk -Force

$ApkItem = Get-Item $TargetOutputApk
$SizeMB = [math]::Round($ApkItem.Length / 1MB, 2)

Write-Host "------------------------------------------------------------" -ForegroundColor Cyan
Write-Host "APK Firmado generado exitosamente!" -ForegroundColor Green
Write-Host "  Archivo: $FinalApkName" -ForegroundColor White
Write-Host "  Tamano:  $SizeMB MB ($($ApkItem.Length) bytes)" -ForegroundColor White
Write-Host "  Version: v$($Config.project.versionName) (code: $($Config.project.versionCode))" -ForegroundColor White
Write-Host "  Ubicacion Output: $TargetOutputApk" -ForegroundColor Yellow
Write-Host "  Ubicacion Dist:   $TargetDistApk" -ForegroundColor Gray
Write-Host "  Ubicacion Raiz:   $TargetRootApk" -ForegroundColor Gray
Write-Host "------------------------------------------------------------" -ForegroundColor Cyan
Write-Host "Paso 04 completado. El binario esta 100% listo para descargar e instalar." -ForegroundColor Green
exit 0
