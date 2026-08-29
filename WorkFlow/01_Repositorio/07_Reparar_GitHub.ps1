# SCRIPT CORREGIDO SIN CARACTERES ESPECIALES
$repo = "bbaakkuu-svg/Mi_app_Java-Swing"
$owner = "bbaakkuu-svg"
$projectNum = 1

Write-Host "--- REGENERACION TOTAL: NutriPlan Pro ---" -ForegroundColor Cyan

$tareas = @(
    # FASE 1: Modelo
    @{t="1.1: Crear clase Ingrediente.java"; b="Modelo de datos para ingredientes."},
    @{t="1.2: Refactorizar Comida.java"; b="Cambiar listas a objetos Ingrediente."},
    @{t="1.3: Crear clase DiaPlan.java"; b="Agrupar las 5 tomas diarias."},
    @{t="1.4: Crear clase SemanaPlan.java"; b="Calendario de 7 dias."},
    # FASE 2: Servicios
    @{t="2.1: Implementar PlanDataService.java"; b="Persistencia JSON."},
    @{t="2.2: Crear ShoppingListService.java"; b="Generador de lista de compra."},
    @{t="2.3: Logica de Consolidacion"; b="Suma de ingredientes iguales."},
    @{t="2.4: Logica de Categorizacion"; b="Carnes, Verduras, etc."},
    # FASE 3/4: UI
    @{t="3.1: Dashboard Principal"; b="Contenedor Swing moderno."},
    @{t="3.2: Navigation Sidebar"; b="Panel lateral de navegacion."},
    @{t="4.1: Panel Mi Dieta"; b="Vista grid con iconos."},
    @{t="4.2: Panel Lista de Compra"; b="Vista con checkboxes."},
    # FASE 6: Avanzado
    @{t="6.1: Integracion con SQLite"; b="Base de datos persistente."},
    @{t="6.7: Diseno Premium (Glassmorphism)"; b="Efectos visuales avanzados."},
    # FASE 7: Pulido Final
    @{t="7.1: Look y Feel moderno (FlatLaf)"; b="Mejora estetica radical."},
    @{t="7.3: Validacion de Formularios"; b="Control de errores de usuario."},
    @{t="7.5: Documentacion Javadoc"; b="Manual tecnico del codigo."}
)

foreach ($tarea in $tareas) {
    Write-Host "Creando: $($tarea.t)..." -ForegroundColor White
    $issueUrl = gh issue create --repo $repo --title $tarea.t --body $tarea.b
    
    if ($issueUrl) {
        Write-Host "Anadiendo a Tablero #$projectNum..." -ForegroundColor DarkGray
        gh project item-add $projectNum --owner $owner --url $issueUrl
    }
}

Write-Host "PROCESO ACABADO" -ForegroundColor Green
