# Feature Specification: Container Configuration Tab

**Feature Branch**: `010-container-config-tab`

**Created**: 2026-07-13

**Status**: Draft

**Input**: User description: "all valid container types must have a new tab on there configuration. this tab must receive the current toggle to enable it as a screen share container. also, this tab must contain: fit mode of the video inside the container, frame rate and resolution. all of these must have by default the values configured on the module settings, but be changeable in a container base."

## Clarifications

### Session 2026-07-13
- Q: Should we expose a "Clip Video Overflow" toggle on the Screen Share tab for Tile and Drawing containers, or should it be hardcoded? → A: Hardcoded: Always clip to container bounds (no UI option).
- Q: Should we expose a separate "Video Opacity" slider in the "Screen Share" configuration tab to control the transparency of the video feed independently from the container itself? → A: No Alpha override: Always match the container document's native opacity.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dedicated Screen Share Configuration Tab (Priority: P1)

As a Gamemaster, I want a dedicated "Screen Share" tab in the configuration sheets of all valid container types (Regions, Tiles, and Drawings) so that all screen share options are logically grouped together instead of cluttering other configuration tabs like Appearance.

**Why this priority**: Core architectural change. Moving the existing toggle from the Appearance tab to a dedicated tab forms the foundation of the feature.

**Independent Test**: Open a Region (on v14), Tile, or Drawing configuration sheet. Verify a new tab navigation header labeled "Screen Share" (with a matching screen share icon, if applicable) exists. Click on it, and verify that the "Screen Share Container" checkbox has been relocated here.

**Acceptance Scenarios**:

1. **Given** a GM on an active scene, **When** they open a Region configuration sheet (on v14), **Then** they see a "Screen Share" tab in the sheet navigation headers.
2. **Given** a GM on an active scene, **When** they open a Tile or Drawing configuration sheet, **Then** they see a "Screen Share" tab in the sheet navigation headers.
3. **Given** the "Screen Share" tab is clicked, **When** the tab content is rendered, **Then** the "Screen Share Container" checkbox is visible in this tab, and it is no longer visible under the "Appearance" tab.

---

### User Story 2 - Container-Level Video Settings Overrides (Priority: P1)

As a Gamemaster, I want to configure custom video parameters (fit mode, frame rate, and resolution) on a per-container basis so that different containers can display video streams optimized for their specific layout and context.

**Why this priority**: Essential to fulfill the user requirement of changeable container-level settings that override the global defaults.

**Independent Test**: Mark a Tile as a screen container, change its video fit mode to "Cover", frame rate to "60 FPS", and resolution to "1080p". Save the tile config, start sharing, and verify that the stream is captured and rendered using these specific values rather than the global defaults.

**Acceptance Scenarios**:

1. **Given** a container's "Screen Share" configuration tab, **When** the GM opens it, **Then** drop-down menus for "Video Fit Mode", "Max Frame Rate", and "Max Resolution" are available.
2. **Given** a container configured with custom video parameters, **When** the GM starts screen sharing on this container, **Then** the media stream is requested using the container's custom frame rate and resolution, and rendered using its custom fit mode.

---

### User Story 3 - Global Default Fallbacks with Dynamic Labels (Priority: P2)

As a Gamemaster, I want the container-level settings to default to the global module settings and dynamically show what those default values are in the dropdown labels, so that I can easily understand the active configuration without navigating back to the module settings panel.

**Why this priority**: Improves usability and guarantees that the "default values configured on the module settings" requirement is met gracefully.

**Independent Test**: Open the global Module Settings and configure "Maximum Capture Resolution" to "720p". Open a Tile's "Screen Share" configuration tab. Verify the "Max Resolution" dropdown has "Default (720p)" selected. Change the global setting to "1080p", re-open the Tile configuration, and verify the label has updated to "Default (1080p)".

**Acceptance Scenarios**:

1. **Given** a container has no custom settings overridden, **When** the configuration sheet is opened, **Then** the default options for Fit Mode, Frame Rate, and Resolution are selected, with labels displaying the active global settings: e.g., "Default (Contain)", "Default (30 FPS)", "Default (720p)".
2. **Given** global module settings are updated, **When** a stream starts on a container configured with "Default", **Then** the stream immediately adopts the new global defaults.

---

### User Story 4 - Conditional Fields Gating (Priority: P2)

As a Gamemaster, I want the video settings fields (fit mode, frame rate, resolution) to be disabled when the container is not enabled as a screen share container, so that I am prevented from configuring settings that have no effect.

**Why this priority**: UX polish that prevents user confusion regarding which containers are active and which settings are applicable.

**Independent Test**: Open a Tile's "Screen Share" tab. If the "Screen Share Container" checkbox is unchecked, verify that the fit mode, frame rate, and resolution dropdowns are disabled. Check the checkbox, and verify that the dropdowns immediately become editable.

**Acceptance Scenarios**:

1. **Given** "Screen Share Container" is unchecked, **When** the tab renders or is toggled, **Then** the dropdowns for Fit Mode, Frame Rate, and Resolution are disabled (greyed out).
2. **Given** "Screen Share Container" is checked, **When** the tab renders or is toggled, **Then** the dropdowns are enabled and fully interactive.

---

### Edge Cases

