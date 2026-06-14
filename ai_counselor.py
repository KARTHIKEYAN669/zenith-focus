import os
import base64
import io
from PIL import Image
import google.generativeai as genai

# Setup Gemini API configuration
api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    gemini_available = True
else:
    gemini_available = False

def query_ai_counselor(prompt: str) -> str:
    """
    Sends a message to the Gemini counselor, acting as an empathetic academic coach.
    Falls back to a structured rule-based mock response if no API key is set.
    """
    if not gemini_available:
        return get_mock_counselor_response(prompt)
    
    try:
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=(
                "You are Zenith Focus, a highly empathetic, encouraging, and expert academic counselor. "
                "You speak directly to stressed JEE/NEET aspirants. Your goal is to guide them, help them manage test anxiety, "
                "combat imposter syndrome, handle burnout, and maintain highly efficient study habits. "
                "Keep your tone supportive, clinical yet warm (like a caring mentor). "
                "Never give incorrect academic formulas or answers. If a student asks an academic question, "
                "provide a clear conceptual answer but always tie it back to encouraging healthy study habits, "
                "taking structured breaks, and avoiding all-nighters."
            )
        )
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error connecting to Gemini API: {str(e)}. Fallback counselor response:\n\n" + get_mock_counselor_response(prompt)

def solve_doubt_ocr(image_base64: str) -> str:
    """
    Multimodal Doubt Solver. Decodes base64 image and queries Gemini to identify
    the JEE/NEET problem and provide a step-by-step markdown solution.
    """
    if not gemini_available:
        return get_mock_doubt_solution()
    
    try:
        # Extract base64 image payload
        if "," in image_base64:
            header, base64_data = image_base64.split(",", 1)
        else:
            base64_data = image_base64
            
        image_bytes = base64.b64decode(base64_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = (
            "You are an expert tutor for JEE (Joint Entrance Examination) and NEET (National Eligibility cum Entrance Test). "
            "Look at this uploaded image containing a science/math problem, textbook page, or diagram. "
            "Please perform OCR and conceptual analysis:\n"
            "1. State the identified question clearly.\n"
            "2. Break down the solution step-by-step with clear scientific explanations, intermediate equations, and final answers.\n"
            "3. State the core concept or formula used.\n"
            "4. Provide a 'Common Pitfall' or tips for solving similar questions under time pressure in JEE/NEET.\n"
            "Format the response using clean, beautiful markdown."
        )
        response = model.generate_content([prompt, image])
        return response.text
    except Exception as e:
        return f"Error processing image with Gemini API: {str(e)}. Fallback OCR doubt solver response:\n\n" + get_mock_doubt_solution()

# --- Fallback Mock Responses ---

def get_mock_counselor_response(prompt: str) -> str:
    prompt_lower = prompt.lower()
    
    if "stress" in prompt_lower or "anxious" in prompt_lower or "anxiety" in prompt_lower or "fear" in prompt_lower:
        return (
            "I hear you, and it is completely understandable to feel this way. The pressure of JEE/NEET can be overwhelming. "
            "Please remember: **Your mock scores or exam ranks do not define your intelligence or value as a person.**\n\n"
            "Here is a quick resilience strategy we can try together:\n"
            "1. **Pause your studies**: Close your eyes and focus on your breathing.\n"
            "2. **Somatic Reset**: Go to our **Health tab** and run the 2-minute breathing bubble exercise. It will help lower your cortisol immediately.\n"
            "3. **Break it down**: Instead of thinking about the entire syllabus, list just *one* small topic you want to revise next. Keep it under 25 minutes.\n\n"
            "Take care of your health first. A healthy brain performs 40% better on test day!"
        )
    elif "burnout" in prompt_lower or "tired" in prompt_lower or "exhausted" in prompt_lower or "sleep" in prompt_lower:
        return (
            "It sounds like you are hitting a wall. Burnout is your body's way of saying: 'I need to recharge.'\n\n"
            "To combat this, please follow these guidelines:\n"
            "- **Prioritize Sleep**: Sleep is where memory consolidation happens. If you sleep less than 6 hours, your brain struggles to recall formulas.\n"
            "- **The 50-10 Rule**: Study for 50 minutes, then stand up, walk, stretch, or drink water for 10 minutes. Do not check social media during this break.\n"
            "- **Mindfulness**: Take a look at the Digital Cognitive Behavioral Therapy (CBT) modules in the health section to re-frame negative thoughts.\n\n"
            "You are running a marathon, not a sprint. Pace yourself!"
        )
    elif "mock" in prompt_lower or "score" in prompt_lower or "test" in prompt_lower or "low" in prompt_lower:
        return (
            "Low mock scores are actually highly valuable diagnostic tools, not verdicts! Every mistake you make now is one less mistake you will make on the actual exam.\n\n"
            "Here is how to analyze a low score:\n"
            "- **Did you make silly calculation errors?** (Slow down by 10 seconds per problem).\n"
            "- **Was it a conceptual gap?** (Mark it in your revision binder).\n"
            "- **Was it a time-management issue?** (Practice section-wise timed quizzes).\n\n"
            "Let's turn the anxiety into action. Let's start a 25-minute Pomodoro study block right now on your weakest topic!"
        )
    else:
        return (
            "Welcome to Zenith Focus. I am your academic counselor. How are you feeling today?\n\n"
            "Whether you want to discuss a study schedule, deal with organic chemistry anxiety, or learn how to sleep better before mock exams, "
            "I am here to guide you. What is on your mind?"
        )

def get_mock_doubt_solution() -> str:
    return """### 🔬 Multimodal Doubt Solver Output (Simulated OCR)
*(Gemini API offline or key unconfigured - displaying example solution)*

**Identified Subject:** JEE Physics - Mechanics (Frictional Forces)

---

#### **Question:**
A $2\\text{ kg}$ block is resting on a rough horizontal deck with static friction coefficient $\\mu_s = 0.5$ and kinetic friction coefficient $\\mu_k = 0.4$. A horizontal force $F = 8\\text{ N}$ is applied to the block. Calculate the force of friction acting on the block. (Take $g = 10\\text{ m/s}^2$).

---

#### **Step-by-Step Solution:**

##### **Step 1: Calculate the Normal Force ($N$)**
Since the deck is horizontal and there is no vertical acceleration:
$$N = m \\cdot g$$
$$N = 2\\text{ kg} \\times 10\\text{ m/s}^2 = 20\\text{ N}$$

##### **Step 2: Determine Maximum Static Friction ($f_{s,\\text{max}}$)**
This is the threshold force required to initiate motion:
$$f_{s,\\text{max}} = \\mu_s \\cdot N$$
$$f_{s,\\text{max}} = 0.5 \\times 20\\text{ N} = 10\\text{ N}$$

##### **Step 3: Compare Applied Force ($F$) with $f_{s,\\text{max}}$**
- Applied force $F = 8\\text{ N}$.
- Maximum static friction threshold $f_{s,\\text{max}} = 10\\text{ N}$.
- Since $F < f_{s,\\text{max}}$ ($8\\text{ N} < 10\\text{ N}$), the applied force is insufficient to overcome friction. The block **remains stationary** (acceleration $a = 0\\text{ m/s}^2$).

##### **Step 4: Determine Actual Frictional Force ($f$)**
For a stationary block, static friction is self-adjusting and matches the applied force to prevent motion:
$$f = F = 8\\text{ N}$$

**Final Answer:** The force of friction acting on the block is **$8\\text{ N}$** (directed opposite to the applied force).

---

#### **⚠️ JEE/NEET Pitfall Alert:**
Many students calculate static friction as $\\mu_s \\cdot N = 10\\text{ N}$ and write it as the answer. However, if the friction force was $10\\text{ N}$ while the applied force was only $8\\text{ N}$, the net force would pull the block backwards without any active force! Remember that static friction is **always equal to the force applied** until it hits its maximum limit ($f_{s,\\text{max}}$).
"""
