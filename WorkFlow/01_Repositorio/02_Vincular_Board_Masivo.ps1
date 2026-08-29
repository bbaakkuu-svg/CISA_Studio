# Script para vincular automáticamente todas las Issues al Proyecto #1
$repo = "bbaakkuu-svg/Mi_app_Java-Swing"
$owner = "bbaakkuu-svg"
$projectNum = 1

Write-Host "--- Iniciando Vinculación de Tareas al Proyecto #1 ---" -ForegroundColor Cyan

# Comprobar si gh está instalado
if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "Error: GitHub CLI (gh) no está instalado o no se encuentra en el PATH." -ForegroundColor Red
    exit
}

# Obtener las URLs de todas las issues abiertas
Write-Host "Buscando tareas en el repositorio $repo..."
$issueUrls = gh issue list --repo $repo --limit 60 --json url --jq '.[].url'

if ($null -eq $issueUrls -or $issueUrls.Count -eq 0) {
    Write-Host "No se encontraron tareas abiertas para vincular." -ForegroundColor Yellow
} else {
    Write-Host "Se han encontrado $($issueUrls.Count) tareas." -ForegroundColor White
    foreach ($url in $issueUrls) {
        Write-Host "Vinculando: $url ..." 
        gh project item-add $projectNum --owner $owner --url $url
    }
    Write-Host "`n¡Listo! Revisa tu tablero en: https://github.com/users/$owner/projects/$projectNum" -ForegroundColor Green
}
