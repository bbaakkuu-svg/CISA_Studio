# 07_Marcar_Done.ps1 
# Sincroniza tareas hacia la columna Done del Proyecto (Refactorizado)
. "$PSScriptRoot\00_Core_Loader.ps1"

Write-WFLog "--- MOVIENDO TAREAS A DONE (Tablero #$Global:PROJECT_NUM) ---"

# Lista de tareas a mover (pueden ser dinámicas o pasadas por parámetro en el futuro)
$tareasCompletadas = @(
    "Modelo de datos",
    "Configuracion Maven",
    "Integracion SQLite"
)

try {
    $items = gh project item-list $Global:PROJECT_NUM --owner $Global:REPO_OWNER --format json | ConvertFrom-Json
    foreach ($item in $items.items) {
        foreach ($titulo in $tareasCompletadas) {
            if ($item.content.title -like "*$titulo*") {
                Write-WFLog "Cerrando: $($item.content.title)" "Yellow"
                gh project item-edit --id $item.id --project-id $Global:PROJECT_NUM --owner $Global:REPO_OWNER --field "Status" --single-select-option "Done"
            }
        }
    }
    Write-WFLog "Estado de hitos sincronizado." "Green"
} catch {
    Write-WFLog "Fallo en la comunicación con GitHub CLI." "Red"
}
