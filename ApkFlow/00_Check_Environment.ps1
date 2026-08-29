# ApkFlow - Paso 0: Verificacion y Diagnostico del Entorno de Desarrollo.
param()

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ApkFlow :: Paso 00 - Diagnostico del Entorno" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# Autodeteccion inteligente de JDK completo con keytool
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

# Autodeteccion inteligente de ANDROID_HOME si falta
if (-not $env:ANDROID_HOME -or -not (Test-Path $env:ANDROID_HOME)) {
    $defaultSdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
    if (Test-Path $defaultSdk) {
        $env:ANDROID_HOME = $defaultSdk
    }
}

$Global:HasErrors = $false

function Test-Executable {
    param(
        [string]$ToolName,
        [string]$ExecCommand,
        [string]$TestArgs = "--version",
        [bool]$IsRequired = $true,
        [string]$Hint = ""
    )
    
    Write-Host -NoNewline "  Verificando $ToolName... "
    try {
        $found = Get-Command $ExecCommand -ErrorAction SilentlyContinue
        if ($found) {
            $rawVer = & $ExecCommand $TestArgs 2>&1 | Select-Object -First 1
            $cleanVer = "$rawVer".Trim()
            Write-Host "OK" -ForegroundColor Green -NoNewline
            Write-Host " ($cleanVer)" -ForegroundColor Gray
            return
        } else {
            if ($IsRequired) {
                Write-Host "NO ENCONTRADO" -ForegroundColor Red
                Write-Host "     Error: $ToolName es requerido. $Hint" -ForegroundColor Yellow
                $Global:HasErrors = $true
            } else {
                Write-Host "OPCIONAL - NO DETECTADO" -ForegroundColor Yellow
            }
            return
        }
    } catch {
        Write-Host "ERROR" -ForegroundColor Red
        if ($IsRequired) { $Global:HasErrors = $true }
        return
    }
}

# 1. Node.js y npm
Test-Executable -ToolName "Node.js" -ExecCommand "node" -TestArgs "-v" -Hint "Instale Node.js LTS desde https://nodejs.org"
Test-Executable -ToolName "npm" -ExecCommand "npm" -TestArgs "-v" -Hint "npm viene integrado con Node.js."

# 2. Java Development Kit (JDK)
Test-Executable -ToolName "Java Runtime (java)" -ExecCommand "java" -TestArgs "-version" -Hint "Instale OpenJDK 17 o 21."
Test-Executable -ToolName "Java Compiler (javac)" -ExecCommand "javac" -TestArgs "-version" -Hint "Instale un JDK completo, no solo JRE."

# 3. Variables de Entorno Clave
Write-Host -NoNewline "  Variable JAVA_HOME... "
if ($env:JAVA_HOME -and (Test-Path $env:JAVA_HOME)) {
    Write-Host "OK" -ForegroundColor Green -NoNewline
    Write-Host " ($($env:JAVA_HOME))" -ForegroundColor Gray
} else {
    Write-Host "ADVERTENCIA" -ForegroundColor Yellow
    Write-Host "     JAVA_HOME no esta configurada o la ruta no existe." -ForegroundColor Yellow
}

Write-Host -NoNewline "  Variable ANDROID_HOME... "
if ($env:ANDROID_HOME -and (Test-Path $env:ANDROID_HOME)) {
    Write-Host "OK" -ForegroundColor Green -NoNewline
    Write-Host " ($($env:ANDROID_HOME))" -ForegroundColor Gray
} else {
    Write-Host "ADVERTENCIA" -ForegroundColor Yellow
    Write-Host "     ANDROID_HOME no esta configurada. Instale Android Studio." -ForegroundColor Yellow
}

# 4. Keytool
Test-Executable -ToolName "Java Keytool" -ExecCommand "keytool" -TestArgs "-help" -Hint "keytool se incluye en bin de JDK."

# 5. Git CLI
Test-Executable -ToolName "Git SCM" -ExecCommand "git" -TestArgs "--version" -IsRequired $false

# 6. GitHub CLI
Test-Executable -ToolName "GitHub CLI (gh)" -ExecCommand "gh" -TestArgs "--version" -IsRequired $false

Write-Host "------------------------------------------------------------" -ForegroundColor Cyan
if ($Global:HasErrors) {
    Write-Host "Se encontraron dependencias criticas faltantes." -ForegroundColor Red
    exit 1
} else {
    Write-Host "Entorno de desarrollo completamente verificado y listo!" -ForegroundColor Green
    exit 0
}
