# 01_Setup_GitHub_Actions.ps1 - EL CREADOR DE LA NUBE
# -------------------------------------------------------------------------
# Configura automatizacion total (CI/CD) en la nube de GitHub Actions

Write-Host "`n--- CONFIGURANDO GITHUB ACTIONS (CI/CD) ---" -ForegroundColor Cyan

# 1. Rutas de carpetas estandar de GitHub
$path = (Get-Item .).FullName
$githubPath = Join-Path $path ".github"
$workflowPath = Join-Path $githubPath "workflows"

# 2. Creacion de carpetas si no existen
Write-Host "Iniciando directorios .github/workflows..." -ForegroundColor Gray
if (!(Test-Path $githubPath)) { New-Item -ItemType Directory -Path $githubPath }
if (!(Test-Path $workflowPath)) { New-Item -ItemType Directory -Path $workflowPath }

# 3. Flujo de trabajo profesional (Compila con Java 17 y Maven)
$workflowContent = @"
name: Java Project CI

on:
  push:
    branches: [ "main", "develop" ]
  pull_request:
    branches: [ "main", "develop" ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: maven
    - name: Build with Maven
      run: mvn -B package --file pom.xml
"@

# 4. Grabacion del archivo
$workflowContent | Out-File (Join-Path $workflowPath "build.yml") -Encoding utf8

Write-Host "`n[EXITO] Configuracion CI/CD terminada." -ForegroundColor Green
Write-Host "Cada vez que hagas push, GitHub revisara y compilara tu codigo." -ForegroundColor White
