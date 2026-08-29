# 01_Setup_Repo.ps1 
# Script para iniciar un repositorio con estandares profesionales (Refactorizado)
. "$PSScriptRoot\00_Core_Loader.ps1"

Write-WFLog "--- CONFIGURACION DE REPOSITORIO PROFESIONAL ---"

# Crear ramas base usando variables del Config
Write-WFLog "Configurando ramas estandar ($Global:BRANCH_MAIN / $Global:BRANCH_DEV)..."
git branch -m $Global:BRANCH_MAIN
git checkout -b $Global:BRANCH_DEV

# Crear carpetas estandar definidas en el JSON
$docsPath = $WFConfig.paths.docs
if (-not (Test-Path $docsPath)) { 
    New-Item -ItemType Directory -Path $docsPath 
    Write-WFLog "Carpeta /$docsPath creada." "Gray"
}

# Crear el proyecto en GitHub
Write-WFLog "Creando tablero Project #$Global:PROJECT_NUM en GitHub..."
try {
    gh project create --owner $Global:REPO_OWNER --title "$($WFConfig.project.name) Master Project"
} catch {
    Write-WFLog "Nota: El proyecto ya existe o hubo un error de red." "Yellow"
}

Write-WFLog "Finalizado. Entorno listo para trabajar en '$Global:BRANCH_DEV'." "Green"
