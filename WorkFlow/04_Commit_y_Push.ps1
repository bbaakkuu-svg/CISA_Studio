# 04_Commit_y_Push.ps1 
# Script de guardado rapido (Refactorizado)
. "$PSScriptRoot\00_Core_Loader.ps1"

$mensaje = Read-Host "Cual es el avance de hoy?"
if (!$mensaje) { $mensaje = "Update modular $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }

Write-WFLog "--- PROCESANDO COMMIT FLASH ---"

git add .
git commit -m $mensaje
$branch = git branch --show-current
git push origin $branch

Write-WFLog "Subido correctamente a la rama: $branch" "Green"
