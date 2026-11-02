from pathlib import Path
from PIL import Image,ImageDraw
r=Path(__file__).resolve().parent/'evidence';(r/'review').mkdir(exist_ok=True)
for width in [320,375,768,1440]:
 for state in ['populated','empty','loading','error','edit']:
  scale=min(1,520/width);w,h=round(width*scale),round(1000*scale);sheet=Image.new('RGB',(3*w,h+30),'#e6e9ed');d=ImageDraw.Draw(sheet)
  for i,a in enumerate('ABC'):
   im=Image.open(r/f'screenshots/{a}-{width}x1000-{state}.png');assert im.size==(width,1000);d.text((i*w+10,8),f'{a} | {width} | {state}',fill='#202b39');sheet.paste(im.resize((w,h)),(i*w,30))
  sheet.save(r/f'review/{width}-{state}.png')
