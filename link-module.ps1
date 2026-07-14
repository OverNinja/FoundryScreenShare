param(
    [switch]$Force
)

# Ensure we run in UTF-8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Find the .env file
$EnvFile = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $EnvFile)) {
    Write-Error "Error: .env file not found. Copy .env.example to .env and configure FOUNDRY_DATA_PATH."
    exit 1
}

# Parse .env for FOUNDRY_DATA_PATH
$FoundryDataPath = $null
Get-Content $EnvFile | ForEach-Object {
    if ($_ -match '^\s*FOUNDRY_DATA_PATH\s*=\s*(.*)$') {
        $FoundryDataPath = $Matches[1].Trim()
        # Remove surrounding quotes if any
        if ($FoundryDataPath.StartsWith('"') -and $FoundryDataPath.EndsWith('"')) {
            $FoundryDataPath = $FoundryDataPath.Substring(1, $FoundryDataPath.Length - 2)
        }
        elseif ($FoundryDataPath.StartsWith("'") -and $FoundryDataPath.EndsWith("'")) {
            $FoundryDataPath = $FoundryDataPath.Substring(1, $FoundryDataPath.Length - 2)
        }
    }
}

if (-not $FoundryDataPath) {
    Write-Error "Error: FOUNDRY_DATA_PATH not defined in .env."
    exit 1
}

# Verify Foundry Data Path exists
if (-not (Test-Path $FoundryDataPath)) {
    Write-Error "Error: The path specified in FOUNDRY_DATA_PATH does not exist: $FoundryDataPath"
    exit 1
}

# Check for the modules directory
$ModulesDir = Join-Path $FoundryDataPath "Data\modules"
if (-not (Test-Path $ModulesDir)) {
    # Try to create it if it doesn't exist but Data exists
    $DataDir = Join-Path $FoundryDataPath "Data"
    if (-not (Test-Path $DataDir)) {
        Write-Error "Error: FOUNDRY_DATA_PATH does not contain a 'Data' directory: $FoundryDataPath"
        exit 1
    }
    Write-Host "Creating modules directory: $ModulesDir"
    New-Item -ItemType Directory -Path $ModulesDir | Out-Null
}

$LinkTarget = Join-Path $ModulesDir "screen-share"

# Verify if target already exists
if (Test-Path $LinkTarget) {
    Write-Host "Found existing module folder or link at: $LinkTarget"
    $ShouldOverwrite = $Force
    if (-not $ShouldOverwrite) {
        $Overwrite = Read-Host "Do you want to delete the existing link/folder and recreate it? (y/N)"
        if ($Overwrite -eq "y" -or $Overwrite -eq "Y") {
            $ShouldOverwrite = $true
        }
    }
    if ($ShouldOverwrite) {
        Write-Host "Removing existing folder/link..."
        Remove-Item -Recurse -Force $LinkTarget
    } else {
        Write-Host "Operation cancelled."
        exit 0
    }
}

# Create directory junction
Write-Host "Creating directory junction..."
Write-Host "Path: $LinkTarget"
Write-Host "Value: $PSScriptRoot"

try {
    New-Item -ItemType Junction -Path $LinkTarget -Value $PSScriptRoot -ErrorAction Stop | Out-Null
    Write-Host "Success: Directory junction created successfully!"
} catch {
    Write-Error "Failed to create directory junction: $_"
    exit 1
}
