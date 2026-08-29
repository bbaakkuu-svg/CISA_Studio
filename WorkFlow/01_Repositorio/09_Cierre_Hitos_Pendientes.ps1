# 09_Cierre_Hitos_Pendientes.ps1
# -------------------------------------------------------------------------
# Cierra las tareas 7.1, 7.3 y 7.5 y las mueve a la columna DONE del proyecto.

$owner = "bbaakkuu-svg"
$projectNum = 1
$issueNumbers = @(18, 19, 20)

Write-Host "--- CERRANDO HITOS 7.1, 7.3 Y 7.5 ---" -ForegroundColor Cyan

foreach ($id in $issueNumbers) {
    Write-Host "Cerrando Issue #$id..." -ForegroundColor Yellow
    gh issue close $id --repo "$owner/Mi_app_Java-Swing"
}

# Sincronizar Board
Write-Host "`n--- Sincronizando con Tablero Kanban ---" -ForegroundColor Cyan
try {
    $itemsJson = gh project item-list $projectNum --owner $owner --format json
    $projectData = $itemsJson | ConvertFrom-Json
    
    foreach ($item in $projectData.items) {
        if ($issueNumbers -contains $item.content.number) {
            Write-Host "Moviendo a DONE: $($item.content.title)" -ForegroundColor Green
            gh project item-edit --id $item.id --project-id $projectNum --owner $owner --field "Status" --single-select-option "Done"
        }
    }
    Write-Host "`n¡Tablero actualizado correctamente!" -ForegroundColor Green
} catch {
    Write-Host "Error al actualizar el tablero. Verifica permisos y nombre de columna." -ForegroundColor Red
}
