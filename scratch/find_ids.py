import re
html = open('frontend/presentation.html', encoding='utf-8').read()
ids = re.findall(r'id=["\'](.*?)["\']', html)
print("IDs found:", [i for i in ids if "timer" in i])
