/*
 * Runnable example for psd-jsx-builder — a Japanese-whisky Instagram template (1080x1080).
 *
 * A reusable "background" layout: the center column is intentionally EMPTY so you can drop a
 * product bottle image on top. Built entirely from fillRect / addText + applyGaussianBlur (glow,
 * ground shadow) and applyAddNoise (film grain) — no external assets needed.
 *
 *     ./scripts/build_psd.sh examples/japanese_whisky.jsx     # writes to your Desktop
 *     python scripts/export_psd.py ~/Desktop/japanese_whisky.psd --format png --width 1080
 *
 * Layers prefixed "GUIDE" mark where to drop the bottle (hide/delete before publishing).
 * Layers prefixed "edit" are the product-name / meta lines — change the text per product to
 * reuse this as a series.
 *
 * Fonts (PostScript names, ship with macOS): Didot, Hiragino Mincho ProN, Toppan Bunkyu Midashi
 * Mincho, Avenir. A wrong/missing font falls back silently (jsx_helpers.md #8) — swap below if
 * yours differ.
 */
#target photoshop

var __origRuler = app.preferences.rulerUnits, __origType = app.preferences.typeUnits;
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits  = TypeUnits.PIXELS;

// ===== DOCUMENT PRESET =====
var CANVAS_W = 1080, CANVAS_H = 1080;   // Instagram square
var SCALE    = 2;                        // build at 2x for crisp type -> 2160x2160
var DPI      = 72;                        // screen/social
var COLOR_MODE = NewDocumentMode.RGB;
var BLEED = 0, SAFE = 0;

var BASE_W = CANVAS_W, BASE_H = CANVAS_H;
var SLIDE_W = BASE_W * SCALE, SLIDE_H = BASE_H * SCALE;
function s(v) { return v * SCALE; }

// ----- palette -----
var BG_HEX    = "0C0A08";  // warm near-black
var GOLD_HEX  = "C9A96E";  // brushed gold
var GOLDD_HEX = "9C7E4E";  // dim gold (frame / guides)
var CREAM_HEX = "ECE3D2";  // warm white
var MUTED_HEX = "A89D8E";  // muted meta text (lifted for phone-feed legibility)
var AMBER_HEX = "8A5320";  // warm glow

var DOC_NAME = "japanese_whisky";
var OUT_PSD  = Folder.desktop.fsName + "/" + DOC_NAME + ".psd";   // builds to your Desktop
var OUT_PNG  = Folder.desktop.fsName + "/" + DOC_NAME + "_preview.png";

// ----- helpers -----
function hex(h) { var c = new SolidColor(); c.rgb.hexValue = h; return c; }
var BG = hex(BG_HEX), GOLD = hex(GOLD_HEX), GOLDD = hex(GOLDD_HEX),
    CREAM = hex(CREAM_HEX), MUTED = hex(MUTED_HEX), AMBER = hex(AMBER_HEX);

