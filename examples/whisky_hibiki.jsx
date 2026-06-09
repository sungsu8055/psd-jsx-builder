/*
 * Japanese Whisky series — variation 02: HIBIKI (響 / harmony).
 * Warm amber-gold, washi-grain texture, a faint 響 watermark and a ring of 24 dots
 * (a nod to Hibiki's 24-facet bottle / the 24 seasons). Center zone stays EMPTY for a bottle.
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

// ----- palette (kokimurasaki 濃紫 — deep traditional purple + gold) -----
var BG    = hexc("140912");  // deep aubergine near-black
var GOLD  = hexc("C9A463");  // Hibiki gold
var GOLDD = hexc("8E7140");  // dim gold
var CREAM = hexc("EDE7D6");  // warm ivory
var MUTED = hexc("A99A8C");  // muted meta
var PLUM  = hexc("4A2547");  // kokimurasaki deep purple (glow)
var PLUM2 = hexc("5C2E55");  // lifted plum (upper bloom)
var LAV   = hexc("8C6E92");  // luminous lavender core (brightness)
var IRID  = hexc("46396E");  // cool blue-violet bloom (iridescent shimmer)
var GLINT = hexc("F4EEE0");  // bright crystalline glint
function hexc(h) { var c = new SolidColor(); c.rgb.hexValue = h; return c; }

var DOC_NAME = "JP-WHISKY-HIBIKI";
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
  var l = addCentered(nm, text, font, sizeBase, color, yDoc, 0);
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
// ring of N small diamonds (24 = Hibiki's facets / the 24 sekki)
function dotRing(nm, cx, cy, r, n, size, color, op) {
  for (var i = 0; i < n; i++) {
    var a = (i / n) * Math.PI * 2;
    var l = diamond(nm + " " + i, cx + Math.cos(a) * r, cy + Math.sin(a) * r, size, color);
    l.opacity = op;
  }
}
// crystalline twinkle: a bright 4-point glint (catch-light off cut glass)
function sparkle(nm, cx, cy, r, color, op) {
  var t = s(2);
  var v = fillRect(nm + " v", cx - t / 2, cy - r, t, r * 2, color);
  var h = fillRect(nm + " h", cx - r, cy - t / 2, r * 2, t, color);
  var c = diamond(nm + " c", cx, cy, r * 0.8, color);
  v.opacity = op; h.opacity = op; c.opacity = Math.min(100, op + 12);
  return c;
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

  // kokimurasaki purple atmosphere: soft upper bloom + glow behind the product (dialed back)
  softGlow("01 · Plum bloom", CX, s(430), s(640), s(620), PLUM2, s(235), 20);
  softGlow("01b · Glow", CX, s(620), s(470), s(540), PLUM, s(205), 22);
  // luminous lift: a faint cool iridescent bloom + a brighter lavender core (영롱한 빛)
  softGlow("01c · Iridescent bloom", CX - s(150), s(372), s(440), s(440), IRID, s(225), 16);
  softGlow("01d · Luminous core", CX, s(560), s(400), s(460), LAV, s(180), 26);
  softGlow("02 · Floor shadow", CX, s(815), s(520), s(70), hexc("000000"), s(34), 60);
  var floor = fillRect("03 · Floor line", CX - s(230), s(806), s(460), s(2), GOLD); floor.opacity = 55;

  // faint 響 watermark + 24-dot ring behind the product zone
  watermark("04 · 響 watermark", "響", "HiraMinProN-W6", 300, CREAM, s(700), 8);
  dotRing("04b · Season ring", CX, s(560), s(312), 24, s(7), GOLD, 32);

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

  // masthead
  addCentered("10 · Eyebrow", "THE ART OF JAPANESE HARMONY", "Avenir-Medium", 14, GOLD, s(132), 320);
  fillRect("11 · Eyebrow rule", CX - s(34), s(150), s(68), s(1.5), GOLD);
  addCentered("12 · Title", "HIBIKI", "Didot-Bold", 70, CREAM, s(240), 60);
  addCentered("13 · Title JP", "響 — 日 本 の ハ ー モ ニ ー", "HiraMinProN-W6", 21, GOLD, s(290), 40);
  diamond("14 · Diamond L", CX - s(258), s(283), s(8), GOLD);
  diamond("14 · Diamond R", CX + s(258), s(283), s(8), GOLD);

  addText("15 · Index", "No. 02", "Didot-Italic", 20, GOLD, s(880), s(132), 0);

  // bottom plate (editable)
  diamond("20 · Name diamond", CX, s(852), s(7), GOLD);
  addCentered("21 · edit Product name (JP)", "響 17年", "ToppanBunkyuMidashiMinchoStdN-ExtraBold", 46, CREAM, s(908), 20);
  addCentered("22 · edit Product name (EN)", "HIBIKI · BLENDED", "Avenir-Medium", 14, GOLD, s(948), 320);
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
