# 01_Scan_Secrets.ps1 - EL GUARDIA DE LA SEGURIDAD
# -------------------------------------------------------------------------
# Script para buscar posibles contrasenas o tokens en el codigo antes de subirlo

Write-Host "`n--- ESCANEO DE SEGURIDAD PRE-COMMIIT ---" -ForegroundColor Cyan

# 1. Definicion de los patrones mas peligrosos
$patrones = @(
    "API_KEY", "SECRET", "PASSWORD", "TOKEN", "PWD", "DB_USERNAME", "DB_PASSWORD"
)

# 2. Buscamos en todos los archivos del repo (excluyendo Binarios, Git y directorios pesados)
$exclusiones = @(".git", "Procesados", "__pycache__", ".pytest_cache", "node_modules", ".next", "exports")
$extensionesBinarias = @(".ps1", ".exe", ".jpg", ".jpeg", ".png", ".gif", ".db", ".zip", ".pdf", ".docx", ".xlsx", ".pptx")

$archivos = Get-ChildItem -Recurse -File | Where-Object {
    $fullName = $_.FullName
    $ext = $_.Extension.ToLower()
    
    $ignorar = $false
    foreach ($ex in $exclusiones) {
        if ($fullName -like "*\$ex\*") { $ignorar = $true; break }
    }
    
    if (!$ignorar -and $extensionesBinarias -contains $ext) {
        $ignorar = $true
    }
    
    !$ignorar
}

$halladoAlerta = $false

foreach ($file in $archivos) {
    foreach ($p in $patrones) {
        # Buscamos coincidencias con el numero de linea (Select-String)
        $matches = Select-String -Path $file.FullName -Pattern $p -SimpleMatch
        if ($matches) {
            Write-Host "[ALERTA] Posible secreto en $($file.FullName)" -ForegroundColor Red
            foreach ($m in $matches) {
                Write-Host "  -> Linea $($m.LineNumber):  $($m.Line.Trim())" -ForegroundColor DarkGray
            }
            $halladoAlerta = $true
        }
    }
}

# 3. Resultado Final
if (!$halladoAlerta) {
    Write-Host "[EXITO] No se han encontrado palabras clave de riesgo en tu codigo." -ForegroundColor Green
} else {
    Write-Host "`n[CUIDADO] Revisa las alertas anteriores antes de subir el codigo a internet." -ForegroundColor Yellow
}

Write-Host "`nEscaneo preliminar finalizado." -ForegroundColor Cyan
