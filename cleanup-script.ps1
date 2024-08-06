# Cleanup script for TransactionProcessorTypescript project

# Remove the dist folder (compiled JavaScript files)
if (Test-Path dist) {
    Write-Host "Removing dist folder..."
    Remove-Item -Recurse -Force dist
}

# Remove the SQLite database file
if (Test-Path transactions.db) {
    Write-Host "Removing SQLite database file..."
    Remove-Item -Force transactions.db
}

# Remove any .js files in the root directory (in case compilation output is not in dist)
Get-ChildItem -Path . -Filter *.js | ForEach-Object {
    Write-Host "Removing $($_.Name)..."
    Remove-Item -Force $_
}

# Remove any .js.map files (source maps)
Get-ChildItem -Path . -Filter *.js.map | ForEach-Object {
    Write-Host "Removing $($_.Name)..."
    Remove-Item -Force $_
}

# Optionally, remove node_modules and package-lock.json if you want to start from a completely clean slate
# Uncomment these lines if you want to include this in your cleanup
# if (Test-Path node_modules) {
#     Write-Host "Removing node_modules folder..."
#     Remove-Item -Recurse -Force node_modules
# }
# if (Test-Path package-lock.json) {
#     Write-Host "Removing package-lock.json..."
#     Remove-Item -Force package-lock.json
# }

Write-Host "Cleanup complete. Your project folder has been reset."
