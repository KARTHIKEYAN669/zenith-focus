from Conditional_Bot import process_command

print("TEST 1: No metrics")
res1 = process_command("check my burnout")
print(res1)
print("\n")

print("TEST 2: Good metrics")
res2 = process_command("Check burnout: 4 hours sleep, 12 hours work, feeling stressed")
print(res2)
print("\n")

print("TEST 3: Fine metrics")
res3 = process_command("Check burnout: 8 hours sleep, 8 hours work, feeling happy")
print(res3)
print("\n")
