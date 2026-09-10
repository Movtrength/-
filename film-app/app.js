import { PRESETS, getPresetById } from "./presets.js";
import { applyPreset } from "./engine.js";

// wire DOM: populate presetSelect from PRESETS; defer processing to Task 3

const presetSelect = document.getElementById("presetSelect");

function populatePresetSelect() {
  if (!presetSelect) return;

  presetSelect.replaceChildren(
    ...PRESETS.map((preset) => {
      const option = document.createElement("option");
      option.value = preset.id;
      option.textContent = preset.name;
      return option;
    })
  );
}

populatePresetSelect();
