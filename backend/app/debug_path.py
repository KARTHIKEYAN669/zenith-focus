import os
basedir = os.path.dirname(os.path.abspath(__file__))
frontend_folder = os.path.join(basedir, '..', '..', 'frontend')
print(f"Base: {basedir}")
print(f"Frontend: {frontend_folder}")
print(f"Exists: {os.path.exists(frontend_folder)}")
print(f"Files: {os.listdir(frontend_folder) if os.path.exists(frontend_folder) else 'N/A'}")
