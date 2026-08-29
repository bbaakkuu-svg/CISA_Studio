# 06_Templates_GitHub.ps1 
# Script para generar plantillas de GitHub profesionales (Refactorizado)
. "$PSScriptRoot\00_Core_Loader.ps1"

$githubPath = Join-Path (Get-Location) ".github"
$issuePath = Join-Path $githubPath "ISSUE_TEMPLATE"

if (-not (Test-Path $githubPath)) { New-Item -ItemType Directory -Path $githubPath }
if (-not (Test-Path $issuePath)) { New-Item -ItemType Directory -Path $issuePath }

Write-WFLog "--- GENERANDO PLANTILLAS DE REPOSITORIO PARA $($WFConfig.project.name) ---"

$featureTemplate = @"
name: Nueva Funcionalidad
description: Sugiere una nueva idea para $($WFConfig.project.name)
title: "[NUEVA TAREA] "
labels: ["enhancement"]
body:
  - type: markdown
    attributes:
      value: "Gracias por proponer una mejora para el proyecto."
"@
$featureTemplate | Out-File (Join-Path $issuePath "feature.yml") -Encoding utf8

$bugTemplate = @"
name: Reporte de Error
description: Avisa sobre algo que no funciona en $($WFConfig.project.name)
title: "[ERROR] "
labels: ["bug"]
body:
  - type: textarea
    id: error
    attributes:
      label: Detalle del fallo detectado
"@
$bugTemplate | Out-File (Join-Path $issuePath "bug.yml") -Encoding utf8

Write-WFLog "Plantillas generadas siguiendo el estandar del proyecto." "Green"
