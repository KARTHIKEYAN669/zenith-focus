import re
html = open('frontend/presentation.html', encoding='utf-8').read()
ids = re.findall(r'id=["\'](.*?)["\']', html)
js_ids = re.findall(r'getElementById\([\'"](.*?)[\'"]\)', html)

missing = set(js_ids) - set(ids)
if missing:
    print("Missing IDs:", missing)
else:
    print("All GetElementById match an existing ID")
