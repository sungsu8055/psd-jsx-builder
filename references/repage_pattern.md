# Editing an existing PSD without losing manual edits

When a user has hand-tuned a PSD and you only need to change some text (e.g. renumber page
footers across a deck) or swap one image, **do not rebuild from the jsx** — that throws away
their manual work. Instead, open the existing `.psd`, walk its layers, and modify only the
targets in place, then save back.

Always back up the PSDs first (`cp -r psd psd_backup_<date>`), because this overwrites them.

## Text-only edit (the "repage" pattern)

Recursively scan layers, and for each **text** layer whose name marks it as the target and
whose contents match the expected pattern, replace only `textItem.contents`. Everything else
(positions the user moved, images, effects) is untouched.

```jsx
#target photoshop
var PSD_DIR = "/abs/path/to/psd/";

// map: filename (no ext) -> new value
var MAP = { "SLIDE-02": 2, "SLIDE-03": 3 /* ... */ };
var DENOM = 29;

function pad(n){ return (n<10?"0":"") + n; }
function isPageText(s){ return /\d+\s*\/\s*\d+/.test(s); }   // looks like "12 / 30"
function walk(layers, fn){
  for (var i=0;i<layers.length;i++){ var l=layers[i]; fn(l);
    if (l.typename=="LayerSet") walk(l.layers, fn); }
}

for (var key in MAP) {
  var f = new File(PSD_DIR + key + ".psd");
  if (!f.exists) continue;
  var d = app.open(f);
  var newTxt = pad(MAP[key]) + "  /  " + DENOM;
  var changed = 0;
  walk(d.layers, function(l){
    if (l.kind == LayerKind.TEXT) {
      var c = l.textItem.contents;
      // prefer layers whose NAME says "page", and whose content looks like a page number
      if (isPageText(c) && /(page|Page)/.test(l.name)) { l.textItem.contents = newTxt; changed++; }
    }
  });
  // fallback: if no name matched, change any page-number-looking text
  if (changed == 0) walk(d.layers, function(l){
    if (l.kind == LayerKind.TEXT && isPageText(l.textItem.contents)) { l.textItem.contents = newTxt; changed++; }
  });
  var so = new PhotoshopSaveOptions(); so.embedColorProfile=true; so.alphaChannels=true; so.layers=true;
  d.saveAs(f, so, true, Extension.LOWERCASE);
  d.close(SaveOptions.DONOTSAVECHANGES);
}
```

Run it the same way as any build: `scripts/build_psd.sh /abs/path/to/repage.jsx`.

## Image swap

Same idea: open the PSD, find the target image layer by name, delete it (or hide it), then
place the replacement at the same position/size with `placeImage`/`placeContain`, and save.
Keep the layer name identical so future edits keep finding it.

## Why name + content matching, not just one
Matching on layer **name** alone breaks if names drift; matching on **content pattern** alone
can hit the wrong layer (e.g. a body line that happens to contain "1/2"). Requiring both —
with a content-only fallback — is robust across a deck where some files were hand-renamed.
