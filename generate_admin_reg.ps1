Add-Type -AssemblyName System.Drawing

$width = 1300
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
$fontBoxSub = New-Object System.Drawing.Font "Arial", 10.0, ([System.Drawing.FontStyle]::Regular)
$fontOval = New-Object System.Drawing.Font "Arial", 10.5, ([System.Drawing.FontStyle]::Bold)
$fontLabel = New-Object System.Drawing.Font "Arial", 10.5, ([System.Drawing.FontStyle]::Bold)

# Pens
$penBox = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(30, 41, 59)), 2.2
$penOval = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(30, 41, 59)), 2.2
$penDB = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(30, 41, 59)), 2.2

$penArrow = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(30, 41, 59)), 2.2
$cap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap 5, 5, $true
$penArrow.CustomEndCap = $cap

$penLine = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(30, 41, 59)), 2.2

# Brushes
$brushTitle = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(15, 23, 42))
$brushText = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(15, 23, 42))
$brushLabel = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(30, 41, 59))

$brushAdminFill = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(238, 246, 255))
$brushDBFill = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(240, 249, 255))
$brushOvalFill = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$brushDeniedFill = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(254, 226, 226))
$brushSuccessFill = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(220, 252, 231))

$sfCenter = New-Object System.Drawing.StringFormat
$sfCenter.Alignment = [System.Drawing.StringAlignment]::Center
$sfCenter.LineAlignment = [System.Drawing.StringAlignment]::Center

# --- Title Header ---
$titleRect = New-Object System.Drawing.RectangleF 0.0, 25.0, ([float]$width), 35.0
$g.DrawString("ADMIN USER REGISTRATION PROCESS", $fontTitle, $brushTitle, $titleRect, $sfCenter)

# --- 1. ADMIN Box (Left Rectangle) ---
$adminX = 40
$adminY = 175
$adminW = 200
$adminH = 80
$rectAdmin = New-Object System.Drawing.RectangleF ([float]$adminX), ([float]$adminY), ([float]$adminW), ([float]$adminH)
$g.FillRectangle($brushAdminFill, $rectAdmin)
$g.DrawRectangle($penBox, [float]$adminX, [float]$adminY, [float]$adminW, [float]$adminH)

$rectAdminTitle = New-Object System.Drawing.RectangleF ([float]$adminX), ([float]($adminY + 16)), ([float]$adminW), 24.0
$rectAdminSub = New-Object System.Drawing.RectangleF ([float]$adminX), ([float]($adminY + 42)), ([float]$adminW), 22.0
$g.DrawString("ADMIN", $fontBox, $brushText, $rectAdminTitle, $sfCenter)
$g.DrawString("(Only Admin Can Register)", $fontBoxSub, $brushText, $rectAdminSub, $sfCenter)

# --- 2. ENTER USER DETAILS (Oval 1) ---
$oval1X = 295
$oval1Y = 160
$oval1W = 185
$oval1H = 110
$rectOval1 = New-Object System.Drawing.RectangleF ([float]$oval1X), ([float]$oval1Y), ([float]$oval1W), ([float]$oval1H)
$g.FillEllipse($brushOvalFill, $rectOval1)
$g.DrawEllipse($penOval, [float]$oval1X, [float]$oval1Y, [float]$oval1W, [float]$oval1H)
$g.DrawString("ENTER USER`nDETAILS", $fontOval, $brushText, $rectOval1, $sfCenter)

# Arrow: ADMIN -> ENTER USER DETAILS
$g.DrawLine($penArrow, ($adminX + $adminW), 215, $oval1X, 215)

# --- 3. CHECK AUTHORIZATION / VALIDITY (Oval 2) ---
$oval2X = 540
$oval2Y = 150
$oval2W = 280
$oval2H = 130
$rectOval2 = New-Object System.Drawing.RectangleF ([float]$oval2X), ([float]$oval2Y), ([float]$oval2W), ([float]$oval2H)
$g.FillEllipse($brushOvalFill, $rectOval2)
$g.DrawEllipse($penOval, [float]$oval2X, [float]$oval2Y, [float]$oval2W, [float]$oval2H)
$g.DrawString("CHECK AUTHORIZATION /`nVALIDITY", $fontOval, $brushText, $rectOval2, $sfCenter)

# Arrow: ENTER USER DETAILS -> CHECK AUTHORIZATION / VALIDITY
$g.DrawLine($penArrow, ($oval1X + $oval1W), 215, $oval2X, 215)

# --- 4. REGISTRATION DATABASE (Cylinder on Right) ---
$dbX = 890
$dbY = 145
$dbW = 170
$dbH = 135

