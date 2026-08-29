# 05_Crear_PullRequest.ps1 
# Script para crear una solicitud de extraccion (Refactorizado)
. "$PSScriptRoot\00_Core_Loader.ps1"

Write-WFLog "--- CREANDO SOLICITUD DE EXTRACCION (PR) ---"

$base = Read-Host "Rama destino? (1: $Global:BRANCH_DEV, 2: $Global:BRANCH_MAIN)"
$target = if ($base -eq "2") { $Global:BRANCH_MAIN } else { $Global:BRANCH_DEV }

$ramaActual = git branch --show-current
Write-WFLog "Origen: $ramaActual | Destino: $target"

gh pr create --base $target --head $ramaActual --title "Fusionar $ramaActual en $target" --body "Nueva funcionalidad completada siguiendo el Framework WorkFlow."

Write-WFLog "Pull Request creado. Revisa tu panel en GitHub." "Green"
