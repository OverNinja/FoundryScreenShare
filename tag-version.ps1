# tag-version.ps1
# Script to tag the Git repository based on the version specified in module.json

# Parse module.json
$ManifestPath = Join-Path $PSScriptRoot "module.json"
if (-not (Test-Path $ManifestPath)) {
    Write-Error "Error: module.json not found."
    exit 1
}

$Manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
$Version = $Manifest.version

if (-not $Version) {
    Write-Error "Error: version not found in module.json."
    exit 1
}

Write-Host "Current module version in module.json: $Version"

# Check if the tag already exists
$ExistingTag = git tag -l $Version
if ($ExistingTag) {
    Write-Warning "Tag '$Version' already exists locally."
    $Choice = Read-Host "Do you want to delete and recreate it locally? (y/N)"
    if ($Choice -eq 'y' -or $Choice -eq 'Y') {
        Write-Host "Deleting local tag '$Version'..."
        git tag -d $Version
    } else {
        Write-Host "Operation cancelled."
        exit 0
    }
}

# Prompt user for confirmation before pushing
$Confirm = Read-Host "Create and push tag '$Version' to origin? (y/N)"
if ($Confirm -ne 'y' -and $Confirm -ne 'Y') {
    Write-Host "Operation cancelled."
    exit 0
}

# Create tag
Write-Host "Creating tag '$Version'..."
git tag $Version

# Push tag
Write-Host "Pushing tag '$Version' to origin..."
git push origin $Version

Write-Host "Success: Tag '$Version' created and pushed!"
