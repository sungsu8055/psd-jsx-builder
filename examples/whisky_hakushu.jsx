/*
 * Japanese Whisky series — variation 03: HAKUSHU (白州 / the forest distillery).
 * Cool forest-green palette, a misty top haze, faint vertical "forest" lines in the margins,
 * and a faint 白州 watermark. Center zone stays EMPTY for a bottle.
 * Concept/mood only — no brand logo artwork is reproduced.
 */
#target photoshop

var __origRuler = app.preferences.rulerUnits, __origType = app.preferences.typeUnits;
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits  = TypeUnits.PIXELS;

// ===== DOCUMENT PRESET =====
var CANVAS_W = 1080, CANVAS_H = 1080, SCALE = 2, DPI = 72;
var COLOR_MODE = NewDocumentMode.RGB;
var SLIDE_W = CANVAS_W * SCALE, SLIDE_H = CANVAS_H * SCALE;
function s(v) { return v * SCALE; }

// ----- palette (fresh forest) -----
var BG     = hexc("08130D");  // deep forest green-black
var GREEN  = hexc("9CC089");  // fresh leaf green (accent)
var GREEND = hexc("5E7B50");  // dim moss green
var CREAM  = hexc("EAF0E4");  // cool white
var MUTED  = hexc("9DB29A");  // muted sage meta
var MIST   = hexc("4A6B46");  // cool glow / haze
function hexc(h) { var c = new SolidColor(); c.rgb.hexValue = h; return c; }

var DOC_NAME = "JP-WHISKY-HAKUSHU";
var OUT_DIR  = Folder.desktop.fsName + "/";
var OUT_PSD  = OUT_DIR + DOC_NAME + ".psd";
var OUT_PNG  = OUT_DIR + DOC_NAME + "_preview.png";

