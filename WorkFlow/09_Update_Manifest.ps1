# 09_Update_Manifest.ps1
# -------------------------------------------------------------------------
# Documentación Viva: Genera automaticamente el README del Framework.
# Google Staff Architect Approach: "Documentation as Code"

. "$PSScriptRoot\00_Core_Loader.ps1"

$outputFile = Join-Path $PSScriptRoot "README.md"
Write-WFLog "Escaneando Framework para actualizar documentacion..."

$scripts = Get-ChildItem -Path $PSScriptRoot -Filter "*.ps1" | Sort-Object Name

# Construcción del README
$readme = @"
# 🛠️ WorkFlow Elite: Framework de Automatización Exportable
**Proyecto:** $($WFConfig.project.name)  
**Versión de Configuración:** 2.0 (Google Architect Edition)

Este directorio es un motor de DevOps diseñado para ser portátil. Centraliza la lógica de Git, GitHub y Maven mediante una arquitectura basada en variables de entorno y JSON.

---

## 📂 Inventario de Automatismos
A continuación se detallan los scripts disponibles detectados por el sistema:

| Script | Propósito | Aplicación |
| :--- | :--- | :--- |
"@

foreach ($s in $scripts) {
    if ($s.Name -eq "09_Update_Manifest.ps1") { continue }
    $lines = Get-Content $s.FullName -TotalCount 5
    $descripcion = "Script de automatización."
    foreach ($line in $lines) {
        if ($line -match "#\s*([^-\s].*)" -and $Matches[1] -notlike "*$($s.Name)*") {
            $descripcion = $Matches[1]
            break
        }
    }
    $readme += "`n| ``$($s.Name)`` | $descripcion | Local |"
}

$readme += @"

---

## 🏗️ IA-Insights (Architectural Intelligence)
*Esta sección es generada por el Staff AI para optimizar tu flujo de trabajo.*

1.  **D desacoplamiento Total:** Al usar `workflow_config.json`, no necesitas editar scripts al cambiar de proyecto. El `00_Core_Loader.ps1` garantiza la integridad del entorno.
2.  **Modularidad:** Cada script tiene una única responsabilidad (Single Responsibility Principle), facilitando la depuración.
3.  **Seguridad Proactiva:** El sistema está diseñado para integrarse con escaneos de secretos y validaciones de CI/CD sin intervención manual.
4.  **Escalabilidad:** Puedes añadir nuevos módulos siguiendo la nomenclatura numérica y estos serán autodetectados por este manifiesto.

---

## ⚡ Guía de Exportación Rápida
> [!IMPORTANT]
> **Para llevar este Framework a otro repositorio:**
> 1.  Copia la carpeta `/WorkFlow` y el script `Setup_New_Project.ps1` al nuevo repo.
> 2.  Personaliza el archivo `workflow_config.json` con los datos del nuevo proyecto.
> 3.  Ejecuta `.\Setup_New_Project.ps1` desde la terminal.
> 4.  **¡Listo!** Tu ecosistema profesional estará configurado en segundos.

---

## 🚀 Guía de Inicio Rápido
1.  Asegúrate de tener instalada la **GitHub CLI (gh)**.
2.  Personaliza el archivo ``workflow_config.json`` con los datos de tu nuevo repo.
3.  Ejecuta ``.\Setup_New_Project.ps1`` (en la raíz) para inicializar todo.

---
Generado por Antigravity AI Engine | $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
"@

$readme | Out-File $outputFile -Encoding utf8
Write-WFLog "README.md actualizado con exito en $PSScriptRoot" "Green"
