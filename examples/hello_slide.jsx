/*
 * Runnable example for psd-jsx-builder — a title slide that needs NO external assets.
 * Try it with zero setup:
 *     ./scripts/build_psd.sh examples/hello_slide.jsx
 * The .psd lands on your Desktop as hello_slide.psd. Render it to a PNG with:
 *     python scripts/verify_psd.py ~/Desktop/hello_slide.psd --width 1280
 *
 * It only uses fillRect / boxStroke / addText (no placed images), so it builds anywhere
 * Photoshop is installed. Copy references/template.jsx for the full helper set (placed images,
 * CMYK/print, etc.).
 */
#target photoshop

var __origRuler = app.preferences.rulerUnits, __origType = app.preferences.typeUnits;
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits  = TypeUnits.PIXELS;

// ---- DOCUMENT PRESET (on-screen 16:9 slide) ----
var CANVAS_W = 1920, CANVAS_H = 1080;
var SCALE = 2, DPI = 72;
var COLOR_MODE = NewDocumentMode.RGB, BLEED = 0;

var BASE_W = CANVAS_W + 2 * BLEED, BASE_H = CANVAS_H + 2 * BLEED;
var SLIDE_W = BASE_W * SCALE, SLIDE_H = BASE_H * SCALE;
function s(v) { return v * SCALE; }

var DOC_NAME = "hello_slide";
var OUT_PSD  = Folder.desktop.fsName + "/" + DOC_NAME + ".psd";   // builds to your Desktop

// ---- colors + helpers ----
function hex(h) { var c = new SolidColor(); c.rgb.hexValue = h; return c; }
var BG = hex("0E0F13"), GOLD = hex("C9A96E"), WHITE = hex("F4F4F2"), DIM = hex("8A8A92");

function fillRect(layerName, x, y, w, h, color) {
  var d = app.activeDocument;
  d.selection.select([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
  var l = d.artLayers.add(); l.name = layerName;
  d.selection.fill(color); d.selection.deselect();
  return l;
}
function boxStroke(layerName, x, y, w, h, color, t) {
  t = t || s(2);
  fillRect(layerName + "·t", x, y, w, t, color);
  fillRect(layerName + "·b", x, y + h - t, w, t, color);
  fillRect(layerName + "·l", x, y, t, h, color);
  fillRect(layerName + "·r", x + w - t, y, t, h, color);
}
function addText(layerName, text, font, sizeHDpx, color, x, y, tracking) {
  var d = app.activeDocument, l = d.artLayers.add();
  l.kind = LayerKind.TEXT; l.name = layerName;
  var ti = l.textItem; ti.kind = TextType.POINTTEXT;
  try { ti.font = font; } catch (e) {}
  ti.size = UnitValue(sizeHDpx * SCALE * 72 / DPI, "pt");
  ti.color = color; ti.contents = text;
  ti.position = [UnitValue(x, "px"), UnitValue(y, "px")];
  if (tracking) { try { ti.tracking = tracking; } catch (e) {} }
  return l;
}

// ---- build ----
var SLIDE_DOC;
try {
  for (var i = app.documents.length - 1; i >= 0; i--) {
    try { if (app.documents[i].name.indexOf(DOC_NAME) >= 0) app.documents[i].close(SaveOptions.DONOTSAVECHANGES); } catch (e) {}
  }

  var doc = app.documents.add(UnitValue(SLIDE_W, "px"), UnitValue(SLIDE_H, "px"), DPI, DOC_NAME, COLOR_MODE, DocumentFill.WHITE);
  SLIDE_DOC = doc;
  doc.selection.selectAll(); doc.selection.fill(BG); doc.selection.deselect();
  doc.layers[0].name = "00 · Background";

  // content
  fillRect("10 · Accent", s(160), s(300), s(110), s(8), GOLD);
  addText("20 · Title", "HELLO, PSD", "Helvetica-Bold", 96, WHITE, s(158), s(450));
  addText("30 · Subtitle", "Built from code, not clicks.", "Helvetica", 30, DIM, s(162), s(560), 40);
  boxStroke("40 · Tag frame", s(162), s(640), s(420), s(96), GOLD, s(2));
  addText("50 · Tag", "psd-jsx-builder", "Helvetica", 26, GOLD, s(192), s(672), 120);
  addText("60 · Foot", "scripted Photoshop · reproducible · screen + print", "Helvetica", 20, DIM, s(160), s(980), 30);

  var outFile = new File(OUT_PSD);
  var so = new PhotoshopSaveOptions();
  so.embedColorProfile = true; so.alphaChannels = true; so.layers = true;
  doc.saveAs(outFile, so, true, Extension.LOWERCASE);

} finally {
  app.preferences.rulerUnits = __origRuler;
  app.preferences.typeUnits  = __origType;
}
