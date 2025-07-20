import zipfile
import os

with zipfile.ZipFile('nova-landing.zip', 'r') as zip_ref:
    zip_ref.extractall('.')
    print("Files extracted successfully!")
    print("Contents:")
    for name in zip_ref.namelist()[:15]:
        print(f"  {name}")
