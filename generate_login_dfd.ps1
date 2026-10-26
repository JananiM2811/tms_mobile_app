Add-Type -AssemblyName System.Drawing

$width = 1350
$height = 700
$bmp = New-Object System.Drawing.Bitmap $width, $height
$g = [System.Drawing.Graphics]::FromImage($bmp)

# Quality & Anti-aliasing
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Clean White Background
$g.Clear([System.Drawing.Color]::White)

# Fonts
$fontTitle = New-Object System.Drawing.Font "Arial", 16, ([System.Drawing.FontStyle]::Bold)
$fontBox = New-Object System.Drawing.Font "Arial", 12.0, ([System.Drawing.FontStyle]::Bold)
$fontOval = New-Object System.Drawing.Font "Arial", 10.5, ([System.Drawing.FontStyle]::Bold)
$fontProcess = New-Object System.Drawing.Font "Arial", 11.5, ([System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font "Arial", 9.5, ([System.Drawing.FontStyle]::Regular)
$fontLabel = New-Object System.Drawing.Font "Arial", 10.5, ([System.Drawing.FontStyle]::Bold)

# Pens
$penBox = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(30, 58, 138)), 2.5
$penOval = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(51, 65, 85)), 2.5
$penProcess = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(37, 99, 235)), 2.8
$penDB = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(71, 85, 105)), 2.5

$penArrow = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(30, 58, 138)), 2.2
$cap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap 5, 5, $true
$penArrow.CustomEndCap = $cap

$penLine = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(30, 58, 138)), 2.2

# Brushes
$brushTitle = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(15, 23, 42))
$brushText = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(15, 23, 42))
$brushProcessText = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(30, 64, 175))
$brushLabel = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(30, 41, 59))
$brushGreen = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(22, 101, 52))
$brushRed = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(185, 28, 28))

$brushFillBox = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(241, 245, 249))
$brushFillOval = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(248, 250, 252))
$brushFillProcess = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(239, 246, 255))
$brushFillDB = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(248, 250, 252))

$sfCenter = New-Object System.Drawing.StringFormat
$sfCenter.Alignment = [System.Drawing.StringAlignment]::Center
$sfCenter.LineAlignment = [System.Drawing.StringAlignment]::Center

# --- Title Header (Without LEVEL 1) ---
$titleRect = New-Object System.Drawing.RectangleF 0.0, 25.0, ([float]$width), 35.0
$g.DrawString("USER AUTHENTICATION & LOGIN PROCESS", $fontTitle, $brushTitle, $titleRect, $sfCenter)

# --- 1. USER Entity (Rectangle on Left) ---
$userX = 60
$userY = 270
$userW = 150
$userH = 75
$rectUser = New-Object System.Drawing.RectangleF ([float]$userX), ([float]$userY), ([float]$userW), ([float]$userH)
$g.FillRectangle($brushFillBox, $rectUser)
$g.DrawRectangle($penBox, [float]$userX, [float]$userY, [float]$userW, [float]$userH)
$g.DrawString("USER", $fontBox, $brushText, $rectUser, $sfCenter)

# --- 2. OVAL SHAPE: ENTER USER NAME & PASSWORD (Middle) ---
$ovalX = 290
$ovalY = 250
$ovalW = 260
$ovalH = 115
$rectOval = New-Object System.Drawing.RectangleF ([float]$ovalX), ([float]$ovalY), ([float]$ovalW), ([float]$ovalH)
$g.FillEllipse($brushFillOval, $rectOval)
$g.DrawEllipse($penOval, [float]$ovalX, [float]$ovalY, [float]$ovalW, [float]$ovalH)
$g.DrawString("ENTER USER NAME &`nPASSWORD", $fontOval, $brushText, $rectOval, $sfCenter)

# Arrow from USER to OVAL
$g.DrawLine($penArrow, ($userX + $userW), 307, $ovalX, 307)

