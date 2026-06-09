/*
 * Blank artboard template for psd-jsx-builder.
 * Set the DOCUMENT PRESET block below (size, scale, dpi, color mode, bleed, safe) from
 * references/project_setup.md, then rename DOC_NAME / OUT_PSD and add your content.
 * Build with:  scripts/build_psd.sh /abs/path/to/this.jsx
 * Print: use a CMYK preset, cmyk() colors and addGuides(); export with export_print_pdf.sh.
 */
#target photoshop

// Preserve & set units (avoids dpi px<->pt conversion surprises).
var __origRuler = app.preferences.rulerUnits, __origType = app.preferences.typeUnits;
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits  = TypeUnits.PIXELS;

// ============ DOCUMENT PRESET — set these FIRST (see references/project_setup.md) ============
// These depend on WHAT this is and WHERE it'll be used. Don't guess: a screen slide, an
// Instagram post, and a printed A3 poster need different values. Defaults = on-screen 16:9 deck.
var CANVAS_W = 1920, CANVAS_H = 1080;        // author size in px (before SCALE). 16:9 deck default.
var SCALE      = 2;                          // 1 = exact · 2 = build at 2x (crisp text on screen/print)
var DPI        = 72;                         // 72 screen/social · 300 print (below 300 prints blurry)
var COLOR_MODE = NewDocumentMode.RGB;        // RGB screen/social · NewDocumentMode.CMYK for print
var BLEED      = 0;                          // px of bleed PER SIDE (print only; 3mm@300dpi ≈ 35)
var SAFE       = 0;                          // px safe margin inside the trim (print; keep text inside)
// ============================================================================================

// Derived — usually leave alone. BASE_* include bleed so backgrounds/full-bleed art cover the
// whole sheet; the TRIM corner is at s(BLEED), so keep key content inside [s(BLEED) .. s(BLEED+CANVAS)].
var BASE_W = CANVAS_W + 2 * BLEED, BASE_H = CANVAS_H + 2 * BLEED;   // author grid incl. bleed
var SLIDE_W = BASE_W * SCALE, SLIDE_H = BASE_H * SCALE;             // real document px
function s(v) { return v * SCALE; }          // author px -> document px

// UNITS (see jsx_helpers.md #9): fillRect/boxStroke/addText take DOCUMENT px — wrap base
// values in s() yourself. placeImage/placeContain take BASE units — they apply s() for you.

var BG_HEX = "0A0A0A", GOLD_HEX = "C9A96E", WHITE_HEX = "FFFFFF";

// Asset folder for placed images (absolute path; UTF-8 / non-ASCII ok).
var IMG_DIR = "/absolute/path/to/your/assets/";

// NOTE: 'name' and 'path' are RESERVED globals in ExtendScript — never use them as var names.
var DOC_NAME = "MY-SLIDE";
var OUT_PSD  = "/absolute/path/to/output/" + DOC_NAME + ".psd";

// ---- helpers ----
function hex(h) { var c = new SolidColor(); c.rgb.hexValue = h; return c; }
// Exact CMYK ink (0-100 each). Use in a CMYK document for print — unlike hex() (RGB), this is
// the value the printer actually gets. e.g. a rich black: cmyk(60,40,40,100).
function cmyk(c, m, y, k) { var col = new SolidColor(); col.cmyk.cyan = c; col.cmyk.magenta = m; col.cmyk.yellow = y; col.cmyk.black = k; return col; }
var BG = hex(BG_HEX), GOLD = hex(GOLD_HEX), WHITE = hex(WHITE_HEX);

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
  // 'font' must be the PostScript name ("Inter-Light", not "Inter Light"). A wrong name does
  // NOT throw here — it silently renders in the default font. Verify in the render. (footgun #8)
  try { ti.font = font; } catch (e) {}
  ti.size = UnitValue(sizeHDpx * SCALE * 72 / DPI, "pt");   // explicit px->pt
  ti.color = color; ti.contents = text;
  ti.position = [UnitValue(x, "px"), UnitValue(y, "px")];
  if (tracking) { try { ti.tracking = tracking; } catch (e) {} }
  return l;
}

// Place an image scaled to COVER a box (Math.max) — for photos. Crops to fill.
function placeImage(filename, layerName, xBase, yBase, boxWBase, boxHBase) {
  var f = new File(IMG_DIR + filename);
  if (!f.exists) return null;
  var idoc = app.open(f);
  idoc.activeLayer.duplicate(SLIDE_DOC, ElementPlacement.PLACEATBEGINNING);
  idoc.close(SaveOptions.DONOTSAVECHANGES);
  app.activeDocument = SLIDE_DOC;            // app.open changed active doc — restore it
  var l = SLIDE_DOC.activeLayer; l.name = layerName;
  var b = l.bounds, cw = b[2].value - b[0].value, ch = b[3].value - b[1].value;
  if (boxWBase && boxHBase) {
    var sc = Math.max(s(boxWBase) / cw, s(boxHBase) / ch) * 100;
    l.resize(sc, sc, AnchorPosition.TOPLEFT);
  }
  var nb = l.bounds; l.translate(s(xBase) - nb[0].value, s(yBase) - nb[1].value);
  return l;
}

