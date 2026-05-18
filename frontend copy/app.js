const micBtn = document.getElementById('mic-btn');
const transcriptPreview = document.getElementById('transcript-preview');
const chatBox = document.getElementById('chat-box');
const textInput = document.getElementById('text-input');
const sendBtn = document.getElementById('send-btn');
const attachmentTrigger = document.getElementById('attachment-trigger');
const fileInput = document.getElementById('file-input');
const attachmentShelf = document.getElementById('attachment-shelf');

// Localization Dictionary
const i18n = {
    en: {
        tab_health: "Health",
        tab_library: "Library",
        tab_settings: "Setting",
        devices_title: "Connected Devices",
        searching_watch: "Searching for Watch...",
        scanning_bt: "Scanning Bluetooth...",
        searching_mobile: "Searching for Mobile...",
        scanning_wifi: "Scanning WiFi...",
        focus_guardian: "Focus Guardian Level",
        tracker_title: "Daily Tracker",
        steps: "Steps",
        mood: "Mood",
        sleep: "Sleep (hrs)",
        work: "Work (hrs)",
        screen: "Screen (hrs)",
        tasks: "Tasks",
        placeholder_task: "Add new task...",
        burnout_title: "Burnout Risk",
        low_risk: "Low Risk",
        suggestions: "Active Suggestions",
        library_title: "Digital Library",
        empty_lib: "No files uploaded yet.",
        settings_lang_title: "Language Preference",
        settings_lang_desc: "Choose how Jarvis communicates with you.",
        system_status: "System Status",
        ai_engine: "AI Engine",
        online: "Online",
        memory: "Memory",
        optimal: "Optimal",
        ready: "Ready",
        title_attach: "Attach Files",
        placeholder_chat: "Message Nexus AI...",
        speech_status: "Speech Status",
        smart_mode: "Smart Mode",
        analyze_btn: "Analyze with AI",
        stress_productivity: "Stress & Productivity",
        productivity: "Productivity",
        stress_level: "Stress Level",
        hero_title: "AI Powered Burnout Prediction & Recovery System",
        speech_enabled: "🔊 Enabled",
        mood_happy: "😊 Happy",
        mood_fine: "😐 Fine",
        mood_stressed: "😫 Stressed",
        library_archives: "Archives & History",
        lib_tab_assets: "Assets",
        lib_tab_history: "Chat History",
        btn_apply_sync: "💾 Apply & Sync Settings",
        manual_sync_title: "Manual Sync",
        early_warning_title: "Early Warning System",
        early_warning_desc: "Monitor micro-stressors and receive preemptive alerts.",
        warning_active: "Detection Active",
        warning_inactive: "Detection Inactive",
        recovery_system_title: "Personalized Recovery System",
        recovery_system_desc: "Tailor AI recovery suggestions to your specific stress factors.",
        recovery_active: "System Enabled",
        recovery_inactive: "System Disabled",
        cardiac_prediction_title: "Cardiac AI Prediction"
    },
    ta: {
        tab_health: "சுகாதாரம்",
        tab_library: "நூலகம்",
        tab_settings: "AI சாட்பாட்",
        devices_title: "இணைக்கப்பட்ட சாதனங்கள்",
        searching_watch: "கடிகாரத்தைத் தேடுகிறது...",
        scanning_bt: "புளூடூத் ஸ்கேன் செய்கிறது...",
        searching_mobile: "மொபைலைத் தேடுகிறது...",
        scanning_wifi: "வைஃபை ஸ்கேன் செய்கிறது...",
        focus_guardian: "கவனப் பாதுகாப்பு நிலை",
        tracker_title: "தினசரி கண்காணிப்பு",
        steps: "படிகள்",
        mood: "மனநிலை",
        sleep: "தூக்கம் (மணி)",
        work: "வேலை (மணி)",
        screen: "திரை (மணி)",
        tasks: "பணிகள்",
        placeholder_task: "புதிய பணியைச் சேர்க்கவும்...",
        burnout_title: "மன அழுத்த சோர்வு",
        low_risk: "குறைந்த அபாயம்",
        suggestions: "செயலில் உள்ள பரிந்துரைகள்",
        library_title: "டிஜிட்டல் நூலகம்",
        empty_lib: "இன்னும் கோப்புகள் பதிவேற்றப்படவில்லை.",
        settings_lang_title: "மொழி விருப்பம்",
        settings_lang_desc: "ஜார்விஸ் உங்களுடன் எப்படி தொடர்பு கொள்கிறார் என்பதைத் தேர்வு செய்யவும்.",
        system_status: "சிஸ்டம் நிலை",
        ai_engine: "AI இயந்திரம்",
        online: "ஆன்லைன்",
        memory: "நினைவகம்",
        optimal: "சிறப்பானது",
        ready: "தயார்",
        title_attach: "கோப்புகளை இணைக்கவும்",
        placeholder_chat: "நெக்ஸஸ் AI-க்கு செய்தி அனுப்பவும்...",
        speech_status: "குரல் நிலை",
        smart_mode: "ஸ்மார்ட் பயன்முறை",
        analyze_btn: "AI மூலம் பகுப்பாய்வு செய்",
        stress_productivity: "மன அழுத்தம் & உற்பத்தித்திறன்",
        productivity: "உற்பத்தித்திறன்",
        stress_level: "மன அழுத்த நிலை",
        hero_title: "AI உதவியாளர் சோர்வு கணிப்பு & மீட்பு அமைப்பு",
        speech_enabled: "🔊 இயக்கப்பட்டது",
        mood_happy: "😊 மகிழ்ச்சி",
        mood_fine: "😐 நன்று",
        mood_stressed: "😫 அழுத்தம்",
        library_archives: "காப்பகங்கள் & வரலாறு",
        lib_tab_assets: "சொத்துக்கள்",
        lib_tab_history: "அரட்டை வரலாறு",
        btn_apply_sync: "💾 அமைப்புகளைச் சேமி",
        manual_sync_title: "கையேடு ஒத்திசைவு",
        early_warning_title: "முன்கூட்டிய எச்சரிக்கை அமைப்பு",
        early_warning_desc: "நுண்-அழுத்தங்களை கண்காணித்து முன்கூட்டியே விழிப்பூட்டல்களை பெறுக.",
        warning_active: "கண்டறிதல் செயலில் உள்ளது",
        warning_inactive: "கண்டறிதல் முடக்கப்பட்டது",
        recovery_system_title: "தனிப்பயனாக்கப்பட்ட மீட்பு அமைப்பு",
        recovery_system_desc: "உங்கள் குறிப்பிட்ட அழுத்த காரணிகளுக்கு ஏற்ப AI மீட்பு பரிந்துரைகளை வழங்குங்கள்.",
        recovery_active: "அமைப்பு செயலில் உள்ளது",
        recovery_inactive: "அமைப்பு முடக்கப்பட்டுள்ளது",
        cardiac_prediction_title: "இதய AI கணிப்பு"
    }
};

let currentLang = 'en';

function getUILanguage(pref) {
    // For UI translation: 'bi' defaults to English, 'ta' => Tamil, 'en' => English
    if (pref === 'ta') return 'ta';
    return 'en';
}

function applyLanguage(pref) {
    const lang = getUILanguage(pref);
    currentLang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang] && i18n[lang][key]) el.textContent = i18n[lang][key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (i18n[lang] && i18n[lang][key]) el.placeholder = i18n[lang][key];
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (i18n[lang] && i18n[lang][key]) el.title = i18n[lang][key];
    });

    // Update mood dropdown options
    const moodSelect = document.getElementById('mood-select');
    if (moodSelect) {
        const options = moodSelect.querySelectorAll('option');
        if (options[0]) options[0].textContent = i18n[lang].mood_happy;
        if (options[1]) options[1].textContent = i18n[lang].mood_fine;
        if (options[2]) options[2].textContent = i18n[lang].mood_stressed;
    }

    // Update HTML lang attribute
    document.documentElement.lang = lang === 'ta' ? 'ta' : 'en';
}

