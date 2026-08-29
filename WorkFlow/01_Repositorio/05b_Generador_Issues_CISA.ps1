# 05b_Generador_Issues_CISA.ps1
# -------------------------------------------------------------------------
# Genera el roadmap completo de Issues para CISA Studio y los asocia a GitHub
# Ejecutar desde la raíz del repositorio

. "$PSScriptRoot\..\00_Core_Loader.ps1"

$repo = "$Global:REPO_OWNER/$Global:REPO_NAME"

Write-WFLog "Inicializando etiquetas personalizadas en: $repo" "Cyan"

# Etiquetas requeridas
$customLabels = @(
    @{ name = "ui/ux"; color = "38bdf8"; desc = "Interfaz de usuario y diseño visual" },
    @{ name = "backend"; color = "3ecf8e"; desc = "Base de datos y bots de backend" },
    @{ name = "ai-engine"; color = "c084fc"; desc = "Motor de inferencia CISA e IA" },
    @{ name = "apk-build"; color = "a4c639"; desc = "Compilación móvil Android y Windows" },
    @{ name = "critical"; color = "ef4444"; desc = "Auditoría de seguridad y criticidad" }
)

foreach ($lbl in $customLabels) {
    Write-WFLog "Verificando etiqueta: $($lbl.name)..." "Gray"
    gh label create $lbl.name --repo $repo --color $lbl.color --description $lbl.desc --force | Out-Null
}

Write-WFLog "Generando Issues del Roadmap de CISA Studio..." "Cyan"

$issues = @(
    @{
        title = "feat: Base de Datos Supabase & Bot Keep-Alive (Fase 2)"
        body  = "## Objetivo`nDesplegar el esquema de Supabase, configurar políticas de Row Level Security (RLS) y configurar el bot Keep-Alive en GitHub Actions.`n`n## Criterios de Aceptación`n- [x] Migraciones de base de datos creadas (profiles, tasks, rubrics, solutions).`n- [x] Políticas RLS configuradas para acceso seguro por usuario.`n- [x] Storage buckets configurados para enunciados y rúbricas.`n- [x] Workflow keep-alive funcionando de forma recurrente."
        label = "backend"
    },
    @{
        title = "feat: Interfaz UI CISA Studio 2.0 (Fase 3)"
        body  = "## Objetivo`nDesarrollar la interfaz modular por pasos (Archivos, Rúbricas, Calibrador, Formato, Solución) con temática oscura fluida.`n`n## Criterios de Aceptación`n- [x] Componente WorkflowTabBar para navegación intuitiva.`n- [x] Componente UniversalDropzone con soporte de pegado rápido (OCR/imágenes).`n- [x] Sliders interactivos y presets por disciplina en RubricsInput.`n- [x] Totalmente adaptado para móviles y tablets."
        label = "ui/ux"
    },
    @{
        title = "feat: Motor CISA 2.0 & Extractor de Rúbricas por IA (Fase 4)"
        body  = "## Objetivo`nIntegrar el extractor inteligente de rúbricas por contexto y compilar los entregables en PDF, XLSX, PPTX y DOCX.`n`n## Criterios de Aceptación`n- [x] Lógica heurística de detección de rúbricas basadas en el título/prompt.`n- [x] Generadores client-side de documentos funcionales.`n- [x] Visualizador interactivo de entregables (PDF, Excel, PPTX, Matriz).`n- [x] Auto-balanceo de ponderaciones de rúbricas al 100%."
        label = "ai-engine"
    },
    @{
        title = "audit: Pruebas de Consistencia & Auditoría de Seguridad (Fase 5)"
        body  = "## Objetivo`nGarantizar la robustez del sistema, corregir fugas de memoria y auditar la seguridad de las peticiones a base de datos.`n`n## Criterios de Aceptación`n- [x] Auditorías de seguridad de RLS en base de datos superadas.`n- [x] Tipado estricto TypeScript en todos los componentes React 19.`n- [x] Verificación de exportación de documentos grandes sin crashes."
        label = "critical"
    },
    @{
        title = "feat: Compilación Nativa Windows & APK Móvil (Fase 6)"
        body  = "## Objetivo`nGenerar y firmar el binario APK de Android mediante ApkFlow y compilar el wrapper exe/instalador para Windows.`n`n## Criterios de Aceptación`n- [x] Pipeline ApkFlow verificado y APK firmada con keystore.`n- [x] Generador de iconos e ICO embebido en el binario.`n- [x] Script Build_Native_Windows_App_And_Installer.ps1 compilando la App y Setup.exe."
        label = "apk-build"
    }
)

$created = 0
foreach ($issue in $issues) {
    Write-WFLog "Creando: [$($issue.label)] $($issue.title)..." "Yellow"
    gh issue create --repo $repo --title $issue.title --body $issue.body --label $issue.label
    if ($LASTEXITCODE -eq 0) { $created++ }
    Start-Sleep -Milliseconds 300
}

Write-WFLog "[$created/$($issues.Count)] Issues creados correctamente en CISA Studio!" "Green"
