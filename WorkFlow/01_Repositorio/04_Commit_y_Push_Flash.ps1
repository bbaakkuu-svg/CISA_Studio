# 04_Commit_y_Push_Flash.ps1 - EL GUARDADO MAS RAPIDO DEL OESTE
# -------------------------------------------------------------------------
# Script para confirmar cambios y empujar a GitHub rapidisimo

Write-Host "`n--- GUARDANDO PROGRESO A GITHUB ---" -ForegroundColor Cyan

# 1. Obtenemos la rama activa para no cometer errores
$ramaActual = git branch --show-current
Write-Host "Rama seleccionada: $ramaActual" -ForegroundColor DarkGray

# 2. Comprobacion de si hay algo que subir
$status = git status --porcelain
if (!$status) {
    Write-Host "[!] No hay cambios nuevos en el codigo para subir." -ForegroundColor Yellow
    exit
}

# 3. Datos del commit
$mensaje = Read-Host "Mensaje del commit (ej: Finalizado el Login)"
if ($mensaje -eq "") { $mensaje = "Actualizacion rapida de codigo" }

# 4. Secuencia automatica de Git
Write-Host "Preparando commit..." -ForegroundColor Gray
git add .
git commit -m "$mensaje"

Write-Host "Subiendo a GitHub..." -ForegroundColor Yellow
git push origin "$ramaActual"

Write-Host "[EXITO] Cambios guardados y subidos perfectamente." -ForegroundColor Green
