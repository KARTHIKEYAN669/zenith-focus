import g4f

def test_model(model):
    print(f"Testing model: {model}")
    try:
        response = g4f.ChatCompletion.create(
            model=model,
            messages=[{"role": "user", "content": "Say 'ok'"}],
        )
        print(f"SUCCESS {model}:", response)
        return True
    except Exception as e:
        print(f"FAILED {model}:", e)
        return False

models_to_test = ["gpt-3.5-turbo", "gpt-4", "gpt-4o", "llama-3-70b"]

for m in models_to_test:
    if test_model(m):
        print(f"--- {m} is working! ---")
    print("-" * 20)
