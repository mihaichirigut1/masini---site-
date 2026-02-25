# Pregateste si deschide folderul cu mu-plugin pentru upload pe server.
# Ruleaza: .\Instalare-MuPlugin-CautareJos.ps1

$siteRoot = $PSScriptRoot
$deployDir = Join-Path $siteRoot "deploy-mu-plugin"

if (-not (Test-Path $deployDir)) {
    New-Item -ItemType Directory -Path $deployDir -Force | Out-Null
}
Copy-Item (Join-Path $siteRoot "mu-plugin-masini-mobile-cautare-jos.php") -Destination (Join-Path $deployDir "mu-plugin-masini-mobile-cautare-jos.php") -Force
Write-Host "Fisier copiat in: $deployDir"
explorer $deployDir
