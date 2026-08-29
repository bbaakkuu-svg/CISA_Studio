# 11_Sync_Doc_Vivo.ps1
# -------------------------------------------------------------------------
# Sincronizador del Documento Vivo: Actualiza marcas temporales y valida
# la integridad de PROYECTO_VITALTRACK.md con el estado actual del repositorio.

. "$PSScriptRoot\00_Core_Loader.ps1"

$docPath = Join-Path $PSScriptRoot "..\PROYECTO_VITALTRACK.md"

if (Test-Path $docPath) {
    Write-WFLog "--- SINCRONIZANDO DOCUMENTO VIVO (PROYECTO_VITALTRACK.md) ---" "Cyan"
    
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
    $content = Get-Content $docPath -Raw -Encoding utf8
    
    # Actualizar la línea de última sincronización
    $updatedContent = $content -replace "(> \*\*Última Sincronización:\*\* ).*", "`$1$timestamp"
    
    $updatedContent | Out-File $docPath -Encoding utf8
    Write-WFLog "Documento vivo sincronizado con éxito a fecha: $timestamp" "Green"
} else {
    Write-WFLog "Error: No se encontró el archivo PROYECTO_VITALTRACK.md en la raíz del proyecto." "Red"
}