- **Scene Container Conflict**: If another container is already marked in the scene, the "Screen Share Container" checkbox is disabled. In this state, all the override fields must also remain disabled, reflecting that this container cannot currently be active.
- **Document Deletion/Re-creation**: If a container with custom overrides is deleted and recreated, it must reset to the default settings (global fallbacks).
- **Invalid Custom Flag Values**: If the flags stored on a document contain invalid or obsolete values (e.g. from manual DB modification or an older module version), the container must gracefully fall back to the global module defaults.
- **Foundry v13 vs v14 Gating**: RegionConfig is v14 only. On v13, only TileConfig and DrawingConfig should receive the new "Screen Share" tab. The module must not throw errors attempting to register RegionConfig hooks on v13.
- **Cover Mode Overflow Clipping**: In Cover mode, the video overflows the container boundaries. The system must always mask/clip the video sprite to the container bounds (rectangular boundaries for Tiles and Drawings, and polygon boundaries for Regions) to prevent video rendering outside the designated container area.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-010-001**: The system MUST register a new global module setting for default video fit mode (`defaultFitMode`) with choices: "contain" (default), "cover", and "fill".
- **FR-010-002**: The system MUST inject a new navigation tab header labeled "Screen Share" into the configuration sheets of all valid container types:
  - `RegionConfig` (v14 only)
  - `TileConfig` (v13 & v14)
  - `DrawingConfig` (v13 & v14)
- **FR-010-003**: The system MUST inject the corresponding tab content section containing:
  - "Screen Share Container" toggle (checkbox)
  - "Video Fit Mode" selection dropdown (choices: Default, Contain, Cover, Fill)
  - "Maximum Frame Rate" selection dropdown (choices: Default, Auto, 15 FPS, 30 FPS, 60 FPS)
  - "Maximum Resolution" selection dropdown (choices: Default, Auto, 720p, 1080p)
- **FR-010-004**: The system MUST save the configuration parameters under the following namespaced document flags:
  - `flags.screen-share.isScreenContainer` (Boolean)
  - `flags.screen-share.fitMode` (String)
  - `flags.screen-share.maxFramerate` (Number)
  - `flags.screen-share.maxResolution` (String)
- **FR-010-005**: The system MUST disable the Fit Mode, Frame Rate, and Resolution dropdowns whenever the "Screen Share Container" checkbox is unchecked or disabled.
- **FR-010-006**: When rendering the dropdowns, the system MUST dynamically resolve the active global module settings and display them within the labels of the "Default" options (e.g., `"Default (Contain)"`, `"Default (30 FPS)"`, `"Default (720p)"`).
- **FR-010-007**: When starting a stream, the system MUST check the active container's flags:
  - If a setting is set to a specific override, it MUST use that override.
  - If a setting is set to `"default"` (or is undefined/null), it MUST fall back to the global module setting value.
- **FR-010-008**: The PIXI rendering pipeline (`ScreenShareSession.renderStream`) MUST respect the resolved "Video Fit Mode" constraint, adjusting the video sprite scale/bounds inside the container boundary accordingly:
  - **Contain**: Scale the video to fit within the container boundaries while preserving the stream's original aspect ratio (letterboxing/pillarboxing).
  - **Cover**: Scale the video to completely cover the container boundaries, preserving the stream's aspect ratio (cropping if aspect ratios do not match).
  - **Fill**: Scale/stretch the video to fill the container boundaries exactly, ignoring the stream's aspect ratio.
- **FR-010-009**: In Cover mode, the system MUST always clip the video sprite to the container bounds using a PIXI mask (rectangular graphics mask for Tiles and Drawings, and native Scene Region polygon masking for Regions), without exposing a UI option to disable clipping.
- **FR-010-010**: The video stream's rendering opacity MUST always match the container document's native opacity/alpha settings, without exposing a separate opacity/alpha slider or setting in the "Screen Share" configuration tab.

### Key Entities

- **Container Configuration Tab**: The custom UI view injected into RegionConfig, TileConfig, and DrawingConfig sheets containing the screen share toggle and settings.
- **Container-level Video Settings**: The group of document flags (`isScreenContainer`, `fitMode`, `maxFramerate`, `maxResolution`) stored on a container.
- **Global Module Settings**: The central settings registry (`maxResolution`, `maxFramerate`, and the new `defaultFitMode`) acting as the fallback values.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-010-001**: GMs can access the new "Screen Share" configuration tab on Regions (v14), Tiles, and Drawings.
- **SC-010-002**: Changes to container settings persist on sheet submit and successfully update document flags.
- **SC-010-003**: The rendering engine adopts the resolved fit mode within 200ms of the stream starting or when a configuration change is saved.
- **SC-010-004**: WebRTC/LiveKit stream capture constraints dynamically adjust to use the container-specific frame rate and resolution values when a container override is configured.
- **SC-010-005**: All UI dropdowns properly disable/enable in real-time based on the "Screen Share Container" checkbox state.

## Assumptions

- We assume that the video element's metadata is loaded (`video.videoWidth` and `video.videoHeight`) prior to applying aspect-ratio-based fit modes (Cover and Contain).
- We assume that drawing custom configuration tabs in Foundry VTT sheets uses jQuery/native DOM injection in `render[Document]Config` hooks, matching existing patterns.
- GMs configure the global settings beforehand or use the pre-configured defaults (30 FPS, Auto resolution, Contain fit mode).