// Language is now controlled exclusively by the Settings preference.
document.querySelectorAll('.lang-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        localStorage.setItem('nexus-lang-pref', lang);

        // Update UI buttons
        document.querySelectorAll('.lang-select-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        applyLanguage(lang);

        // Notification
        const msg = lang === 'ta' ? "மொழி மாற்றப்பட்டது: தமிழ்" : "Language changed: English";
        transcriptPreview.innerText = msg;
        setTimeout(() => { transcriptPreview.innerText = "Ready"; }, 2000);
    });
});

let selectedFiles = [];

// Setup Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
} else {
    transcriptPreview.innerText = "Speech Recognition API not supported in this browser.";
}

let isListening = false;

function addMessage(text, sender, attachments = []) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    const bubbleDiv = document.createElement('div');
    bubbleDiv.classList.add('bubble');

    if (text) {
        // Detect Visual Components
        const heartRiskMatch = text.match(/\[VISUAL:HEART_RISK\|(\d+)%\]/);
        const heartInputMatch = text.includes("[VISUAL:HEART_INPUT]");

        let cleanText = text;
        let riskValue = 0;

        if (heartRiskMatch) {
            riskValue = parseInt(heartRiskMatch[1]);
            cleanText = text.replace(heartRiskMatch[0], "").trim();
        }
        if (heartInputMatch) {
            cleanText = text.replace("[VISUAL:HEART_INPUT]", "").trim();
        }

        const textSpan = document.createElement('div');
        textSpan.style.display = 'inline-block';
        textSpan.innerText = cleanText;
        bubbleDiv.appendChild(textSpan);

        if (heartRiskMatch) {
            const riskCard = document.createElement('div');
            riskCard.className = 'heart-risk-card';

            const colorClass = riskValue < 30 ? 'risk-low' : (riskValue < 70 ? 'risk-med' : 'risk-high');
            const heartColor = riskValue < 30 ? '#10b981' : (riskValue < 70 ? '#f59e0b' : '#ef4444');
            const pulseSpeed = riskValue < 30 ? '2s' : (riskValue < 70 ? '1s' : '0.5s');

            riskCard.innerHTML = `
                <div class="scanning-line"></div>
                <div class="heart-risk-title">CARDIAC DIAGNOSTIC REPORT</div>
                
                <div class="pictorial-heart-container" style="--heart-color: ${heartColor}; --pulse-speed: ${pulseSpeed}">
                    <div class="heart-glow"></div>
                    <svg class="main-heart-svg" viewBox="0 0 24 24" fill="${heartColor}">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <div class="risk-overlay-text">${riskValue}%</div>
                </div>

                <div class="heart-risk-info">
                    <div class="heart-risk-desc">
                        SYSTEM ANALYSIS INDICATES: <strong class="${colorClass}">${riskValue < 30 ? 'STABLE' : (riskValue < 70 ? 'ELEVATED RISK' : 'CRITICAL WARNING')}</strong>
                    </div>
                </div>
            `;
            bubbleDiv.appendChild(riskCard);
        }

        if (heartInputMatch) {
            const inputContainer = document.createElement('div');
            inputContainer.className = 'heart-input-system';
            inputContainer.innerHTML = `
                <h4>Health Scan Parameters</h4>
                <div class="heart-input-grid">
                    <div class="heart-field"><label>Age</label><input type="number" id="h-age" value="45"></div>
                    <div class="heart-field"><label>Sex</label><select id="h-sex"><option value="1">Male</option><option value="0">Female</option></select></div>
                    <div class="heart-field"><label>Chest Pain (0-3)</label><input type="number" id="h-cp" min="0" max="3" value="0"></div>
                    <div class="heart-field"><label>Resting BP</label><input type="number" id="h-bp" value="120"></div>
                    <div class="heart-field"><label>Cholesterol</label><input type="number" id="h-chol" value="200"></div>
                    <div class="heart-field"><label>Sugar > 120</label><select id="h-fbs"><option value="0">No</option><option value="1">Yes</option></select></div>
                    <div class="heart-field"><label>Rest ECG (0-2)</label><input type="number" id="h-ecg" min="0" max="2" value="0"></div>
                    <div class="heart-field"><label>Max Heart Rate</label><input type="number" id="h-rate" value="150"></div>
                    <div class="heart-field"><label>Exercise Angina</label><select id="h-exang"><option value="0">No</option><option value="1">Yes</option></select></div>
                    <div class="heart-field"><label>Oldpeak (ST)</label><input type="number" step="0.1" id="h-oldpeak" value="1.0"></div>
                    <div class="heart-field"><label>Slope (0-2)</label><input type="number" id="h-slope" min="0" max="2" value="1"></div>
                    <div class="heart-field"><label>Vessels (0-3)</label><input type="number" id="h-ca" min="0" max="3" value="0"></div>
                    <div class="heart-field" style="grid-column: span 2"><label>Thal (1-3)</label><input type="number" id="h-thal" min="1" max="3" value="2"></div>
                    <button class="heart-submit-btn" id="h-submit">INITIALIZE CARDIAC SCAN</button>
                </div>
            `;

            inputContainer.querySelector('#h-submit').onclick = () => {
                const values = [
                    document.getElementById('h-age').value,
                    document.getElementById('h-sex').value,
                    document.getElementById('h-cp').value,
                    document.getElementById('h-bp').value,
                    document.getElementById('h-chol').value,
                    document.getElementById('h-fbs').value,
                    document.getElementById('h-ecg').value,
                    document.getElementById('h-rate').value,
                    document.getElementById('h-exang').value,
                    document.getElementById('h-oldpeak').value,
                    document.getElementById('h-slope').value,
                    document.getElementById('h-ca').value,
                    document.getElementById('h-thal').value
                ];
                const msg = values.join(",");
                inputContainer.style.opacity = "0.5";
                inputContainer.style.pointerEvents = "none";
                sendToServer(`Heart prediction for these metrics: ${msg}`);
            };

            bubbleDiv.appendChild(inputContainer);
        }

        // Add Replay button for bot messages
        if (sender === 'bot') {
            const replayBtn = document.createElement('button');
            replayBtn.className = 'speech-replay-btn';
            replayBtn.title = "Replay Voice";
            replayBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>`;
            replayBtn.onclick = (e) => {
                e.stopPropagation();
                speakJarvis(cleanText);
            };
            bubbleDiv.appendChild(replayBtn);
        }
    }

    if (attachments && attachments.length > 0) {
        const mediaDiv = document.createElement('div');
        mediaDiv.classList.add('message-media');

        attachments.forEach(file => {
            const isImage = file.type?.startsWith('image/') || file.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
            const isVideo = file.type?.startsWith('video/') || file.url?.match(/\.(mp4|webm|ogg)$/i);

            if (isImage || isVideo) {
                const thumb = document.createElement('div');
                thumb.classList.add('media-thumbnail');
                const mediaElement = document.createElement(isImage ? 'img' : 'video');
                mediaElement.src = file.url || URL.createObjectURL(file);
                if (isVideo) {
                    mediaElement.controls = true;
                    mediaElement.autoplay = true;
                    mediaElement.muted = true;
                    mediaElement.loop = true;
                    mediaElement.playsInline = true;
                }

                // Make chat attachments clickable for full preview
                thumb.style.cursor = 'pointer';
                thumb.onclick = () => openMediaPreview(file);

                thumb.appendChild(mediaElement);
                mediaDiv.appendChild(thumb);
            } else {
                const link = document.createElement('a');
                link.classList.add('media-file-link');
                link.href = 'javascript:void(0)';
                link.onclick = () => openMediaPreview(file);
                link.innerHTML = `<span>📁</span> <span>${file.name}</span>`;
                mediaDiv.appendChild(link);
            }
        });
        bubbleDiv.appendChild(mediaDiv);
    }

    msgDiv.appendChild(bubbleDiv);
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Synchronize library after upload
async function sendToServer(text, files = []) {
    transcriptPreview.innerText = "Thinking...";
    try {
        let body;
        let headers = {};

        // Handle pre-existing library files (objects with .url) vs new Files
        const newFiles = files.filter(f => f instanceof File);
        const existingFiles = files.filter(f => !(f instanceof File));

        const warningEnabled = localStorage.getItem('nexus-warning-enabled') === 'true';
        const recoveryEnabled = localStorage.getItem('nexus-recovery-enabled') === 'true';
        const langPref = localStorage.getItem('nexus-lang-pref') || 'en';

        if (newFiles.length > 0 || existingFiles.length > 0) {
            body = new FormData();
            body.append('text', text);
            body.append('warning_enabled', warningEnabled);
            body.append('recovery_enabled', recoveryEnabled);
            body.append('language_pref', langPref);
            newFiles.forEach(f => body.append('files', f));
            if (existingFiles.length > 0) {
                body.append('existing_files', JSON.stringify(existingFiles));
            }
        } else {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify({
                text: text,
                warning_enabled: warningEnabled,
                recovery_enabled: recoveryEnabled,
                language_pref: langPref
            });
        }

        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: headers,
            body: body
        });
        const data = await res.json();

        addMessage(data.reply, 'bot');
        updateHealthMetrics(data.reply);

        // Speak automatically if enabled in Settings
        if (isSpeechEnabled()) {
            speakJarvis(data.reply);
        }

        transcriptPreview.innerText = "Ready";

        if (newFiles.length > 0) loadLibrary();

    } catch (err) {
        addMessage("Sorry, I couldn't reach the server.", 'bot');
        transcriptPreview.innerText = "Connection error";
    }
}

function speakJarvis(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    window._currentUtterance = utterance; // Prevent garbage collection bug

    // Choose a premium sounding voice if available (e.g. Google UK Female/US Female)
    let voices = synth.getVoices();
    let preferredVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Samantha"));
    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

    // Animate the status indicator while speaking
    const indicator = document.querySelector('.status-indicator');
    indicator.style.background = "#3b82f6";
    indicator.style.boxShadow = "0 0 10px #3b82f6";

    utterance.onend = () => {
        indicator.style.background = "#22c55e";
        indicator.style.boxShadow = "0 0 10px #22c55e";
    };

    synth.speak(utterance);
}

if (recognition) {
    recognition.onstart = () => {
        isListening = true;
        micBtn.classList.add('listening');
        transcriptPreview.innerText = "Listening...";
        // stop active speaking
        window.speechSynthesis.cancel();
    };

    recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        transcriptPreview.innerText = transcript;
    };

    recognition.onerror = (event) => {
        isListening = false;
        micBtn.classList.remove('listening');
        if (event.error === 'not-allowed') {
            transcriptPreview.innerText = "Please go to browser settings to turn on the microphone.";
        } else {
            transcriptPreview.innerText = "Mic error: " + event.error;
        }
    };

    recognition.onend = () => {
        isListening = false;
        micBtn.classList.remove('listening');

        const finalTranscript = transcriptPreview.innerText;
        if (finalTranscript && finalTranscript !== "Listening..." && finalTranscript !== "Ready" && finalTranscript !== "Thinking...") {
            addMessage(finalTranscript, 'user');
            sendToServer(finalTranscript);
        } else {
            transcriptPreview.innerText = "Ready";
        }
    };

    micBtn.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });

    // Ensure voices are loaded
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}

// Attachment Logic
attachmentTrigger.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
    const files = Array.from(fileInput.files);
    selectedFiles = [...selectedFiles, ...files];
    renderPreviews();
    fileInput.value = ''; // Reset for next selection
});

function renderPreviews() {
    if (selectedFiles.length === 0) {
        attachmentShelf.style.display = 'none';
        attachmentShelf.innerHTML = '';
        return;
    }

    attachmentShelf.style.display = 'flex';
    attachmentShelf.innerHTML = '';

    selectedFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.classList.add('attachment-item');

        const removeBtn = document.createElement('button');
        removeBtn.classList.add('remove-btn');
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => {
            selectedFiles.splice(index, 1);
            renderPreviews();
        };
        item.appendChild(removeBtn);

        const isImage = file.type?.startsWith('image/') || file.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        const isVideo = file.type?.startsWith('video/') || file.name?.match(/\.(mp4|webm|ogg)$/i);

        if (isImage) {
            const img = document.createElement('img');
            img.src = file.url || URL.createObjectURL(file);
            item.appendChild(img);
        } else if (isVideo) {
            const video = document.createElement('video');
            video.src = file.url || URL.createObjectURL(file);
            item.appendChild(video);
        } else {
            const icon = document.createElement('div');
            icon.classList.add('file-icon');
            icon.innerText = '📄';
            item.appendChild(icon);
        }

        attachmentShelf.appendChild(item);
    });
}

// Sidebar Tab Switching
const tabHealth = document.getElementById('tab-health');
const tabLibrary = document.getElementById('tab-library');
const tabSettings = document.getElementById('tab-settings');
const contentHealth = document.getElementById('content-health');
const contentLibrary = document.getElementById('content-library');
const contentSettings = document.getElementById('content-settings');

if (tabHealth && tabLibrary && tabSettings) {
    const tabs = [tabHealth, tabLibrary, tabSettings];
    const contents = [contentHealth, contentLibrary, contentSettings];

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', async () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.style.display = 'none');
            tab.classList.add('active');
            contents[index].style.display = 'flex';
            contents[index].style.flexDirection = 'column';

            // Execute Preprocessing for the selected tab
            if (tab === tabHealth) await preprocessHealth();
            if (tab === tabLibrary) await preprocessLibrary();
            if (tab === tabSettings) await preprocessSettings();

            // On mobile, ensure the content is scrolled into view
            if (window.innerWidth <= 768) {
                contents[index].scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}


const speechToggleBtn = document.getElementById('speech-toggle-btn');
const headerSpeechBtn = document.getElementById('header-speech-btn');
const speechStatusText = document.getElementById('speech-status-text');
const testVoiceBtn = document.getElementById('test-voice-btn');

function toggleSpeech() {
    const isActive = speechToggleBtn.classList.toggle('active');
    headerSpeechBtn?.classList.toggle('active', isActive);

    const icon = speechToggleBtn.querySelector('.v-icon');
    const hIcon = headerSpeechBtn?.querySelector('.v-icon');

    if (isActive) {
        if (icon) icon.innerText = "🔊";
        if (hIcon) hIcon.innerText = "🔊";
        if (speechStatusText) speechStatusText.innerText = "Voice Enabled";
        localStorage.setItem('nexus-speech-enabled', 'true');
    } else {
        if (icon) icon.innerText = "🔇";
        if (hIcon) hIcon.innerText = "🔇";
        if (speechStatusText) speechStatusText.innerText = "Voice Muted";
        localStorage.setItem('nexus-speech-enabled', 'false');
        window.speechSynthesis.cancel();
    }
}

if (speechToggleBtn) {
    speechToggleBtn.addEventListener('click', toggleSpeech);
}
if (headerSpeechBtn) {
    headerSpeechBtn.addEventListener('click', toggleSpeech);
}

if (testVoiceBtn) {
    testVoiceBtn.addEventListener('click', () => {
        const currentPref = getLanguagePref();
        const testText = currentPref === 'ta' ? "வணக்கம், நான் ஜார்விஸ். உங்கள் குரல் அமைப்பு சரியாக உள்ளது." :
            (currentPref === 'bi' ? "Hello, I am Jarvis. --- வணக்கம், நான் ஜார்விஸ்." :
                "Hello, I am Jarvis. Your voice settings are working correctly.");
        speakJarvis(testText);
    });
}

// Early Warning Detection Toggle
const warningToggleBtn = document.getElementById('warning-toggle-btn');
const warningStatusText = document.getElementById('warning-status-text');

if (warningToggleBtn) {
    warningToggleBtn.addEventListener('click', () => {
        const isActive = warningToggleBtn.classList.toggle('active');
        const icon = warningToggleBtn.querySelector('.v-icon');
        const lang = getUILanguage(localStorage.getItem('nexus-lang-pref') || 'en');

        if (isActive) {
            icon.innerText = "🛡️";
            warningStatusText.innerText = i18n[lang].warning_active;
            localStorage.setItem('nexus-warning-enabled', 'true');
        } else {
            icon.innerText = "🛑";
            warningStatusText.innerText = i18n[lang].warning_inactive;
            localStorage.setItem('nexus-warning-enabled', 'false');
        }
    });

    // Load saved preference
    const savedWarning = localStorage.getItem('nexus-warning-enabled');
    if (savedWarning === 'false') {
        warningToggleBtn.classList.remove('active');
        warningToggleBtn.querySelector('.v-icon').innerText = "🛑";
        // Let the applyLanguage function handle the text on load if possible, 
        // but set it initially here just in case:
        warningStatusText.innerText = i18n[getUILanguage(localStorage.getItem('nexus-lang-pref') || 'en')].warning_inactive;
    }
}

// Personalized Recovery System Toggle
const recoveryToggleBtn = document.getElementById('recovery-toggle-btn');
const recoveryStatusText = document.getElementById('recovery-status-text');

if (recoveryToggleBtn) {
    recoveryToggleBtn.addEventListener('click', () => {
        const isActive = recoveryToggleBtn.classList.toggle('active');
        const icon = recoveryToggleBtn.querySelector('.v-icon');
        const lang = getUILanguage(localStorage.getItem('nexus-lang-pref') || 'en');

        if (isActive) {
            icon.innerText = "🌱";
            recoveryStatusText.innerText = i18n[lang].recovery_active;
            localStorage.setItem('nexus-recovery-enabled', 'true');
        } else {
            icon.innerText = "🥀";
            recoveryStatusText.innerText = i18n[lang].recovery_inactive;
            localStorage.setItem('nexus-recovery-enabled', 'false');
        }
    });

    // Load saved preference
    const savedRecovery = localStorage.getItem('nexus-recovery-enabled');
    if (savedRecovery === 'false') {
        recoveryToggleBtn.classList.remove('active');
        recoveryToggleBtn.querySelector('.v-icon').innerText = "🥀";
        // Let the applyLanguage function handle the text on load
        recoveryStatusText.innerText = i18n[getUILanguage(localStorage.getItem('nexus-lang-pref') || 'en')].recovery_inactive;
    }
}



applyLanguage('en');

const savedSpeech = localStorage.getItem('nexus-speech-enabled');
if (savedSpeech === 'false' && speechToggleBtn) {
    speechToggleBtn.classList.remove('active');
    headerSpeechBtn?.classList.remove('active');
    if (speechToggleBtn.querySelector('.v-icon')) speechToggleBtn.querySelector('.v-icon').innerText = "🔇";
    if (headerSpeechBtn?.querySelector('.v-icon')) headerSpeechBtn.querySelector('.v-icon').innerText = "🔇";
    if (speechStatusText) speechStatusText.innerText = "Voice Muted";
} else if (headerSpeechBtn) {
    headerSpeechBtn.classList.add('active');
}



function getLanguagePref() {
    return localStorage.getItem('nexus-lang-pref') || 'en';
}

function isSpeechEnabled() {
    const btn = document.getElementById('speech-toggle-btn');
    return btn ? btn.classList.contains('active') : true;
}

// Elite Digital Library Logic
async function loadLibrary() {
    const grid = document.getElementById('library-grid');
    if (!grid) return;

    try {
        const res = await fetch('/api/uploads');
        const data = await res.json();

        if (!data.files || data.files.length === 0) {
            grid.innerHTML = `<p class="empty-state">${i18n[getLanguage() === 'ta' ? 'ta' : 'en'].empty_lib}</p>`;
            return;
        }

        grid.innerHTML = '';
        data.files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'library-item';

            const thumb = document.createElement('div');
            thumb.className = 'library-thumb';

            const isImage = file.type?.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
            const isVideo = file.type?.startsWith('video/') || file.name.match(/\.(mp4|webm)$/i);

            if (isImage) {
                thumb.innerHTML = `<img src="${file.url}" alt="${file.name}">`;
            } else if (isVideo) {
                thumb.innerHTML = `<video src="${file.url}" muted onmouseover="this.play()" onmouseout="this.pause()"></video>`;
            } else {
                thumb.innerText = '📄';
            }

            const name = document.createElement('div');
            name.className = 'library-name';
            name.innerText = file.name;

            const actions = document.createElement('div');
            actions.className = 'lib-actions';

            // AI Analysis Button
            const intelBtn = document.createElement('button');
            intelBtn.className = 'lib-btn intel';
            intelBtn.innerHTML = '🧠';
            intelBtn.title = "AI Insight";
            intelBtn.onclick = (e) => { e.stopPropagation(); analyzeFileWithAI(file); };

            // Preview Button
            const previewBtn = document.createElement('button');
            previewBtn.className = 'lib-btn preview';
            previewBtn.innerHTML = '🔍';
            previewBtn.title = "Full Preview";
            previewBtn.onclick = (e) => { e.stopPropagation(); openMediaPreview(file); };

            // Reuse Button
            const useBtn = document.createElement('button');
            useBtn.className = 'lib-btn use';
            useBtn.innerHTML = '📎';
            useBtn.title = "Reuse file";
            useBtn.onclick = (e) => {
                e.stopPropagation();
                if (!selectedFiles.find(f => f.url === file.url)) {
                    selectedFiles.push(file);
                    renderPreviews();
                }
                textInput.focus();
            };

            // Delete Button
            const delBtn = document.createElement('button');
            delBtn.className = 'lib-btn del';
            delBtn.innerHTML = '🗑️';
            delBtn.onclick = async (e) => {
                e.stopPropagation();
                if (confirm(`Delete ${file.name}?`)) {
                    await fetch(`/api/uploads/${file.name}`, { method: 'DELETE' });
                    loadLibrary();
                }
            };

            actions.appendChild(intelBtn);
            actions.appendChild(previewBtn);
            actions.appendChild(useBtn);
            actions.appendChild(delBtn);

            item.appendChild(thumb);
            item.appendChild(name);
            item.appendChild(actions);

            item.onclick = () => openMediaPreview(file);
            grid.appendChild(item);
        });
    } catch (e) {
        grid.innerHTML = '<p class="empty-state">Failed to load library.</p>';
    }
}

// Media Preview Logic
const mediaModal = document.getElementById('media-modal');
const mediaViewer = document.getElementById('media-viewer');
const mediaTitle = document.getElementById('media-title');
let currentPreviewFile = null;

async function openMediaPreview(file) {
    if (!mediaModal || !mediaViewer || !mediaTitle) return;

    mediaTitle.innerText = file.name;
    currentPreviewFile = file;
    mediaViewer.innerHTML = '<div class="loader"></div>';

    const isImage = file.type?.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const isVideo = file.type?.startsWith('video/') || file.name.match(/\.(mp4|webm|mov)$/i);
    const isCode = file.type?.startsWith('text/') || file.name.match(/\.(py|js|html|css|txt|json|md)$/i);

    if (isImage) {
        mediaViewer.innerHTML = `<img src="${file.url}" alt="${file.name}" style="max-width:100%; border-radius:8px; box-shadow: 0 0 20px rgba(0,0,0,0.5);">`;
    } else if (isVideo) {
        mediaViewer.innerHTML = `<video src="${file.url}" controls autoplay muted loop style="width:100%; border-radius:8px;"></video>`;
    } else if (isCode) {
        try {
            const res = await fetch(file.url);
            const content = await res.text();
            mediaViewer.innerHTML = `
                <div style="background: #0d1117; color: #e6edf3; padding: 15px; border-radius: 8px; text-align: left; font-family: 'Courier New', monospace; font-size: 0.9rem; overflow: auto; max-height: 70vh; white-space: pre-wrap; border: 1px solid #30363d;">
                    ${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                </div>
                <div style="margin-top: 10px;">
                    <a href="${file.url}" download="${file.name}" class="lib-btn use" style="display:inline-block; text-decoration:none; padding: 5px 15px;">💾 Download File</a>
                </div>`;
        } catch (e) {
            mediaViewer.innerHTML = `<div class="file-icon large">⚠️</div><p>Failed to load code content.</p>`;
        }
    } else {
        mediaViewer.innerHTML = `
            <div class="file-icon large">📄</div>
            <p>${file.name}</p>
            <a href="${file.url}" download class="lib-btn use" style="display:inline-block; text-decoration:none; padding: 5px 15px;">💾 Download Asset</a>`;
    }
    mediaModal.style.display = 'flex';
}

document.getElementById('close-media-modal')?.addEventListener('click', () => {
    mediaModal.style.display = 'none';
    mediaViewer.innerHTML = '';
});

document.getElementById('modal-analyze-btn')?.addEventListener('click', () => {
    if (currentPreviewFile) {
        analyzeFileWithAI(currentPreviewFile);
        mediaModal.style.display = 'none';
    }
});

function analyzeFileWithAI(file) {
    addMessage(`Explain this file in detail and check for any potential improvements: ${file.name}`, 'user', [file]);
    sendToServer(`Explain this file in detail and check for any potential improvements: ${file.name}`, [file]);
    // Switch to Chat tab
    document.getElementById('tab-health').click();
}

document.getElementById('refresh-library')?.addEventListener('click', loadLibrary);

// Text search listeners
function handleTextSubmit() {
    const text = textInput.value.trim();
    if (text !== "" || selectedFiles.length > 0) {
        addMessage(text, 'user', selectedFiles);
        sendToServer(text, selectedFiles);
        textInput.value = "";
        selectedFiles = [];
        renderPreviews();
    }
}

sendBtn.addEventListener('click', handleTextSubmit);

textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleTextSubmit();
    }
});

window.addEventListener('load', async () => {
    // Sync Language Buttons
    const savedLang = localStorage.getItem('nexus-lang-pref') || 'en';
    applyLanguage(savedLang);
    document.querySelectorAll('.lang-select-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === savedLang) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    try {
        const res = await fetch('/api/history');
        const data = await res.json();
        if (data.history && data.history.length > 0) {
            // clear default message
            chatBox.innerHTML = '';
            data.history.forEach(msg => {
                if (msg.role === 'user') {
                    addMessage(msg.content, 'user');
                } else if (msg.role === 'assistant') {
                    addMessage(msg.content, 'bot');
                    updateHealthMetrics(msg.content);
                }
            });
        }
    } catch (err) {
        console.error("Failed to load history", err);
    }

    // Fetch local IP for QR code generation
    try {
        const ipRes = await fetch('/api/local-ip');
        const ipData = await ipRes.json();
        if (ipData.ip) window.localIp = ipData.ip;
    } catch (e) {
        console.error("Could not fetch local IP", e);
    }

    // Setup Share Modal
    const shareBtn = document.getElementById('share-app-btn');
    const shareModal = document.getElementById('share-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const appQrContainer = document.getElementById('app-qr-container');

    if (shareBtn && shareModal && closeBtn && appQrContainer) {
        shareBtn.addEventListener('click', () => {
            const appUrl = `http://${window.localIp}:5000/`;
            appQrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(appUrl)}" alt="App QR" />`;
            shareModal.style.display = 'flex';
        });

        closeBtn.addEventListener('click', () => {
            shareModal.style.display = 'none';
        });
    }
});


