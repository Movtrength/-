function fitSize(w, h, maxEdge) {
  const edge = Math.max(w, h);
  if (edge <= maxEdge) return { w, h };
  const s = maxEdge / edge;
  return { w: Math.round(w * s), h: Math.round(h * s) };
}

function clamp(v, lo = 0, hi = 255) {
  return v < lo ? lo : v > hi ? hi : v;
}

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function luma01(r, g, b) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function toRgb(r, g, b) {
  return [clamp(r), clamp(g), clamp(b)];
}

function dramaticFilter(r, g, b, amount) {
  const t = amount / 100;
  if (t === 0) return [r, g, b];

  const lr = r / 255;
  const lg = g / 255;
  const lb = b / 255;
  const contrast = 1 + t * 0.55;
  const desat = t * 0.4;

  const cr = clamp01((lr - 0.5) * contrast + 0.5);
  const cg = clamp01((lg - 0.5) * contrast + 0.5);
  const cb = clamp01((lb - 0.5) * contrast + 0.5);
  const gray = 0.2126 * cr + 0.7152 * cg + 0.0722 * cb;

  return toRgb(
    (cr + desat * (gray - cr)) * 255,
    (cg + desat * (gray - cg)) * 255,
    (cb + desat * (gray - cb)) * 255
  );
}

function applyBrilliance(r, g, b, value) {
  const t = value / 100;
  if (t === 0) return [r, g, b];

  const lr = r / 255;
  const lg = g / 255;
  const lb = b / 255;
  const l = 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
  const w = 4 * l * (1 - l);
  const gain = 1 + t * 0.22 * w;
  const lift = t * 0.1 * w;

  return toRgb((lr * gain + lift) * 255, (lg * gain + lift) * 255, (lb * gain + lift) * 255);
}

function applyHighlights(r, g, b, value) {
  const t = value / 100;
  if (t === 0) return [r, g, b];

  const l = luma01(r, g, b);
  const w = smoothstep(0.45, 0.95, l);
  const adj = t * 0.22 * w * 255;

  return toRgb(r + adj, g + adj, b + adj);
}

function applyShadows(r, g, b, value) {
  const t = value / 100;
  if (t === 0) return [r, g, b];

  const l = luma01(r, g, b);
  const w = 1 - smoothstep(0.15, 0.55, l);
  const lift = t * 0.28 * w * 255;

  return toRgb(r + lift, g + lift, b + lift);
}

function applyContrast(r, g, b, value) {
  const t = value / 100;
  if (t === 0) return [r, g, b];

  const factor = 1 + t * 0.75;
  return toRgb((r / 255 - 0.5) * factor * 255 + 128, (g / 255 - 0.5) * factor * 255 + 128, (b / 255 - 0.5) * factor * 255 + 128);
}

function applyBrightness(r, g, b, value) {
  const t = value / 100;
  if (t === 0) return [r, g, b];

  const shift = t * 30;
  return toRgb(r + shift, g + shift, b + shift);
}

function applyBlackPoint(r, g, b, value) {
  const t = value / 100;
  if (t === 0) return [r, g, b];

  const l = luma01(r, g, b);
  const w = Math.pow(1 - l, 1.5);
  const lift = -t * 28 * w;

  return toRgb(r + lift, g + lift, b + lift);
}

function applyWarmth(r, g, b, value) {
  const t = value / 100;
  if (t === 0) return [r, g, b];

  const rGain = 1 + t * 0.22;
  const bGain = 1 - t * 0.18;
  return toRgb(r * rGain, g, b * bGain);
}

function boxBlurChannel(src, dst, w, h, radius) {
  const size = radius * 2 + 1;
  const window = new Float32Array(w);

  for (let y = 0; y < h; y++) {
    let sum = 0;
    for (let x = -radius; x <= radius; x++) {
      sum += src[y * w + clamp(x, 0, w - 1)];
    }
    window[0] = sum / size;
    for (let x = 1; x < w; x++) {
      const add = src[y * w + clamp(x + radius, 0, w - 1)];
      const sub = src[y * w + clamp(x - radius - 1, 0, w - 1)];
      sum += add - sub;
      window[x] = sum / size;
    }
    for (let x = 0; x < w; x++) {
      dst[y * w + x] = window[x];
    }
  }

  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = -radius; y <= radius; y++) {
      sum += dst[clamp(y, 0, h - 1) * w + x];
    }
    window[0] = sum / size;
    for (let y = 1; y < h; y++) {
      const add = dst[clamp(y + radius, 0, h - 1) * w + x];
      const sub = dst[clamp(y - radius - 1, 0, h - 1) * w + x];
      sum += add - sub;
      window[y] = sum / size;
    }
    for (let y = 0; y < h; y++) {
      dst[y * w + x] = window[y];
    }
  }
}

function blurRgb(data, w, h, radius) {
  const len = w * h;
  const out = new Float32Array(len * 3);
  const ch = [new Float32Array(len), new Float32Array(len), new Float32Array(len)];
  const blurred = [new Float32Array(len), new Float32Array(len), new Float32Array(len)];

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    ch[0][p] = data[i];
    ch[1][p] = data[i + 1];
    ch[2][p] = data[i + 2];
  }

  for (let c = 0; c < 3; c++) {
    boxBlurChannel(ch[c], blurred[c], w, h, radius);
  }

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    out[i] = blurred[0][p];
    out[i + 1] = blurred[1][p];
    out[i + 2] = blurred[2][p];
  }

  return out;
}

function applyDefinition(data, w, h, value) {
  const t = value / 100;
  if (t === 0) return;

  const blurred = blurRgb(data, w, h, 1);
  const amount = t * 1.2;

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const orig = data[i + c];
      data[i + c] = clamp(orig + amount * (orig - blurred[i + c]));
    }
  }
}

function applyNoiseReduction(data, w, h, value) {
  const t = value / 100;
  if (t === 0) return;

  const blurred = blurRgb(data, w, h, 2);
  const mix = t * 0.65;

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      data[i + c] = clamp(data[i + c] * (1 - mix) + blurred[i + c] * mix);
    }
  }
}

function sourceSize(source) {
  if (source.width != null && source.height != null) {
    return { w: source.width, h: source.height };
  }
  return { w: source.naturalWidth, h: source.naturalHeight };
}

export async function applyPreset(sourceBitmap, preset, maxEdge = 2048) {
  const { w: srcW, h: srcH } = sourceSize(sourceBitmap);
  const { w, h } = fitSize(srcW, srcH, maxEdge);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(sourceBitmap, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const adj = preset.adjustments;
  const filterAmount = preset.filter?.type === "dramatic" ? preset.filter.amount : 0;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    [r, g, b] = dramaticFilter(r, g, b, filterAmount);
    [r, g, b] = applyBrilliance(r, g, b, adj.brilliance);
    [r, g, b] = applyHighlights(r, g, b, adj.highlights);
    [r, g, b] = applyShadows(r, g, b, adj.shadows);
    [r, g, b] = applyContrast(r, g, b, adj.contrast);
    [r, g, b] = applyBrightness(r, g, b, adj.brightness);
    [r, g, b] = applyBlackPoint(r, g, b, adj.blackPoint);
    [r, g, b] = applyWarmth(r, g, b, adj.warmth);

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  applyDefinition(data, w, h, adj.definition);
  applyNoiseReduction(data, w, h, adj.noiseReduction);

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
  });
}
