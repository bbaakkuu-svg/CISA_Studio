# 03_Nueva_Rama.ps1 
# Script para crear ramas profesionales (Refactorizado)
. "$PSScriptRoot\00_Core_Loader.ps1"

$tipo = Read-Host "Tipo de rama? (1: feature, 2: bugfix, 3: hotfix)"
$nombre = Read-Host "Nombre de la tarea (ej: dashboard-oscuro)"

$prefix = switch($tipo) {
    "1" { $WFConfig.git_flow.feature_prefix }
    "2" { $WFConfig.git_flow.bugfix_prefix }
    "3" { $WFConfig.git_flow.hotfix_prefix }
    Default { "task/" }
}

$branchName = "$prefix$nombre"

Write-WFLog "--- CREANDO NUEVA RAMA ---"
git checkout -b $branchName

Write-WFLog "Rama '$branchName' creada y activada." "Green"