window.localIp = 'localhost'; // default fallback

function updateHealthMetrics(reply) {
    if (reply.includes("*** Guardian Report ***")) {
        // Parse Focus Score
        const focusMatch = reply.match(/Focus Score:\s*(\d+)%/);
        if (focusMatch && focusMatch[1]) {
            const focusVal = parseInt(focusMatch[1]);
            currentFocus = focusVal; // Update live tracker base
            const focusBar = document.getElementById('focus-level-bar');
            const focusText = document.getElementById('focus-level-text');
            if (focusBar) focusBar.style.width = focusVal + '%';
            if (focusText) focusText.innerText = focusVal + '%';

            // Derive productivity
            const prodValElement = document.getElementById('productivity-val');
            if (prodValElement) {
                if (focusVal >= 80) { prodValElement.innerText = "High"; prodValElement.className = "metric-val good"; }
                else if (focusVal >= 50) { prodValElement.innerText = "Medium"; prodValElement.className = "metric-val neutral"; }
                else { prodValElement.innerText = "Low"; prodValElement.className = "metric-val bad"; }
            }
        }

        // Parse Burnout Score
        const burnoutScoreMatch = reply.match(/Burnout Score:\s*(\d+)%/);
        if (burnoutScoreMatch && burnoutScoreMatch[1]) {
            updateBurnoutUI(parseInt(burnoutScoreMatch[1]));
        }

        // Parse Burnout Risk
        const burnoutMatch = reply.match(/Burnout Risk:\s*(High|Moderate|Low)/);
        if (burnoutMatch && burnoutMatch[1]) {
            const risk = burnoutMatch[1];
            const badge = document.getElementById('burnout-badge');
            const stressValElement = document.getElementById('stress-val');

            if (badge) {
                badge.innerText = risk + " Risk";
                badge.className = "status-badge"; // reset
                if (risk === "Low") { badge.classList.add("low"); }
                else if (risk === "Moderate") { badge.classList.add("med"); }
                else { badge.classList.add("high"); }
            }

            if (stressValElement) {
                if (risk === "Low") { stressValElement.innerText = "Normal"; stressValElement.className = "metric-val good"; }
                else if (risk === "Moderate") { stressValElement.innerText = "Elevated"; stressValElement.className = "metric-val neutral"; }
                else { stressValElement.innerText = "Critical"; stressValElement.className = "metric-val bad"; }
            }
        }

        // Parse Advice
        const adviceMatch = reply.match(/Advice:\s*(.*)/);
        if (adviceMatch && adviceMatch[1]) {
            const adviceEl = document.getElementById('burnout-advice');
            if (adviceEl) {
                adviceEl.innerText = adviceMatch[1];
            }
        }
    }

    // NEW Cardiac Sidebar Sync
    const heartRiskMatch = reply.match(/\[VISUAL:HEART_RISK\|(\d+)%\]/);
    if (heartRiskMatch && heartRiskMatch[1]) {
        updateCardiacSidebar(parseInt(heartRiskMatch[1]));
    }
}

