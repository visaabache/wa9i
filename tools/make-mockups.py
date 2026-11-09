"""Step 2 of the product mockups: prints each design drawing onto the real case photo (tools/mockup-base.jpg).

The photo's light and shadows are kept: the case area's brightness, smoothed so the case's weave and the
embossed logo disappear, multiplies the design. The real camera, the case edge and the background stay untouched.
Usage: python3 tools/make-mockups.py <designs-dir> assets/mockups
"""
import json, os, sys
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps

designs, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
here = os.path.dirname(os.path.abspath(__file__))
base = Image.open(os.path.join(here, "mockup-base.jpg")).convert("RGB")  # 1200 x 1200
assert base.size == (1200, 1200), base.size

# Case geometry in the photo (pixels)
CASE = (383, 121, 813, 1001)      # outer edge of the case
CASE_R = 64
CAM = (414, 156, 776, 386)        # camera island (stays as in the photo)
CAM_R = 48
S = 4                              # supersampling for smooth mask edges

def rrect_mask(box, r, inset=0):
    m = Image.new("L", (1200 * S, 1200 * S), 0)
    x0, y0, x1, y1 = box
    ImageDraw.Draw(m).rounded_rectangle([(x0 + inset) * S, (y0 + inset) * S, (x1 - inset) * S, (y1 - inset) * S], radius=(r - inset) * S, fill=255)
    return m.resize((1200, 1200), Image.LANCZOS)

case_m = rrect_mask(CASE, CASE_R, inset=2)
cam_m = rrect_mask(CAM, CAM_R)
mask = ImageChops.subtract(case_m, cam_m).filter(ImageFilter.GaussianBlur(0.8))

# Shading: brightness of the case, blurred to drop the weave texture and the embossed logo, normalised around 1
lum = ImageOps.grayscale(base)
lum_s = lum.filter(ImageFilter.GaussianBlur(9))
vals = sorted(v for v, m in zip(lum_s.get_flattened_data(), mask.get_flattened_data()) if m > 200)
mid = vals[len(vals) // 2]
def shade_px(v):
    s = v / mid
    return max(0, min(255, int(round(178 * (min(s, 1.0) if s < 1 else 1 + (min(s, 1.6) - 1) * 0.55)))))  # 178 = "normal light"; sunbeams brighten gently
shade = lum_s.point(shade_px)
# Darken the curved edge of the case a little, like a real case wrapping round the phone
edge = ImageChops.subtract(rrect_mask(CASE, CASE_R, 2), rrect_mask(CASE, CASE_R, 16)).filter(ImageFilter.GaussianBlur(6))
shade = ImageChops.subtract(shade, edge.point(lambda v: int(v * 0.28)))
# A little of the case's fine grain, so the print looks like it sits on a real surface
grain = ImageChops.subtract(lum, lum.filter(ImageFilter.GaussianBlur(2)), scale=2.6, offset=128)  # about 40% of the weave

def compose(design_png):
    d = Image.open(design_png).convert("RGBA")
    x0, y0, x1, y1 = CASE
    d = d.resize((x1 - x0, y1 - y0), Image.LANCZOS)
    layer = Image.new("RGBA", (1200, 1200), (0, 0, 0, 0))
    layer.paste(d, (x0, y0), d)
    rgb = layer.convert("RGB")
    sh = shade.convert("RGB")
    lit = ImageChops.multiply(rgb, sh).point(lambda v: min(255, int(v * 255 / 178)))     # back to full brightness in normal light
    lit = ImageChops.add(lit, grain.convert("RGB"), scale=1, offset=-128)
    out_img = base.copy()
    out_img.paste(lit, (0, 0), mask)
    return out_img

manifest = json.load(open(os.path.join(designs, "manifest.json")))
count = 0
for design, colors in manifest.items():
    for i, _ in enumerate(colors):
        img = compose(os.path.join(designs, f"{design}-{i}.png"))
        img = img.crop((150, 60, 1050, 1060)).resize((486, 540), Image.LANCZOS)  # frame the phone
        img.save(os.path.join(out, f"{design}-{i}.webp"), "WEBP", quality=64, method=6)
        count += 1
json.dump(manifest, open(os.path.join(out, "manifest.json"), "w"))
print(f"{count} mockups written to {out}")
