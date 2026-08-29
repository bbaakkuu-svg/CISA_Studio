# 01_Inicia_Proyecto.ps1 - EL CONFIGURADOR MAESTRO
# Script para iniciar repo, ramas y proyecto en GitHub
# -------------------------------------------------------------------------

$owner = ""
$repo = (Get-Item .).Name

Write-Host "`n--- SETUP INICIAL PROFESIONAL: $repo ---" -ForegroundColor Cyan

# 1. Verificar si GitHub CLI (gh) está listo
try {
    $owner = (gh api user -q ".login" -ErrorAction Stop)
} catch {
    Write-Host "[!] Error: No estas logueado en GitHub. Ejecuta 'gh auth login' primero." -ForegroundColor Red
    exit
}

# 2. Iniciar Git si no existe
if (!(Test-Path ".git")) {
    Write-Host "Iniciando repositorio Git..."
    git init
}

# 3. Configurar ramas segun estandar (main/develop)
Write-Host "Configurando ramas estandar..." -ForegroundColor Gray
git branch -m main
git checkout -b develop

# 4. Crear Proyecto V2 en la web de GitHub
Write-Host "Creando Tablero de Gestion en GitHub..." -ForegroundColor Yellow
gh project create --owner $owner --title "$repo Management"

Write-Host "`n[EXITO] Entorno listo. Recuerda trabajar siempre en 'develop'." -ForegroundColor Green
