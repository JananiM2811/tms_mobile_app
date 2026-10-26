Add-Type -AssemblyName System.Drawing

$width = 1520
$height = 800
$bmp = New-Object System.Drawing.Bitmap $width, $height
$g = [System.Drawing.Graphics]::FromImage($bmp)

# Smoothing & Quality
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Background (Pure Crisp White)
$g.Clear([System.Drawing.Color]::White)

# Fonts
$fontTitle = New-Object System.Drawing.Font "Arial", 16, ([System.Drawing.FontStyle]::Bold)
$fontHeader = New-Object System.Drawing.Font "Arial", 12.5, ([System.Drawing.FontStyle]::Bold)
$fontBox = New-Object System.Drawing.Font "Arial", 10.5, ([System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font "Arial", 9.0, ([System.Drawing.FontStyle]::Regular)
$fontLabel = New-Object System.Drawing.Font "Arial", 10.0, ([System.Drawing.FontStyle]::Bold)

# Pens
$penBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(51, 65, 85)), 2
$penHeader = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(37, 99, 235)), 2.5
$penDiamond = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(217, 119, 6)), 2.5
$penNotification = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(5, 150, 105)), 2.5
$penReports = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(124, 58, 237)), 2.5

$penArrow = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(71, 85, 105)), 2
$cap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap 5, 5, $true
$penArrow.CustomEndCap = $cap

$penLine = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(71, 85, 105)), 2

# Brushes
$brushText = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(15, 23, 42))
$brushSubText = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(71, 85, 105))
$brushHeaderFill = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(239, 246, 255))
$brushHeaderText = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(29, 78, 216))

$brushDiamondFill = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(254, 243, 199))
$brushDiamondText = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(146, 64, 14))

$brushNotifFill = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(236, 253, 245))
$brushNotifText = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(6, 95, 70))

$brushReportsFill = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(245, 243, 255))
$brushReportsText = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(109, 40, 217))

$brushWhite = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$brushGreen = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(22, 101, 52))
$brushRed = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(185, 28, 28))
$brushBlue = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(30, 64, 175))

$sfCenter = New-Object System.Drawing.StringFormat
$sfCenter.Alignment = [System.Drawing.StringAlignment]::Center
$sfCenter.LineAlignment = [System.Drawing.StringAlignment]::Center

function Draw-Box {
    param($x, $y, $w, $h, $title, $sub = "", $style = "default")
    $rect = New-Object System.Drawing.RectangleF ([float]$x), ([float]$y), ([float]$w), ([float]$h)
    
    $fillBrush = $brushWhite
    $pen = $penBorder
    $textBrush = $brushText
    $subBrush = $brushSubText
    
    if ($style -eq "header") {
        $fillBrush = $brushHeaderFill
        $pen = $penHeader
        $textBrush = $brushHeaderText
        $subBrush = $brushHeaderText
    } elseif ($style -eq "notification") {
        $fillBrush = $brushNotifFill
        $pen = $penNotification
        $textBrush = $brushNotifText
        $subBrush = $brushNotifText
    } elseif ($style -eq "reports") {
        $fillBrush = $brushReportsFill
        $pen = $penReports
        $textBrush = $brushReportsText
        $subBrush = $brushReportsText
    }
    
    $g.FillRectangle($fillBrush, $rect)
    $g.DrawRectangle($pen, [float]$x, [float]$y, [float]$w, [float]$h)
    
    if ($sub -eq "") {
        $g.DrawString($title, $fontBox, $textBrush, $rect, $sfCenter)
    } else {
        $rectTitle = New-Object System.Drawing.RectangleF ([float]$x), ([float]($y + 10)), ([float]$w), 22.0
        $rectSub = New-Object System.Drawing.RectangleF ([float]$x), ([float]($y + 34)), ([float]$w), 20.0
        $g.DrawString($title, $fontBox, $textBrush, $rectTitle, $sfCenter)
        $g.DrawString($sub, $fontSub, $subBrush, $rectSub, $sfCenter)
    }
}

function Draw-Diamond {
    param($cx, $cy, $w, $h, $line1, $line2)
    $p1 = New-Object System.Drawing.PointF ([float]$cx), ([float]($cy - $h/2))
    $p2 = New-Object System.Drawing.PointF ([float]($cx + $w/2)), ([float]$cy)
    $p3 = New-Object System.Drawing.PointF ([float]$cx), ([float]($cy + $h/2))
    $p4 = New-Object System.Drawing.PointF ([float]($cx - $w/2)), ([float]$cy)
    $points = [System.Drawing.PointF[]]@($p1, $p2, $p3, $p4)
    
    $g.FillPolygon($brushDiamondFill, $points)
    $g.DrawPolygon($penDiamond, $points)
    
    $rect = New-Object System.Drawing.RectangleF ([float]($cx - $w/2)), ([float]($cy - 20)), ([float]$w), 20.0
    $rect2 = New-Object System.Drawing.RectangleF ([float]($cx - $w/2)), ([float]($cy + 2)), ([float]$w), 20.0
    $g.DrawString($line1, $fontBox, $brushDiamondText, $rect, $sfCenter)
    $g.DrawString($line2, $fontBox, $brushDiamondText, $rect2, $sfCenter)
}