function updateCardiacSidebar(risk) {
    const bar = document.getElementById('cardiac-level-bar');
    const text = document.getElementById('cardiac-risk-text');
    const badge = document.getElementById('cardiac-risk-badge');
    const miniHeart = document.getElementById('sidebar-heart-visual');

    if (bar) bar.style.width = risk + '%';
    if (text) text.innerText = risk + '% Risk';

    if (badge) {
        badge.innerText = risk < 30 ? "Stable" : (risk < 70 ? "Elevated" : "Critical");
        badge.className = "status-badge " + (risk < 30 ? "low" : (risk < 70 ? "med" : "high"));
    }

    if (miniHeart) {
        miniHeart.style.display = 'flex';
        const heartColor = risk < 30 ? '#10b981' : (risk < 70 ? '#f59e0b' : '#ef4444');
        const pulseSpeed = risk < 30 ? '1.5s' : (risk < 70 ? '0.8s' : '0.4s');
        miniHeart.style.setProperty('--heart-color', heartColor);
        miniHeart.style.setProperty('--pulse-speed', pulseSpeed);
    }
}

function speakJarvis(text) {
    if (!window.speechSynthesis) return;

    // Check if muted using new logic
    if (!isSpeechEnabled()) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Split into segments (handle the current bilingual separator '---' or '|')
    const segments = text.split(/---|\|/).map(s => s.trim()).filter(s => s.length > 0);

    let currentSegment = 0;

    function speakNext() {
        if (currentSegment >= segments.length) return;

        const segmentText = segments[currentSegment];
        const isTamil = /[\u0B80-\u0BFF]/.test(segmentText);

        const utterance = new SpeechSynthesisUtterance(segmentText);
        window._currentUtterance = utterance; // Prevent garbage collection bug
        let voices = window.speechSynthesis.getVoices();

        let targetLang = isTamil ? "ta" : "en";
        let preferredVoice = voices.find(v => v.lang.startsWith(targetLang));

        // Specialize for higher quality if available
        if (isTamil) {
            preferredVoice = voices.find(v => v.lang === "ta-IN" || v.name.includes("Kani") || v.name.includes("Pallavi"));
        } else {
            preferredVoice = voices.find(v => v.lang.includes("en-GB") || v.name.includes("Google UK English"));
        }

        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.pitch = isTamil ? 1.0 : 0.9;
        utterance.rate = 1.0;

        utterance.onstart = () => {
            const indicator = document.querySelector('.status-indicator');
            if (indicator) {
                indicator.style.background = isTamil ? "#8b5cf6" : "#3b82f6"; // Purple for Tamil, Blue for English
                indicator.style.boxShadow = `0 0 20px ${isTamil ? "#8b5cf6" : "#3b82f6"}`;
            }
            if (window.speechInterval) clearInterval(window.speechInterval);
            window.speechInterval = setInterval(() => {
                if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
                    window.speechSynthesis.pause();
                    window.speechSynthesis.resume();
                }
            }, 14000);
        };

        utterance.onend = () => {
            if (window.speechInterval) clearInterval(window.speechInterval);
            currentSegment++;
            if (currentSegment < segments.length) {
                setTimeout(speakNext, 300); // Small pause between languages
            } else {
                const indicator = document.querySelector('.status-indicator');
                if (indicator) {
                    indicator.style.background = "#22c55e";
                    indicator.style.boxShadow = "0 0 10px #22c55e";
                }
            }
        };

        utterance.onerror = () => {
            if (window.speechInterval) clearInterval(window.speechInterval);
            const indicator = document.querySelector('.status-indicator');
            if (indicator) {
                indicator.style.background = "#22c55e";
                indicator.style.boxShadow = "0 0 10px #22c55e";
            }
        };

        window.speechSynthesis.speak(utterance);
    }

    speakNext();
}

