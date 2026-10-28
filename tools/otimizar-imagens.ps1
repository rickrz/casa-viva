param([string]$Dir)
Add-Type -AssemblyName System.Drawing
$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 80L

function Redimensionar($origem, $destino, $maxL, $maxA) {
  $src = [System.Drawing.Image]::FromFile($origem)
  $escala = [Math]::Min(1.0, [Math]::Min($maxL / $src.Width, $maxA / $src.Height))
  $w = [int][Math]::Max(1, [Math]::Round($src.Width * $escala))
  $h = [int][Math]::Max(1, [Math]::Round($src.Height * $escala))
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::White)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($src, 0, 0, $w, $h)
  $g.Dispose()
  $tmp = $destino + ".tmp.jpg"
  $bmp.Save($tmp, $enc, $ep)
  $bmp.Dispose()
  $src.Dispose()
  Move-Item -LiteralPath $tmp -Destination $destino -Force
  return @($w, $h)
}

$arquivos = Get-ChildItem -Path $Dir -File | Where-Object { $_.Extension -match '^\.(jpg|jpeg|png)$' -and $_.Name -notmatch '-800\.' }
foreach ($f in $arquivos) {
  $base = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
  $principal = Join-Path $Dir ($base + ".jpg")
  if ($f.FullName -ne $principal) {
    Move-Item -LiteralPath $f.FullName -Destination ($principal + ".src") -Force
    $origem = $principal + ".src"
  } else {
    $origem = $principal
  }
  $d = Redimensionar $origem $principal 1600 1800
  if ($origem -ne $principal) { Remove-Item -LiteralPath $origem -Force }
  $w = $d[0]; $h = $d[1]
  if ($w -gt 900) {
    Redimensionar $principal (Join-Path $Dir ($base + "-800.jpg")) 800 1000 | Out-Null
  }
  "{0}|{1}x{2}" -f ($base + ".jpg"), $w, $h
}
