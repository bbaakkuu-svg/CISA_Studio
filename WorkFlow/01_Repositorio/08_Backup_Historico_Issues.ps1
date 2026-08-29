# Script para crear los Issues de NutriPlan Pro en GitHub usando la CLI 'gh'

$repo = "bbaakkuu-svg/Mi_app_Java-Swing"

$issues = @(
    @{title="Tarea 1.1: Crear clase Ingrediente.java"; body="Definir nombre, cantidad, unidad y categoría en una nueva clase del modelo."},
    @{title="Tarea 1.2: Refactorizar Comida.java"; body="Cambiar la lista de ingredientes de List<String> a List<Ingrediente>."},
    @{title="Tarea 1.3: Crear clase DiaPlan.java"; body="Objeto que agrupe las 5 instancias de Comida diarias."},
    @{title="Tarea 1.4: Crear clase SemanaPlan.java"; body="Contenedor principal para el calendario de 7 días."},
    @{title="Tarea 2.1: Implementar PlanDataService.java"; body="Lógica para serializar/deserializar el plan semanal en JSON."},
    @{title="Tarea 2.2: Crear ShoppingListService.java"; body="Algoritmo para recorrer el plan y extraer una lista plana de ingredientes."},
    @{title="Tarea 2.3: Lógica de Consolidación"; body="Algoritmo que suma cantidades de ingredientes con el mismo nombre y unidad."},
    @{title="Tarea 2.4: Lógica de Categorización"; body="Clasificar la lista final en secciones (Carnes, Verduras, etc.)."},
    @{title="Tarea 3.1: Crear MainDashboardFrame.java"; body="Ventana principal con Layout de BorderLayout."},
    @{title="Tarea 3.2: Implementar NavigationSidebar.java"; body="Panel lateral izquierdo con diseño moderno y botones de navegación."},
    @{title="Tarea 3.3: Configurar ViewManager"; body="Implementar CardLayout en el área central para alternar vistas."},
    @{title="Tarea 4.1: Panel Mi Dieta"; body="Interfaz grid que muestre las 5 tomas del día con iconos."},
    @{title="Tarea 4.2: Panel Lista de Compra"; body="Vista de lista con checkboxes e indicadores de categoría."},
    @{title="Tarea 4.3: Panel Consejos"; body="Área dinámica para mostrar los Nutriconsejos diarios."},
    @{title="Tarea 5.1: Conexión Login-Dashboard"; body="Asegurar que tras un éxito en VentanaLogin se inicie el Dashboard."},
    @{title="Tarea 5.2: Look & Feel Personalizado"; body="Aplicar paleta de colores coherente y fuentes modernas."}
)

foreach ($issue in $issues) {
    Write-Host "Creando: $($issue.title)..."
    gh issue create --repo $repo --title $issue.title --body $issue.body
}

Write-Host "¡Plan completado en GitHub!"
