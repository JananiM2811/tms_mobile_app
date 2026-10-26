Add-Type -AssemblyName System.Drawing

$width = 1500
$height = 680
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
$fontEntity = New-Object System.Drawing.Font "Arial", 14, ([System.Drawing.FontStyle]::Bold)
$fontEntitySub = New-Object System.Drawing.Font "Arial", 11, ([System.Drawing.FontStyle]::Regular)
$fontProcess = New-Object System.Drawing.Font "Arial", 15, ([System.Drawing.FontStyle]::Bold)
$fontLabel = New-Object System.Drawing.Font "Arial", 10.0, ([System.Drawing.FontStyle]::Bold)

# Pens & Arrow Caps
$penEntity = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(30, 58, 138)), 2.5
$penProcess = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(30, 58, 138)), 3.0

$penArrow = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(30, 58, 138)), 2.2
$cap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap 5, 5, $true
$penArrow.CustomEndCap = $cap

# Brushes
$brushTitle = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(15, 23, 42))
$brushEntityText = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(15, 23, 42))
$brushLabel = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(30, 41, 59))
$brushProcessText = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(30, 58, 138))
$brushProcessFill = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(248, 250, 252))
$brushEntityFill = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(241, 245, 249))

$sfCenter = New-Object System.Drawing.StringFormat
$sfCenter.Alignment = [System.Drawing.StringAlignment]::Center
$sfCenter.LineAlignment = [System.Drawing.StringAlignment]::Center

# --- Title Header ---
$titleRect = New-Object System.Drawing.RectangleF 0.0, 30.0, ([float]$width), 40.0
$g.DrawString("DATA FLOW DIAGRAM (DFD) LEVEL 0 - CONTEXT DIAGRAM", $fontTitle, $brushTitle, $titleRect, $sfCenter)

# --- Left Entity: User (External Entity) ---
$userX = 60
$userY = 220
$userW = 180
$userH = 220
$rectUser = New-Object System.Drawing.RectangleF ([float]$userX), ([float]$userY), ([float]$userW), ([float]$userH)
$g.FillRectangle($brushEntityFill, $rectUser)
$g.DrawRectangle($penEntity, [float]$userX, [float]$userY, [float]$userW, [float]$userH)

$rectUserTitle = New-Object System.Drawing.RectangleF ([float]$userX), ([float]($userY + 80)), ([float]$userW), 30.0
$rectUserSub = New-Object System.Drawing.RectangleF ([float]$userX), ([float]($userY + 110)), ([float]$userW), 25.0
$g.DrawString("User", $fontEntity, $brushEntityText, $rectUserTitle, $sfCenter)
$g.DrawString("(Complainant)", $fontEntitySub, $brushEntityText, $rectUserSub, $sfCenter)

# --- Center Process: Ticket Management System (Process 0) ---
$circleX = 620
$circleY = 200
$circleD = 260
$rectCircle = New-Object System.Drawing.RectangleF ([float]$circleX), ([float]$circleY), ([float]$circleD), ([float]$circleD)
$g.FillEllipse($brushProcessFill, $rectCircle)
$g.DrawEllipse($penProcess, [float]$circleX, [float]$circleY, [float]$circleD, [float]$circleD)

$rectProcText = New-Object System.Drawing.RectangleF ([float]$circleX), ([float]($circleY + 95)), ([float]$circleD), 70.0
$g.DrawString("Ticket`nManagement`nSystem", $fontProcess, $brushProcessText, $rectProcText, $sfCenter)

# --- Right Entity: Staff (External Entity) ---
$staffX = 1260
$staffY = 220
$staffW = 180
$staffH = 220
$rectStaff = New-Object System.Drawing.RectangleF ([float]$staffX), ([float]$staffY), ([float]$staffW), ([float]$staffH)
$g.FillRectangle($brushEntityFill, $rectStaff)
$g.DrawRectangle($penEntity, [float]$staffX, [float]$staffY, [float]$staffW, [float]$staffH)

$rectStaffTitle = New-Object System.Drawing.RectangleF ([float]$staffX), ([float]($staffY + 80)), ([float]$staffW), 30.0
$rectStaffSub = New-Object System.Drawing.RectangleF ([float]$staffX), ([float]($staffY + 110)), ([float]$staffW), 25.0
$g.DrawString("Staff", $fontEntity, $brushEntityText, $rectStaffTitle, $sfCenter)
$g.DrawString("(Admin / Technician)", $fontEntitySub, $brushEntityText, $rectStaffSub, $sfCenter)

# ==================== DATA FLOWS: USER <-> SYSTEM ====================
$leftGapW = $circleX - ($userX + $userW)

# 1. User -> System: Complaint Submission
$g.DrawLine($penArrow, ($userX + $userW), 280, $circleX, 280)
$rectFlow1 = New-Object System.Drawing.RectangleF ([float]($userX + $userW)), 252.0, ([float]$leftGapW), 25.0
$g.DrawString("1. Complaint Submission (Details, Category, Evidence)", $fontLabel, $brushLabel, $rectFlow1, $sfCenter)

# 2. System -> User: Complaint Status / Confirmation
$g.DrawLine($penArrow, $circleX, 380, ($userX + $userW), 380)
$rectFlow2 = New-Object System.Drawing.RectangleF ([float]($userX + $userW)), 388.0, ([float]$leftGapW), 25.0
$g.DrawString("2. Complaint Status / Resolution Notification", $fontLabel, $brushLabel, $rectFlow2, $sfCenter)

# ==================== DATA FLOWS: STAFF <-> SYSTEM ====================
$rightGapW = $staffX - ($circleX + $circleD)

# 3. Staff -> System: Complaint Data Request
$g.DrawLine($penArrow, $staffX, 255, ($circleX + $circleD), 255)
$rectFlow3 = New-Object System.Drawing.RectangleF ([float]($circleX + $circleD)), 230.0, ([float]$rightGapW), 24.0
$g.DrawString("3. Complaint Data / Filter Request", $fontLabel, $brushLabel, $rectFlow3, $sfCenter)

# 4. System -> Staff: Complaint Details / List
$g.DrawLine($penArrow, ($circleX + $circleD), 310, $staffX, 310)
$rectFlow4 = New-Object System.Drawing.RectangleF ([float]($circleX + $circleD)), 318.0, ([float]$rightGapW), 24.0
$g.DrawString("4. Complaint Details / Ticket List", $fontLabel, $brushLabel, $rectFlow4, $sfCenter)

# 5. Staff -> System: Resolution / Action Update
$g.DrawLine($penArrow, $staffX, 370, ($circleX + $circleD), 370)
$rectFlow5 = New-Object System.Drawing.RectangleF ([float]($circleX + $circleD)), 378.0, ([float]$rightGapW), 24.0
$g.DrawString("5. Resolution / Assignment / Status Update", $fontLabel, $brushLabel, $rectFlow5, $sfCenter)

# 6. System -> Staff: System Reports / Analytics
$g.DrawLine($penArrow, ($circleX + $circleD), 430, $staffX, 430)
$rectFlow6 = New-Object System.Drawing.RectangleF ([float]($circleX + $circleD)), 438.0, ([float]$rightGapW), 24.0
$g.DrawString("6. System Reports & Performance Analytics", $fontLabel, $brushLabel, $rectFlow6, $sfCenter)

# Save to PNG
$outputPath = "d:\Sem3\miniproject\dfd_level_0_context_diagram.png"
$bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
Write-Output "Successfully updated: $outputPath"
