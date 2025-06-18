# PowerShell script to build the extension in a local temp directory and copy the output back
# Usage: Run this script from the project root in PowerShell

# Set paths
$SourceDir = "G:\My Drive\source\youtubetime"
$TempDir = "C:\temp\youtubetime-build"
$DistDir = "$TempDir\dist"
$TargetDistDir = "$SourceDir\dist"

# Clean up any previous temp build
if (Test-Path $TempDir) { Remove-Item -Recurse -Force $TempDir }

# Copy project to temp directory
Copy-Item -Recurse -Force $SourceDir $TempDir

# Change to temp directory
Set-Location $TempDir

# Clean and install dependencies
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install
npm install --save-dev rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs

# Build with Rollup
if (-Not (Test-Path "$TempDir\rollup.config.mjs") -and (Test-Path "$TempDir\rollup.config.js")) {
    Rename-Item "$TempDir\rollup.config.js" "rollup.config.mjs"
}
npx rollup -c

# Copy dist folder back to source
if (Test-Path $DistDir) {
    if (Test-Path $TargetDistDir) { Remove-Item -Recurse -Force $TargetDistDir }
    Copy-Item -Recurse -Force $DistDir $TargetDistDir
    Write-Host "Build complete. Output copied to $TargetDistDir"
} else {
    Write-Host "Build failed. No dist directory found."
}

# Clean up temp directory
Set-Location $SourceDir
Remove-Item -Recurse -Force $TempDir

Write-Host "Temporary build directory cleaned up." 