$target = Get-Content -Raw -Path "target.txt"
$replace = Get-Content -Raw -Path "replace.txt"

Get-ChildItem -Filter *.html | ForEach-Object {
    $content = Get-Content -Raw -Path $_.FullName
    if ($content.Contains($target)) {
        $newContent = $content.Replace($target, $replace)
        Set-Content -Path $_.FullName -Value $newContent -NoNewline
        Write-Host "Updated $($_.Name)"
    }
}
