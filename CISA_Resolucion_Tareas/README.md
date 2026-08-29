# 🎓 Célula CISA: Ingeniería de Soluciones Académicas

## Propósito
Esta célula está diseñada para resolver tareas, exámenes o proyectos técnicos asegurando el cumplimiento del 100% de los criterios de evaluación (rúbricas). 

## Estructura de Operación
1.  **Input:** Coloca el enunciado y las rúbricas en la carpeta `/Inbox/`. Puede ser:
    *   Un archivo `.pdf`.
    *   Un archivo `.txt` o `.md`.
    *   O simplemente pega el texto directamente en una conversación con el **MAA**.
2.  **Procesamiento:** La célula identifica los "Puntos de Dolor" del enunciado y las "Métricas de Éxito" de la rúbrica.
3.  **Output:** Un archivo `.md` en `/Finalizados/` con la solución estructurada y una tabla de auto-evaluación.

## Cómo usarla vía Chat
Si no tienes un archivo PDF, simplemente escribe:
> "MAA, procesa en CISA el siguiente enunciado: [Pegar Enunciado] bajo estas rúbricas: [Pegar Rúbricas]"

## Diferenciadores MAA
- **Alineación Total:** La solución se adapta al peso de cada rúbrica. Si la rúbrica pide "Claridad en el código", la solución priorizará comentarios y limpieza sobre la complejidad.
- **Auto-Check:** Antes de finalizar, el sistema verifica que no falte ningún punto solicitado.

## Guía de Importación
- Copia la carpeta `CISA_Resolucion_Tareas`.
- Requiere un motor de IA activo (como el Meta-Agente) para la generación de contenido.
