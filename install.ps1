# Flux Screensaver Installer
# Must be run as Administrator
# Usage:
#   .\install.ps1              — Install the screensaver
#   .\install.ps1 -Uninstall   — Remove all traces of the screensaver

param(
    [switch]$Uninstall
)

# ── Always resolve paths from the script's own location, not the CWD ──
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$installDir = "C:\ProgramData\FluxScreensaver"
$scrName = "FluxScreensaver.scr"
$regPath = "HKCU:\Control Panel\Desktop"

# ────────────────────────────────────────────────
# UNINSTALL
# ────────────────────────────────────────────────
if ($Uninstall) {
    Write-Host "`n=== Uninstalling Flux Screensaver ===" -ForegroundColor Yellow

    # Remove any old .scr files from System32 (from previous broken installs)
    $sys32Scrs = Get-ChildItem "C:\WINDOWS\System32\*Flux*Screensaver*" -ErrorAction SilentlyContinue
    foreach ($scr in $sys32Scrs) {
        Remove-Item $scr.FullName -Force -ErrorAction SilentlyContinue
        Write-Host "  Removed: $($scr.Name) from System32" -ForegroundColor Red
    }

    # Remove install directory (the full Electron app)
    if (Test-Path $installDir) {
        Remove-Item $installDir -Recurse -Force
        Write-Host "  Removed: $installDir" -ForegroundColor Red
    } else {
        Write-Host "  $installDir not found (already clean)" -ForegroundColor DarkGray
    }

    # Clear screensaver registry entries
    Set-ItemProperty -Path $regPath -Name "SCRNSAVE.EXE" -Value "" -ErrorAction SilentlyContinue
    Set-ItemProperty -Path $regPath -Name "ScreenSaveActive" -Value "0" -ErrorAction SilentlyContinue
    Write-Host "  Cleared screensaver registry entries" -ForegroundColor Red

    Write-Host "`n  Flux Screensaver fully uninstalled." -ForegroundColor Green
    Write-Host "  Open Screen Saver Settings and select another screensaver or '(None)'.`n"
    return
}

# ────────────────────────────────────────────────
# INSTALL
# ────────────────────────────────────────────────
Write-Host "`n=== Installing Flux Screensaver ===" -ForegroundColor Cyan

# Use absolute path from script location
$unpackedDir = Join-Path $scriptDir "release\win-unpacked"
$sourceExe = Join-Path $unpackedDir "Flux Screensaver.exe"

if (-not (Test-Path $sourceExe)) {
    Write-Host "  ERROR: Build not found at:" -ForegroundColor Red
    Write-Host "    $sourceExe" -ForegroundColor Red
    Write-Host "  Run 'npm run electron:build' first.`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "  Found build: $unpackedDir" -ForegroundColor DarkGray

# Step 1: Clean previous installs from System32 (from old approach)
$sys32Scrs = Get-ChildItem "C:\WINDOWS\System32\*Flux*Screensaver*" -ErrorAction SilentlyContinue
foreach ($scr in $sys32Scrs) {
    Remove-Item $scr.FullName -Force -ErrorAction SilentlyContinue
    Write-Host "  Cleaned old: $($scr.Name) from System32" -ForegroundColor Yellow
}

# Step 2: Copy ENTIRE unpacked app to install directory
# The .scr must stay alongside its resources/, DLLs, locales/, etc.
Write-Host "  Copying app to $installDir ..." -ForegroundColor White
if (Test-Path $installDir) {
    Remove-Item $installDir -Recurse -Force
}
Copy-Item $unpackedDir $installDir -Recurse

# Step 3: Rename exe → .scr (in place, keeping all siblings intact)
$installedExe = Join-Path $installDir "Flux Screensaver.exe"
$installedScr = Join-Path $installDir $scrName

if (Test-Path $installedScr) { Remove-Item $installedScr -Force }
Rename-Item $installedExe $scrName
Write-Host "  Created: $installedScr" -ForegroundColor Green

# Step 4: Register via Windows registry
# NOTE: We do NOT copy the .scr to System32. An Electron exe needs its full
# directory (resources/, DLLs, locales/) to function. Copying just the exe
# to System32 causes it to crash silently → "(none)" in the dropdown.
# Instead, we point the registry directly at the install location.
Set-ItemProperty -Path $regPath -Name "SCRNSAVE.EXE" -Value $installedScr
Set-ItemProperty -Path $regPath -Name "ScreenSaveActive" -Value "1"
Set-ItemProperty -Path $regPath -Name "ScreenSaveTimeOut" -Value "300"
Write-Host "  Registered in Windows registry" -ForegroundColor Green

# Step 5: Verify
Write-Host "`n  Flux Screensaver v1.3.0 installed successfully!" -ForegroundColor Cyan
Write-Host "  Location: $installedScr"
Write-Host "  Timeout:  5 minutes (300 seconds)"
Write-Host ""
Write-Host "  To test:" -ForegroundColor White
Write-Host "    1. Open: Desktop > Personalize > Lock Screen > Screen saver settings"
Write-Host "    2. The screensaver should show as selected (path or 'FluxScreensaver')"
Write-Host "    3. Click 'Preview' to test full-screen"
Write-Host "    4. Click 'Settings...' to open the configuration panel"
Write-Host ""
Write-Host "  To uninstall later:" -ForegroundColor White
Write-Host "    Run: .\install.ps1 -Uninstall`n"
