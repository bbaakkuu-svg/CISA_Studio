# 08_Generador_Post_Testeo.ps1
# -------------------------------------------------------------------------
# Crea Issues en GitHub basadas en los resultados del testeo de 50 usos.

$remote = (git remote get-url origin) -replace "https://github.com/", "" -replace ".git", ""
if (!$remote) { $remote = "bbaakkuu-svg/Mi_app_Java-Swing" }

$issues = @(
    @{title="BUG: Gestion de foco en errores de tabla"; body="Cuando hay un error de formato en la tabla de ingredientes, el sistema debe devolver el foco a la celda exacta del error para mejorar la velocidad de correccion."},
    @{title="BUG: Advertencia de exportacion vacia"; body="Añadir una validacion que impida exportar archivos .txt si no hay datos cargados, mostrando un mensaje informativo al usuario."},
    @{title="UX: Implementar Atajos de Teclado"; body="Añadir soporte para CTRL+S (guardar), ENTER (aceptar formularios) y ESC (cerrar diálogos) en toda la aplicacion."},
    @{title="Mejora: Sistema de Copia de Dia"; body="Añadir funcionalidad en el editor para copiar toda la configuracion de un dia seleccionado a otro dia de la semana."},
    @{title="Mejora: Indicadores de Progreso Calorico"; body="Añadir barras de progreso visuales que comparen las calorias del plan actual contra el objetivo del perfil de usuario."},
    @{title="Mejora: Dialogos de Feedback Premium"; body="Sustituir JOptionPane por clases personalizadas que utilicen bordes redondeados y los colores del DesignSystem."},
    @{title="Mejora: Toggle de Modo Oscuro"; body="Añadir un interruptor en el Dashboard para alternar globalmente entre tema claro y oscuro usando los tokens de DesignSystem."}
)

Write-Host "--- DETECTADO REPO: $remote ---" -ForegroundColor Cyan

foreach ($issue in $issues) {
    Write-Host "Creando Issue: $($issue.title)..." -ForegroundColor White
    gh issue create --repo $remote --title $issue.title --body $issue.body
}

Write-Host "`n[EXITO] Todas las tareas del testeo han sido cargadas en GitHub." -ForegroundColor Green
