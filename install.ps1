# Flux Screensaver Installer
# Run as Administrator

param(
    [switch]$Uninstall
)

$installDir = "C:\ProgramData\FluxScreensaver"
$scrName = "FluxScreensaver.scr"
$regPath = "HKCU:\Control Panel\Desktop"

if ($Uninstall) {
    Write-Host "=== Uninstalling Flux Screensaver ===" -ForegroundColor Yellow
    
    # Remove from System32
    $sys32Scrs = Get-ChildItem "C:\WINDOWS\System32\Flux*Screensaver*.scr" -ErrorAction SilentlyContinue
    foreach ($scr in $sys32Scrs) {
        Remove-Item $scr.FullName -Force -ErrorAction SilentlyContinue
        Write-Host "  Removed: $($scr.Name) from System32" -ForegroundColor Red
    }
    
    # Remove install directory
    if (Test-Path $installDir) {
        Remove-Item $installDir -Recurse -Force
        Write-Host "  Removed: $installDir" -ForegroundColor Red
    }
    
    # Clear screensaver registry
    Set-ItemProperty -Path $regPath -Name "SCRNSAVE.EXE" -Value "" -ErrorAction SilentlyContinue
    Set-ItemProperty -Path $regPath -Name "ScreenSaveActive" -Value "0" -ErrorAction SilentlyContinue
    Write-Host "  Cleared screensaver registry entries" -ForegroundColor Red
    
    # Clean up old portable .scr from release folder
    $releaseScrs = Get-ChildItem "release\Flux_Screensaver_v*.scr" -ErrorAction SilentlyContinue
    foreach ($scr in $releaseScrs) {
        Remove-Item $scr.FullName -Force -ErrorAction SilentlyContinue
        Write-Host "  Removed: $($scr.FullName)" -ForegroundColor Red
    }
    
    Write-Host "`nFlux Screensaver fully uninstalled." -ForegroundColor Green
    return
}

Write-Host "=== Installing Flux Screensaver ===" -ForegroundColor Cyan

# Check unpacked build exists
$unpackedDir = "release\win-unpacked"
if (-not (Test-Path "$unpackedDir\Flux Screensaver.exe")) {
    Write-Host "ERROR: Build not found. Run 'npm run electron:build' first." -ForegroundColor Red
    exit 1
}

# Clean previous installs from System32
$sys32Scrs = Get-ChildItem "C:\WINDOWS\System32\Flux*Screensaver*.scr" -ErrorAction SilentlyContinue
foreach ($scr in $sys32Scrs) {
    Remove-Item $scr.FullName -Force -ErrorAction SilentlyContinue
    Write-Host "  Cleaned: $($scr.Name) from System32" -ForegroundColor Yellow
}

# Copy unpacked app to install directory
Write-Host "  Copying app to $installDir ..." -ForegroundColor White
if (Test-Path $installDir) {
    Remove-Item $installDir -Recurse -Force
}
Copy-Item $unpackedDir $installDir -Recurse

# Rename exe to .scr
$exePath = Join-Path $installDir "Flux Screensaver.exe"
$scrPath = Join-Path $installDir $scrName

if (Test-Path $scrPath) { Remove-Item $scrPath -Force }
Rename-Item $exePath $scrName

Write-Host "  Created: $scrPath" -ForegroundColor Green

# Copy the .scr to System32 so it shows in the dropdown
Copy-Item $scrPath "C:\WINDOWS\System32\$scrName" -Force
Write-Host "  Copied .scr to System32 (for dropdown visibility)" -ForegroundColor Green

# Register as active screensaver via registry
Set-ItemProperty -Path $regPath -Name "SCRNSAVE.EXE" -Value $scrPath
Set-ItemProperty -Path $regPath -Name "ScreenSaveActive" -Value "1"
Set-ItemProperty -Path $regPath -Name "ScreenSaveTimeOut" -Value "300"
Write-Host "  Registered in Windows registry" -ForegroundColor Green

Write-Host "`nFlux Screensaver installed successfully!" -ForegroundColor Cyan
Write-Host "  Location: $scrPath"
Write-Host "  Go to: Desktop > Personalize > Lock Screen > Screen saver settings"
Write-Host "  Select 'FluxScreensaver' from the dropdown"
