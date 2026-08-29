# =============================================================================
# Generador de Icono Multirresolución .ICO para Windows
# =============================================================================

Add-Type -AssemblyName System.Drawing

$SourcePng = "c:\Users\LENOVO\Desktop\REPOSITORIOS\FREETIME\public\cisa-icon.png"
$DestIco = "c:\Users\LENOVO\Desktop\REPOSITORIOS\FREETIME\public\cisa-icon.ico"
$ElectronIco = "c:\Users\LENOVO\Desktop\REPOSITORIOS\FREETIME\cisa-icon.ico"

if (-not (Test-Path $SourcePng)) {
    Write-Host "Error: No se encontro $SourcePng" -ForegroundColor Red
    exit 1
}

$Sizes = @(16, 32, 48, 64, 128, 256)
$Bitmaps = @()

$srcImg = [System.Drawing.Image]::FromFile($SourcePng)

foreach ($sz in $Sizes) {
    $bmp = New-Object System.Drawing.Bitmap($sz, $sz)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($srcImg, 0, 0, $sz, $sz)
    $g.Dispose()
    $Bitmaps += $bmp
}

$srcImg.Dispose()

# Guardar como ICO compuesto
$fs = New-Object System.IO.FileStream($DestIco, [System.IO.FileMode]::Create)
$bw = New-Object System.IO.BinaryWriter($fs)

# Header ICO
$bw.Write([uint16]0) # Reserved
$bw.Write([uint16]1) # Type (1 = ICO)
$bw.Write([uint16]$Bitmaps.Count) # Number of images

$offset = 6 + (16 * $Bitmaps.Count)
$pngBytesList = @()

for ($i = 0; $i -lt $Bitmaps.Count; $i++) {
    $ms = New-Object System.IO.MemoryStream
    $Bitmaps[$i].Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngBytes = $ms.ToArray()
    $pngBytesList += ,$pngBytes
    $ms.Dispose()

    $w = if ($Sizes[$i] -ge 256) { [byte]0 } else { [byte]$Sizes[$i] }
    $h = if ($Sizes[$i] -ge 256) { [byte]0 } else { [byte]$Sizes[$i] }

    $bw.Write($w) # Width
    $bw.Write($h) # Height
    $bw.Write([byte]0) # Color palette
    $bw.Write([byte]0) # Reserved
    $bw.Write([uint16]1) # Color planes
    $bw.Write([uint16]32) # Bits per pixel
    $bw.Write([uint32]$pngBytes.Length) # Image size
    $bw.Write([uint32]$offset) # Offset

    $offset += $pngBytes.Length
}

for ($i = 0; $i -lt $Bitmaps.Count; $i++) {
    $bw.Write($pngBytesList[$i])
    $Bitmaps[$i].Dispose()
}

$bw.Flush()
$bw.Close()
$fs.Close()

Copy-Item $DestIco $ElectronIco -Force

Write-Host "Icono Windows .ICO generado con exito en $DestIco ($($Sizes -join ', ') px)" -ForegroundColor Green