function updateBurnoutUI(score) {
    const bar = document.getElementById('burnout-level-bar');
    const text = document.getElementById('burnout-score-text');
    if (bar) bar.style.width = score + '%';
    if (text) text.innerText = score + '%';

    // Auto-update badge based on score
    const badge = document.getElementById('burnout-badge');
    if (badge) {
        badge.className = "status-badge";
        if (score < 30) { badge.innerText = "Low Risk"; badge.classList.add("low"); }
        else if (score < 60) { badge.innerText = "Moderate Risk"; badge.classList.add("med"); }
        else { badge.innerText = "High Risk"; badge.classList.add("high"); }
    }
}

// --- Health Summary Polling ---
let lastSpokenAdvice = null;

async function syncHealthData() {
    try {
        const res = await fetch(`/api/health-summary?language_pref=${getLanguagePref()}`);
        const data = await res.json();

        // Update Focus Level
        const focusBar = document.getElementById('focus-level-bar');
        const focusText = document.getElementById('focus-level-text');
        if (focusBar) focusBar.style.width = data.focus_score + '%';
        if (focusText) focusText.innerText = data.focus_score + '%';
        currentFocus = data.focus_score;

        // Update Burnout UI
        updateBurnoutUI(data.burnout_score);

        // Update Early Warning UI
        const warningBar = document.getElementById('warning-level-bar');
        const warningText = document.getElementById('warning-score-text');
        if (warningBar && warningText) {
            const isWarningActive = localStorage.getItem('nexus-warning-enabled') === 'true';
            if (isWarningActive) {
                warningBar.style.width = data.early_warning_score + '%';
                warningText.innerText = data.early_warning_score + '% Detected';
                if (data.early_warning_score > 75) {
                    warningText.style.color = '#ef4444';
                    warningBar.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
                } else if (data.early_warning_score > 30) {
                    warningText.style.color = '#f59e0b';
                    warningBar.style.background = 'linear-gradient(90deg, #10b981, #f59e0b)';
                } else {
                    warningText.style.color = '#10b981';
                    warningBar.style.background = '#10b981';
                }
            } else {
                warningBar.style.width = '0%';
                warningText.innerText = 'System Offline';
                warningText.style.color = 'rgba(255,255,255,0.4)';
            }
        }

        // Proactive Voice Alert (Jarvis Mode)
        if (data.voice_alert && data.voice_alert !== lastSpokenAdvice) {
            speakJarvis(data.voice_alert);
            lastSpokenAdvice = data.voice_alert;
        }

        // Render Suggestions
        const suggestionsCard = document.getElementById('suggestions-card');
        const suggestionsList = document.getElementById('suggestions-list');

        if (data.suggestions && data.suggestions.length > 0) {
            if (suggestionsCard) suggestionsCard.style.display = 'block';
            if (suggestionsList) {
                suggestionsList.innerHTML = '';
                data.suggestions.forEach(s => {
                    const chip = document.createElement('div');
                    chip.className = 'suggestion-chip';
                    chip.innerText = s;
                    chip.onclick = () => {
                        addTaskFromSuggestion(s);
                        chip.style.display = 'none';
                    };
                    suggestionsList.appendChild(chip);
                });
            }
        } else if (data.burnout_score > 30 || data.focus_score < 70) {
            if (suggestionsCard) suggestionsCard.style.display = 'block';
            if (suggestionsList) {
                suggestionsList.innerHTML = '<p style="font-size:0.8rem; color:var(--text-muted); animation: blink 1s infinite;">AI is analyzing your metrics...</p>';
            }
        } else {
            if (suggestionsCard) suggestionsCard.style.display = 'none';
        }

        // Update Productivity/Stress Text
        const prodElement = document.getElementById('productivity-val');
        const stressElement = document.getElementById('stress-val');

        if (data.focus_score >= 80) {
            if (prodElement) { prodElement.innerText = "High"; prodElement.className = "metric-val good"; }
        } else if (data.focus_score >= 50) {
            if (prodElement) { prodElement.innerText = "Medium"; prodElement.className = "metric-val neutral"; }
        } else {
            if (prodElement) { prodElement.innerText = "Low"; prodElement.className = "metric-val bad"; }
        }

        if (data.burnout_score < 30) {
            if (stressElement) { stressElement.innerText = "Normal"; stressElement.className = "metric-val good"; }
        } else if (data.burnout_score < 60) {
            if (stressElement) { stressElement.innerText = "Elevated"; stressElement.className = "metric-val neutral"; }
        } else {
            if (stressElement) { stressElement.innerText = "Critical"; stressElement.className = "metric-val bad"; }
        }

        // Update Cardiac Health Diagnostic
        if (data.predicted_cardiac_risk !== undefined) {
            updateCardiacSidebar(data.predicted_cardiac_risk);
        }

    } catch (e) {
        console.error("Health sync error", e);
    }
}

