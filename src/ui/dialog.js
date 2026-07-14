/**
 * Opens the streaming backend selection dialog for the GM.
 */
export function openBackendSelectionDialog() {
  if (!game.user?.isGM) {
    ui.notifications.error("Only Gamemasters can select streaming backends.");
    return;
  }
  const currentBackend = game.settings.get("screen-share", "activeBackend") || "local";
  let optionsHtml = "";
  const providers = globalThis.ScreenShare?.PROVIDERS || {};
  for (const [key, provider] of Object.entries(providers)) {
    const selectedAttr = key === currentBackend ? "selected" : "";
    optionsHtml += `<option value="${key}" ${selectedAttr}>${provider.name}</option>`;
  }
  const content = `
    <form>
      <div class="form-group">
        <label>Streaming Backend</label>
        <div class="form-fields">
          <select name="backend">
            ${optionsHtml}
          </select>
        </div>
      </div>
    </form>
  `;

  if (foundry.applications?.api?.DialogV2) {
    new foundry.applications.api.DialogV2({
      window: { title: "Select Streaming Backend" },
      content: content,
      buttons: [
        {
          action: "save",
          icon: "fas fa-check",
          label: "Save Selection",
          default: true,
          callback: (event, button, dialog) => {
            const select = button.form?.querySelector('select[name="backend"]') || button.form?.elements?.backend;
            const selected = select?.value;
            if (selected) {
              game.settings.set("screen-share", "activeBackend", selected);
              const rawName = providers[selected]?.name || selected;
              const cleanName = rawName.replace(/\s*\(Testing\)/i, "");
              ui.notifications.info(`Active streaming backend updated to: ${cleanName}`);
            }
          }
        },
        {
          action: "cancel",
          icon: "fas fa-times",
          label: "Cancel"
        }
      ]
    }).render({ force: true });
  } else {
    new Dialog({
      title: "Select Streaming Backend",
      content: content,
      buttons: {
        save: {
          icon: '<i class="fas fa-check"></i>',
          label: "Save Selection",
          callback: (html) => {
            const select = (html instanceof HTMLElement) 
              ? html.querySelector('select[name="backend"]')
              : (html[0]?.querySelector('select[name="backend"]') || html.find('select[name="backend"]')[0]);
            const selected = select?.value;
            if (selected) {
              game.settings.set("screen-share", "activeBackend", selected);
              const rawName = providers[selected]?.name || selected;
              const cleanName = rawName.replace(/\s*\(Testing\)/i, "");
              ui.notifications.info(`Active streaming backend updated to: ${cleanName}`);
            }
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel"
        }
      },
      default: "save"
    }).render(true);
  }
}
