// Zenith Focus Client Application - 2026

document.addEventListener("DOMContentLoaded", () => {
    // --- State Variables ---
    let token = localStorage.getItem("zenith_token") || "";
    let currentUser = JSON.parse(localStorage.getItem("zenith_user")) || null;
    
    // Timer State
    let timerInterval = null;
    let timerSecondsLeft = 25 * 60;
    let timerTotalSeconds = 25 * 60;
    let timerRunning = false;
    let timerMode = "study"; // "study" or "break"
    let timerSubject = "Physics";
    let timerStartTime = null;

    // Ambient Audio State
    let activeAudio = null;

    // Somatic Reset State
    let breathingInterval = null;
    let breathingActive = false;

    // Biometric Wearable Simulation
    let simulatedHeartRate = 72;
    let lockoutTimerInterval = null;

    // Chart Handles
    let subjectChart = null;
    let wellnessChart = null;

    // --- DOM Elements ---
    const authScreen = document.getElementById("auth-screen");
    const mainSystem = document.getElementById("main-system");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const toggleLoginBtn = document.getElementById("toggle-login-btn");
    const toggleSignupBtn = document.getElementById("toggle-signup-btn");
    
    const navItems = document.querySelectorAll(".nav-item");
    const tabPanels = document.querySelectorAll(".tab-panel");
    const logoutBtn = document.getElementById("logout-btn");
    
    // User Display Elements
    const userDisplayName = document.getElementById("user-display-name");
    const userExamBadge = document.getElementById("user-exam-badge");
    const welcomeUsername = document.getElementById("welcome-username");
    const avatarLetters = document.getElementById("avatar-letters");

    // Dashboard Stats
    const dashboardStreak = document.getElementById("dashboard-streak");
    const dashboardTotalStudy = document.getElementById("dashboard-total-study");
    const dashboardBurnoutRisk = document.getElementById("dashboard-burnout-risk");
    const dashboardBurnoutDesc = document.getElementById("dashboard-burnout-desc");
    const burnoutWarningCard = document.getElementById("burnout-warning-card");

    // Wellness sliders
    const wellnessForm = document.getElementById("wellness-form");
    const sleepInput = document.getElementById("wellness-sleep");
    const stressInput = document.getElementById("wellness-stress");
    const screenInput = document.getElementById("wellness-screen");
    const sleepValDisplay = document.getElementById("sleep-value");
    const stressValDisplay = document.getElementById("stress-value");
    const screenValDisplay = document.getElementById("screen-value");

    // Timer Elements
    const timerDisplay = document.getElementById("timer-display");
    const timerStatus = document.getElementById("timer-status");
    const timerPlayBtn = document.getElementById("timer-play-btn");
    const timerResetBtn = document.getElementById("timer-reset-btn");
    const timerDurationSelect = document.getElementById("timer-duration-select");
    const timerSubjectTags = document.getElementById("timer-subject-tags");
    const playIcon = document.getElementById("play-icon");
    const progressRing = document.getElementById("progress-ring");
    const blockerToggle = document.getElementById("blocker-toggle");
    const shieldStatusBox = document.getElementById("shield-status-box");
    const shieldStatusText = document.getElementById("shield-status-text");

    // AI Chat & OCR
    const chatInputForm = document.getElementById("chat-input-form");
    const chatInput = document.getElementById("chat-input");
    const chatMessagesContainer = document.getElementById("chat-messages-container");
    const ocrUploadZone = document.getElementById("ocr-upload-zone");
    const ocrFileInput = document.getElementById("ocr-file-input");
    const ocrPreviewContainer = document.getElementById("ocr-preview-container");
    const ocrPreviewImage = document.getElementById("ocr-preview-image");
    const ocrRemoveBtn = document.getElementById("ocr-remove-btn");
    const ocrSolveBtn = document.getElementById("ocr-solve-btn");
    const ocrResultBox = document.getElementById("ocr-result-box");

    // NCERT Podcast & Mindmap
    const ncertTextInput = document.getElementById("ncert-text-input");
    const ncertPodcastBtn = document.getElementById("ncert-podcast-btn");
    const ncertMapBtn = document.getElementById("ncert-map-btn");
    const mindmapCanvasContainer = document.getElementById("mindmap-canvas-container");

    // Somatic Reset & Health
    const breathingBubble = document.getElementById("breathing-bubble");
    const breathingInstruction = document.getElementById("breathing-instruction");
    const breathingToggleBtn = document.getElementById("breathing-toggle-btn");
    const simHeartRateDisplay = document.getElementById("sim-heart-rate");
    const simSleepCheckDisplay = document.getElementById("sim-sleep-check");
    const simStressSpikeBtn = document.getElementById("sim-stress-spike-btn");
    const cbtNegativeInput = document.getElementById("cbt-negative");
    const cbtReframedInput = document.getElementById("cbt-reframed");
    const cbtSubmitBtn = document.getElementById("cbt-submit-btn");

    // Leaderboard
    const leaderboardForm = document.getElementById("leaderboard-form");
    const mockScoreInput = document.getElementById("mock-score-input");
    const leaderboardRowsContainer = document.getElementById("leaderboard-rows-container");
    const leaderboardTitle = document.getElementById("leaderboard-title");

    // Lockout Overlay
    const lockoutOverlay = document.getElementById("lockout-overlay");
    const lockoutTimerDisplay = document.getElementById("lockout-timer");
    const lockoutBreathingBtn = document.getElementById("lockout-breathing-btn");
    const toastContainer = document.getElementById("toast-container");

    const ringRadius = 85;
    const ringCircumference = 2 * Math.PI * ringRadius;
    progressRing.style.strokeDasharray = `${ringCircumference} ${ringCircumference}`;
    progressRing.style.strokeDashoffset = 0;

    // --- Toast Alerts ---
    function showToast(message, type = "info") {
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        
        let iconName = "info";
        if (type === "success") iconName = "check-circle";
        if (type === "warning") iconName = "alert-triangle";
        if (type === "danger") iconName = "shield-alert";

        toast.innerHTML = `
            <i data-lucide="${iconName}"></i>
            <span class="toast-message">${message}</span>
        `;
        toastContainer.appendChild(toast);
        lucide.createIcons();

        setTimeout(() => {
            toast.style.animation = "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards";
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // --- Auth View Toggles ---
    toggleLoginBtn.addEventListener("click", () => {
        toggleLoginBtn.classList.add("active");
        toggleSignupBtn.classList.remove("active");
        loginForm.classList.remove("hidden");
        signupForm.classList.add("hidden");
    });

    toggleSignupBtn.addEventListener("click", () => {
        toggleSignupBtn.classList.add("active");
        toggleLoginBtn.classList.remove("active");
        signupForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
    });

    // --- API Request Helpers ---
    async function apiRequest(endpoint, method = "GET", body = null) {
        const url = `/api/v1${endpoint}`;
        const headers = {};
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        if (body) {
            headers["Content-Type"] = "application/json";
        }

        try {
            const config = {
                method,
                headers,
                body: body ? JSON.stringify(body) : null
            };
            const res = await fetch(url, config);
            
            if (res.status === 401) {
                // Token expired
                logout();
                showToast("Session expired. Please log in again.", "warning");
                return null;
            }
            
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "Request failed");
            }
            return await res.json();
        } catch (error) {
            showToast(error.message, "danger");
            console.error("API Error:", error);
            return null;
        }
    }

    // --- Authentication Pipeline ---
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-password").value;

        const data = await apiRequest("/auth/login", "POST", { username, password });
        if (data) {
            token = data.access_token;
            currentUser = {
                username: data.username,
                target_exam: data.target_exam,
                streak_count: data.streak_count
            };
            localStorage.setItem("zenith_token", token);
            localStorage.setItem("zenith_user", JSON.stringify(currentUser));
            
            showToast(`Welcome back, ${data.username}!`, "success");
            initializeSystem();
        }
    });

    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("signup-username").value.trim();
        const password = document.getElementById("signup-password").value;
        const target_exam = document.getElementById("signup-exam").value;

        const data = await apiRequest("/auth/register", "POST", { username, password, target_exam });
        if (data) {
            showToast("Account created successfully! Please log in.", "success");
            toggleLoginBtn.click();
            document.getElementById("login-username").value = username;
        }
    });

    function logout() {
        token = "";
        currentUser = null;
        localStorage.removeItem("zenith_token");
        localStorage.removeItem("zenith_user");
        
        // Stop any running timer or audio
        stopTimer();
        stopSoundscape();
        
        authScreen.classList.remove("hidden");
        mainSystem.classList.add("hidden");
    }

    logoutBtn.addEventListener("click", logout);

    // --- System Initialization ---
    function initializeSystem() {
        if (!token || !currentUser) {
            authScreen.classList.remove("hidden");
            mainSystem.classList.add("hidden");
            return;
        }

        authScreen.classList.add("hidden");
        mainSystem.classList.remove("hidden");

        // Display User Credentials
        userDisplayName.textContent = currentUser.username;
        userExamBadge.textContent = currentUser.target_exam;
        welcomeUsername.textContent = currentUser.username;
        avatarLetters.textContent = currentUser.username.substring(0, 2).toUpperCase();

        // Populate exam specific Pomodoro subject tags
        populateSubjectTags();

        // Fetch Dashboard Stats & Analytics
        refreshDashboardData();
        refreshLeaderboard();
        
        // Request Notification Permission
        if (Notification.permission === "default") {
            Notification.requestPermission();
        }

        lucide.createIcons();
    }

    function populateSubjectTags() {
        timerSubjectTags.innerHTML = "";
        const exam = currentUser.target_exam;
        const subjects = exam === "JEE" ? ["Physics", "Chemistry", "Math"] : ["Physics", "Chemistry", "Biology"];
        
        subjects.forEach((sub, index) => {
            const btn = document.createElement("button");
            btn.className = `subject-tag-btn ${index === 0 ? "active" : ""}`;
            btn.dataset.subject = sub;
            btn.textContent = sub;
            btn.addEventListener("click", () => {
                document.querySelectorAll(".subject-tag-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                timerSubject = sub;
                showToast(`Focused subject switched to ${sub}`, "info");
            });
            timerSubjectTags.appendChild(btn);
        });
        timerSubject = subjects[0];
    }

    // --- Tab Switching Navigation ---
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");
            
            const targetTab = item.dataset.tab;
            tabPanels.forEach(panel => {
                if (panel.id === targetTab) {
                    panel.classList.add("active");
                } else {
                    panel.classList.remove("active");
                }
            });
            
            // Refresh data when navigating to specific panels
            if (targetTab === "dashboard-tab") {
                refreshDashboardData();
            } else if (targetTab === "leaderboard-tab") {
                refreshLeaderboard();
            }
        });
    });

    // --- Dashboard & Sliders Interactivity ---
    // Update labels dynamically
    sleepInput.addEventListener("input", (e) => {
        sleepValDisplay.textContent = `${parseFloat(e.target.value).toFixed(1)} Hrs`;
    });
    stressInput.addEventListener("input", (e) => {
        stressValDisplay.textContent = `${e.target.value} / 10`;
    });
    screenInput.addEventListener("input", (e) => {
        screenValDisplay.textContent = `${parseFloat(e.target.value).toFixed(1)} Hrs`;
    });

    async function refreshDashboardData() {
        // Fetch focus statistics
        const stats = await apiRequest("/focus/stats");
        if (stats) {
            let totalMins = 0;
            const subjects = [];
            const durations = [];
            
            Object.keys(stats).forEach(sub => {
                totalMins += stats[sub].total_duration_mins;
                subjects.push(sub);
                durations.push(stats[sub].total_duration_mins);
            });
            
            dashboardTotalStudy.textContent = `${totalMins} Mins`;
            updateSubjectChart(subjects, durations);
        }

        // Fetch wellness logs history
        const wellnessHistory = await apiRequest("/wellness/history");
        if (wellnessHistory && wellnessHistory.length > 0) {
            const latestLog = wellnessHistory[0];
            const dates = [];
            const stresses = [];
            const burnoutScores = [];

            // Read list chronologically
            wellnessHistory.slice(0, 7).reverse().forEach(log => {
                const dateObj = new Date(log.timestamp);
                dates.push(dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
                stresses.push(log.stress_level);
                burnoutScores.push(log.burnout_score * 100);
            });

            // Update user streak count from dashboard refresh
            dashboardStreak.textContent = `${currentUser.streak_count} Days`;
            
            // Update Burnout UI status card
            updateBurnoutWarningCard(latestLog.burnout_score);
            updateWellnessChart(dates, stresses, burnoutScores);
        } else {
            dashboardStreak.textContent = `${currentUser.streak_count} Days`;
            dashboardBurnoutRisk.textContent = "N/A";
            dashboardBurnoutRisk.className = "stat-value";
            dashboardBurnoutDesc.textContent = "Complete your daily wellness log to predict burnout.";
            burnoutWarningCard.style.borderColor = "rgba(255, 255, 255, 0.08)";
            burnoutWarningCard.style.boxShadow = "none";
        }
    }

    wellnessForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const sleep_hours = parseFloat(sleepInput.value);
        const stress_level = parseInt(stressInput.value);
        const screen_time_hours = parseFloat(screenInput.value);

        const data = await apiRequest("/wellness/checkin", "POST", { sleep_hours, stress_level, screen_time_hours });
        if (data) {
            showToast("Wellness metrics logged successfully!", "success");
            currentUser.streak_count = data.streak_count;
            localStorage.setItem("zenith_user", JSON.stringify(currentUser));
            
            // Check for smartwatch lockout condition (sleep < 5 hrs for 3 consecutive days simulation)
            if (sleep_hours < 5.0) {
                simSleepCheckDisplay.textContent = "Warning (Under 5 hrs)";
                simSleepCheckDisplay.className = "biometric-value danger-text";
            } else {
                simSleepCheckDisplay.textContent = "Healthy";
                simSleepCheckDisplay.className = "biometric-value success-text";
            }

            refreshDashboardData();
        }
    });

    function updateBurnoutWarningCard(prob) {
        let riskText = "Low";
        let glowClass = "border-glow-teal";
        let descText = "Your stress levels are low. Keep studying but maintain healthy sleep cycles!";
        let iconName = "shield-check";

        if (prob >= 0.35 && prob < 0.7) {
            riskText = "Medium";
            glowClass = "border-glow-orange";
            descText = "Minor signs of erratic study/stress fatigue detected. Take more Pomodoro breaks.";
            iconName = "alert-triangle";
        } else if (prob >= 0.7) {
            riskText = "High Risk";
            glowClass = "border-glow-red glow-red-pulse";
            descText = "CRITICAL: Empathy systems alert. High burnout imminent! Somatic breathing is forced.";
            iconName = "shield-alert";
            
            // Auto lockout trigger for test safety
            triggerLockout("High ML predicted burnout levels. Complete relaxation breathing to unlock.");
        }

        dashboardBurnoutRisk.textContent = riskText;
        dashboardBurnoutDesc.textContent = descText;
        
        // Remove old glow border classes
        burnoutWarningCard.className = "stat-card glass-card " + glowClass;
        
        const riskIcon = document.getElementById("burnout-risk-icon");
        riskIcon.setAttribute("data-lucide", iconName);
        lucide.createIcons();
    }

    // --- Chart rendering functions ---
    function updateSubjectChart(labels, data) {
        const ctx = document.getElementById("subjectChart").getContext("2d");
        if (subjectChart) subjectChart.destroy();
        
        subjectChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Study Duration (Mins)",
                    data,
                    backgroundColor: ["rgba(139, 92, 246, 0.4)", "rgba(20, 184, 166, 0.4)", "rgba(249, 115, 22, 0.4)", "rgba(239, 68, 68, 0.4)"],
                    borderColor: ["#8b5cf6", "#14b8a6", "#f97316", "#ef4444"],
                    borderWidth: 1.5,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        grid: { color: "rgba(255, 255, 255, 0.05)" },
                        ticks: { color: "#94a3b8" }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: "#94a3b8" }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    function updateWellnessChart(labels, stressData, burnoutData) {
        const ctx = document.getElementById("wellnessChart").getContext("2d");
        if (wellnessChart) wellnessChart.destroy();

        wellnessChart = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: "Stress Level (1-10)",
                        data: stressData,
                        borderColor: "#f97316",
                        backgroundColor: "rgba(249, 115, 22, 0.1)",
                        tension: 0.3,
                        borderWidth: 2,
                        yAxisID: "y"
                    },
                    {
                        label: "Burnout Probability (%)",
                        data: burnoutData,
                        borderColor: "#ef4444",
                        backgroundColor: "rgba(239, 68, 68, 0.05)",
                        tension: 0.3,
                        borderWidth: 2,
                        yAxisID: "y1"
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: "linear",
                        display: true,
                        position: "left",
                        grid: { color: "rgba(255, 255, 255, 0.05)" },
                        ticks: { color: "#94a3b8" },
                        min: 1,
                        max: 10
                    },
                    y1: {
                        type: "linear",
                        display: true,
                        position: "right",
                        grid: { display: false },
                        ticks: { color: "#94a3b8" },
                        min: 0,
                        max: 100
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: "#94a3b8" }
                    }
                },
                plugins: {
                    legend: { labels: { color: "#f8fafc" } }
                }
            }
        });
    }

    // --- Circular Pomodoro Timer Module ---
    function updateTimerDisplay() {
        const mins = Math.floor(timerSecondsLeft / 60);
        const secs = timerSecondsLeft % 60;
        timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        // Progress Ring animation offset
        const progressFraction = timerSecondsLeft / timerTotalSeconds;
        const offset = ringCircumference * (1 - progressFraction);
        progressRing.style.strokeDashoffset = offset;
    }

    timerDurationSelect.addEventListener("change", (e) => {
        if (timerRunning) {
            showToast("Stop active timer before switching cycles", "warning");
            timerDurationSelect.value = (timerTotalSeconds / 60).toString();
            return;
        }

        const modeVal = e.target.value;
        if (modeVal.includes("break")) {
            timerMode = "break";
            timerStatus.textContent = "REST BREAK INTERVAL";
            timerSecondsLeft = parseInt(modeVal.split("-")[0]) * 60;
        } else {
            timerMode = "study";
            timerStatus.textContent = "STUDY SESSION";
            timerSecondsLeft = parseInt(modeVal) * 60;
        }
        timerTotalSeconds = timerSecondsLeft;
        updateTimerDisplay();
    });

    function startTimer() {
        if (timerRunning) return;
        timerRunning = true;
        timerStartTime = new Date();
        playIcon.setAttribute("data-lucide", "pause");
        lucide.createIcons();

        timerInterval = setInterval(() => {
            timerSecondsLeft--;
            updateTimerDisplay();
            
            // Check Tab focus system block simulator
            if (blockerToggle.checked && document.hidden) {
                // User navigated away from focus browser window!
                triggerWearableStressWarning();
            }

            if (timerSecondsLeft <= 0) {
                clearInterval(timerInterval);
                timerRunning = false;
                timerInterval = null;
                playIcon.setAttribute("data-lucide", "play");
                lucide.createIcons();
                
                triggerTimerCompletion();
            }
        }, 1000);
        
        showToast("Focus mode countdown initiated.", "success");
    }

    function stopTimer() {
        if (!timerRunning) return;
        timerRunning = false;
        clearInterval(timerInterval);
        timerInterval = null;
        playIcon.setAttribute("data-lucide", "play");
        lucide.createIcons();
        showToast("Focus timer paused.", "warning");
    }

    timerPlayBtn.addEventListener("click", () => {
        if (timerRunning) {
            stopTimer();
        } else {
            startTimer();
        }
    });

    timerResetBtn.addEventListener("click", () => {
        stopTimer();
        const modeVal = timerDurationSelect.value;
        if (modeVal.includes("break")) {
            timerSecondsLeft = parseInt(modeVal.split("-")[0]) * 60;
        } else {
            timerSecondsLeft = parseInt(modeVal) * 60;
        }
        timerTotalSeconds = timerSecondsLeft;
        updateTimerDisplay();
    });

    async function triggerTimerCompletion() {
        // Play alert sound
        const alertAudio = new Audio("https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg");
        alertAudio.play();

        // Push local browser notification
        if (Notification.permission === "granted") {
            const title = timerMode === "study" ? "Pomodoro Round Completed!" : "Break Finished!";
            const body = timerMode === "study" ? "Amazing work. Logged session. Take a 5-minute somatic breathing break!" : "Time to dive back into study. Prepare your next topic!";
            new Notification(title, { body });
        }

        if (timerMode === "study") {
            const endTime = new Date();
            const focus_duration_mins = Math.floor(timerTotalSeconds / 60);
            
            // Log study session to database
            const logData = await apiRequest("/focus/log", "POST", {
                start_time: timerStartTime.toISOString(),
                end_time: endTime.toISOString(),
                subject_tag: timerSubject,
                efficiency_score: 85, // Default average efficiency
                focus_duration_mins
            });
            
            if (logData) {
                showToast(`Session logged to ${timerSubject}! Current Streak: ${logData.streak_count} days.`, "success");
                currentUser.streak_count = logData.streak_count;
                localStorage.setItem("zenith_user", JSON.stringify(currentUser));
            }
            
            // Shift automatically to break mode
            timerMode = "break";
            timerStatus.textContent = "REST BREAK INTERVAL";
            timerSecondsLeft = 5 * 60; // 5 minute default break
            timerTotalSeconds = 5 * 60;
            timerDurationSelect.value = "5";
        } else {
            // Shift automatically to study mode
            timerMode = "study";
            timerStatus.textContent = "STUDY SESSION";
            timerSecondsLeft = 25 * 60;
            timerTotalSeconds = 25 * 60;
            timerDurationSelect.value = "25";
        }
        updateTimerDisplay();
    }

    // App Blocker Simulator Switch
    blockerToggle.addEventListener("change", (e) => {
        if (e.target.checked) {
            shieldStatusBox.className = "shield-status-box id-active";
            shieldStatusText.textContent = "Distraction Shield Activated";
            showToast("System-level tab redirection monitoring active.", "success");
        } else {
            shieldStatusBox.className = "shield-status-box id-inactive";
            shieldStatusText.textContent = "Shield Disabled";
        }
    });

    // --- Study Soundscape ambient loops ---
    const soundButtons = document.querySelectorAll(".sound-track-btn");
    
    soundButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            soundButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            stopSoundscape();
            
            const soundType = btn.dataset.sound;
            if (soundType !== "none") {
                activeAudio = document.getElementById(`audio-${soundType}`);
                if (activeAudio) {
                    activeAudio.currentTime = 0;
                    activeAudio.play();
                    showToast(`Ambient Track '${soundType}' is playing.`, "info");
                }
            }
        });
    });

    function stopSoundscape() {
        if (activeAudio) {
            activeAudio.pause();
            activeAudio = null;
        }
    }

    // --- AI Chat Window (marked.js markdown conversion) ---
    chatInputForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        // Add user message to UI
        appendMessage(text, "user");
        chatInput.value = "";

        const data = await apiRequest("/ai/counsel", "POST", { prompt: text });
        if (data) {
            appendMessage(data.response, "bot");
        }
    });

    function appendMessage(text, sender) {
        const bubbleWrap = document.createElement("div");
        bubbleWrap.className = `message ${sender}`;
        
        // Compile markdown to HTML clean format
        const compiledHtml = marked.parse(text);
        
        bubbleWrap.innerHTML = `
            <div class="message-bubble">
                ${compiledHtml}
            </div>
        `;
        chatMessagesContainer.appendChild(bubbleWrap);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    // --- OCR Multimodal solver upload ---
    ocrUploadZone.addEventListener("click", () => ocrFileInput.click());
    
    // Drag-and-drop support
    ocrUploadZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        ocrUploadZone.style.borderColor = "var(--color-teal)";
    });
    
    ocrUploadZone.addEventListener("dragleave", () => {
        ocrUploadZone.style.borderColor = "rgba(255, 255, 255, 0.1)";
    });

    ocrUploadZone.addEventListener("drop", (e) => {
        e.preventDefault();
        ocrUploadZone.style.borderColor = "rgba(255, 255, 255, 0.1)";
        if (e.dataTransfer.files.length > 0) {
            handleOcrFile(e.dataTransfer.files[0]);
        }
    });

    ocrFileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleOcrFile(e.target.files[0]);
        }
    });

    let ocrImageBase64 = "";

    function handleOcrFile(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            ocrImageBase64 = event.target.result;
            ocrPreviewImage.src = ocrImageBase64;
            ocrPreviewContainer.classList.remove("hidden");
            ocrUploadZone.classList.add("hidden");
            ocrSolveBtn.classList.remove("hidden");
            ocrResultBox.classList.add("hidden");
        };
        reader.readAsDataURL(file);
    }

    ocrRemoveBtn.addEventListener("click", () => {
        ocrImageBase64 = "";
        ocrPreviewContainer.classList.add("hidden");
        ocrUploadZone.classList.remove("hidden");
        ocrSolveBtn.classList.add("hidden");
        ocrFileInput.value = "";
    });

    ocrSolveBtn.addEventListener("click", async () => {
        ocrSolveBtn.disabled = true;
        ocrSolveBtn.innerHTML = 'Analyzing with Gemini... <i data-lucide="refresh-cw" class="spin-icon"></i>';
        lucide.createIcons();
        ocrResultBox.classList.add("hidden");

        const data = await apiRequest("/ai/solve", "POST", { image_base64: ocrImageBase64 });
        
        ocrSolveBtn.disabled = false;
        ocrSolveBtn.innerHTML = 'Solve Problem via Gemini <i data-lucide="sparkles"></i>';
        lucide.createIcons();

        if (data) {
            ocrResultBox.innerHTML = marked.parse(data.solution);
            ocrResultBox.classList.remove("hidden");
            showToast("Question solved with step-by-step guidance.", "success");
        }
    });

    // --- NCERT Summarizer Audio Podcast & Concept maps ---
    ncertPodcastBtn.addEventListener("click", () => {
        const text = ncertTextInput.value.trim();
        if (!text) {
            showToast("Please paste some textbook text first.", "warning");
            return;
        }

        // Cancel previous speech if running
        window.speechSynthesis.cancel();

        // Standard summary translation
        const summary = `Here is a study summary for your pasted chapter notes: This topic covers core molecular concepts. Focus heavily on definition constraints and primary equations. Practice recent 5-year mock problems relating to this segment to lock it down. Make sure to rest during late sessions.`;
        
        const utterance = new SpeechSynthesisUtterance(summary);
        // Setup rate & pitch suited for students
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        window.speechSynthesis.speak(utterance);
        showToast("Audio summary playing via browser speech engine.", "success");
    });

    ncertMapBtn.addEventListener("click", () => {
        const text = ncertTextInput.value.trim();
        if (!text) {
            showToast("Please paste some textbook text first.", "warning");
            return;
        }

        // Simulating text extraction for Concept map rendering as HTML lists
        mindmapCanvasContainer.innerHTML = "";
        
        const rootConcept = "Organic Reaction Mechanisms"
        const connections = ["Nucleophilic Substitution (Sn1/Sn2)", "Electrophilic Addition", "Elimination Pathways (E1/E2)"];

        const mapHtml = `
            <div class="concept-root">
                <div class="concept-node">${rootConcept}</div>
                <div class="concept-children">
                    ${connections.map(node => `
                        <div class="concept-child-node">${node}</div>
                    `).join('')}
                </div>
            </div>
        `;
        
        mindmapCanvasContainer.innerHTML = mapHtml;
        mindmapCanvasContainer.classList.remove("hidden");
        showToast("Visual concept web rendered using layout tree.", "success");
    });

    // --- Somatic Reset & Box Breathing loop ---
    breathingToggleBtn.addEventListener("click", () => {
        if (breathingActive) {
            stopBreathingCycle();
        } else {
            startBreathingCycle();
        }
    });

    function startBreathingCycle() {
        breathingActive = true;
        breathingToggleBtn.textContent = "Stop Somatic Protocol";
        breathingToggleBtn.className = "reset-action-btn glow-button btn-secondary";
        runBreathingStep();
    }

    function runBreathingStep() {
        if (!breathingActive) return;
        
        // Phase 1: Inhale (4s)
        breathingBubble.className = "breathing-bubble inhale";
        breathingInstruction.textContent = "INHALE";
        
        breathingInterval = setTimeout(() => {
            // Phase 2: Hold (4s)
            breathingBubble.className = "breathing-bubble hold";
            breathingInstruction.textContent = "HOLD";
            
            breathingInterval = setTimeout(() => {
                // Phase 3: Exhale (4s)
                breathingBubble.className = "breathing-bubble exhale";
                breathingInstruction.textContent = "EXHALE";
                
                breathingInterval = setTimeout(() => {
                    // Repeat loop
                    runBreathingStep();
                }, 4000);
            }, 4000);
        }, 4000);
    }

    function stopBreathingCycle() {
        breathingActive = false;
        clearTimeout(breathingInterval);
        breathingBubble.className = "breathing-bubble";
        breathingInstruction.textContent = "READY";
        breathingToggleBtn.textContent = "Start Somatic Protocol";
        breathingToggleBtn.className = "reset-action-btn glow-button";
        
        // If we are in lockout mode, check if heart rate has lowered
        if (simulatedHeartRate > 100) {
            simulatedHeartRate = 72;
            simHeartRateDisplay.textContent = "72 BPM (Resting)";
            simHeartRateDisplay.className = "biometric-value success-text";
            
            // Release lockout overlay
            unlockSystem();
        }
    }

    // --- Biometric Wearable Sync & Hard Lockouts ---
    simStressSpikeBtn.addEventListener("click", () => {
        // Triggers stress alert
        simulatedHeartRate = 114;
        simHeartRateDisplay.textContent = "114 BPM (Stress Spike!)";
        simHeartRateDisplay.className = "biometric-value danger-text";
        
        triggerLockout("Biometric resting heart rate exceeded threshold limits (110+ BPM). Focus mode lockout forced to protect student wellness.");
    });

    function triggerWearableStressWarning() {
        showToast("Tab redirection warning: Stay on the study dashboard!", "danger");
    }

    function triggerLockout(reason) {
        lockoutOverlay.classList.remove("hidden");
        document.getElementById("lockout-reason").textContent = reason;
        
        let timeLeft = 60;
        lockoutTimerDisplay.textContent = `${timeLeft}s`;
        
        clearInterval(lockoutTimerInterval);
        lockoutTimerInterval = setInterval(() => {
            timeLeft--;
            lockoutTimerDisplay.textContent = `${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(lockoutTimerInterval);
                unlockSystem();
            }
        }, 1000);
    }

    function unlockSystem() {
        clearInterval(lockoutTimerInterval);
        lockoutOverlay.classList.add("hidden");
        showToast("Zenith locks released. Stay calm and study smart.", "success");
    }

    lockoutBreathingBtn.addEventListener("click", () => {
        // Instantly switch tabs to Health & Somatic tab and start breathing
        lockoutOverlay.classList.add("hidden");
        clearInterval(lockoutTimerInterval);
        
        // Click navigation panel
        document.querySelector('[data-tab="health-tab"]').click();
        
        // Start breathing
        if (!breathingActive) {
            startBreathingCycle();
        }
    });

    // --- CBT Refocus Submission ---
    cbtSubmitBtn.addEventListener("click", () => {
        const neg = cbtNegativeInput.value.trim();
        const ref = cbtReframedInput.value.trim();
        if (!neg || !ref) {
            showToast("Please input both blocks to reframe stress.", "warning");
            return;
        }

        cbtNegativeInput.value = "";
        cbtReframedInput.value = "";
        showToast("Thought reframed. Anxious energy channeled back to productivity!", "success");
    });

    // --- Leaderboard Integration ---
    async function refreshLeaderboard() {
        const data = await apiRequest("/leaderboard");
        if (data) {
            leaderboardTitle.textContent = `${data.target_exam} Mock Test Leaderboard`;
            leaderboardRowsContainer.innerHTML = "";
            
            data.leaderboard.forEach((entry, idx) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>#${idx + 1}</td>
                    <td>${entry.username} ${entry.username === currentUser.username ? "(You)" : ""}</td>
                    <td class="text-right">${entry.score.toFixed(2)}%</td>
                `;
                leaderboardRowsContainer.appendChild(tr);
            });
        }
    }

    leaderboardForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const score = parseFloat(mockScoreInput.value);
        if (isNaN(score)) return;

        const data = await apiRequest("/leaderboard/submit", "POST", { score });
        if (data) {
            showToast("Mock percentile updated successfully in cache!", "success");
            mockScoreInput.value = "";
            refreshLeaderboard();
        }
    });

    // --- Start System on Load ---
    initializeSystem();
});
