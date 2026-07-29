# Wordmark font

`space-grotesk-700-pir2pir.woff2` is Space Grotesk Bold subset to the four glyphs used by the
navbar wordmark — `P`, `i`, `r`, `2`. It is referenced only by the `@font-face` rule in
`../custom.css`, which scopes it further with `unicode-range`.

At 808 bytes it lands under the asset-inlining threshold, so the build embeds it as a base64
`data:` URI inside the CSS bundle rather than emitting a separate file. There is no extra request
and therefore no flash of unstyled text.

## Regenerating

Needed only if the brand name changes. `--text` must list every character in the new wordmark.

```sh
# 1. Grab the upstream latin subset (the URL comes from the Google Fonts CSS API).
curl -A 'Mozilla/5.0' \
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700' | grep -o 'https://[^)]*'

# 2. Subset it.
pip install 'fonttools[woff]' brotli
pyftsubset upstream.woff2 \
  --flavor=woff2 --text='Pir2' --layout-features='' --no-hinting --desubroutinize \
  --output-file=space-grotesk-700-pir2pir.woff2
```

Then update the `unicode-range` in `../custom.css` to match the new glyph set.

Do not subset with opentype.js — its font writer displaced a control point on the `2` by 25 units
(2.5% of em) while leaving advance widths and command counts identical, so the damage does not show
up in a naive comparison. `pyftsubset` round-trips with zero coordinate deviation.

## Licence

SIL Open Font License 1.1 — see `OFL.txt`. Copyright 2020 The Space Grotesk Project Authors.
No Reserved Font Name is declared, so the original family name is kept in `@font-face`.
