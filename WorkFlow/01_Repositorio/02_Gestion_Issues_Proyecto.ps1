# 02_Gestion_Issues_Proyecto.ps1 - VINCULACION INTELIGENTE
# -------------------------------------------------------------------------
# Sincroniza todas las Tareas abiertas (Issues) con tu Tablero #1 en GitHub

try {
    # 1. Obtencion automatica del repo y owner desde Git Remote
    $remote = (git remote get-url origin) -replace "https://github.com/", "" -replace ".git", ""
    if (!$remote) { throw "No hay 'origin' configurado en Git." }
    $owner = $remote.Split("/")[0]
} catch {
    Write-Host "[!] Error: No hay repositorio remoto configurado o no estas en la carpeta Git." -ForegroundColor Red
    exit
}

Write-Host "`n--- SINCRONIZANDO TAREAS CON PROYECTO ---" -ForegroundColor Cyan
Write-Host "Usuario detectado: $owner" -ForegroundColor DarkGray

# 2. Obtenemos las URLs de todas las Issues abiertas
$urls = gh issue list --repo $remote --limit 50 --json url --jq '.[].url'

if ($urls.Count -eq 0) {
    Write-Host "[!] No se han encontrado tareas abiertas en tu GitHub." -ForegroundColor Yellow
} else {
    Write-Host "Se van a vincular $($urls.Count) tareas..." -ForegroundColor Yellow
    foreach ($url in $urls) {
        Write-Host "Vinculando: $url ..." -ForegroundColor White
        # Intentamos añadir la tarea al Proyecto #1 del usuario
        # GitHub Projects v2 usa el project-number (1 en tu caso)
        gh project item-add 1 --owner $owner --url $url
    }
    Write-Host "`n[EXITO] ¡Tablero sincronizado y al dia!" -ForegroundColor Green
}
