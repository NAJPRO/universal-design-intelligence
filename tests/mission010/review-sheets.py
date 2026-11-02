"""Optional contact sheets for review; requires existing Pillow. Originals stay unchanged."""
from PIL import Image, ImageDraw
from pathlib import Path
import os
root=Path(__file__).resolve().parent/os.environ.get('UDI_BENCH_EVIDENCE','evidence')
(root/'review').mkdir(exist_ok=True)
for width in (375,768,1440):
 for state in ('populated','empty','error','loading','edit'):
  scale=1 if width==375 else .75 if width==768 else .5
  w,h=int(width*scale),int(1000*scale)
  sheet=Image.new('RGB',(3*w,h+36),'#e4e8e4');d=ImageDraw.Draw(sheet)
  for i,arm in enumerate('ABC'):
   d.text((i*w+12,10),f'{arm} | {width} CSS px | {state}',fill='#17281d')
   im=Image.open(root/f'screenshots/{arm}/{width}-{state}.png').convert('RGB');assert im.size==(width,1000),im.size
   sheet.paste(im.resize((w,h),Image.Resampling.LANCZOS),(i*w,36))
  sheet.save(root/f'review/{width}-{state}.png')
for state in ('collapsed-filters','invalid','discard'):
 sheet=Image.new('RGB',(1125,1036),'#e4e8e4');d=ImageDraw.Draw(sheet)
 for i,arm in enumerate('ABC'):
  d.text((i*375+12,10),f'{arm} | 375 CSS px | {state}',fill='#17281d')
  sheet.paste(Image.open(root/f'details/{arm}-{state}.png').convert('RGB'),(i*375,36))
 sheet.save(root/f'review/375-{state}.png')