function fillRect(layerName, x, y, w, h, color) {
  var d = app.activeDocument;
  d.selection.select([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
  var l = d.artLayers.add(); l.name = layerName;
  d.selection.fill(color); d.selection.deselect();
  return l;
}

function addText(layerName, text, font, sizeBase, color, x, y, tracking) {
  var d = app.activeDocument, l = d.artLayers.add();
  l.kind = LayerKind.TEXT; l.name = layerName;
  var ti = l.textItem; ti.kind = TextType.POINTTEXT;
  try { ti.font = font; } catch (e) {}
  ti.size = UnitValue(sizeBase * SCALE * 72 / DPI, "pt");
  ti.color = color; ti.contents = text;
  ti.position = [UnitValue(x, "px"), UnitValue(y, "px")];
  if (tracking) { try { ti.tracking = tracking; } catch (e) {} }
  return l;
}

// center horizontally on the canvas; y is baseline in doc px
function addCentered(layerName, text, font, sizeBase, color, yDoc, tracking) {
  var l = addText(layerName, text, font, sizeBase, color, 0, yDoc, tracking);
  var b = l.bounds, w = b[2].value - b[0].value, cur = b[0].value;
  l.translate((SLIDE_W - w) / 2 - cur, 0);
  return l;
}

function softGlow(layerName, cxDoc, cyDoc, wDoc, hDoc, color, blurDoc, op) {
  var l = fillRect(layerName, cxDoc - wDoc / 2, cyDoc - hDoc / 2, wDoc, hDoc, color);
  try { l.applyGaussianBlur(blurDoc); } catch (e) {}
  l.opacity = op;
  return l;
}

function diamond(layerName, cxDoc, cyDoc, sizeDoc, color) {
  var l = fillRect(layerName, cxDoc - sizeDoc / 2, cyDoc - sizeDoc / 2, sizeDoc, sizeDoc, color);
  try { l.rotate(45, AnchorPosition.MIDDLECENTER); } catch (e) {}
  return l;
}

// corner bracket: (cx,cy) is the corner point; hx/hy (+1/-1) = arm direction
function cornerBracket(nm, cx, cy, len, t, color, hx, hy) {
  var hxX = hx > 0 ? cx : cx - len;
  var hY  = hy > 0 ? cy : cy - t;
  fillRect(nm + " h", hxX, hY, len, t, color);
  var vX  = hx > 0 ? cx : cx - t;
  var vyY = hy > 0 ? cy : cy - len;
  fillRect(nm + " v", vX, vyY, t, len, color);
}

// machined corner ornament: outer L + inset inner L + diamond stud.
// (cx,cy) = corner point; sx/sy (+1/-1) point toward the interior.
function frameCorner(nm, cx, cy, sx, sy) {
  var LEN = s(82), LEN2 = s(52), T = s(2), T2 = s(1.5), GAP = s(9);
  fillRect(nm + " oh", sx > 0 ? cx : cx - LEN, sy > 0 ? cy : cy - T, LEN, T, GOLD);
  fillRect(nm + " ov", sx > 0 ? cx : cx - T, sy > 0 ? cy : cy - LEN, T, LEN, GOLD);
  var ix = cx + sx * GAP, iy = cy + sy * GAP;
  fillRect(nm + " ih", sx > 0 ? ix : ix - LEN2, sy > 0 ? iy : iy - T2, LEN2, T2, GOLDD);
  fillRect(nm + " iv", sx > 0 ? ix : ix - T2, sy > 0 ? iy : iy - LEN2, T2, LEN2, GOLDD);
  diamond(nm + " stud", cx, cy, s(9), GOLD);
}

// fine monochrome film grain over the whole canvas (Editorial Luxury texture)
function addGrain(layerName, op) {
  var d = app.activeDocument;
  var l = d.artLayers.add(); l.name = layerName;
  var g = new SolidColor(); g.rgb.hexValue = "808080";
  d.selection.selectAll(); d.selection.fill(g); d.selection.deselect();
  try { l.applyAddNoise(14, NoiseDistribution.GAUSSIAN, true); } catch (e) {}
  l.blendMode = BlendMode.SOFTLIGHT;
  l.opacity = op;
  return l;
}

var SLIDE_DOC;
try {
  for (var i = app.documents.length - 1; i >= 0; i--) {
    try { if (app.documents[i].name.indexOf(DOC_NAME) >= 0) app.documents[i].close(SaveOptions.DONOTSAVECHANGES); } catch (e) {}
  }

  var doc = app.documents.add(UnitValue(SLIDE_W, "px"), UnitValue(SLIDE_H, "px"), DPI, DOC_NAME, COLOR_MODE, DocumentFill.WHITE);
  SLIDE_DOC = doc;
  doc.selection.selectAll(); doc.selection.fill(BG); doc.selection.deselect();
  doc.layers[0].name = "00 · Background";

  var CX = SLIDE_W / 2;

  // --- ambient warm glow behind the product zone (makes a bottle pop) ---
  softGlow("01 · Glow", CX, s(595), s(470), s(560), AMBER, s(200), 34);

  // --- soft ground shadow where the bottle base sits ---
  softGlow("02 · Floor shadow", CX, s(815), s(520), s(70), hex("000000"), s(34), 60);
  // thin reflective floor line
  var floor = fillRect("03 · Floor line", CX - s(230), s(806), s(460), s(2), GOLD);
  floor.opacity = 55;

  // --- refined frame: barely-there hairline + machined corner ornaments ---
  (function () {
    var x = s(54), y = s(54), w = s(972), h = s(972), t = s(1);
    var ft = fillRect("05 · Frame top",    x, y, w, t, GOLDD);
    var fb = fillRect("05 · Frame bottom", x, y + h - t, w, t, GOLDD);
    var fl = fillRect("05 · Frame left",   x, y, t, h, GOLDD);
    var fr = fillRect("05 · Frame right",  x + w - t, y, t, h, GOLDD);
    ft.opacity = 32; fb.opacity = 32; fl.opacity = 32; fr.opacity = 32;
  })();
  frameCorner("06 · Corner TL", s(54),   s(54),   +1, +1);
  frameCorner("06 · Corner TR", s(1026), s(54),   -1, +1);
  frameCorner("06 · Corner BL", s(54),   s(1026), +1, -1);
  frameCorner("06 · Corner BR", s(1026), s(1026), -1, -1);

  // --- top masthead ---
  addCentered("10 · Eyebrow", "THE SPIRIT OF JAPAN", "Avenir-Medium", 14, GOLD, s(132), 380);
  // short rule under eyebrow
  fillRect("11 · Eyebrow rule", CX - s(34), s(150), s(68), s(1.5), GOLD);
  // hero title
  addCentered("12 · Title", "JAPANESE WHISKY", "Didot-Bold", 68, CREAM, s(238), 20);
  // japanese subtitle
  addCentered("13 · Title JP", "日 本 の ウ イ ス キ ー", "HiraMinProN-W6", 22, GOLD, s(288), 60);
  // flanking diamonds for the JP subtitle
  diamond("14 · Diamond L", CX - s(250), s(281), s(8), GOLD);
  diamond("14 · Diamond R", CX + s(250), s(281), s(8), GOLD);

  // --- series index, top-right inside frame ---
  addText("15 · Index", "No. 01", "Didot-Italic", 20, GOLD, s(880), s(132), 0);

  // --- bottom plate (editable product info) ---
  diamond("20 · Name diamond", CX, s(852), s(7), GOLD);
  addCentered("21 · edit Product name (JP)", "山崎 12年", "ToppanBunkyuMidashiMinchoStdN-ExtraBold", 46, CREAM, s(908), 20);
  addCentered("22 · edit Product name (EN)", "YAMAZAKI · SINGLE MALT", "Avenir-Medium", 14, GOLD, s(948), 320);
  addCentered("23 · edit Meta", "SUNTORY   ·   43% ABV   ·   JAPAN", "Avenir-Medium", 13, MUTED, s(988), 240);

  // ============================================================
  //  GUIDE LAYERS — hide or delete these before you publish.
  //  They mark where to drop the bottle image. (Prefix "GUIDE")
  // ============================================================
  (function () {
    var L = s(360), R = s(720), T = s(330), B = s(792); // drop-zone rectangle
    var len = s(48), t = s(2);
    cornerBracket("GUIDE TL", L, T, len, t, GOLDD, +1, +1);
    cornerBracket("GUIDE TR", R, T, len, t, GOLDD, -1, +1);
    cornerBracket("GUIDE BL", L, B, len, t, GOLDD, +1, -1);
    cornerBracket("GUIDE BR", R, B, len, t, GOLDD, -1, -1);
    var hint = addCentered("GUIDE hint", "PLACE PRODUCT\rIMAGE HERE", "Avenir-Medium", 15, GOLDD, s(548), 120);
    hint.opacity = 70;
  })();

  // --- film grain on top (Editorial Luxury texture) ---
  addGrain("98 · Film grain", 55);

  // ----- save layered PSD -----
  var outFile = new File(OUT_PSD);
  if (!outFile.parent.exists) outFile.parent.create();
  var so = new PhotoshopSaveOptions();
  so.embedColorProfile = true; so.alphaChannels = true; so.layers = true;
  doc.saveAs(outFile, so, true, Extension.LOWERCASE);

  // ----- save a flattened PNG preview (does not alter the layered doc) -----
  var pngFile = new File(OUT_PNG);
  var po = new PNGSaveOptions();
  doc.saveAs(pngFile, po, true, Extension.LOWERCASE);

} finally {
  app.preferences.rulerUnits = __origRuler;
  app.preferences.typeUnits  = __origType;
}
