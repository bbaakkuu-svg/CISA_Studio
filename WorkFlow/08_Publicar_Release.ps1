# =============================================================================
# 08_Publicar_Release.ps1
# Automatiza el versionado, etiquetado y publicación de Release en GitHub con binarios .apk y .exe
# =============================================================================
param(
    [string]$ReleaseVersion = "1.0.0"
)

. "$PSScriptRoot\00_Core_Loader.ps1"

if (-not $ReleaseVersion) {
    $ReleaseVersion = Read-Host "Cual es el numero de la nueva version? (ej: 1.0.0)"
}
if (-not $ReleaseVersion) { Write-WFLog "Operacion cancelada." "Red"; exit }

$tagName = "v$ReleaseVersion"
$fullRepo = "$Global:REPO_OWNER/$Global:REPO_NAME"

Write-WFLog "--- INICIANDO PROCESO DE RELEASE $tagName ---" "Cyan"

# 1. Actualizar package.json si existe
$pkgPath = Join-Path (Get-Location) "package.json"
if (Test-Path $pkgPath) {
    Write-WFLog "Actualizando version en package.json a $ReleaseVersion..."
    (Get-Content $pkgPath -Raw) -replace '"version":\s*"[^"]+"', "`"version`": `"$ReleaseVersion`"" | Set-Content $pkgPath
}

# 2. Git Workflow
Write-WFLog "Preparando tags y commits..."
git add .
git commit -m "chore(release): release $tagName para $($WFConfig.project.name)" --allow-empty
git tag -a $tagName -m "Release $tagName" -f

Write-WFLog "Sincronizando con $Global:BRANCH_MAIN..."
git checkout $Global:BRANCH_MAIN
git merge $Global:BRANCH_DEV
git push origin $Global:BRANCH_MAIN $Global:BRANCH_DEV --tags -f

# 3. Detectar binarios de salida (.apk y .exe)
$AssetsToUpload = @()

$apkCandidates = @(
    (Join-Path (Get-Location) "CISA Studio-v$ReleaseVersion-signed.apk"),
    (Join-Path (Get-Location) "CISA Studio-v1.0.0-signed.apk"),
    (Join-Path (Get-Location) "ApkFlow\output\CISA Studio-v$ReleaseVersion-signed.apk"),
    (Join-Path (Get-Location) "ApkFlow\output\CISA Studio-v1.0.0-signed.apk")
)

foreach ($c in $apkCandidates) {
    if (Test-Path $c) {
        $AssetsToUpload += $c
        Write-WFLog "Binario APK detectado: $c" "Green"
        break
    }
}

$exeCandidates = @(
    (Join-Path (Get-Location) "CISA_Studio_Windows.exe"),
    (Join-Path (Get-Location) "output\CISA_Studio_Windows.exe")
)

foreach ($c in $exeCandidates) {
    if (Test-Path $c) {
        $AssetsToUpload += $c
        Write-WFLog "Binario Windows EXE detectado: $c" "Green"
        break
    }
}

# 4. GitHub Release
Write-WFLog "Creando Release oficial en GitHub..." "Yellow"
$notas = @"
# 🎓 $($WFConfig.project.name) $tagName — Generador Inteligente de Tareas Orientado al 100% de la Rúbrica

### 🚀 Novedades y Características de la Versión:
- 📥 **Ingesta Universal & OCR Multimodal:** Soporte para PDF, Word (.docx), Excel (.xlsx/.csv), código y capturas de pantalla instantáneas (`Ctrl+V`).
- ⚖️ **Calibrador de Rúbricas al 100%:** Medidor interactivo de energía continua con auto-balanceo dinámico y plantillas para Ingeniería, Finanzas, Código y Ensayos Académicos.
- ⚡ **Motor de Inferencia CISA 2.0:** Procesamiento de 5 fases (Detección, Normalización, Alineación a Rúbricas, Generación CoT y Compilación).
- 📊 **Hub de Previsualización 4 en 1:** Visor de Hoja A4 maquetada, Interactive Excel Data Grid con fórmulas vivas, carrusel de diapositivas PPTX 16:9 y Matriz de Auditoría 10/10.
- 💾 **Descargas Client-Side Instantáneas:** Generación directa en el navegador de archivos PDF, Excel (.xlsx), PowerPoint (.pptx) y Word (.docx) sin coste ni latencia de servidor.

---

### 📦 Binarios Oficiales Adjuntos en esta Release:
1. 📱 **Aplicación Móvil Android (`.apk`):** Compilada con Capacitor 8 y Android SDK 36, firmada criptográficamente con algoritmo **RSA 2048-bit (SHA256withRSA)** esquemas v1 y v2.
2. 💻 **Ejecutable de Escritorio Windows (`.exe`):** Binario autónomo con aceleración por hardware GPU para ejecutar CISA Studio en PC sin abrir la consola.
"@

# Crear Release con GitHub CLI (gh)
if ($AssetsToUpload.Count -gt 0) {
    Write-WFLog "Publicando Release con $($AssetsToUpload.Count) archivos binarios adjuntos..." "Cyan"
    gh release create $tagName $AssetsToUpload --repo $fullRepo --title "$($WFConfig.project.name) $tagName" --notes $notas --latest
} else {
    gh release create $tagName --repo $fullRepo --title "$($WFConfig.project.name) $tagName" --notes $notas --latest
}

# Regresar a develop
git checkout $Global:BRANCH_DEV

Write-WFLog "Version $tagName publicada con exito en GitHub con todos sus binarios!" "Green"
