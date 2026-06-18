$files = Get-ChildItem -Path . -Include *.html,*.css -Recurse -File
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content

    $content = $content -replace 'font-weight:\s*600', 'font-weight: 550'
    $content = $content -replace 'font-weight:\s*700', 'font-weight: 580'
    $content = $content -replace 'font-weight:\s*800', 'font-weight: 580'
    $content = $content -replace 'font-weight:\s*900', 'font-weight: 580'
    $content = $content -replace 'font-weight:\s*bold;', 'font-weight: 580;'
    $content = $content -replace 'font-weight:\s*bolder;', 'font-weight: 580;'

    if ($content -cne $original) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Updated $($file.Name)"
    }
}
