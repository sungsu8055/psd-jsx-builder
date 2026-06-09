/*
 * The README hero image for psd-jsx-builder — built by the tool itself (docs/example.png).
 * A light-editorial layout: big headline, a mono command chip, and a sample output card with a
 * soft (gaussian-blurred) drop shadow. Run it like any other build:
 *     ./scripts/build_psd.sh examples/hero.jsx          # writes to your Desktop
 *     python scripts/export_psd.py ~/Desktop/psd-jsx-builder-hero.psd --format png
 *
 * Fonts: uses Avenir Next (ships with macOS) and JetBrains Mono. If a font is missing, Photoshop
 * silently falls back to a default (jsx_helpers.md #8) — swap F_HEAVY / F_MONO below for fonts
 * you have. This doubles as a worked example of gradients-free depth via applyGaussianBlur().
 */
#target photoshop
var __r = app.preferences.rulerUnits, __t = app.preferences.typeUnits;
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits  = TypeUnits.PIXELS;

var CANVAS_W = 1280, CANVAS_H = 720, SCALE = 2, DPI = 72;
var SLIDE_W = CANVAS_W * SCALE, SLIDE_H = CANVAS_H * SCALE;
function s(v){ return v * SCALE; }

var DOC_NAME = "psd-jsx-builder-hero";
var OUT_PSD  = Folder.desktop.fsName + "/" + DOC_NAME + ".psd";

// fonts (PostScript names — change to ones you have if needed)
var F_HEAVY = "AvenirNext-Heavy", F_DEMI = "AvenirNext-DemiBold", F_MED = "AvenirNext-Medium",
    F_REG = "AvenirNext-Regular", F_MONO = "JetBrainsMono-Medium", F_MONO_R = "JetBrainsMono-Regular";

// palette
function hex(h){ var c=new SolidColor(); c.rgb.hexValue=h; return c; }
var BG=hex("F4F3EF"), INK=hex("1A1A1E"), MUTE=hex("5C5C58"), FAINT=hex("8C8C86"),
    ACCENT=hex("E2533A"), CHIP=hex("E8E6E0"),
    NAVY=hex("14254E"), PAPER=hex("F7F6F2"), NAVYMUTE=hex("AEB7CC");

function fillRect(name,x,y,w,h,color){
  var d=app.activeDocument;
  d.selection.select([[x,y],[x+w,y],[x+w,y+h],[x,y+h]]);
  var l=d.artLayers.add(); l.name=name; d.selection.fill(color); d.selection.deselect();
  return l;
}
function txt(name,text,font,sizeA,color,x,y,tr){
  var d=app.activeDocument, l=d.artLayers.add();
  l.kind=LayerKind.TEXT; l.name=name;
  var ti=l.textItem; ti.kind=TextType.POINTTEXT;
  try{ ti.font=font; }catch(e){}
  ti.size=UnitValue(sizeA*SCALE*72/DPI,"pt");
  ti.color=color; ti.contents=text;
  ti.position=[UnitValue(s(x),"px"),UnitValue(s(y),"px")];
  if(tr!==undefined){ try{ ti.tracking=tr; }catch(e){} }
  return l;
}
// soft ambient shadow: a dark rect on its own layer, gaussian-blurred, low opacity
function softShadow(name,x,y,w,h,blurA,op){
  var l=fillRect(name,s(x),s(y),s(w),s(h),hex("11131A"));
  try{ l.applyGaussianBlur(s(blurA)); }catch(e){}
  l.opacity=op; return l;
}

var SLIDE_DOC;
try{
  for(var i=app.documents.length-1;i>=0;i--){ try{ if(app.documents[i].name.indexOf(DOC_NAME)>=0) app.documents[i].close(SaveOptions.DONOTSAVECHANGES);}catch(e){} }
  var doc=app.documents.add(UnitValue(SLIDE_W,"px"),UnitValue(SLIDE_H,"px"),DPI,DOC_NAME,NewDocumentMode.RGB,DocumentFill.WHITE);
  SLIDE_DOC=doc;
  doc.selection.selectAll(); doc.selection.fill(BG); doc.selection.deselect();
  doc.layers[0].name="00 bg";

  // ---- right: sample output card floating on the clean ground with a soft shadow ----
  var CX=860, CY=162, CW=340, CH=470;
  softShadow("10 shadow", CX+8, CY+24, CW, CH, 32, 22);
  fillRect("11 card", s(CX), s(CY), s(CW), s(CH), NAVY);
  fillRect("12 card rule", s(CX+34), s(CY+52), s(70), s(6), ACCENT);
  txt("13 card eyebrow","NIGHT MARKET", F_MONO_R, 12, NAVYMUTE, CX+34, CY+96, 120);
  txt("14 card h1","Late", F_HEAVY, 58, PAPER, CX+30, CY+200, -20);
  txt("15 card h2","Summer", F_HEAVY, 58, PAPER, CX+30, CY+262, -20);
  txt("16 card h3","Sessions", F_HEAVY, 58, ACCENT, CX+30, CY+324, -20);
  fillRect("17 card div", s(CX+34), s(CY+372), s(CW-68), s(2), hex("2E3D63"));
  txt("18 card meta","SAT 14 JUN  ·  8 PM", F_DEMI, 15, PAPER, CX+34, CY+412, 40);
  txt("19 card foot","made with psd-jsx-builder", F_MONO_R, 11, NAVYMUTE, CX+34, CY+440, 20);
  txt("20 card tag",".psd", F_MONO, 12, NAVYMUTE, CX+CW-72, CY+96, 0);

  // ---- left: editorial copy ----
  txt("30 eyebrow","PHOTOSHOP  ·  SCRIPTED  ·  OPEN SOURCE", F_DEMI, 13, ACCENT, 110, 152, 180);
  txt("31 h1","Photoshop files,", F_HEAVY, 82, INK, 108, 300, -30);
  txt("32 h2","built from code.", F_HEAVY, 82, INK, 108, 396, -30);
  txt("33 sub1","A reproducible PSD pipeline — write a small script,", F_REG, 22, MUTE, 110, 474, 0);
  txt("34 sub2","render to a PNG, repeat. For screen and for print.", F_REG, 22, MUTE, 110, 506, 0);

  fillRect("40 chip", s(110), s(548), s(486), s(58), CHIP);
  txt("41 chip txt","build_psd.sh  slide.jsx", F_MONO, 15, INK, 132, 585, 0);
  txt("42 chip arrow","->  slide.psd", F_MONO, 15, ACCENT, 350, 585, 0);

  txt("50 foot","MIT  ·  macOS + Photoshop  ·  github.com/sungsu8055/psd-jsx-builder", F_MED, 14, FAINT, 110, 666, 10);

  var f=new File(OUT_PSD);
  var so=new PhotoshopSaveOptions(); so.embedColorProfile=true; so.alphaChannels=true; so.layers=true;
  doc.saveAs(f, so, true, Extension.LOWERCASE);
} finally {
  app.preferences.rulerUnits=__r; app.preferences.typeUnits=__t;
}
