# 05_Generador_Masivo_Issues_VitalTrack.ps1
# -------------------------------------------------------------------------
# Genera el roadmap completo de Issues para VitalTrack
# Ejecutar desde: WorkFlow/01_Repositorio/

. "$PSScriptRoot\..\00_Core_Loader.ps1"

$repo = "$Global:REPO_OWNER/$Global:REPO_NAME"

Write-WFLog "Generando Issues del Roadmap de VitalTrack en: $repo" "Cyan"

$issues = @(
    @{
        title = "feat: Dashboard de Constantes Vitales"
        body  = "## Objetivo`nImplementar la pantalla principal del dashboard con visualizaci\u00f3n en tiempo real de: Tensi\u00f3n Arterial (Sist\u00f3lica/Diast\u00f3lica), Frecuencia Card\u00edaca, Peso Corporal y Diuresis 24h.`n`n## Criterios de Aceptaci\u00f3n`n- [ ] Cards de vitales con valores actuales`n- [ ] Dise\u00f1o glassmorphism premium`n- [ ] Responsive (mobile/desktop)`n- [ ] Indicadores de estado (normal/alerta/cr\u00edtico)"
        label = "enhancement"
    },
    @{
        title = "feat: Formulario de Registro de Constantes"
        body  = "## Objetivo`nCrear un formulario para el registro manual de constantes vitales con validaci\u00f3n de rangos cl\u00ednicos y persistencia local.`n`n## Criterios de Aceptaci\u00f3n`n- [ ] Inputs para todos los par\u00e1metros`n- [ ] Validaci\u00f3n de rangos (p.ej. Sist\u00f3lica: 60-250 mmHg)`n- [ ] Guardado en localStorage`n- [ ] Confirmaci\u00f3n visual post-registro"
        label = "enhancement"
    },
    @{
        title = "feat: Historial y An\u00e1lisis de Tendencias"
        body  = "## Objetivo`nImplementar gr\u00e1ficas interactivas de evoluci\u00f3n temporal para cada constante vital.`n`n## Criterios de Aceptaci\u00f3n`n- [ ] Gr\u00e1fica de tensi\u00f3n arterial (7/30/90 d\u00edas)`n- [ ] Gr\u00e1fica de FC y peso`n- [ ] Filtros temporales`n- [ ] Exportar gr\u00e1fica como imagen"
        label = "enhancement"
    },
    @{
        title = "feat: Sistema de Alertas por Valores Cr\u00edticos"
        body  = "## Objetivo`nNotificar al usuario cuando una constante supera los umbrales cl\u00ednicos configurados.`n`n## Criterios de Aceptaci\u00f3n`n- [ ] Umbrales personalizables por el usuario`n- [ ] Alerta visual inmediata en el dashboard`n- [ ] Historial de alertas`n- [ ] Colores semaf\u00f3ricos (verde/amarillo/rojo)"
        label = "critical"
    },
    @{
        title = "feat: Exportaci\u00f3n de Informes PDF/CSV"
        body  = "## Objetivo`nPermitir al usuario exportar su historial de constantes en formato PDF (informe m\u00e9dico) o CSV (datos brutos).`n`n## Criterios de Aceptaci\u00f3n`n- [ ] Export PDF con cabecera m\u00e9dica y gr\u00e1ficas`n- [ ] Export CSV con todos los registros`n- [ ] Rango de fechas seleccionable`n- [ ] Bot\u00f3n de descarga directo"
        label = "enhancement"
    },
    @{
        title = "feat: PWA \u2014 Instalaci\u00f3n M\u00f3vil y Modo Offline"
        body  = "## Objetivo`nConvertir VitalTrack en una Progressive Web App instalable en iOS y Android con soporte offline.`n`n## Criterios de Aceptaci\u00f3n`n- [ ] manifest.json con iconos y splash screen`n- [ ] Service Worker con cach\u00e9 offline`n- [ ] Instalable en iOS (Safari) y Android (Chrome)`n- [ ] Sincronizaci\u00f3n en background al recuperar conexi\u00f3n"
        label = "enhancement"
    },
    @{
        title = "feat: Autenticaci\u00f3n y Gesti\u00f3n de Perfiles"
        body  = "## Objetivo`nSistema de autenticaci\u00f3n para soporte multi-usuario con perfiles m\u00e9dicos independientes.`n`n## Criterios de Aceptaci\u00f3n`n- [ ] Login / Registro con email`n- [ ] Perfiles de paciente (nombre, edad, condiciones previas)`n- [ ] Datos aislados por usuario`n- [ ] Opci\u00f3n de PIN de acceso r\u00e1pido"
        label = "enhancement"
    },
    @{
        title = "docs: README completo y documentaci\u00f3n t\u00e9cnica"
        body  = "## Objetivo`nDocumentaci\u00f3n completa del proyecto para desarrolladores y usuarios finales.`n`n## Criterios de Aceptaci\u00f3n`n- [ ] README con arquitectura y setup`n- [ ] Guia de contribuci\u00f3n (CONTRIBUTING.md)`n- [ ] Documentaci\u00f3n de la API/datos`n- [ ] Changelog inicial"
        label = "documentation"
    },
    @{
        title = "ui/ux: Sistema de Dise\u00f1o Premium Glassmorphism"
        body  = "## Objetivo`nDefinir y aplicar un sistema de dise\u00f1o consistente con tokens de color, tipograf\u00eda y animaciones.`n`n## Criterios de Aceptaci\u00f3n`n- [ ] Paleta de colores cl\u00ednicos (azul cl\u00ednico, verde salud, rojos de alerta)`n- [ ] Componentes con glassmorphism (blur, transparencia, bordes)`n- [ ] Microanimaciones en cards e indicadores`n- [ ] Dark mode / Light mode`n- [ ] Accesibilidad WCAG AA"
        label = "ui/ux"
    }
)

$created = 0
foreach ($issue in $issues) {
    Write-WFLog "Creando: [$($issue.label)] $($issue.title)..." "Yellow"
    gh issue create --repo $repo --title $issue.title --body $issue.body --label $issue.label
    if ($LASTEXITCODE -eq 0) { $created++ }
    Start-Sleep -Milliseconds 300
}

Write-WFLog "[$created/$($issues.Count)] Issues creadas correctamente en VitalTrack!" "Green"
