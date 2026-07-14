#!/usr/bin/env bash
# tag-version.sh
# Bash script to tag the Git repository based on the version specified in module.json

set -e

# Find the directory containing this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MANIFEST_PATH="$SCRIPT_DIR/module.json"

if [[ ! -f "$MANIFEST_PATH" ]]; then
    echo "Error: module.json not found." >&2
    exit 1
fi

# Extract version from module.json (works without jq using simple grep/sed/awk)
VERSION=$(grep -m 1 '"version"' "$MANIFEST_PATH" | sed -E 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')

if [[ -z "$VERSION" ]]; then
    echo "Error: Could not extract version from module.json." >&2
    exit 1
fi

echo "Current module version in module.json: $VERSION"

# Check if the tag already exists
if git rev-parse "$VERSION" >/dev/null 2>&1; then
    echo "Warning: Tag '$VERSION' already exists locally."
    read -p "Do you want to delete and recreate it locally? (y/N): " choice
    case "$choice" in
        y|Y|yes|YES)
            echo "Deleting local tag '$VERSION'..."
            git tag -d "$VERSION"
            ;;
        *)
            echo "Operation cancelled."
            exit 0
            ;;
    esac
fi

read -p "Create and push tag '$VERSION' to origin? (y/N): " confirm
case "$confirm" in
    y|Y|yes|YES)
        ;;
    *)
        echo "Operation cancelled."
        exit 0
        ;;
esac

# Create tag
echo "Creating tag '$VERSION'..."
git tag "$VERSION"

# Push tag
echo "Pushing tag '$VERSION' to origin..."
git push origin "$VERSION"

echo "Success: Tag '$VERSION' created and pushed!"
