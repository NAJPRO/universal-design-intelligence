"""Optional Pillow contact sheets. Original PNGs are never resized in place."""
from PIL import Image,ImageDraw
from pathlib import Path
root=Path(__file__).resolve().parent/'evidence';(root/'review').mkdir(exist_ok=True)
for width in (375,768,1440):
 for state in ('populated','empty','error','loading','edit','compare'):
  scale=1 if width<1000 else .65
  w,h=int(width*scale),int(1000*scale)
  sheet=Image.new('RGB',(2*w,h+32),'#e4e8e4');d=ImageDraw.Draw(sheet)
  for i,arm in enumerate(('before','after')):
   im=Image.open(root/f'screenshots/{arm}-{width}-{state}.png');assert im.size==(width,1000)
   d.text((i*w+10,8),f'{arm} | {width} CSS px | {state}',fill='#192c25');sheet.paste(im.resize((w,h)),(i*w,32))
  sheet.save(root/f'review/{width}-{state}.png')
for height in (500,320):
 sheet=Image.new('RGB',(750,height+32),'#e4e8e4');d=ImageDraw.Draw(sheet)
 for i,arm in enumerate(('before','after')):
  d.text((i*375+10,8),f'{arm} | 375 x {height} | editing',fill='#192c25')
  im=Image.open(root/f'screenshots/{arm}-375x{height}-edit.png');assert im.size==(375,height);sheet.paste(im,(i*375,32))
 sheet.save(root/f'review/375x{height}-edit.png')
