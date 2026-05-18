import g4f

def test():
    try:
        response = g4f.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": "Say 'hello world' literally."}],
        )
        print("SUCCESS:", response)
    except Exception as e:
        print("FAILED:", e)

if __name__ == "__main__":
    test()
import g4f

def ai_fallback(user):
    try:
        response = g4f.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": user}],
        )
        return response
    except:
        return "AI service unavailable"