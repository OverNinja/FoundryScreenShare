# Feature Specification: Module Setup and Initialization

**Feature Branch**: `001-module-setup`

**Created**: 2026-07-09

**Status**: Draft

**Input**: User description: "initial module creation. no functionality implemented at first. must create local git repo. must have scripts to install the module via simlink to a configurable foundry v14 path. must enable a scene control button only for testing."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Project Environment Setup (Priority: P1)

A developer wants to initialize the module repository and link it into their local Foundry VTT modules directory so they can begin development.

**Why this priority**: Highly critical foundational step. Without the repository and symlinking capability, no further development can be tested or organized.

**Independent Test**: Can be fully verified by initializing the repository, defining a local Foundry VTT path in a configuration file, running the symlink script, and checking that a valid symbolic link is created in the target directory.

**Acceptance Scenarios**:

1. **Given** a new module development directory, **When** initialized, **Then** a local Git repository is established and ignores environment files, IDE settings, and node modules.
2. **Given** a target Foundry VTT user data path, **When** the symlink script is executed, **Then** a symbolic link is successfully created under the target's `Data/modules/screen-share` directory.
3. **Given** a missing or invalid Foundry VTT path in the configuration, **When** the symlink script is executed, **Then** it fails gracefully with an informative error message.

---

### User Story 2 - Basic Scene Control Button (Priority: P2)

A GM wants to see a dedicated control button in the left toolbar under the Regions layer when using Foundry VTT, indicating the module is loaded.

**Why this priority**: Key initial validation that the module is correctly initialized, registered, and integrated into Foundry VTT v14 UI hooks.

**Independent Test**: Can be verified by activating the module in a Foundry VTT v14 scene, logging in as a GM, navigating to the Regions layer, and checking for the presence of the toggle button.

**Acceptance Scenarios**:

1. **Given** the module is enabled in Foundry VTT v14, **When** a GM views the canvas, **Then** a custom control button appears in the Scene Controls left toolbar under the Regions layer.
2. **Given** a non-GM player logs in, **When** they view the canvas, **Then** they cannot see the custom screen share control button.

---

### Edge Cases

- **Existing Symlink**: The symlink script is run when a directory or symlink with the same name already exists in the target modules folder. The script MUST handle this safely without destroying unrelated files (e.g. prompt or replace).
- **No Active Scene**: The module is loaded but no scene is active. The module hooks must load gracefully without errors.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support local version control via a Git repository.
- **FR-002**: System MUST define a configurable environment variable or configuration file to specify the path to the local Foundry VTT `Data` directory.
- **FR-003**: System MUST provide a setup script to create a symbolic link from the development directory to the Foundry VTT `Data/modules` directory.
- **FR-004**: System MUST define a Foundry VTT v14 compatible `module.json` manifest specifying the module identifier, title, compatibility limits, and main entry files.
- **FR-005**: System MUST hook into Foundry's standard controls registration process (`getSceneControlButtons`) to inject a testing control button under the Regions layer.
- **FR-006**: System MUST ensure the custom control button is only visible to GMs.

### Key Entities

- **Module Manifest**: Metadata definition for Foundry VTT.
- **Scene Control Button**: Injected UI control element.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can configure and symlink the module into their Foundry directory in under 15 seconds.
- **SC-002**: The module successfully loads in Foundry VTT v14 without throwing startup or execution console errors.
- **SC-003**: The Scene Control button appears on the GM's toolbar under the Regions layer within 1 second of canvas load.
- **SC-004**: Non-GM players have 0 visibility and access to the testing control button.

## Assumptions

- Developer is working in a local development environment with Node.js and Git installed.
- Developer has permissions to create symbolic links on the host operating system.
- The environment configuration will use standard dotenv (`.env`) or a simple configuration file.
- The setup script can be run on Windows (PowerShell/CMD) or Unix-based shells.
