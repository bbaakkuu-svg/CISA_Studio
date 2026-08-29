# 02_Sincronizar_Todo.ps1 
# Sincroniza todas las tareas (Issues) con el Tablero del Proyecto (Refactorizado)
. "$PSScriptRoot\00_Core_Loader.ps1"

$fullRepo = "$Global:REPO_OWNER/$Global:REPO_NAME"

Write-WFLog "--- SINCRONIZACION PROFESIONAL DE ISSUES ---"
Write-WFLog "Repositorio objetivo: $fullRepo"

# Obtener tareas existentes
$urls = gh issue list --repo $fullRepo --limit 100 --json url --jq '.[].url'

if ($null -eq $urls -or $urls.Count -eq 0) {
    Write-WFLog "No se encontraron tareas abiertas." "Yellow"
} else {
    foreach ($url in $urls) {
        Write-WFLog "Vinculando: $url ..." "Gray"
        gh project item-add $Global:PROJECT_NUM --owner $Global:REPO_OWNER --url $url
    }
    Write-WFLog "Tablero sincronizado con todas las tareas." "Green"
}
