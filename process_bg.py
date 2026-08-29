import os
import sys
import time
from rembg import remove
from PIL import Image

src_dir = r"e:\xampp\htdocs\Sinthanai\src\data\faculty_images"
dst_dir = r"e:\xampp\htdocs\Sinthanai\public\faculty_images"

mapping = {
    'ARUNMAHARAJA E.jpg': 'arunmaharaja-e.jpg',
    'Ashwin Gurusamy.jpg': 'ashwing.jpg',
    'Lydia Mary S.jpg': 'mrslydia-mary.jpg',
    'Maruthupandi V.jpg': 'maruthupandi-v.jpg',
    'Preetha Krishnamoorthy.jpg': 'mrskpreetha.jpg',
    'Priya Dharshini.jpg': 'priyadharshini-r.jpg',
    'Rajesh S.jpg': 'rajesh-s.jpg',
    'Samuvel Rajappa.png': 'samuvel-rajappa-j.png',
    'Sankardayal.jpg': 'sankardayal-p.jpg',
    'Santhoshi M.jpg': 'santhoshi-m.jpg'
}

print("Starting AI background removal for faculty images...", flush=True)

for src_name, dst_name in mapping.items():
    src_path = os.path.join(src_dir, src_name)
    dst_path = os.path.join(dst_dir, dst_name)
    
    if not os.path.exists(src_path):
        print(f"Source missing: {src_name}", flush=True)
        continue
        
    try:
        print(f"Processing {src_name} -> {dst_name}...", flush=True)
        input_img = Image.open(src_path).convert('RGB')
        
        # Remove background using AI rembg u2net model
        output_rgba = remove(input_img)
        
        # Composite on crisp bright light studio backdrop (#FFFFFF)
        w, h = output_rgba.size
        bg_img = Image.new('RGBA', (w, h), (255, 255, 255, 255))
        final_rgba = Image.alpha_composite(bg_img, output_rgba)
        final_rgb = final_rgba.convert('RGB')
        
        if dst_name.endswith('.png'):
            final_rgb.save(dst_path, 'PNG')
        else:
            final_rgb.save(dst_path, 'JPEG', quality=98)
            
        print(f"SUCCESS: {dst_name}", flush=True)
    except Exception as e:
        print(f"ERROR on {src_name}: {e}", flush=True)

print("ALL_IMAGES_PROCESSED_SUCCESSFULLY", flush=True)