// --- Tab Preprocessing Suite ---

async function preprocessHealth() {
    console.log("Preprocessing Health Tab...");
    // 1. Force sync data
    syncHealthData();

    // 3. Sync Toggles (since they moved here)
    syncToggles();

    // 4. Load Recent History Previews
    loadSidebarHistory();

    // 5. Restart Hero Video if it exists
    const heroVid = document.getElementById('hero-video');
    if (heroVid) {
        heroVid.play().catch(e => console.log("Hero video autoplay blocked or not ready"));
    }

    // 3. Sync Tracker inputs with potential background changes (demo purpose)
    // In a real app, we might fetch current tracker state from server here.
}

async function preprocessLibrary() {
    console.log("Preprocessing Library Tab...");
    // 1. Fetch backend library summary
    try {
        const res = await fetch('/api/library-summary');
        const data = await res.json();
        const insightCard = document.getElementById('library-insights');
        const statsContent = document.getElementById('lib-stats-content');
        if (insightCard && statsContent) {
            insightCard.style.display = 'block';
            statsContent.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Files:</span> <span>${data.total_files}</span></div>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;"><span>Size:</span> <span>${data.total_size_mb} MB</span></div>
                <div style="display:flex; justify-content:space-between;"><span>Latest:</span> <span style="font-size:0.7rem; color:var(--primary);">${data.latest_upload}</span></div>
            `;
        }
    } catch (e) { console.error("Lib summary fetch err", e); }

    // 2. Determine which sub-tab is active and load data
    const isHistory = document.getElementById('lib-history-btn').classList.contains('active');
    if (isHistory) {
        loadChatHistory();
    } else {
        loadLibrary();
    }

    // 3. Clear any lingering media previews
    const mediaModal = document.getElementById('media-modal');
    if (mediaModal && mediaModal.style.display === 'flex') {
        mediaModal.style.display = 'none';
    }
}

function syncToggles() {
    const speechActive = localStorage.getItem('nexus-speech-enabled') !== 'false';
    const warningActive = localStorage.getItem('nexus-warning-enabled') === 'true';
    const recoveryActive = localStorage.getItem('nexus-recovery-enabled') === 'true';

    const sToggle = document.getElementById('speech-toggle-btn');
    const wToggle = document.getElementById('warning-toggle-btn');
    const rToggle = document.getElementById('recovery-toggle-btn');

    if (sToggle) sToggle.classList.toggle('active', speechActive);
    if (wToggle) wToggle.classList.toggle('active', warningActive);
    if (rToggle) rToggle.classList.toggle('active', recoveryActive);
}

async function preprocessSettings() {
    console.log("Preprocessing Settings Tab...");
    // 1. Sync Toggles with LocalStorage
    syncToggles();

    // 2. Refresh System Status Indicators from Backend
    const aiStatus = document.getElementById('ai-engine-status');
    const memStatus = document.getElementById('memory-status');

    try {
        const res = await fetch('/api/settings-summary');
        const data = await res.json();

        if (aiStatus) {
            aiStatus.innerText = "Verifying...";
            aiStatus.className = "metric-val neutral";
            setTimeout(() => {
                aiStatus.innerText = data.ai_engine;
                aiStatus.className = "metric-val good";
            }, 600);
        }

        if (memStatus) {
            memStatus.innerText = "Analyzing...";
            setTimeout(() => {
                memStatus.innerText = `${data.memory_status} (${data.memory_load})`;
            }, 800);
        }
    } catch (e) { console.error("Settings summary fetch err", e); }
}

// --- Health Summary Polling ---
setInterval(syncHealthData, 5000);


// --- Live Data Simulation ---
let currentFocus = 100;
let isLiveSyncing = true;

setInterval(() => {
    if (!isLiveSyncing) return;

    // Simulate minor fluctuations (-2 to +2)
    const change = Math.floor(Math.random() * 5) - 2;
    currentFocus = Math.max(0, Math.min(100, currentFocus + change));

    const focusBar = document.getElementById('focus-level-bar');
    const focusText = document.getElementById('focus-level-text');
    if (focusBar) focusBar.style.width = currentFocus + '%';
    if (focusText) focusText.innerText = currentFocus + '%';

    // Occasionally fluctuate productivity/stress text
    if (Math.random() > 0.8) {
        const prodElement = document.getElementById('productivity-val');
        const stressElement = document.getElementById('stress-val');

        if (currentFocus >= 80) {
            if (prodElement) { prodElement.innerText = "High"; prodElement.className = "metric-val good"; }
            if (stressElement) { stressElement.innerText = "Normal"; stressElement.className = "metric-val good"; }
        } else if (currentFocus >= 50) {
            if (prodElement) { prodElement.innerText = "Medium"; prodElement.className = "metric-val neutral"; }
            if (stressElement) { stressElement.innerText = "Elevated"; stressElement.className = "metric-val neutral"; }
        } else {
            if (prodElement) { prodElement.innerText = "Low"; prodElement.className = "metric-val bad"; }
            if (stressElement) { stressElement.innerText = "Critical"; stressElement.className = "metric-val bad"; }
        }
    }
}, 3000);

// --- Live Tracker Logic (Steps) ---
let steps = 4500;
setInterval(() => {
    if (!isLiveSyncing) return;

    // Simulate steps increment
    steps += Math.floor(Math.random() * 15);
    const maxSteps = 10000;
    const stepsVal = document.getElementById('steps-val');
    const stepsBar = document.getElementById('steps-bar');

    if (stepsVal) stepsVal.innerText = `${steps} / ${maxSteps}`;
    if (stepsBar) stepsBar.style.width = Math.min((steps / maxSteps) * 100, 100) + '%';

    // Sync backend API
    const moodVal = document.getElementById('mood-select')?.value || 'fine';
    const tasks = document.querySelectorAll('#task-list input[type="checkbox"]');
    let completed = 0;
    tasks.forEach(t => { if (t.checked) completed++; });
    const total = tasks.length || 3;

    const sleepVal = document.getElementById('sleep-input')?.value || 8;
    const workVal = document.getElementById('work-input')?.value || 8;
    const screenVal = document.getElementById('screen-input')?.value || 6;

    fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            steps: steps,
            mood: moodVal,
            tasks_completed: completed,
            total_tasks: total,
            sleep: sleepVal,
            work_hours: workVal,
            screen_time: screenVal,
            breaks_taken: 2 // default or can be calculated
        })
    }).catch(e => console.log('Sync err:', e));

}, 2000);

// --- Real Device Connection Polling ---
setInterval(async () => {
    try {
        const res = await fetch('/api/devices/status');
        const status = await res.json();

        // Watch Logic
        const watchName = document.getElementById('smartwatch-name');
        const watchStatus = document.getElementById('smartwatch-status');
        const watchIcon = document.getElementById('watch-icon');
        const editWatchBtn = document.getElementById('edit-watch-btn');

        if (status.watch) {
            if (watchStatus && watchStatus.innerText !== "Syncing Live Data...") {
                if (watchName && watchName.innerText.includes("Searching")) watchName.innerText = "Apple Watch Ultra";
                if (watchStatus) {
                    watchStatus.innerText = "Syncing Live Data...";
                    watchStatus.className = "device-status syncing";
                }
                if (watchIcon) watchIcon.innerText = "⌚";
                if (editWatchBtn) editWatchBtn.style.display = "flex";
            }
        }

        // Mobile UI Logic
        const phoneName = document.getElementById('mobile-name');
        const phoneStatus = document.getElementById('mobile-status');
        const phoneIcon = document.getElementById('phone-icon');
        const editPhoneBtn = document.getElementById('edit-phone-btn');
        const qrContainer = document.getElementById('mobile-qr-container');
        const mobileLink = document.getElementById('mobile-link');

        if (status.mobile) {
            if (phoneStatus && phoneStatus.innerText !== "Connected") {
                if (phoneName && phoneName.innerText.includes("Searching")) phoneName.innerText = "iPhone 15 Pro";
                if (phoneStatus) {
                    phoneStatus.innerText = "Connected";
                    phoneStatus.className = "device-status active";
                }
                if (phoneIcon) phoneIcon.innerText = "📱";
                if (editPhoneBtn) editPhoneBtn.style.display = "flex";
                if (qrContainer) qrContainer.style.display = "none";
                if (mobileLink) mobileLink.style.display = "none";
            }
        } else {
            if (phoneStatus && phoneStatus.innerText === "Connected" || (qrContainer && qrContainer.style.display === "none")) {
                if (phoneName) phoneName.innerText = "Searching for Mobile...";
                if (phoneStatus) {
                    phoneStatus.innerText = "Scanning WiFi...";
                    phoneStatus.className = "device-status scanning";
                }
                if (phoneIcon) phoneIcon.innerText = "📡";
                if (editPhoneBtn) editPhoneBtn.style.display = "none";

                if (qrContainer) {
                    qrContainer.style.display = "flex";
                    const connectUrl = `http://${window.localIp}:5000/api/devices/connect?device=mobile`;
                    qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(connectUrl)}" alt="QR" title="Scan to connect your phone" />`;
                    if (mobileLink) {
                        mobileLink.href = connectUrl;
                        mobileLink.style.display = "block";
                    }
                }
            }
        }

    } catch (err) {
        console.error("Device polling error", err);
    }
}, 2000); // Poll every 2 seconds

