# 02_Generar_Javadoc.ps1 
# Script para generar automáticamente la documentación Javadoc del código
Write-Host "--- GENERANDO DOCUMENTACION JAVADOC ---" -ForegroundColor Cyan

# Comprobar si mvn está instalado
if (!(Get-Command mvn -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Maven (mvn) no está instalado." -ForegroundColor Red
    exit
}

# Ejecución de Maven
mvn javadoc:javadoc

if ($LASTEXITCODE -eq 0) {
    Write-Host "Manual técnico generado con éxito." -ForegroundColor Green
    Write-Host "Ruta: /target/site/apidocs/index.html" -ForegroundColor DarkGray
} else {
    Write-Host "Error al generar el manual técnico." -ForegroundColor Red
}
