# =============================================================================
# ApkFlow - Paso 2b: Generación e Inyección Automatizada de Iconos y Splash Nativo
# =============================================================================
param(
    [string]$CustomIconPath = ""
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigFile = Join-Path $ScriptDir "config.json"

if (-not (Test-Path $ConfigFile)) {
    Write-Error "No se encontro el archivo config.json en $ScriptDir"
    exit 1
}

$Config = Get-Content -Raw $ConfigFile | ConvertFrom-Json

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ApkFlow :: Paso 02b - Branding & Generacion de Iconos Android" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

Add-Type -AssemblyName System.Drawing

# 1. Localizar la imagen fuente
$SourceImagePath = ""

if ($CustomIconPath -and (Test-Path $CustomIconPath)) {
    $SourceImagePath = Resolve-Path $CustomIconPath
} elseif ($Config.branding.iconSourcePath) {
    $candidate = Join-Path $ScriptDir $Config.branding.iconSourcePath
    if (Test-Path $candidate) {
        $SourceImagePath = Resolve-Path $candidate
    }
}

if (-not $SourceImagePath -and $Config.branding.fallbackIconPaths) {
    foreach ($fb in $Config.branding.fallbackIconPaths) {
        $candidate = Join-Path $ScriptDir $fb
        if (Test-Path $candidate) {
            $SourceImagePath = Resolve-Path $candidate
            break
        }
    }
}

if (-not $SourceImagePath) {
    $searchCandidates = @(
        (Join-Path $ScriptDir "..\public\cisa-icon.png"),
        (Join-Path $ScriptDir "..\public\icon.png"),
        (Join-Path $ScriptDir "..\public\favicon.png"),
        (Join-Path $ScriptDir "..\cisa-icon.png")
    )
    foreach ($sc in $searchCandidates) {
        if (Test-Path $sc) {
            $SourceImagePath = Resolve-Path $sc
            break
        }
    }
}

if (-not $SourceImagePath -or -not (Test-Path $SourceImagePath)) {
    Write-Host "  [ADVERTENCIA]: No se encontro imagen de icono fuente en las rutas configuradas." -ForegroundColor Yellow
    Write-Host "  Manteniendo iconos por defecto de Capacitor." -ForegroundColor Gray
    exit 0
}

Write-Host "  Icono fuente detectado: $SourceImagePath" -ForegroundColor Green

# 2. Rutas de destino
$AndroidDir = Resolve-Path (Join-Path $ScriptDir $Config.paths.androidDir)
$ResDir = Join-Path $AndroidDir "app\src\main\res"

if (-not (Test-Path $ResDir)) {
    Write-Host "  Error: Directorio de recursos Android no encontrado en $ResDir" -ForegroundColor Red
    exit 1
}

# 3. Configurar color de fondo de adaptive icon
$AdaptiveBgColor = if ($Config.branding.adaptiveBackgroundColor) { $Config.branding.adaptiveBackgroundColor } else { "#030712" }
$ValuesDir = Join-Path $ResDir "values"
if (-not (Test-Path $ValuesDir)) {
    New-Item -ItemType Directory -Path $ValuesDir -Force | Out-Null
}

$BgXmlPath = Join-Path $ValuesDir "ic_launcher_background.xml"
$BgXmlContent = @"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">$AdaptiveBgColor</color>
</resources>
"@
[System.IO.File]::WriteAllText($BgXmlPath, $BgXmlContent, [System.Text.Encoding]::UTF8)

# 4. Funcion de redimensionamiento de alta calidad
function Resize-Image-Native($srcPath, $destPath, $targetWidth, $targetHeight) {
    $srcImg = [System.Drawing.Image]::FromFile($srcPath)
    $destBitmap = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
    $graphic = [System.Drawing.Graphics]::FromImage($destBitmap)
    
    $graphic.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphic.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphic.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphic.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $graphic.DrawImage($srcImg, 0, 0, $targetWidth, $targetHeight)
    
    $destBitmap.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphic.Dispose()
    $destBitmap.Dispose()
    $srcImg.Dispose()
}

# 5. Generar Mipmaps en todas las densidades de pantalla
$MipmapConfigs = @(
    @{ Folder = "mipmap-mdpi";    Size = 48;  FgSize = 108 },
    @{ Folder = "mipmap-hdpi";    Size = 72;  FgSize = 162 },
    @{ Folder = "mipmap-xhdpi";   Size = 96;  FgSize = 216 },
    @{ Folder = "mipmap-xxhdpi";  Size = 144; FgSize = 324 },
    @{ Folder = "mipmap-xxxhdpi"; Size = 192; FgSize = 432 }
)

foreach ($cfg in $MipmapConfigs) {
    $targetFolder = Join-Path $ResDir $cfg.Folder
    if (-not (Test-Path $targetFolder)) {
        New-Item -ItemType Directory -Path $targetFolder -Force | Out-Null
    }
    
    $launcherPath = Join-Path $targetFolder "ic_launcher.png"
    $launcherRoundPath = Join-Path $targetFolder "ic_launcher_round.png"
    $foregroundPath = Join-Path $targetFolder "ic_launcher_foreground.png"
    
    Resize-Image-Native $SourceImagePath $launcherPath $cfg.Size $cfg.Size
    Resize-Image-Native $SourceImagePath $launcherRoundPath $cfg.Size $cfg.Size
    Resize-Image-Native $SourceImagePath $foregroundPath $cfg.FgSize $cfg.FgSize
    
    Write-Host "  -> Mipmap inyectado: $($cfg.Folder) ($($cfg.Size)x$($cfg.Size))" -ForegroundColor Gray
}

# 6. Generar Splash Screens
$SplashDirs = @(
    "drawable",
    "drawable-port-hdpi",
    "drawable-port-mdpi",
    "drawable-port-xhdpi",
    "drawable-port-xxhdpi",
    "drawable-port-xxxhdpi",
    "drawable-land-hdpi",
    "drawable-land-mdpi",
    "drawable-land-xhdpi",
    "drawable-land-xxhdpi",
    "drawable-land-xxxhdpi"
)

foreach ($sDir in $SplashDirs) {
    $destFolder = Join-Path $ResDir $sDir
    if (Test-Path $destFolder) {
        $splashPath = Join-Path $destFolder "splash.png"
        Resize-Image-Native $SourceImagePath $splashPath 512 512
    }
}
Write-Host "  -> Splash screens adaptativas generadas (512x512)" -ForegroundColor Gray

Write-Host "------------------------------------------------------------" -ForegroundColor Cyan
Write-Host "Paso 02b completado: Branding y recursos graficos inyectados con exito!" -ForegroundColor Green
exit 0
