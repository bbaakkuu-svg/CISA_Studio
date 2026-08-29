# 10_Deploy_AutomatiK.ps1
# Despliegue industrial de AutomatiK — Agente DevOps
# Ejecuta el ciclo completo: Audit → Build → Versión → Release
. "$PSScriptRoot\00_Core_Loader.ps1"

param(
    [string]$Version = "",
    [switch]$DockerDeploy,
    [switch]$LocalDeploy,
    [switch]$SkipAudit
)

$ROOT = Split-Path -Parent $PSScriptRoot

Write-WFLog "======================================================"
Write-WFLog "   AutomatiK — Pipeline de Despliegue Industrial"
Write-WFLog "======================================================"

# ─── STEP 1: Audit ────────────────────────────────────────────────────────────
if (-not $SkipAudit) {
    Write-WFLog "[1/5] Ejecutando auditoría del SISTEMA_AUTONOMO..." "Cyan"
    try {
        python "$ROOT\automatik.py" audit
        Write-WFLog "  ✔  Auditoría completada." "Green"
    } catch {
        Write-WFLog "  ✘  Error en auditoría: $_" "Red"
        exit 1
    }
}

# ─── STEP 2: Frontend Build ───────────────────────────────────────────────────
Write-WFLog "[2/5] Compilando frontend Next.js (producción)..." "Cyan"
Push-Location "$ROOT\web_nexus\frontend"
try {
    $env:NEXT_TELEMETRY_DISABLED = "1"
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }
    Write-WFLog "  ✔  Frontend compilado." "Green"
} catch {
    Write-WFLog "  ✘  Error compilando frontend: $_" "Red"
    Pop-Location; exit 1
}
Pop-Location

# ─── STEP 3: Backend Syntax Check ─────────────────────────────────────────────
Write-WFLog "[3/5] Verificando sintaxis del backend..." "Cyan"
try {
    python -m py_compile "$ROOT\web_nexus\backend\main.py"
    Write-WFLog "  ✔  Backend validado." "Green"
} catch {
    Write-WFLog "  ✘  Error en backend: $_" "Red"
    exit 1
}

# ─── STEP 4: Docker (optional) ────────────────────────────────────────────────
if ($DockerDeploy) {
    Write-WFLog "[4/5] Construyendo imágenes Docker..." "Cyan"
    Push-Location $ROOT
    try {
        docker build -f Dockerfile.backend -t automatik-backend:latest .
        docker build -f Dockerfile.frontend -t automatik-frontend:latest .
        docker-compose up -d
        Write-WFLog "  ✔  Servicios Docker en ejecución." "Green"
    } catch {
        Write-WFLog "  ✘  Error Docker: $_" "Red"
        Pop-Location; exit 1
    }
    Pop-Location
} elseif ($LocalDeploy) {
    Write-WFLog "[4/5] Lanzando en modo local..." "Cyan"
    Start-Process pwsh -ArgumentList "-File `"$ROOT\start_automatik.ps1`" -Production"
    Write-WFLog "  ✔  AutomatiK lanzado en modo producción local." "Green"
} else {
    Write-WFLog "[4/5] Skipping deploy (use -DockerDeploy o -LocalDeploy)" "DarkGray"
}

# ─── STEP 5: Release to GitHub ────────────────────────────────────────────────
Write-WFLog "[5/5] Publicando release en GitHub..." "Cyan"

if (-not $Version) {
    # Auto-detect version from package.json
    $pkgJson = Get-Content "$ROOT\web_nexus\frontend\package.json" | ConvertFrom-Json
    $Version = $pkgJson.version
    if (-not $Version) { $Version = "2.0.0" }
}

$tagName = "v$Version"
Write-WFLog "  Versión detectada: $tagName" "White"

git -C $ROOT add .
git -C $ROOT commit -m "chore(release): AutomatiK $tagName — Despliegue automatizado CI/CD" --allow-empty
git -C $ROOT tag -a $tagName -m "AutomatiK $tagName" 2>$null
git -C $ROOT push origin main --tags 2>&1 | Write-WFLog

try {
    $notes = "AutomatiK $tagName — Autonomous Orchestration Platform. Backend FastAPI + Frontend Next.js + Workflow Engine."
    gh release create $tagName `
        --title "AutomatiK $tagName" `
        --notes $notes `
        "$ROOT\docker-compose.yml" `
        "$ROOT\start_automatik.ps1" `
        "$ROOT\setup_automatik.ps1"
    Write-WFLog "  ✔  Release $tagName publicado en GitHub." "Green"
} catch {
    Write-WFLog "  ⚠  GitHub release requiere gh CLI. Commit y tag publicados." "Yellow"
}

Write-WFLog ""
Write-WFLog "======================================================"
Write-WFLog "  ✔  Pipeline de despliegue completado: AutomatiK $tagName"
Write-WFLog "======================================================"
