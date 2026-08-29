# 03_Nueva_Rama_Feature.ps1 - GESTOR DE RAMAS LIMPIO
# -------------------------------------------------------------------------
# Crea ramas con un formato estandar profesional (Git-Flow)

Write-Host "`n--- NUEVA RAMA PROFESIONAL ---" -ForegroundColor Cyan

# 1. Menu de tipos de rama
Write-Host "Seleccione el tipo de rama (1-3):" -ForegroundColor Gray
Write-Host " 1. feature/ (Nuevas funcionalidades)"
Write-Host " 2. bugfix/  (Arreglo de errores)"
Write-Host " 3. hotfix/  (Arreglo critico urgente)"
$opcion = Read-Host "Opcion"

$tipo = "feature"
if ($opcion -eq "1") { $tipo = "feature" }
elseif ($opcion -eq "2") { $tipo = "bugfix" }
elseif ($opcion -eq "3") { $tipo = "hotfix" }

# 2. Nombre descriptivo de la tarea
$nombreRaw = Read-Host "Nombre descriptivo de la tarea"
# Limpieza: Convertimos espacios en guiones para evitar errores de Git
$nombreFinal = $nombreRaw.Trim().Replace(" ", "-").ToLower()

if ($nombreFinal -eq "") {
    Write-Host "[!] Error: El nombre de la rama no puede estar vacio." -ForegroundColor Red
    exit
}

$ramaCompleta = "$tipo/$nombreFinal"

# 3. Creacion de la rama en Git
Write-Host "Creando rama: $ramaCompleta ..." -ForegroundColor Yellow
git checkout -b $ramaCompleta

Write-Host "[EXITO] Rama activa. ¡Feliz codificacion!" -ForegroundColor Green
