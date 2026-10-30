from PIL import Image
import os

img_path = r'C:\Users\USER\.gemini\antigravity-ide\brain\3d25ebe6-ee88-46b4-8eac-05b20efa0b3c\.user_uploaded\media_1793355653756.jpg'
out_dir = r'c:\Users\USER\Downloads\VLEARN-hari\Frontend\public\images'

img = Image.open(img_path)

# 1. Hero Workstation (Clean photo: x=525 to 1024, y=0 to 199)
hero = img.crop((525, 0, 1024, 199))
hero_up = hero.resize((hero.width * 2, hero.height * 2), Image.Resampling.LANCZOS)
hero_up.save(os.path.join(out_dir, 'academic-hero-workstation.jpg'), quality=95)

# 2. Card 01 - Full Stack (Clean monitor photo: x=240 to 346, y=242 to 415)
c1 = img.crop((240, 242, 346, 415))
c1_up = c1.resize((c1.width * 4, c1.height * 4), Image.Resampling.LANCZOS)
c1_up.save(os.path.join(out_dir, 'academic-fullstack.jpg'), quality=95)

# 3. Card 02 - Data Analytics (Clean analytics monitor photo: x=562 to 670, y=242 to 415)
c2 = img.crop((562, 242, 670, 415))
c2_up = c2.resize((c2.width * 4, c2.height * 4), Image.Resampling.LANCZOS)
c2_up.save(os.path.join(out_dir, 'academic-data-analytics.jpg'), quality=95)

# 4. Card 03 - Cloud & DevOps (Clean server racks photo: x=888 to 998, y=242 to 415)
c3 = img.crop((888, 242, 998, 415))
c3_up = c3.resize((c3.width * 4, c3.height * 4), Image.Resampling.LANCZOS)
c3_up.save(os.path.join(out_dir, 'academic-cloud-devops.jpg'), quality=95)

# 5. Card 04 - Cybersecurity (Clean security SOC terminal photo: x=240 to 346, y=426 to 598)
c4 = img.crop((240, 426, 346, 598))
c4_up = c4.resize((c4.width * 4, c4.height * 4), Image.Resampling.LANCZOS)
c4_up.save(os.path.join(out_dir, 'academic-cybersecurity.jpg'), quality=95)

# 6. Card 05 - AI & ML (Clean AI processor chip photo: x=555 to 670, y=426 to 598)
c5 = img.crop((555, 426, 670, 598))
c5_up = c5.resize((c5.width * 4, c5.height * 4), Image.Resampling.LANCZOS)
c5_up.save(os.path.join(out_dir, 'academic-ai-ml.jpg'), quality=95)

# 7. Card 06 - UI/UX Design (Clean designer workstation photo: x=875 to 998, y=426 to 598)
c6 = img.crop((875, 426, 998, 598))
c6_up = c6.resize((c6.width * 4, c6.height * 4), Image.Resampling.LANCZOS)
c6_up.save(os.path.join(out_dir, 'academic-uiux.jpg'), quality=95)

print("All clean assets extracted and upscaled successfully.")
