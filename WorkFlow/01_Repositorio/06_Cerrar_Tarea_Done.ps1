# Script para mover tareas a la columna Done
$owner = "bbaakkuu-svg"
$projectNum = 1

Write-Host "--- Moviendo Tareas Terminadas a 'DONE' ---" -ForegroundColor Cyan

# Lista de tareas que basandonos en los archivos locales ya estan terminadas o en proceso avanzado
$tareasCompletadas = @(
    "1.1: Crear clase Ingrediente.java",
    "3.1: Dashboard Principal",
    "6.1: Integracion con SQLite"
)

# Intentar obtener los items del proyecto
try {
    $itemsJson = gh project item-list $projectNum --owner $owner --format json
    if ($null -eq $itemsJson) { throw "No se pudieron obtener items" }
    
    $projectData = $itemsJson | ConvertFrom-Json
    $items = $projectData.items

    foreach ($item in $items) {
        foreach ($titulo in $tareasCompletadas) {
            if ($item.content.title -like "*$titulo*") {
                Write-Host "Marcando como terminada: $($item.content.title)" -ForegroundColor Yellow
                # Intentamos mover por nombre de opcion comun
                gh project item-edit --id $item.id --project-id $projectNum --owner $owner --field "Status" --single-select-option "Done"
            }
        }
    }
    Write-Host "`n¡Sincronizacion de estados completada!" -ForegroundColor Green
} catch {
    Write-Host "Error al acceder al proyecto. Asegurate de estar logueado y que la columna se llame 'Done'." -ForegroundColor Red
}
