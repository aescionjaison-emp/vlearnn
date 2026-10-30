Add-Type -AssemblyName System.Drawing

$brainDir = "C:\Users\USER\.gemini\antigravity-ide\brain\3d25ebe6-ee88-46b4-8eac-05b20efa0b3c"
$pubDir = "Frontend\public\images"

Copy-Item "$brainDir\hero_student_laptop_1793344648557.jpg" "$pubDir\hero-student-laptop.jpg" -Force
Copy-Item "$brainDir\about_learning_campus_1793344670251.jpg" "$pubDir\about-learning-campus.jpg" -Force
Copy-Item "$brainDir\floating_card_thumb_1793344695204.jpg" "$pubDir\floating-card-thumb.jpg" -Force

$avatarSrc = "$brainDir\student_avatar_group_1793344720291.jpg"
if (Test-Path $avatarSrc) {
    $img = [System.Drawing.Image]::FromFile($avatarSrc)
    $w = $img.Width
    $h = $img.Height
    $colW = [int]($w / 3)

    for ($i = 0; $i -lt 3; $i++) {
        $cropRect = New-Object System.Drawing.Rectangle ($i * $colW), 0, $colW, $h
        $bmp = New-Object System.Drawing.Bitmap $colW, $h
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $destRect = New-Object System.Drawing.Rectangle 0, 0, $colW, $h
        $g.DrawImage($img, $destRect, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
        $bmp.Save("$pubDir\avatar-$($i + 1).jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
        $g.Dispose()
        $bmp.Dispose()
    }
    $img.Dispose()
}

Write-Output "All asset images successfully prepared!"