// Edit Device Handlers
document.getElementById('edit-watch-btn')?.addEventListener('click', () => {
    const currentName = document.getElementById('smartwatch-name').innerText;
    const newName = prompt("Enter new smartwatch name:", currentName);
    if (newName && newName.trim() !== "") {
        document.getElementById('smartwatch-name').innerText = newName.trim();
    }
});

document.getElementById('edit-phone-btn')?.addEventListener('click', () => {
    const currentName = document.getElementById('mobile-name').innerText;
    const newName = prompt("Enter new mobile device name:", currentName);
    if (newName && newName.trim() !== "") {
        document.getElementById('mobile-name').innerText = newName.trim();
    }
});

// Task Tracking Logic
const addTaskBtn = document.getElementById('add-task-btn');
const newTaskInput = document.getElementById('new-task-input');
const taskList = document.getElementById('task-list');

if (addTaskBtn && newTaskInput && taskList) {
    function addTask() {
        const text = newTaskInput.value.trim();
        if (text === "") return;
        const taskId = 'task' + (taskList.children.length + 1);
        const li = document.createElement('li');
        li.style.marginBottom = '4px';
        li.innerHTML = `<input type="checkbox" id="${taskId}"> <label for="${taskId}">${text}</label>`;
        taskList.appendChild(li);
        newTaskInput.value = "";
    }

    function addTaskFromSuggestion(suggestionText) {
        const taskId = 'task' + (taskList.children.length + 1);
        const li = document.createElement('li');
        li.style.marginBottom = '4px';
        li.innerHTML = `<input type="checkbox" id="${taskId}"> <label for="${taskId}">${suggestionText}</label>`;
        taskList.appendChild(li);
    }

    // Export globally for usage in polling logic
    window.addTaskFromSuggestion = addTaskFromSuggestion;

    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
}




