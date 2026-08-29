# 00_Core_Loader.ps1
# -------------------------------------------------------------------------
# Engine de carga de configuración para el Framework WorkFlow Elite.
# Google Staff DevOps Approach: "Convention over Configuration with Abstraction"

$ConfigPath = Join-Path $PSScriptRoot "workflow_config.json"

if (!(Test-Path $ConfigPath)) {
    Write-Host "[ERROR] No se encuentra workflow_config.json en $PSScriptRoot" -ForegroundColor Red
    return
}

# Cargar y parsear JSON
$Global:WFConfig = Get-Content $ConfigPath -Raw | ConvertFrom-Json

# Exportar variables globales para acceso rápido
$Global:REPO_OWNER = $WFConfig.project.owner
$Global:REPO_NAME  = $WFConfig.project.repo_name
$Global:BRANCH_MAIN = $WFConfig.git_flow.main_branch
$Global:BRANCH_DEV  = $WFConfig.git_flow.develop_branch
$Global:PROJECT_NUM = $WFConfig.github_settings.project_number

# Función de log profesional
function Write-WFLog {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "[WorkFlow] $Message" -ForegroundColor $Color
}

Write-WFLog "Entorno de automatización cargado para: $($WFConfig.project.name)" "Green"
