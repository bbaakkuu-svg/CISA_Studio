# ApkFlow - Paso 2: Criptografia, Keystore y Configuracion de Firma en Gradle.
param()

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigFile = Join-Path $ScriptDir "config.json"

if (-not (Test-Path $ConfigFile)) {
    Write-Error "No se encontro el archivo config.json en $ScriptDir"
    exit 1
}

$Config = Get-Content -Raw $ConfigFile | ConvertFrom-Json

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ApkFlow :: Paso 02 - Criptografia & Keystore de Firma" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# Asegurar JDK y keytool en PATH
$candidateJdks = @(
    "C:\Program Files\Java\jdk-21",
    "C:\Program Files\Java\jdk-17",
    $env:JAVA_HOME
)
foreach ($jdk in $candidateJdks) {
    if ($jdk -and (Test-Path "$jdk\bin\keytool.exe")) {
        $env:JAVA_HOME = $jdk
        if ($env:PATH -notlike "*$jdk\bin*") {
            $env:PATH = "$jdk\bin;$($env:PATH)"
        }
        break
    }
}

$AndroidDir = Resolve-Path (Join-Path $ScriptDir $Config.paths.androidDir)
$AppDir = Join-Path $AndroidDir "app"
$KeystorePath = Join-Path $AppDir $Config.signing.keystoreFile

# 1. Generar Keystore si no existe
if (-not (Test-Path $KeystorePath)) {
    Write-Host "  Generando almacen criptografico de produccion ($($Config.signing.keystoreFile))..." -ForegroundColor Cyan
    
    $keytoolArgs = @(
        "-genkey",
        "-v",
        "-keystore", $KeystorePath,
        "-alias", $Config.signing.keyAlias,
        "-keyalg", $Config.signing.keyAlgorithm,
        "-keysize", $Config.signing.keySize,
        "-validity", $Config.signing.validityDays,
        "-storepass", $Config.signing.storePassword,
        "-keypass", $Config.signing.keyPassword,
        "-dname", $Config.signing.dname
    )
    
    & keytool @keytoolArgs
    
    if (Test-Path $KeystorePath) {
        Write-Host "     Keystore generado con exito en: $KeystorePath" -ForegroundColor Green
    } else {
        Write-Host "     Error: No se pudo generar el Keystore." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  Keystore ya existente en: $KeystorePath" -ForegroundColor Gray
}

$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# 2. Configurar variables.gradle sin BOM
Write-Host "  Aplicando variables.gradle (SDK 36, Min 24)..." -ForegroundColor Cyan
$VariablesTemplateFile = Join-Path $ScriptDir "templates/variables.gradle.template"
$VariablesContent = Get-Content -Raw $VariablesTemplateFile
$VariablesContent = $VariablesContent `
    -replace '\{\{MIN_SDK_VERSION\}\}', $Config.android.minSdkVersion `
    -replace '\{\{COMPILE_SDK_VERSION\}\}', $Config.android.compileSdkVersion `
    -replace '\{\{TARGET_SDK_VERSION\}\}', $Config.android.targetSdkVersion `
    -replace '\{\{ANDROIDX_APPCOMPAT_VERSION\}\}', $Config.android.androidxAppCompatVersion `
    -replace '\{\{ANDROIDX_COORDINATORLAYOUT_VERSION\}\}', $Config.android.androidxCoordinatorLayoutVersion `
    -replace '\{\{CORE_SPLASHSCREEN_VERSION\}\}', $Config.android.coreSplashScreenVersion

$TargetVariablesPath = Join-Path $AndroidDir "variables.gradle"
[System.IO.File]::WriteAllText($TargetVariablesPath, $VariablesContent, $Utf8NoBom)
Write-Host "     variables.gradle actualizado (No-BOM)." -ForegroundColor Green

# 3. Configurar app/build.gradle con signingConfigs sin BOM
Write-Host "  Aplicando build.gradle con firma criptografica (v1 + v2)..." -ForegroundColor Cyan
$BuildGradleTemplateFile = Join-Path $ScriptDir "templates/build.gradle.template"
$BuildGradleContent = Get-Content -Raw $BuildGradleTemplateFile
$BuildGradleContent = $BuildGradleContent `
    -replace '\{\{APP_ID\}\}', $Config.project.appId `
    -replace '\{\{VERSION_CODE\}\}', $Config.project.versionCode `
    -replace '\{\{VERSION_NAME\}\}', $Config.project.versionName `
    -replace '\{\{KEYSTORE_FILE\}\}', $Config.signing.keystoreFile `
    -replace '\{\{STORE_PASSWORD\}\}', $Config.signing.storePassword `
    -replace '\{\{KEY_ALIAS\}\}', $Config.signing.keyAlias `
    -replace '\{\{KEY_PASSWORD\}\}', $Config.signing.keyPassword `
    -replace '\{\{V1_SIGNING\}\}', ($Config.signing.v1SigningEnabled.ToString().ToLower()) `
    -replace '\{\{V2_SIGNING\}\}', ($Config.signing.v2SigningEnabled.ToString().ToLower())

$TargetBuildGradlePath = Join-Path $AppDir "build.gradle"
[System.IO.File]::WriteAllText($TargetBuildGradlePath, $BuildGradleContent, $Utf8NoBom)
Write-Host "     app/build.gradle configurado con signingConfigs (No-BOM)." -ForegroundColor Green

Write-Host "------------------------------------------------------------" -ForegroundColor Cyan
Write-Host "Paso 02 completado exitosamente." -ForegroundColor Green
exit 0