# --- 3. CIRCLE: CHECK VALIDITY (Right Middle) ---
$procX = 670
$procY = 235
$procD = 145
$rectProc = New-Object System.Drawing.RectangleF ([float]$procX), ([float]$procY), ([float]$procD), ([float]$procD)
$g.FillEllipse($brushFillProcess, $rectProc)
$g.DrawEllipse($penProcess, [float]$procX, [float]$procY, [float]$procD, [float]$procD)
$g.DrawString("CHECK`nVALIDITY", $fontProcess, $brushProcessText, $rectProc, $sfCenter)

# Arrow from OVAL to CHECK VALIDITY
$g.DrawLine($penArrow, ($ovalX + $ovalW), 307, $procX, 307)

# --- 4. CYLINDER: LOGIN DB (Top) ---
$dbX = 670
$dbY = 65
$dbW = 145
$dbH = 95

# Cylinder body
$g.FillRectangle($brushFillDB, [float]$dbX, [float]($dbY + 14), [float]$dbW, [float]($dbH - 14))
$g.DrawLine($penDB, [float]$dbX, [float]($dbY + 14), [float]$dbX, [float]($dbY + $dbH))
$g.DrawLine($penDB, [float]($dbX + $dbW), [float]($dbY + 14), [float]($dbX + $dbW), [float]($dbY + $dbH))

# Cylinder bottom arc
$rectDbBottom = New-Object System.Drawing.RectangleF ([float]$dbX), ([float]($dbY + $dbH - 14)), ([float]$dbW), 28.0
$g.FillEllipse($brushFillDB, $rectDbBottom)
$g.DrawArc($penDB, [float]$dbX, [float]($dbY + $dbH - 14), [float]$dbW, 28.0, 0, 180)

# Cylinder top cap
$rectDbTop = New-Object System.Drawing.RectangleF ([float]$dbX), ([float]$dbY), ([float]$dbW), 28.0
$g.FillEllipse($brushFillDB, $rectDbTop)
$g.DrawEllipse($penDB, [float]$dbX, [float]$dbY, [float]$dbW, 28.0)

$rectDbText = New-Object System.Drawing.RectangleF ([float]$dbX), ([float]($dbY + 28)), ([float]$dbW), 45.0
$g.DrawString("LOGIN`nDB", $fontBox, $brushText, $rectDbText, $sfCenter)

# Two-way Query & Verification Arrows
$g.DrawLine($penArrow, 725, $procY, 725, ($dbY + $dbH + 8))
$g.DrawLine($penArrow, 760, ($dbY + $dbH + 8), 760, $procY)
$g.DrawString("Query", $fontSub, $brushLabel, 685, 185)
$g.DrawString("Match", $fontSub, $brushLabel, 770, 185)

# --- 5. MAIN PAGE (Bottom Rectangle) ---
$mainX = 650
$mainY = 530
$mainW = 185
$mainH = 70
$rectMain = New-Object System.Drawing.RectangleF ([float]$mainX), ([float]$mainY), ([float]$mainW), ([float]$mainH)
$g.FillRectangle($brushFillBox, $rectMain)
$g.DrawRectangle($penBox, [float]$mainX, [float]$mainY, [float]$mainW, [float]$mainH)
$g.DrawString("MAIN PAGE", $fontBox, $brushText, $rectMain, $sfCenter)

# Arrow: IF YES -> MAIN PAGE
$g.DrawLine($penArrow, 742, ($procY + $procD), 742, $mainY)
$g.DrawString("IF YES", $fontLabel, $brushGreen, 755, 450)

# Arrow: IF NO -> Loop back to USER completely BELOW the Oval shape
$g.DrawLine($penLine, 680, 350, 610, 350)
$g.DrawLine($penLine, 610, 350, 610, 430)
$g.DrawLine($penLine, 610, 430, 135, 430)
$g.DrawLine($penArrow, 135, 430, 135, ($userY + $userH))
$g.DrawString("IF NO (Invalid Credentials)", $fontLabel, $brushRed, 250, 440)

# Save to PNG
$outputPath = "d:\Sem3\miniproject\login_authentication_dfd.png"
$bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
Write-Output "Successfully updated without Level 1: $outputPath"
