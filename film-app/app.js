import { PRESETS, getPresetById } from "./presets.js";
import { applyPreset, canvasToBlob } from "./engine.js";

const uploadInput = document.getElementById("uploadInput");
const presetSelect = document.getElementById("presetSelect");
const compareEl = document.getElementById("compare");
const compareStage = compareEl?.querySelector(".compare__stage");
const compareBefore = document.getElementById("compareBefore");
const compareAfter = document.getElementById("compareAfter");
const compareSlider = document.getElementById("compareSlider");
const compareHandle = compareEl?.querySelector(".compare__handle");
const downloadBtn = document.getElementById("downloadBtn");
const replaceBtn = document.getElementById("replaceBtn");
const workspace = document.getElementById("workspace");
const appError = document.getElementById("appError");

let originalBitmap = null;
let processedCanvas = null;
let activePresetId = PRESETS[0]?.id ?? "";
let originalObjectUrl = null;
let processGeneration = 0;

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

  if (activePresetId) {
    presetSelect.value = activePresetId;
  }
}

function setControlsDisabled(disabled) {
  if (presetSelect) presetSelect.disabled = disabled;
  if (downloadBtn) downloadBtn.disabled = disabled;
  if (replaceBtn) replaceBtn.disabled = disabled;
  if (compareSlider) compareSlider.disabled = disabled;
  if (workspace) workspace.setAttribute("aria-busy", disabled ? "true" : "false");
}

function revokeObjectUrls() {
  if (originalObjectUrl) {
    URL.revokeObjectURL(originalObjectUrl);
    originalObjectUrl = null;
  }
}

function showError() {
  if (appError) appError.hidden = false;
}

function hideError() {
  if (appError) appError.hidden = true;
}

function updateComparePosition(percent) {
  const pct = Math.max(0, Math.min(100, percent));

  if (compareSlider) {
    compareSlider.value = String(pct);
  }

  if (compareAfter) {
    compareAfter.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
  }

  if (compareHandle) {
    compareHandle.style.left = `${pct}%`;
  }
}

function updateStageAspectRatio(width, height) {
  if (!compareStage || !width || !height) return;
  compareStage.style.aspectRatio = `${width} / ${height}`;
}

function clearCompareLayers() {
  if (compareAfter) {
    compareAfter.replaceChildren();
    compareAfter.style.clipPath = "";
  }

  if (compareStage) {
    compareStage.style.aspectRatio = "";
  }
}

function mountProcessedCanvas(canvas) {
  if (!compareAfter) return;

  canvas.className = "compare__image";
  compareAfter.replaceChildren(canvas);

  const badge = document.createElement("span");
  badge.className = "compare__badge compare__badge--after";
  badge.textContent = "보정";
  compareAfter.appendChild(badge);
}

async function processImage() {
  if (!originalBitmap) return false;

  const generation = ++processGeneration;

  setControlsDisabled(true);
  hideError();

  try {
    const preset = getPresetById(activePresetId);
    const canvas = await applyPreset(originalBitmap, preset);

    if (generation !== processGeneration) return false;

    processedCanvas = canvas;
    mountProcessedCanvas(processedCanvas);
    updateStageAspectRatio(processedCanvas.width, processedCanvas.height);
    return true;
  } catch (err) {
    if (generation !== processGeneration) return false;

    console.error(err);
    showError();
    return false;
  } finally {
    if (generation === processGeneration) {
      setControlsDisabled(false);
    }
  }
}

async function handleFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  processGeneration++;
  revokeObjectUrls();

  if (originalBitmap?.close) {
    originalBitmap.close();
  }

  originalBitmap = null;
  processedCanvas = null;
  clearCompareLayers();

  setControlsDisabled(true);
  hideError();

  try {
    originalObjectUrl = URL.createObjectURL(file);

    if (compareBefore) {
      compareBefore.src = originalObjectUrl;
    }

    originalBitmap = await createImageBitmap(file);
    activePresetId = presetSelect?.value || PRESETS[0].id;

    const processed = await processImage();
    if (!processed) {
      resetToUpload(false);
      showError();
      return;
    }

    if (workspace) {
      workspace.hidden = false;
      document.body.classList.add("has-workspace");
    }

    updateComparePosition(50);
    workspace?.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    console.error(err);
    resetToUpload(false);
    showError();
  } finally {
    setControlsDisabled(false);
  }
}

function resetToUpload(clearInput = true) {
  processGeneration++;
  revokeObjectUrls();

  if (originalBitmap?.close) {
    originalBitmap.close();
  }

  originalBitmap = null;
  processedCanvas = null;

  if (compareBefore) {
    compareBefore.removeAttribute("src");
  }

  clearCompareLayers();

  if (workspace) {
    workspace.hidden = true;
  }

  document.body.classList.remove("has-workspace");

  if (clearInput && uploadInput) {
    uploadInput.value = "";
  }

  hideError();
  updateComparePosition(50);
}

function handleReplace() {
  resetToUpload();
  uploadInput?.focus();
  document.querySelector(".hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function handleDownload() {
  if (!processedCanvas) return;

  try {
    const blob = await canvasToBlob(processedCanvas);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "film-sensibility.png";
    anchor.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    showError();
  }
}

function handlePresetChange() {
  activePresetId = presetSelect?.value ?? activePresetId;
  void processImage();
}

populatePresetSelect();

uploadInput?.addEventListener("change", (event) => {
  void handleFileChange(event);
});

presetSelect?.addEventListener("change", handlePresetChange);
downloadBtn?.addEventListener("click", () => {
  void handleDownload();
});
replaceBtn?.addEventListener("click", handleReplace);

compareSlider?.addEventListener("input", (event) => {
  updateComparePosition(Number(event.target.value));
});

updateComparePosition(50);
