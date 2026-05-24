# 🛠️ Zenith Focus — Developer Extensions & Future Architecture Integration

This developer guide contains modular, production-ready code integration snippets to expand Zenith Focus from a standalone client-side SPA into a commercial-grade SaaS platform. 

---

## 🔐 1. Firebase / Auth0 Authentication Integration

To transition Zenith Focus to a cloud-synced account platform, replace the local avatar component and integrate user session flows.

### Integration Blueprint (HTML)
Add the Firebase SDK scripts into your header:
```html
<script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"></script>
```

### Integration Blueprint (JS)
Configure Firebase authentication and link session state into your `app.js`:
```javascript
// firebase-integration.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "zenith-focus.firebaseapp.com",
  projectId: "zenith-focus",
  storageBucket: "zenith-focus.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Function to handle login
function signInStudent() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      showToast('success', `Welcome, ${user.displayName}! Syncing database...`);
      loadStudentCloudState(user.uid);
    })
    .catch((error) => {
      showToast('error', `Authentication failed: ${error.message}`);
    });
}

// Function to listen to session shifts
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is logged in
    document.querySelector('.user-name').textContent = user.displayName;
    document.querySelector('.avatar-inner').innerHTML = `<img src="${user.photoURL}" style="width:100%; border-radius:50%">`;
    // Toggle active clouds syncing state
    document.querySelector('.status-label').textContent = "Cloud Sync Active";
  } else {
    // Guest Mode
    document.querySelector('.user-name').textContent = "Guest Student";
    document.querySelector('.avatar-inner').textContent = "GS";
    document.querySelector('.status-label').textContent = "Offline Storage Mode";
  }
});
```

---

## 🧠 2. Real-Time Gemini Pro AI API Integration

To swap the localized heuristic advisor with real-time dynamic LLM responses, set up an asynchronous gateway call.

### Node.js Serverless Gateway Endpoint (`/api/coach`)
```javascript
// api/coach.js (Vercel Serverless Function / Express route)
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { message, stats } = req.body;
  
  const prompt = `
    You are Aura, an elite student performance and cognitive wellness coach.
    Analyze the student's current performance metrics:
    - Subject: ${stats.subject}
    - Study Time: ${stats.productiveTime}m
    - Distraction Time: ${stats.distractedTime}m
    - Tab-Blur count: ${stats.blurCount}
    - Pomodoros completed: ${stats.pomoRounds}
    - Focus Score: ${stats.focusScore}/100
    - Burnout Index: ${stats.burnoutScore}/100
    
    Student's question: "${message}"
    
    Provide a professional, motivating, context-aware coaching response. Keep it concise, practical, and highly encouraging. 
    If Burnout Index is above 60, prioritize recommending stress relief exercises and breaks. Use markdown.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });
    
    res.status(200).json({ reply: response.text });
  } catch (error) {
    res.status(500).json({ error: "Gemini Engine Error: " + error.message });
  }
}
```

### Client Frontend Hook (`app.js`)
Replace the local AI advisor method with this async fetch call:
```javascript
async function fetchAuraCoachResponse(query, stats) {
  try {
    const response = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: query, stats })
    });
    const data = await response.json();
    return { reply: data.reply, action: null };
  } catch (error) {
    return { 
      reply: "Sorry, I lost connection to the Zenith servers. Using local backup: Let's do a guided breathing break to relax!", 
      action: "start-breathing" 
    };
  }
}
```

---

## 👥 3. Multiplayer Group Study & Accountability Rooms

Link students studying together in competitive study ecosystems (like JEE/NEET groups) using Socket.io.

### Server-Side Socket Controller (`server.js`)
```javascript
const io = require('socket.io')(httpServer, { cors: { origin: "*" } });

io.on('connection', (socket) => {
  socket.on('join-study-room', (roomId, studentData) => {
    socket.join(roomId);
    socket.to(roomId).emit('student-joined', studentData);
    
    socket.on('update-metrics', (metrics) => {
      socket.to(roomId).emit('peer-metrics-updated', {
        id: socket.id,
        name: studentData.name,
        metrics
      });
    });
  });
});
```

---

## 📱 4. Packaging Native iOS/Android Apps via CapacitorJS

To compile Zenith Focus into native mobile applications, setup Capacitor configurations:

1. **Initialize Capacitor**:
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init "Zenith Focus" "com.zenith.focus" --web-dir=dist
   ```
2. **Add Native Android & iOS Platforms**:
   ```bash
   npm install @capacitor/android @capacitor/ios
   npx cap add android
   npx cap add ios
   ```
3. **Build and Synchronize Code**:
   ```bash
   # Copy minified code to Android and iOS workspaces
   npx cap sync
   ```
4. **Compile & Debug**:
   - For Android: `npx cap open android` (Opens standard Android Studio)
   - For iOS: `npx cap open ios` (Opens Xcode)
