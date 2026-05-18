from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.void_elements = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}

    def handle_starttag(self, tag, attrs):
        if tag not in self.void_elements:
            self.stack.append((tag, self.getpos()))

    def handle_endtag(self, tag):
        if tag in self.void_elements:
            return
        
        if not self.stack:
            print(f"Error: Encountered closing tag </{tag}> at line {self.getpos()[0]} but stack is empty")
            return
        
        if self.stack[-1][0] == tag:
            self.stack.pop()
        else:
            print(f"Error: Mismatched tag at line {self.getpos()[0]}. Expected </{self.stack[-1][0]}>, got </{tag}>")
            # Pop until we match, or ignore if not found to avoid cascading errors
            found = False
            for i in range(len(self.stack)-1, -1, -1):
                if self.stack[i][0] == tag:
                    found = True
                    break
            if found:
                self.stack.pop(i)

parser = MyHTMLParser()
with open('c:/Users/karthikeyan/Desktop/Health & Wellness app/frontend/presentation.html', 'r', encoding='utf-8') as f:
    parser.feed(f.read())

if parser.stack:
    print("Unclosed tags:", parser.stack)
else:
    print("All tags matched correctly.")