let currentObjectiveIndex = 0;

// Archives & Chat History Logic
async function loadChatHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    try {
        const res = await fetch('/api/history');
        const data = await res.json();

        if (!data.history || data.history.length === 0) {
            historyList.innerHTML = `<p class="empty-state">No chat records found.</p>`;
            return;
        }

        historyList.innerHTML = '';
        data.history.forEach((entry, idx) => {
            // Filter out cardiac diagnostic reports from history list in Library
            if (entry.content && (entry.content.includes("CARDIAC DIAGNOSTIC REPORT") || entry.content.includes("[VISUAL:HEART_RISK"))) {
                return;
            }

            const item = document.createElement('div');
            item.className = 'history-item';

            const date = document.createElement('div');
            date.className = 'history-date';
            date.innerText = `SESSION LOG #${data.history.length - idx}`;

            const preview = document.createElement('div');
            preview.className = 'history-preview';
            preview.innerText = entry.content || (entry.role === 'user' ? "User Message" : "Jarvis Response");

            const restoreBtn = document.createElement('button');
            restoreBtn.className = 'lib-btn use';
            restoreBtn.style.marginTop = '10px';
            restoreBtn.style.width = '100%';
            restoreBtn.style.fontSize = '0.75rem';
            restoreBtn.innerHTML = '📂 Restore into Chat';
            restoreBtn.onclick = (e) => {
                e.stopPropagation();
                restoreChatSession(data.history);
            };

            item.appendChild(date);
            item.appendChild(preview);
            item.appendChild(restoreBtn);

            item.onclick = () => {
                alert("Preview Content:\n\n" + entry.content);
            };

            historyList.appendChild(item);
        });
    } catch (err) {
        console.error("History load error:", err);
    }
}

function restoreChatSession(history) {
    if (!confirm("This will clear your current chat and load the archived conversation. Proceed?")) return;

    chatBox.innerHTML = '';
    history.forEach(msg => {
        if (msg.role === 'user') {
            addMessage(msg.content, 'user');
        } else if (msg.role === 'assistant') {
            addMessage(msg.content, 'bot');
            updateHealthMetrics(msg.content);
        }
    });

    // Switch to Health tab to see the chat
    document.getElementById('tab-health').click();
    transcriptPreview.innerText = "History Restored";
    setTimeout(() => { transcriptPreview.innerText = "Ready"; }, 2000);
}

// Library Sub-tab Handling
const libFilesBtn = document.getElementById('lib-files-btn');
const libHistoryBtn = document.getElementById('lib-history-btn');
const libGrid = document.getElementById('library-grid');
const histList = document.getElementById('history-list');

if (libFilesBtn && libHistoryBtn) {
    libFilesBtn.onclick = (e) => {
        e.stopPropagation();
        libFilesBtn.classList.add('active');
        libHistoryBtn.classList.remove('active');
        if (libGrid) libGrid.style.display = 'grid';
        if (histList) histList.style.display = 'none';
        loadLibrary();
    };
    libHistoryBtn.onclick = (e) => {
        e.stopPropagation();
        libHistoryBtn.classList.add('active');
        libFilesBtn.classList.remove('active');
        if (libGrid) libGrid.style.display = 'none';
        if (histList) histList.style.display = 'flex';
        loadChatHistory();
    };
}

// Cinematic Presentation Mode
const startPresentBtn = document.getElementById('start-presentation-btn');
const presentOverlay = document.getElementById('presentation-overlay');
const closePresentBtn = document.getElementById('close-presentation');

if (startPresentBtn && presentOverlay) {
    startPresentBtn.onclick = () => triggerPresentation();
}

if (closePresentBtn) {
    closePresentBtn.onclick = () => {
        presentOverlay.style.display = 'none';
        window.speechSynthesis.cancel();
    };
}

function triggerPresentation() {
    if (!presentOverlay) return;
    presentOverlay.style.display = 'flex';

    // Get current stats
    const focusValText = document.getElementById('focus-level-text')?.innerText || "100%";
    const burnoutValText = document.getElementById('burnout-score-text')?.innerText || "0%";
    const burnoutNum = parseInt(burnoutValText);
    const focusNum = parseInt(focusValText);

    // Animate Rings
    const focusCircle = document.getElementById('hud-ring-focus');
    const burnoutCircle = document.getElementById('hud-ring-burnout');

    // Circumference is ~283 (2 * pi * 45)
    if (focusCircle) focusCircle.style.strokeDashoffset = 283 - (283 * (focusNum / 100));
    if (burnoutCircle) burnoutCircle.style.strokeDashoffset = 283 - (283 * (burnoutNum / 100));

    const hudFocusElement = document.getElementById('hud-focus-val');
    const hudBurnoutElement = document.getElementById('hud-burnout-val');
    if (hudFocusElement) hudFocusElement.innerText = focusNum + "%";
    if (hudBurnoutElement) hudBurnoutElement.innerText = burnoutNum + "%";

    // Generate Summary
    const summaryBox = document.getElementById('hud-summary');
    let summaryText = `Sir, I have compiled your health metrics. Focus Guardian is currently stabilizing at ${focusNum}%. `;
    if (burnoutNum > 50) {
        summaryText += "I am detecting critical burnout risk in your biometric stream. The system strongly suggests immediate rest and hydration to restore neural efficiency. Monitoring Focus levels in real-time...";
    } else {
        summaryText += "Your biometric profile is stable. Burnout risk is minimal, and focus efficiency remains at peak levels. Nexus AI continues to act as your health guardian.";
    }

    if (summaryBox) {
        summaryBox.innerText = "";
        let i = 0;
        const typeWriter = () => {
            if (i < summaryText.length && presentOverlay.style.display === 'flex') {
                summaryBox.innerText += summaryText.charAt(i);
                i++;
                setTimeout(typeWriter, 35);
            }
        };
        typeWriter();
    }

    speakJarvis(summaryText);
}

// --- History & Library Access ---
document.addEventListener('DOMContentLoaded', () => {
    const historyBtns = [
        document.getElementById('header-history-btn'),
        document.getElementById('sidebar-history-btn')
    ];

    historyBtns.forEach(btn => {
        if (btn) {
            btn.onclick = () => {
                // Trigger Library Tab Click
                const tabLib = document.getElementById('tab-library');
                if (tabLib) tabLib.click();

                // Switch to history sub-tab (Archives)
                const historySubBtn = document.getElementById('lib-history-btn');
                if (historySubBtn) {
                    // Ensure sub-tab is clicked/active
                    historySubBtn.click();
                }

                // On mobile, scroll the library into view
                if (window.innerWidth <= 768) {
                    const sidebar = document.querySelector('.health-sidebar');
                    if (sidebar) sidebar.scrollIntoView({ behavior: 'smooth' });
                }
            };
        }
    });

    const autoScanBtn = document.getElementById('auto-scan-btn');
    if (autoScanBtn) {
        autoScanBtn.onclick = () => {
            addMessage("Initiate automatic heart disease scan.", 'user');
            sendToServer("predict heart risk");
        };
    }

    const viewReportBtn = document.getElementById('view-report-btn');
    if (viewReportBtn) {
        viewReportBtn.onclick = () => {
            const latestCard = document.querySelector('.heart-risk-card');
            if (latestCard) {
                latestCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                latestCard.style.animation = 'highlightGlow 2s ease';
            } else {
                addMessage("I haven't generated a cardiac report yet. Please run a scan first.", 'bot');
            }
        };
    }
});


