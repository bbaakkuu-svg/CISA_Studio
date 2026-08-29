# 08_Publicar_Release.ps1
# Automatiza el proceso de versionado y lanzamiento de una nueva release (Refactorizado)
. "$PSScriptRoot\00_Core_Loader.ps1"

$version = Read-Host "Cual es el numero de la nueva version? (ej: 1.4)"
if (!$version) { Write-WFLog "Operacion cancelada." "Red"; exit }

$tagName = "v$version"
$fullRepo = "$Global:REPO_OWNER/$Global:REPO_NAME"

Write-WFLog "--- INICIANDO PROCESO DE RELEASE $tagName ---"

# 1. Actualizar pom.xml (Maven) - Busqueda dinamica del archivo
$pomPath = Join-Path (Get-Location) "pom.xml"
if (Test-Path $pomPath) {
    Write-WFLog "Actualizando version en pom.xml..."
    (Get-Content $pomPath) -replace '<version>.*</version>', "<version>$version</version>" | Set-Content $pomPath
}

# 2. Git Workflow
Write-WFLog "Preparando tags y commits..."
git add .
git commit -m "chore: release $tagName para $($WFConfig.project.name)"
git tag -a $tagName -m "Release $tagName"

Write-WFLog "Sincronizando con $Global:BRANCH_MAIN..."
git checkout $Global:BRANCH_MAIN
git merge $Global:BRANCH_DEV
git push origin $Global:BRANCH_MAIN $Global:BRANCH_DEV --tags

# 3. GitHub Release
Write-WFLog "Creando Release en GitHub..." "Yellow"
$notas = @"
# 💊 VitalTrack $tagName — Plataforma Clínica Personal

### 🚀 Novedades de la Versión:
- 🔐 **Onboarding & Autenticación Segura:** Hashing SHA-256 y verificación de código OTP (6 dígitos).
- 🩺 **Entrada de Datos & Semáforo Clínico:** Botón flotante FAB (+) y modal interactivo con validación médica en tiempo real (AHA/ESC).
- 💾 **Persistencia Offline-First:** Motor IndexedDB relacional estructurado (`users`, `measurements`, `goals`, `alerts`).
- 📅 **Calendarización & Gráficas Dinámicas:** Calendario con mapa de calor y curvas interactivas con Chart.js.
- 📱 **Binario Nativo Android:** APK compilado y firmado criptográficamente (APK Signature Scheme v2).
"@

$apkPath = Join-Path (Get-Location) "VitalTrack-$version-signed.apk"
if (-not (Test-Path $apkPath)) {
    $apkPath = Join-Path (Get-Location) "VitalTrack-v2.0-signed.apk"
}

if (Test-Path $apkPath) {
    Write-WFLog "Adjuntando binario APK: $apkPath" "Cyan"
    gh release create $tagName $apkPath --title "$($WFConfig.project.name) $tagName" --notes $notas
} else {
    gh release create $tagName --title "$($WFConfig.project.name) $tagName" --notes $notas
}

Write-WFLog "Version $tagName publicada con exito en GitHub!" "Green"
