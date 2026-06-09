/*
 * Japanese Whisky series — variation 01: YAMAZAKI (山崎 / Japan's pioneer single malt).
 * Honey-amber over warm espresso black with an ivory + gold seal (black brush 山, echoing the
 * label) and a faint 山崎 watermark. Palette tuned to the actual bottle/box: amber · ivory ·
 * gold · espresso black. Center zone stays EMPTY for a bottle. Mood only — no logo reproduced.
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

// ----- palette (honey amber · ivory · gold · espresso black — from the bottle/box) -----
var BG    = hexc("100B07");  // warm espresso black (the box)
var GOLD  = hexc("C6A25C");  // cap / text gold
var GOLDD = hexc("8F6F3C");  // dim gold
var CREAM = hexc("EBE0C7");  // label parchment ivory
var MUTED = hexc("A99C82");  // muted meta
var AMBER = hexc("8C5E1E");  // honey-amber whisky glow (warm gold, not red)
var INK   = hexc("1A130B");  // near-black brush ink (seal kanji)
function hexc(h) { var c = new SolidColor(); c.rgb.hexValue = h; return c; }

var DOC_NAME = "JP-WHISKY-YAMAZAKI";
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
function fillCircle(nm, cx, cy, r, color, sides) {
  sides = sides || 72;
  var pts = [];
  for (var i = 0; i < sides; i++) { var a = i / sides * Math.PI * 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  var d = app.activeDocument;
  d.selection.select(pts);
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
  var l = addCentered(nm, text, font, sizeBase, color, yDoc, 40);
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
function cornerBracket(nm, cx, cy, len, t, color, hx, hy) {
  fillRect(nm + " h", hx > 0 ? cx : cx - len, hy > 0 ? cy : cy - t, len, t, color);
  fillRect(nm + " v", hx > 0 ? cx : cx - t, hy > 0 ? cy : cy - len, t, len, color);
}
function frameCorner(nm, cx, cy, sx, sy) {
  var LEN = s(82), LEN2 = s(52), T = s(2), T2 = s(1.5), GAP = s(9);
  fillRect(nm + " oh", sx > 0 ? cx : cx - LEN, sy > 0 ? cy : cy - T, LEN, T, GOLD);
  fillRect(nm + " ov", sx > 0 ? cx : cx - T, sy > 0 ? cy : cy - LEN, T, LEN, GOLD);
  var ix = cx + sx * GAP, iy = cy + sy * GAP;
  fillRect(nm + " ih", sx > 0 ? ix : ix - LEN2, sy > 0 ? iy : iy - T2, LEN2, T2, GOLDD);
  fillRect(nm + " iv", sx > 0 ? ix : ix - T2, sy > 0 ? iy : iy - LEN2, T2, LEN2, GOLDD);
  diamond(nm + " stud", cx, cy, s(9), GOLD);
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

  // sherry glow + ground shadow
  softGlow("01 · Glow", CX, s(590), s(480), s(560), AMBER, s(205), 36);
  softGlow("02 · Floor shadow", CX, s(815), s(520), s(70), hexc("000000"), s(34), 60);
  var floor = fillRect("03 · Floor line", CX - s(230), s(806), s(460), s(2), GOLD); floor.opacity = 55;

  // faint 山崎 watermark behind product
  watermark("04 · 山崎 watermark", "山崎", "HiraMinProN-W6", 196, CREAM, s(648), 7);

  // refined frame + machined corners
  (function () {
    var x = s(54), y = s(54), w = s(972), h = s(972), t = s(1);
    var a = fillRect("05 · Frame top", x, y, w, t, GOLDD);
    var b = fillRect("05 · Frame bottom", x, y + h - t, w, t, GOLDD);
    var c = fillRect("05 · Frame left", x, y, t, h, GOLDD);
    var e = fillRect("05 · Frame right", x + w - t, y, t, h, GOLDD);
    a.opacity = 32; b.opacity = 32; c.opacity = 32; e.opacity = 32;
  })();
  frameCorner("06 · Corner TL", s(54), s(54), +1, +1);
  frameCorner("06 · Corner TR", s(1026), s(54), -1, +1);
  frameCorner("06 · Corner BL", s(54), s(1026), +1, -1);
  frameCorner("06 · Corner BR", s(1026), s(1026), -1, -1);

  // masthead (aligned with the Hibiki / Hakushu layout)
  addCentered("10 · Eyebrow", "THE PIONEER OF JAPANESE MALT", "Avenir-Medium", 13, GOLD, s(132), 320);
  fillRect("11 · Eyebrow rule", CX - s(34), s(150), s(68), s(1.5), GOLD);
  addCentered("12 · Title", "YAMAZAKI", "Didot-Bold", 64, CREAM, s(240), 30);
  addCentered("13 · Title JP", "山崎 — 日 本 の シ ン グ ル モ ル ト", "HiraMinProN-W6", 20, GOLD, s(290), 30);
  diamond("14 · Diamond L", CX - s(280), s(283), s(8), GOLD);
  diamond("14 · Diamond R", CX + s(280), s(283), s(8), GOLD);

  addText("15 · Index", "No. 01", "Didot-Italic", 20, GOLD, s(880), s(132), 0);

  // bottom plate (editable)
  diamond("20 · Name diamond", CX, s(852), s(7), GOLD);
  addCentered("21 · edit Product name (JP)", "山崎 12年", "ToppanBunkyuMidashiMinchoStdN-ExtraBold", 46, CREAM, s(908), 20);
  addCentered("22 · edit Product name (EN)", "YAMAZAKI · SINGLE MALT", "Avenir-Medium", 14, GOLD, s(948), 300);
  addCentered("23 · edit Meta", "SUNTORY   ·   43% ABV   ·   JAPAN", "Avenir-Medium", 13, MUTED, s(988), 240);

  // GUIDE layers (hide/delete before publishing)
  (function () {
    var L = s(360), R = s(720), T = s(330), B = s(792), len = s(48), t = s(2);
    cornerBracket("GUIDE TL", L, T, len, t, GOLDD, +1, +1);
    cornerBracket("GUIDE TR", R, T, len, t, GOLDD, -1, +1);
    cornerBracket("GUIDE BL", L, B, len, t, GOLDD, +1, -1);
    cornerBracket("GUIDE BR", R, B, len, t, GOLDD, -1, -1);
    var hint = addCentered("GUIDE hint", "PLACE PRODUCT\rIMAGE HERE", "Avenir-Medium", 15, GOLDD, s(548), 120);
    hint.opacity = 70;
  })();

  addGrain("98 · Film grain", 48, 12, BlendMode.SOFTLIGHT);
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
