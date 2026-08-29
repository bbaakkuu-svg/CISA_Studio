# =============================================================================
# CISA STUDIO — GENERADOR E INYECTOR DE ICONOS NATIVOS ANDROID
# Genera y distribuye el icono personalizado en todas las resoluciones mipmap y splash
# =============================================================================

Add-Type -AssemblyName System.Drawing

$SourceImagePath = "C:\Users\LENOVO\.gemini\antigravity-ide\brain\bb717f0f-7fb8-4ecc-a269-7ab1a5504b9b\cisa_app_icon_1787998987091.jpg"

if (-not (Test-Path $SourceImagePath)) {
    Write-Host "Error: No se encontro la imagen fuente en $SourceImagePath" -ForegroundColor Red
    exit 1
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  CISA Studio :: Generando Iconos y Splash Personalizados" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$ResDir = "c:\Users\LENOVO\Desktop\REPOSITORIOS\FREETIME\cisa-mobile\android\app\src\main\res"
$PublicDir = "c:\Users\LENOVO\Desktop\REPOSITORIOS\FREETIME\public"

# Actualizar color de fondo del icono adaptativo a Dark Slate (#030712)
$BgXmlPath = Join-Path $ResDir "values\ic_launcher_background.xml"
$BgXmlContent = @"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#030712</color>
</resources>
"@
$BgXmlContent | Out-File -FilePath $BgXmlPath -Encoding utf8

# Funcion para redimensionar imagenes con interpolacion bicubica de alta calidad
function Resize-Image($srcPath, $destPath, $targetWidth, $targetHeight) {
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

# Configuracion de resoluciones de Mipmaps
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
    
    Resize-Image $SourceImagePath $launcherPath $cfg.Size $cfg.Size
    Resize-Image $SourceImagePath $launcherRoundPath $cfg.Size $cfg.Size
    Resize-Image $SourceImagePath $foregroundPath $cfg.FgSize $cfg.FgSize
    
    Write-Host "  -> Generado $($cfg.Folder) ($($cfg.Size)x$($cfg.Size) / Fg: $($cfg.FgSize)x$($cfg.FgSize))" -ForegroundColor Green
}

# Generar Splash Screens
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
        Resize-Image $SourceImagePath $splashPath 512 512
    }
}
Write-Host "  -> Splash screens actualizadas a 512x512" -ForegroundColor Green

# Copiar a public para la version web
if (-not (Test-Path $PublicDir)) {
    New-Item -ItemType Directory -Path $PublicDir -Force | Out-Null
}
$WebIcon = Join-Path $PublicDir "cisa-icon.png"
$WebFavicon = Join-Path $PublicDir "favicon.png"
Resize-Image $SourceImagePath $WebIcon 512 512
Resize-Image $SourceImagePath $WebFavicon 64 64

Write-Host "------------------------------------------------------------" -ForegroundColor Cyan
Write-Host "Iconos y caratula de aplicacion instalados con exito!" -ForegroundColor Green
