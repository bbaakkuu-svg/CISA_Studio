# 01_Build_and_Test.ps1 - EL GUARDIAN DE LA CALIDAD
# -------------------------------------------------------------------------
# Script para compilar con Maven y ejecutar tests Unitarios

Write-Host "`n--- COMPILANDO Y TESTEANDO PROYECTO ---" -ForegroundColor Cyan

# 1. Comprobacion de si Maven (mvn) esta instalado
if (!(Get-Command mvn -ErrorAction SilentlyContinue)) {
    Write-Host "[!] Error: No tienes Maven (mvn) instalado o en el PATH de Windows." -ForegroundColor Red
    exit
}

# 2. Ejecutar limpieza y compilacion completa
Write-Host "Iniciando 'mvn clean install' (Esto puede tardar)..." -ForegroundColor Yellow
mvn clean install

# 3. Resultado de la compilacion
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[EXITO] Compilacion impecable. JAR generado en carpeta /target." -ForegroundColor Green
} else {
    Write-Host "`n[ERROR] El proyecto NO ha compilado o fallaron los tests." -ForegroundColor Red
    Write-Host "Revisa el codigo fuente antes de subirlo a GitHub." -ForegroundColor Gray
}
