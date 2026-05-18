import re

def check_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    js_code_match = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
    if not js_code_match:
        print("No <script> tag found")
        return
    
    js = js_code_match.group(1)
    
    stack = []
    lines = js.split('\n')
    for i, line in enumerate(lines):
        line_num = i + 1
        for j, char in enumerate(line):
            if char in "({[":
                stack.append((char, line_num))
            elif char in ")}]":
                if not stack:
                    print(f"Unmatched {char} at line {line_num}")
                else:
                    top_char, top_line = stack.pop()
                    if (char == ')' and top_char != '(') or \
                       (char == '}' and top_char != '{') or \
                       (char == ']' and top_char != '['):
                        print(f"Mismatched {char} at line {line_num}, expected match for {top_char} from line {top_line}")

    if stack:
        print("Unclosed braces/brackets/parens:")
        for char, line in stack:
            print(f"- {char} from line {line}")
    else:
        print("All braces matched!")

check_html(r'c:\Users\karthikeyan\Desktop\Health & Wellness app\frontend\presentation.html')