// Place an image scaled to CONTAIN within a box (Math.min) — for transparent PNGs
// (diagrams, QR) so nothing spills outside the box.
function placeContain(filename, layerName, xBase, yBase, boxWBase, boxHBase) {
  var f = new File(IMG_DIR + filename);
  if (!f.exists) return null;
  var idoc = app.open(f);
  idoc.activeLayer.duplicate(SLIDE_DOC, ElementPlacement.PLACEATBEGINNING);
  idoc.close(SaveOptions.DONOTSAVECHANGES);
  app.activeDocument = SLIDE_DOC;
  var l = SLIDE_DOC.activeLayer; l.name = layerName;
  var b = l.bounds, cw = b[2].value - b[0].value, ch = b[3].value - b[1].value;
  var sc = Math.min(s(boxWBase) / cw, s(boxHBase) / ch) * 100;
  l.resize(sc, sc, AnchorPosition.TOPLEFT);
  var nb = l.bounds; l.translate(s(xBase) - nb[0].value, s(yBase) - nb[1].value);
  return l;
}

// Trim + safe-area GUIDES (guides never print). Call this in a print doc to SEE where the paper
// gets cut (trim) and how far to keep text from the edge (safe). No-op visuals if BLEED/SAFE = 0.
function addGuides() {
  var g = SLIDE_DOC.guides;
  function v(x) { g.add(Direction.VERTICAL, UnitValue(x, "px")); }
  function h(y) { g.add(Direction.HORIZONTAL, UnitValue(y, "px")); }
  v(s(BLEED)); v(s(BLEED + CANVAS_W)); h(s(BLEED)); h(s(BLEED + CANVAS_H));                 // trim (cut line)
  if (SAFE) { v(s(BLEED + SAFE)); v(s(BLEED + CANVAS_W - SAFE)); h(s(BLEED + SAFE)); h(s(BLEED + CANVAS_H - SAFE)); } // safe
}

// ---- build (wrapped in try/finally so ruler/type units always restore, even on a throw) ----
var SLIDE_DOC;   // global the place* helpers reference
try {

  // ---- close same-named tabs so re-running doesn't pile up duplicates ----
  for (var i = app.documents.length - 1; i >= 0; i--) {
    try { if (app.documents[i].name.indexOf(DOC_NAME) >= 0) app.documents[i].close(SaveOptions.DONOTSAVECHANGES); } catch (e) {}
  }

  // ---- new document + background ----
  var doc = app.documents.add(UnitValue(SLIDE_W, "px"), UnitValue(SLIDE_H, "px"), DPI, DOC_NAME, COLOR_MODE, DocumentFill.WHITE);
  SLIDE_DOC = doc;
  doc.selection.selectAll(); doc.selection.fill(BG); doc.selection.deselect();
  doc.layers[0].name = "00 · Background";

  // ====================================================================
  //  YOUR CONTENT HERE
  //  Order matters: things drawn later sit on top. Place backgrounds first.
  //  UNITS: rectangles & text wrap coords in s(...); placed images take raw
  //         base numbers (place* helpers apply s() for you). jsx_helpers.md #9.
  //  Example:
  //    placeImage("hero.png", "10 · Hero", 0, 0, BASE_W, BASE_H);              // base units, fullbleed
  //    addText("20 · Title", "Hello", "Inter-Light", 40, WHITE, s(85), s(120)); // doc px; font = PostScript name
  //    fillRect("30 · Bar", s(85), s(200), s(120), s(4), GOLD);                // doc px
  //  PRINT (CMYK doc): use cmyk(c,m,y,k) for exact ink, keep text inside the SAFE box, and
  //    call addGuides(); to drop trim+safe guides. Export with scripts/export_print_pdf.sh.
  // ====================================================================


  // ---- save ----
  var outFile = new File(OUT_PSD);
  if (!outFile.parent.exists) outFile.parent.create();
  var so = new PhotoshopSaveOptions();
  so.embedColorProfile = true; so.alphaChannels = true; so.layers = true;
  doc.saveAs(outFile, so, true, Extension.LOWERCASE);

} finally {
  app.preferences.rulerUnits = __origRuler;
  app.preferences.typeUnits  = __origType;
}
