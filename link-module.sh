#!/usr/bin/env bash
# link-module.sh
# Bash script to create a symbolic link from the development folder to the Foundry VTT modules directory on macOS / Linux.

set -e

# Find the directory containing this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Find the .env file
ENV_FILE="$SCRIPT_DIR/.env"
if [[ ! -f "$ENV_FILE" ]]; then
    echo "Error: .env file not found. Copy .env.example to .env and configure FOUNDRY_DATA_PATH." >&2
    exit 1
fi

# Parse .env for FOUNDRY_DATA_PATH
FOUNDRY_DATA_PATH=""
# Read lines from .env, ignoring comments and whitespace
while IFS= read -r line || [[ -n "$line" ]]; do
    # Remove leading/trailing space, skip comments
    line=$(echo "$line" | xargs)
    if [[ -z "$line" || "$line" == "#"* ]]; then
        continue
    fi
    if [[ "$line" =~ ^FOUNDRY_DATA_PATH=(.*)$ ]]; then
        FOUNDRY_DATA_PATH="${BASH_REMATCH[1]}"
        # Remove surrounding quotes if any
        FOUNDRY_DATA_PATH="${FOUNDRY_DATA_PATH#\"}"
        FOUNDRY_DATA_PATH="${FOUNDRY_DATA_PATH%\"}"
        FOUNDRY_DATA_PATH="${FOUNDRY_DATA_PATH#\'}"
        FOUNDRY_DATA_PATH="${FOUNDRY_DATA_PATH%\'}"
        break
    fi
done < "$ENV_FILE"

if [[ -z "$FOUNDRY_DATA_PATH" ]]; then
    echo "Error: FOUNDRY_DATA_PATH not defined in .env." >&2
    exit 1
fi

# Expand tilde (~) if present in the path
if [[ "$FOUNDRY_DATA_PATH" == "~"* ]]; then
    FOUNDRY_DATA_PATH="${FOUNDRY_DATA_PATH/#\~/$HOME}"
fi

# Verify Foundry Data Path exists
if [[ ! -d "$FOUNDRY_DATA_PATH" ]]; then
    echo "Error: The path specified in FOUNDRY_DATA_PATH does not exist: $FOUNDRY_DATA_PATH" >&2
    exit 1
fi

# Check for the modules directory
MODULES_DIR="$FOUNDRY_DATA_PATH/Data/modules"
if [[ ! -d "$MODULES_DIR" ]]; then
    DATA_DIR="$FOUNDRY_DATA_PATH/Data"
    if [[ ! -d "$DATA_DIR" ]]; then
        echo "Error: FOUNDRY_DATA_PATH does not contain a 'Data' directory: $FOUNDRY_DATA_PATH" >&2
        exit 1
    fi
    echo "Creating modules directory: $MODULES_DIR"
    mkdir -p "$MODULES_DIR"
fi

LINK_TARGET="$MODULES_DIR/screen-share"

# Verify if target already exists
if [[ -e "$LINK_TARGET" || -L "$LINK_TARGET" ]]; then
    echo "Found existing module folder or link at: $LINK_TARGET"
    FORCE_OVERWRITE=false
    for arg in "$@"; do
        if [[ "$arg" == "--force" || "$arg" == "-f" ]]; then
            FORCE_OVERWRITE=true
        fi
    done
    
    if ! $FORCE_OVERWRITE; then
        read -p "Do you want to delete the existing link/folder and recreate it? (y/N): " choice
        case "$choice" in
            y|Y|yes|YES) FORCE_OVERWRITE=true ;;
            *) FORCE_OVERWRITE=false ;;
        esac
    fi
    
    if $FORCE_OVERWRITE; then
        echo "Removing existing folder/link..."
        rm -rf "$LINK_TARGET"
    fi
fi

# Create symbolic link
echo "Creating symbolic link..."
echo "Path: $LINK_TARGET"
echo "Value: $SCRIPT_DIR"

if ln -s "$SCRIPT_DIR" "$LINK_TARGET"; then
    echo "Success: Symbolic link created successfully!"
else
    echo "Error: Failed to create symbolic link." >&2
    exit 1
fi