# --- Title Header ---
$titleRect = New-Object System.Drawing.RectangleF 0.0, 22.0, ([float]$width), 35.0
$g.DrawString("COMPLAINT & TICKET MANAGEMENT SYSTEM - WORKFLOW ARCHITECTURE", $fontTitle, $brushText, $titleRect, $sfCenter)

# ==================== COLUMN 1: USER (COMPLAINANT) ====================
Draw-Box -x 90 -y 80 -w 270 -h 48 -title "User (Complainant)" -style "header"
$g.DrawLine($penArrow, 225, 128, 225, 165)

Draw-Box -x 90 -y 165 -w 270 -h 60 -title "1. Access System" -sub "(Login / Register Account)"
$g.DrawLine($penArrow, 225, 225, 225, 260)

Draw-Box -x 90 -y 260 -w 270 -h 60 -title "2. Submit Complaint" -sub "(Category, Title, Evidence Upload)"
$g.DrawLine($penArrow, 225, 320, 225, 365)

# Decision Diamond 1: Complaint Submitted?
Draw-Diamond -cx 225 -cy 415 -w 210 -h 100 -line1 "Complaint" -line2 "Submitted?"

# Diamond 1 - No -> Loop back to Submit
$g.DrawLine($penLine, 120, 415, 40, 415)
$g.DrawLine($penLine, 40, 415, 40, 290)
$g.DrawLine($penArrow, 40, 290, 90, 290)
$g.DrawString("No (Validation Fail)", $fontSub, $brushRed, 35, 422)

# Diamond 1 - Yes -> Down to Step 3
$g.DrawLine($penArrow, 225, 465, 225, 560)
$g.DrawString("Yes", $fontLabel, $brushGreen, 235, 502)

Draw-Box -x 90 -y 560 -w 270 -h 70 -title "3. View & Track Status" -sub "(Open / In Progress / Resolved)"

# Diamond 1 - Ticket Stored in DB -> Staff view
$g.DrawLine($penLine, 330, 415, 460, 415)
$g.DrawLine($penLine, 460, 415, 460, 290)
$g.DrawLine($penArrow, 460, 290, 640, 290)
$g.DrawString("Ticket Stored in DB", $fontLabel, $brushBlue, 345, 395)


# ==================== COLUMN 2: STAFF (ADMIN / TECHNICIAN) ====================
Draw-Box -x 640 -y 80 -w 300 -h 48 -title "Staff (Admin / Technician)" -style "header"
$g.DrawLine($penArrow, 790, 128, 790, 165)

Draw-Box -x 640 -y 165 -w 300 -h 60 -title "4. Staff Login" -sub "(Role-Based Access Control)"
$g.DrawLine($penArrow, 790, 225, 790, 260)

Draw-Box -x 640 -y 260 -w 300 -h 60 -title "5. View & Filter Complaints" -sub "(By Dept, Priority, Status)"
$g.DrawLine($penArrow, 790, 320, 790, 355)

Draw-Box -x 640 -y 355 -w 300 -h 60 -title "6. Assign Complaint" -sub "(To Department Technician)"
$g.DrawLine($penArrow, 790, 415, 790, 450)

Draw-Box -x 640 -y 450 -w 300 -h 60 -title "7. Update Status & Notes" -sub "(Add Work / Resolution Notes)"
$g.DrawLine($penArrow, 790, 510, 790, 545)

# Decision Diamond 2: Complaint Resolved?
Draw-Diamond -cx 790 -cy 595 -w 220 -h 100 -line1 "Complaint" -line2 "Resolved?"

# Diamond 2 - No -> Loop back to Step 7 (In progress)
$g.DrawLine($penLine, 900, 595, 980, 595)
$g.DrawLine($penLine, 980, 595, 980, 480)
$g.DrawLine($penArrow, 980, 480, 940, 480)
$g.DrawString("No (Work In Progress)", $fontSub, $brushRed, 990, 535)


# ==================== STEP 8: USER NOTIFICATION BOX ====================
# Diamond 2 - Yes -> Arrow entering Step 8 Box
$g.DrawLine($penArrow, 680, 595, 600, 595)
$g.DrawString("Yes", $fontLabel, $brushGreen, 635, 575)

Draw-Box -x 395 -y 562 -w 205 -h 66 -title "8. Send User Notification" -sub "(Ticket Resolved & Closed)" -style "notification"

# Arrow from Step 8 Box entering Step 3 Box (User tracking view updated)
$g.DrawLine($penArrow, 395, 595, 360, 595)


# ==================== ADMIN REPORTS & ANALYTICS ====================
# Connected directly from 4. Staff Login via clean arrow
$g.DrawLine($penArrow, 940, 195, 1070, 195)
$g.DrawString("Generate", $fontSub, $brushBlue, 975, 175)

Draw-Box -x 1070 -y 160 -w 330 -h 70 -title "Reports & Analytics Dashboard" -sub "(Performance Metrics, SLA & Excel Export)" -style "reports"


# Save to PNG
$outputPath = "d:\Sem3\miniproject\system_workflow_diagram.png"
$bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
Write-Output "Successfully updated: $outputPath"
