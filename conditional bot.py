while True:
    user = input("You: ").lower()
    if user == "bye":
        print("Chatbot: Goodbye!")
        
    elif "hello" in user or "hi" in user:
        print("Chatbot: Hi there!")
        
    elif "how are you" in user:
        print("Chatbot: I'm just code, but I'm doing great")
    
    elif "name" in user:
        print("Chatbot: My name is HealthBot.")
        
    elif "your name" in user:
        print("Chatbot: I'm a simple chatbot.")
    
    else:
        print("Chatbot: Sorry, I don't Understand.")
    