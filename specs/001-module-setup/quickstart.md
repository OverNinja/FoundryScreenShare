# Quickstart & Validation Guide: Module Setup and Initialization

This guide describes how to verify that the environment setup, repository configuration, symlink installation, and Foundry VTT v14 basic UI elements are working correctly.

## Prerequisites
- Node.js (v18+)
- Git installed locally
- Foundry VTT v14 installed and running locally

## Step 1: Environment Setup
1. Create a `.env` file in the root of the project with your local Foundry VTT user data path:
   ```env
   FOUNDRY_DATA_PATH=C:\Users\<YourUsername>\AppData\Local\FoundryVTT
   ```
   *(Adjust the path based on your operating system and configuration. The directory must contain a `Data` folder).*

## Step 2: Running the Symlink Script
Execute the script corresponding to your operating system to link the module to Foundry VTT.

### Windows (PowerShell)
1. Open PowerShell.
2. Run the script:
   ```powershell
   .\link-module.ps1
   ```

### macOS / Linux (Bash)
1. Open your terminal.
2. Grant execution permissions:
   ```bash
   chmod +x link-module.sh
   ```
3. Run the script:
   ```bash
   ./link-module.sh
   ```

### Expected Outcome
Verify that a symbolic link or directory junction named `screen-share` exists at:
- Windows: `<FOUNDRY_DATA_PATH>\Data\modules\screen-share`
- macOS/Linux: `<FOUNDRY_DATA_PATH>/Data/modules/screen-share`
And that it points to your development repository root.

---

## Step 3: Module Verification in Foundry VTT
1. Start Foundry VTT v14.
2. Launch a World.
3. Open **Manage Modules** in the Game Settings sidebar.
4. Verify that "Screen Share" is listed as an available module.
5. Check the box to enable it, and click **Save Module Settings**.
6. Verify the world reloads without errors in the browser developer console (F12).

---

## Step 4: UI Control Verification (GM vs Player)

### GM View
1. Log into the world as a **Gamemaster (GM)** user.
2. Go to the canvas screen.
3. Click on the **Regions** layer (the polygon icon in the left toolbar).
4. Verify that a button with a computer icon (`fas fa-desktop`) is present in the toolset.
5. Click/toggle the button and check that a notification popup appears: `"Screen Share Toggled: [true/false]"`.

### Player View
1. Log into the world as a non-GM **Player** user.
2. Verify that the **Regions** layer icon is either disabled/hidden, or if visible, that the custom screen share control button is **not** present in the toolbar.
