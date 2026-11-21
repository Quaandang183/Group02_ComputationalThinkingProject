import os
import shutil

# 1. Setup src/js structure
js_dirs = [
    'src/js/core',
    'src/js/services',
    'src/js/features',
    'src/js/components',
    'src/js/native'
]
for d in js_dirs:
    os.makedirs(d, exist_ok=True)

# 2. Setup root images structure
img_subdirs = [
    'images/avatar',
    'images/avatars',
    'images/background',
    'images/backgrounds',
    'images/destination',
    'images/destinations',
    'images/icons'
]
for d in img_subdirs:
    os.makedirs(d, exist_ok=True)

# Copy from src/images to root images
mapping = {
    'src/images/avatars': ['images/avatar', 'images/avatars'],
    'src/images/backgrounds': ['images/background', 'images/backgrounds'],
    'src/images/destinations': ['images/destination', 'images/destinations'],
    'src/images/icons': ['images/icons']
}

for src_folder, dest_folders in mapping.items():
    if os.path.exists(src_folder):
        for fname in os.listdir(src_folder):
            src_file = os.path.join(src_folder, fname)
            if os.path.isfile(src_file):
                for dest_dir in dest_folders:
                    dest_file = os.path.join(dest_dir, fname)
                    shutil.copy2(src_file, dest_file)

# Ensure src/images also has singular aliases (avatar, background, destination) if needed
src_aliases = {
    'src/images/avatars': 'src/images/avatar',
    'src/images/backgrounds': 'src/images/background',
    'src/images/destinations': 'src/images/destination'
}
for s_src, s_dest in src_aliases.items():
    if os.path.exists(s_src):
        os.makedirs(s_dest, exist_ok=True)
        for fname in os.listdir(s_src):
            src_file = os.path.join(s_src, fname)
            if os.path.isfile(src_file):
                shutil.copy2(src_file, os.path.join(s_dest, fname))

print("Images synced successfully between root and src/images!")