# Cylinder body
$g.FillRectangle($brushDBFill, [float]$dbX, [float]($dbY + 18), [float]$dbW, [float]($dbH - 18))
$g.DrawLine($penDB, [float]$dbX, [float]($dbY + 18), [float]$dbX, [float]($dbY + $dbH))
$g.DrawLine($penDB, [float]($dbX + $dbW), [float]($dbY + 18), [float]($dbX + $dbW), [float]($dbY + $dbH))

# Cylinder bottom arc
$rectDbBottom = New-Object System.Drawing.RectangleF ([float]$dbX), ([float]($dbY + $dbH - 18)), ([float]$dbW), 36.0
$g.FillEllipse($brushDBFill, $rectDbBottom)
$g.DrawArc($penDB, [float]$dbX, [float]($dbY + $dbH - 18), [float]$dbW, 36.0, 0, 180)

# Cylinder top cap
$rectDbTop = New-Object System.Drawing.RectangleF ([float]$dbX), ([float]$dbY), ([float]$dbW), 36.0
$g.FillEllipse($brushDBFill, $rectDbTop)
$g.DrawEllipse($penDB, [float]$dbX, [float]$dbY, [float]$dbW, 36.0)

$rectDbText = New-Object System.Drawing.RectangleF ([float]$dbX), ([float]($dbY + 45)), ([float]$dbW), 45.0
$g.DrawString("REGISTRATION`nDATABASE", $fontBox, $brushText, $rectDbText, $sfCenter)

# Arrow: CHECK AUTHORIZATION -> REGISTRATION DATABASE
$g.DrawLine($penArrow, ($oval2X + $oval2W), 215, $dbX, 215)

# --- 5. BRANCHING LINES (AUTHORIZED / NOT AUTHORIZED) ---
# Vertical stem down from Oval 2
$stemX = $oval2X + ($oval2W / 2) # 680
$stemTopY = $oval2Y + $oval2H    # 280
$branchY = 345
$g.DrawLine($penLine, $stemX, $stemTopY, $stemX, $branchY)

# Horizontal split
$leftBranchX = 500
$rightBranchX = 860
$g.DrawLine($penLine, $leftBranchX, $branchY, $rightBranchX, $branchY)

# Left Branch: AUTHORIZED
$g.DrawString("AUTHORIZED", $fontLabel, $brushLabel, ($leftBranchX - 10), ($branchY - 24))
$g.DrawLine($penArrow, $leftBranchX, $branchY, $leftBranchX, 395)

# Right Branch: NOT AUTHORIZED
$g.DrawString("NOT AUTHORIZED", $fontLabel, $brushLabel, ($rightBranchX - 85), ($branchY - 24))
$g.DrawLine($penArrow, $rightBranchX, $branchY, $rightBranchX, 420)

# --- 6. REGISTER USER (Oval 3) on Left Branch ---
$oval3X = 395
$oval3Y = 395
$oval3W = 210
$oval3H = 105
$rectOval3 = New-Object System.Drawing.RectangleF ([float]$oval3X), ([float]$oval3Y), ([float]$oval3W), ([float]$oval3H)
$g.FillEllipse($brushOvalFill, $rectOval3)
$g.DrawEllipse($penOval, [float]$oval3X, [float]$oval3Y, [float]$oval3W, [float]$oval3H)
$g.DrawString("REGISTER`nUSER", $fontOval, $brushText, $rectOval3, $sfCenter)

# Arrow: REGISTER USER -> LOGIN PAGE
$g.DrawLine($penArrow, $leftBranchX, ($oval3Y + $oval3H), $leftBranchX, 550)

# --- 7. LOGIN PAGE (Success Box) ---
$loginX = 405
$loginY = 550
$loginW = 190
$loginH = 65
$rectLogin = New-Object System.Drawing.RectangleF ([float]$loginX), ([float]$loginY), ([float]$loginW), ([float]$loginH)
$g.FillRectangle($brushSuccessFill, $rectLogin)
$g.DrawRectangle($penBox, [float]$loginX, [float]$loginY, [float]$loginW, [float]$loginH)
$g.DrawString("LOGIN PAGE", $fontBox, $brushText, $rectLogin, $sfCenter)

# --- 8. ACCESS DENIED (Failure Box) on Right Branch ---
$deniedX = 765
$deniedY = 420
$deniedW = 190
$deniedH = 65
$rectDenied = New-Object System.Drawing.RectangleF ([float]$deniedX), ([float]$deniedY), ([float]$deniedW), ([float]$deniedH)
$g.FillRectangle($brushDeniedFill, $rectDenied)
$g.DrawRectangle($penBox, [float]$deniedX, [float]$deniedY, [float]$deniedW, [float]$deniedH)
$g.DrawString("ACCESS DENIED", $fontBox, $brushText, $rectDenied, $sfCenter)

# Save to PNG
$outputPath = "d:\Sem3\miniproject\admin_user_registration_process.png"
$bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
Write-Output "Successfully generated: $outputPath"