// ----- helpers -----
function fillRect(nm, x, y, w, h, color) {
  var d = app.activeDocument;
  d.selection.select([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
  var l = d.artLayers.add(); l.name = nm;
  d.selection.fill(color); d.selection.deselect();
  return l;
}
function addText(nm, text, font, sizeBase, color, x, y, tracking) {
  var d = app.activeDocument, l = d.artLayers.add();
  l.kind = LayerKind.TEXT; l.name = nm;
  var ti = l.textItem; ti.kind = TextType.POINTTEXT;
  try { ti.font = font; } catch (e) {}
  ti.size = UnitValue(sizeBase * SCALE * 72 / DPI, "pt");
  ti.color = color; ti.contents = text;
  ti.position = [UnitValue(x, "px"), UnitValue(y, "px")];
  if (tracking) { try { ti.tracking = tracking; } catch (e) {} }
  return l;
}
function addCentered(nm, text, font, sizeBase, color, yDoc, tracking) {
  var l = addText(nm, text, font, sizeBase, color, 0, yDoc, tracking);
  var b = l.bounds, w = b[2].value - b[0].value, cur = b[0].value;
  l.translate((SLIDE_W - w) / 2 - cur, 0);
  return l;
}
function watermark(nm, text, font, sizeBase, color, yDoc, op) {
  var l = addCentered(nm, text, font, sizeBase, color, yDoc, 80);
  l.opacity = op; return l;
}
function softGlow(nm, cx, cy, w, h, color, blur, op) {
  var l = fillRect(nm, cx - w / 2, cy - h / 2, w, h, color);
  try { l.applyGaussianBlur(blur); } catch (e) {}
  l.opacity = op; return l;
}
function diamond(nm, cx, cy, size, color) {
  var l = fillRect(nm, cx - size / 2, cy - size / 2, size, size, color);
  try { l.rotate(45, AnchorPosition.MIDDLECENTER); } catch (e) {}
  return l;
}
// faint vertical lines in the side margins — a hint of forest / falling light
function forestLines(nm, color) {
  var xs = [108, 156, 214, 286, 352, 728, 800, 866, 924, 978];
  for (var i = 0; i < xs.length; i++) {
    var h = 280 + (i % 4) * 130, y = 110 + (i % 3) * 70;
    var l = fillRect(nm + " " + i, s(xs[i]), s(y), s(1), s(h), color);
    l.opacity = 7 + (i % 3) * 4;
  }
}
function cornerBracket(nm, cx, cy, len, t, color, hx, hy) {
  fillRect(nm + " h", hx > 0 ? cx : cx - len, hy > 0 ? cy : cy - t, len, t, color);
  fillRect(nm + " v", hx > 0 ? cx : cx - t, hy > 0 ? cy : cy - len, t, len, color);
}
function frameCorner(nm, cx, cy, sx, sy) {
  var LEN = s(82), LEN2 = s(52), T = s(2), T2 = s(1.5), GAP = s(9);
  fillRect(nm + " oh", sx > 0 ? cx : cx - LEN, sy > 0 ? cy : cy - T, LEN, T, GREEN);
  fillRect(nm + " ov", sx > 0 ? cx : cx - T, sy > 0 ? cy : cy - LEN, T, LEN, GREEN);
  var ix = cx + sx * GAP, iy = cy + sy * GAP;
  fillRect(nm + " ih", sx > 0 ? ix : ix - LEN2, sy > 0 ? iy : iy - T2, LEN2, T2, GREEND);
  fillRect(nm + " iv", sx > 0 ? ix : ix - T2, sy > 0 ? iy : iy - LEN2, T2, LEN2, GREEND);
  diamond(nm + " stud", cx, cy, s(9), GREEN);
}
function addGrain(nm, op, amount, mode) {
  amount = amount || 14;
  var d = app.activeDocument, l = d.artLayers.add(); l.name = nm;
  d.selection.selectAll(); d.selection.fill(hexc("808080")); d.selection.deselect();
  try { l.applyAddNoise(amount, NoiseDistribution.GAUSSIAN, true); } catch (e) {}
  l.blendMode = mode || BlendMode.SOFTLIGHT; l.opacity = op; return l;
}

var SLIDE_DOC;
try {
  for (var i = app.documents.length - 1; i >= 0; i--) {
    try { if (app.documents[i].name.indexOf(DOC_NAME) >= 0) app.documents[i].close(SaveOptions.DONOTSAVECHANGES); } catch (e) {}
  }

  var doc = app.documents.add(UnitValue(SLIDE_W, "px"), UnitValue(SLIDE_H, "px"), DPI, DOC_NAME, COLOR_MODE, DocumentFill.WHITE);
  SLIDE_DOC = doc;
  try { doc.bitsPerChannel = BitsPerChannelType.SIXTEEN; } catch (e) {}  // 16-bit: smooth glows, kills banding at source
  doc.selection.selectAll(); doc.selection.fill(BG); doc.selection.deselect();
  doc.layers[0].name = "00 · Background";

  var CX = SLIDE_W / 2;

  // misty haze near the top + cool light behind the product
  softGlow("01 · Mist", CX, s(150), s(940), s(420), MIST, s(230), 30);
  softGlow("01b · Glow", CX, s(600), s(470), s(560), MIST, s(200), 34);
  // faint forest lines in the margins
  forestLines("02 · Forest", GREEN);
  // ground shadow + floor line
  softGlow("03 · Floor shadow", CX, s(815), s(520), s(70), hexc("000000"), s(34), 55);
  var floor = fillRect("03b · Floor line", CX - s(230), s(806), s(460), s(2), GREEN); floor.opacity = 50;

  // faint 白州 watermark behind the product
  watermark("04 · 白州 watermark", "白州", "HiraMinProN-W3", 188, CREAM, s(648), 6);

  // refined frame + machined corners
  (function () {
    var x = s(54), y = s(54), w = s(972), h = s(972), t = s(1);
    var a = fillRect("05 · Frame top", x, y, w, t, GREEND);
    var b = fillRect("05 · Frame bottom", x, y + h - t, w, t, GREEND);
    var c = fillRect("05 · Frame left", x, y, t, h, GREEND);
    var e = fillRect("05 · Frame right", x + w - t, y, t, h, GREEND);
    a.opacity = 30; b.opacity = 30; c.opacity = 30; e.opacity = 30;
  })();
  frameCorner("06 · Corner TL", s(54), s(54), +1, +1);
  frameCorner("06 · Corner TR", s(1026), s(54), -1, +1);
  frameCorner("06 · Corner BL", s(54), s(1026), +1, -1);
  frameCorner("06 · Corner BR", s(1026), s(1026), -1, -1);

  // masthead
  addCentered("10 · Eyebrow", "THE FOREST DISTILLERY", "Avenir-Medium", 14, GREEN, s(132), 360);
  fillRect("11 · Eyebrow rule", CX - s(34), s(150), s(68), s(1.5), GREEN);
  addCentered("12 · Title", "HAKUSHU", "Didot-Bold", 66, CREAM, s(240), 30);
  addCentered("13 · Title JP", "白州 — 森 の ウ イ ス キ ー", "HiraMinProN-W6", 21, GREEN, s(290), 40);
  diamond("14 · Diamond L", CX - s(262), s(283), s(8), GREEN);
  diamond("14 · Diamond R", CX + s(262), s(283), s(8), GREEN);

  addText("15 · Index", "No. 03", "Didot-Italic", 20, GREEN, s(880), s(132), 0);

  // bottom plate (editable)
  diamond("20 · Name diamond", CX, s(852), s(7), GREEN);
  addCentered("21 · edit Product name (JP)", "白州 18年", "ToppanBunkyuMidashiMinchoStdN-ExtraBold", 46, CREAM, s(908), 20);
  addCentered("22 · edit Product name (EN)", "HAKUSHU · SINGLE MALT", "Avenir-Medium", 14, GREEN, s(948), 300);
  addCentered("23 · edit Meta", "SUNTORY   ·   43% ABV   ·   JAPAN", "Avenir-Medium", 13, MUTED, s(988), 240);

  // GUIDE layers (hide/delete before publishing)
  (function () {
    var L = s(360), R = s(720), T = s(330), B = s(792), len = s(48), t = s(2);
    cornerBracket("GUIDE TL", L, T, len, t, GREEND, +1, +1);
    cornerBracket("GUIDE TR", R, T, len, t, GREEND, -1, +1);
    cornerBracket("GUIDE BL", L, B, len, t, GREEND, +1, -1);
    cornerBracket("GUIDE BR", R, B, len, t, GREEND, -1, -1);
    var hint = addCentered("GUIDE hint", "PLACE PRODUCT\rIMAGE HERE", "Avenir-Medium", 15, GREEND, s(548), 120);
    hint.opacity = 72;
  })();

  addGrain("98 · Film grain", 44, 12, BlendMode.SOFTLIGHT);
  addGrain("99 · Dither", 9, 6, BlendMode.LINEARLIGHT);  // fine dither into shadows — breaks 8-bit banding

  var outFile = new File(OUT_PSD);
  if (!outFile.parent.exists) outFile.parent.create();
  var so = new PhotoshopSaveOptions(); so.embedColorProfile = true; so.alphaChannels = true; so.layers = true;
  doc.saveAs(outFile, so, true, Extension.LOWERCASE);
  doc.saveAs(new File(OUT_PNG), new PNGSaveOptions(), true, Extension.LOWERCASE);

} finally {
  app.preferences.rulerUnits = __origRuler;
  app.preferences.typeUnits  = __origType;
}
