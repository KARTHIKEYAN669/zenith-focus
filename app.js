/**
 * Zenith Focus — Core Client Application Controller
 * Handles global state, local storage synchronization, Pomodoro state machine,
 * Web Audio synthesizers, Page Visibility detection, simulated trackers,
 * custom SVG progress gauges, and Chart.js animations.
 */

document.addEventListener('DOMContentLoaded', function() {
  
  // ================= APPLICATION STATE =================
  let state = {
    // Analytics Metrics
    productiveTime: 0,   // total productive study minutes
    distractedTime: 0,   // total distracted app minutes
    blurCount: 0,        // tab visibility distraction count
    pomoRounds: 0,       // completed pomodoros
    focusScore: 100,     // focus rating (0-100)
    burnoutScore: 0,     // burnout warning score (0-100)
    stressLevel: 0,      // self-reported stress level (0-10)
    subject: 'general',  // currently selected study subject
    
    // Historical Log Array for Charts
    history: [],         // list of { time: string, productive: number, distracted: number, focus: number, burnout: number }
    
    // Pomodoro Timer State
    timer: {
      timeLeft: 1500,     // seconds remaining
      duration: 1500,     // total seconds in phase
      isRunning: false,
      mode: 'work',       // 'work', 'shortBreak', 'longBreak'
      sessionCount: 1     // current study cycle
    },
    
    // Timer Configurations (in minutes)
    config: {
      work: 25,
      shortBreak: 5,
      longBreak: 15
    },
    
    // Autopilot simulator status
    simulatorActive: true
  };

  // ================= DOM ELEMENT REFERENCES =================
  const elements = {
    // Navigation
    navButtons: document.querySelectorAll('.nav-item'),
    tabPanels: document.querySelectorAll('.tab-panel'),
    pageTitle: document.getElementById('page-title'),
    pageSubtitle: document.getElementById('page-subtitle'),
    
    // Subject Selector
    subjectSelector: document.getElementById('subject-selector'),
    liveClock: document.getElementById('live-clock'),
    
    // Dashboard Gauges & Stats
    txtFocusScore: document.getElementById('txt-focus-score'),
    lblFocusStatus: document.getElementById('lbl-focus-status'),
    txtBurnoutScore: document.getElementById('txt-burnout-score'),
    lblBurnoutStatus: document.getElementById('lbl-burnout-status'),
    
    // Quick Timer Widget
    txtQuickTimer: document.getElementById('txt-quick-timer'),
    btnQuickPlayPause: document.getElementById('btn-quick-play-pause'),
    iconQuickPlay: document.getElementById('icon-quick-play'),
    btnQuickSkip: document.getElementById('btn-quick-skip'),
    quickTimerBar: document.getElementById('quick-timer-bar'),
    pomoPhaseIndicator: document.getElementById('pomo-phase-indicator'),
    
    // Main Pomodoro Tab
    btnModeWork: document.getElementById('btn-mode-work'),
    btnModeShort: document.getElementById('btn-mode-short'),
    btnModeLong: document.getElementById('btn-mode-long'),
    pomoRingProgress: document.getElementById('pomo-ring-progress'),
    txtTimerModeLabel: document.getElementById('txt-timer-mode-label'),
    txtMainTimer: document.getElementById('txt-main-timer'),
    txtTimerSession: document.getElementById('txt-timer-session'),
    btnTimerReset: document.getElementById('btn-timer-reset'),
    btnTimerPlayPause: document.getElementById('btn-timer-play-pause'),
    iconTimerPlay: document.getElementById('icon-timer-play'),
    btnTimerSkip: document.getElementById('btn-timer-skip'),
    
    // Pomodoro Audio Options
    audioButtons: document.querySelectorAll('.btn-audio'),
    
    // Timer Input Fields
    inputStudyTime: document.getElementById('input-study-time'),
    inputShortBreak: document.getElementById('input-short-break'),
    inputLongBreak: document.getElementById('input-long-break'),
    btnApplyTimerSettings: document.getElementById('btn-apply-timer-settings'),
    lblTotalRounds: document.getElementById('lbl-total-rounds'),
    lblTotalMinutes: document.getElementById('lbl-total-minutes'),
    
    // Focus Lab Controls
    chkAutoSimulator: document.getElementById('chk-auto-simulator'),
    btnSimStudy: document.getElementById('btn-sim-study'),
    btnSimSocial: document.getElementById('btn-sim-social'),
    btnSimGaming: document.getElementById('btn-sim-gaming'),
    trackerLogList: document.getElementById('tracker-log-list'),
    lblActiveState: document.getElementById('lbl-active-state'),
    
    // Focus Lab Metrics
    lblProductiveTime: document.getElementById('lbl-productive-time'),
    lblDistractedTime: document.getElementById('lbl-distracted-time'),
    lblBlurCount: document.getElementById('lbl-blur-count'),
    
    // AI Coach Tab
    btnViewAiCoach: document.getElementById('btn-view-ai-coach'),
    coachMetricFocus: document.getElementById('coach-metric-focus'),
    coachMetricBurnout: document.getElementById('coach-metric-burnout'),
    aiSubjectTips: document.getElementById('ai-subject-tips'),
    btnAiAnalyze: document.getElementById('btn-ai-analyze'),
    chatMessages: document.getElementById('chat-messages'),
    chatPresets: document.querySelectorAll('.preset-btn'),
    inputChatQuery: document.getElementById('input-chat-query'),
    btnSendChat: document.getElementById('btn-send-chat'),
    dashboardCoachText: document.getElementById('dashboard-coach-text'),
    
    // Daily Analytics Report
    printDate: document.getElementById('print-date'),
    repTotalStudy: document.getElementById('rep-total-study'),
    repTotalDistraction: document.getElementById('rep-total-distraction'),
    repPomoCompleted: document.getElementById('rep-pomo-completed'),
    repDistractionCount: document.getElementById('rep-distraction-count'),
    repFocusScore: document.getElementById('rep-focus-score'),
    repFocusDesc: document.getElementById('rep-focus-desc'),
    repBurnoutScore: document.getElementById('rep-burnout-score'),
    repBurnoutDesc: document.getElementById('rep-burnout-desc'),
    repAiContentText: document.getElementById('rep-ai-content-text'),
    btnPrintReport: document.getElementById('btn-print-report'),
    btnResetData: document.getElementById('btn-reset-data'),
    
    // General Toasts
    toastContainer: document.getElementById('toast-container')
  };

  // ================= CHARTS AND AUDIO REFERENCES =================
  let dashboardUsageChart = null;
  let trackerDetailedChart = null;
  let reportTimelineChart = null;
  let pomodoroTickInterval = null;
  let simulatorTickInterval = null;
  
  // Web Audio Context & Synthesizer State
  let audioCtx = null;
  let activeAmbientNode = null;
  let activeAmbientSource = null;
  let selectedAmbientSound = 'none';

  // ================= CORE PERSISTENCE MODULE =================
  function initPersistence() {
    const savedState = localStorage.getItem('zenith_focus_state_v1');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Deep copy loaded state attributes
        state.productiveTime = parsed.productiveTime || 0;
        state.distractedTime = parsed.distractedTime || 0;
        state.blurCount = parsed.blurCount || 0;
        state.pomoRounds = parsed.pomoRounds || 0;
        state.focusScore = parsed.focusScore !== undefined ? parsed.focusScore : 100;
        state.burnoutScore = parsed.burnoutScore !== undefined ? parsed.burnoutScore : 0;
        state.stressLevel = parsed.stressLevel || 0;
        state.subject = parsed.subject || 'general';
        state.history = parsed.history || [];
        
        state.config = parsed.config || { work: 25, shortBreak: 5, longBreak: 15 };
        
        // Sync values into settings inputs
        elements.inputStudyTime.value = state.config.work;
        elements.inputShortBreak.value = state.config.shortBreak;
        elements.inputLongBreak.value = state.config.longBreak;
        elements.subjectSelector.value = state.subject;
        
        // Reset timer configuration to match subject/mode values loaded
        setupTimerMode(state.timer.mode);
        showToast('info', 'Synced last session data from LocalStorage.');
      } catch (e) {
        console.error("Local storage sync failed, using default state.", e);
      }
    } else {
      // Seed initial dummy timeline history so visual charts render beautifully immediately
      seedInitialHistory();
    }
  }

  function saveStateToStorage() {
    localStorage.setItem('zenith_focus_state_v1', JSON.stringify(state));
  }

  function seedInitialHistory() {
    const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
    state.history = hours.map((hour, idx) => {
      return {
        time: hour,
        productive: Math.floor(Math.random() * 20) + 15 * idx,
        distracted: Math.floor(Math.random() * 5) + 2,
        focus: Math.min(100, 100 - idx * 2 + Math.floor(Math.random() * 5)),
        burnout: Math.min(100, idx * 8 + Math.floor(Math.random() * 6))
      };
    });
    saveStateToStorage();
  }

  // ================= SCORING FORMULAS =================
  function calculateFocusAndBurnout() {
    // 1. Focus Score Formula (0-100)
    // Increases with productive study minutes and completed Pomodoros.
    // Severely penalized by distracted screen-time minutes and tab blur count.
    const totalActivity = state.productiveTime + state.distractedTime;
    let baseFocus = 100;
    
    if (totalActivity > 0) {
      const productiveRatio = state.productiveTime / totalActivity;
      baseFocus = productiveRatio * 100;
    }
    
    // Penalize tab blurs (each tab blur removes 6 Focus Score points)
    baseFocus -= (state.blurCount * 6);
    
    // Reward completed Pomodoros (each completed session rewards 4 Focus Score points)
    baseFocus += (state.pomoRounds * 4);
    
    // Clamp score
    state.focusScore = Math.max(0, Math.min(100, Math.round(baseFocus)));

    // 2. Burnout Score Formula (0-100)
    // Increases with total productive hours studied without sufficient break balance.
    // Spiked heavily by self-reported stress levels and distracted screen usage.
    // Decreased by completed break times.
    let baseBurnout = 0;
    
    // Screen hours contribute to base fatigue
    baseBurnout += (state.productiveTime * 0.45);
    baseBurnout += (state.distractedTime * 0.6);
    
    // Blurs reflect visual chaos / cognitive strain
    baseBurnout += (state.blurCount * 2);
    
    // Stress multiplier
    baseBurnout += (state.stressLevel * 4);
    
    // Subtract break buffers (1 completed Pomodoro signifies study effort, but short breaks decrement fatigue)
    // For calculation: total breaks completed approx = pomoRounds * shortBreakDuration (5 min)
    const breakCredit = state.pomoRounds * 8;
    baseBurnout -= breakCredit;
    
    // Clamp score
    state.burnoutScore = Math.max(0, Math.min(100, Math.round(baseBurnout)));
    
    if (state.burnoutScore >= 50) {
      ZenithTelemetry.trackBurnoutWarning(state.burnoutScore, state.focusScore);
    }
    
    saveStateToStorage();
    updateUIElements();
  }

  // ================= AUDIO SYNTHESIZER (WEB AUDIO API) =================
  function initAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  /**
   * Continuous Soundscapes generator. Uses custom synthesizers
   * to create ambient white noise, rainfall, and binaural beats.
   */
  function startAmbientAudio(soundType) {
    initAudioContext();
    stopAmbientAudio();
    
    if (soundType === 'none') return;
    
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Fill the buffer with white noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    activeAmbientSource = audioCtx.createBufferSource();
    activeAmbientSource.buffer = noiseBuffer;
    activeAmbientSource.loop = true;
    
    // Filter node for custom styling
    const filterNode = audioCtx.createBiquadFilter();
    const gainNode = audioCtx.createGain();
    
    if (soundType === 'white') {
      // Gentle white noise with high frequencies cut down
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(800, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      
      activeAmbientSource.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioCtx.destination);
    } 
    else if (soundType === 'waves') {
      // Rain / Waves effect using modulated bandpass filter
      filterNode.type = 'bandpass';
      filterNode.frequency.setValueAtTime(450, audioCtx.currentTime);
      filterNode.Q.setValueAtTime(1.5, audioCtx.currentTime);
      
      // Modulator oscillator to create rhythmic rain/ocean swelling
      const modulator = audioCtx.createOscillator();
      const modulatorGain = audioCtx.createGain();
      modulator.type = 'sine';
      modulator.frequency.setValueAtTime(0.12, audioCtx.currentTime); // very slow swelling
      modulatorGain.gain.setValueAtTime(250, audioCtx.currentTime); // frequency range swing
      
      modulator.connect(modulatorGain);
      modulatorGain.connect(filterNode.frequency);
      
      gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
      
      activeAmbientSource.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      modulator.start();
      
      // Save modulator for termination cleanup
      activeAmbientNode = modulator;
    }
    else if (soundType === 'binaural') {
      // Binaural beats (alpha relaxation waves) using dual oscillators
      stopAmbientAudio(); // don't need noise buffer source
      
      const leftOsc = audioCtx.createOscillator();
      const rightOsc = audioCtx.createOscillator();
      const merger = audioCtx.createChannelMerger(2);
      
      leftOsc.type = 'sine';
      leftOsc.frequency.setValueAtTime(200, audioCtx.currentTime); // 200 Hz Left Channel
      
      rightOsc.type = 'sine';
      rightOsc.frequency.setValueAtTime(210, audioCtx.currentTime); // 210 Hz Right Channel (10Hz Alpha beat gap)
      
      const waveGain = audioCtx.createGain();
      waveGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      
      leftOsc.connect(merger, 0, 0);
      rightOsc.connect(merger, 0, 1);
      merger.connect(waveGain);
      waveGain.connect(audioCtx.destination);
      
      leftOsc.start();
      rightOsc.start();
      
      activeAmbientSource = leftOsc; // Reference for stopping
      activeAmbientNode = rightOsc;  // Reference for stopping second channel
      
      showToast('info', 'Binaural beats activated. Use stereo headphones for full effect!');
      return;
    }
    
    activeAmbientSource.start();
  }

  function stopAmbientAudio() {
    if (activeAmbientSource) {
      try {
        activeAmbientSource.stop();
      } catch (e) {}
      activeAmbientSource = null;
    }
    if (activeAmbientNode) {
      try {
        activeAmbientNode.stop();
      } catch (e) {}
      activeAmbientNode = null;
    }
  }

  /**
   * High-fidelity synthetic chiming when Pomodoro round finishes.
   */
  function playFinishChime() {
    initAudioContext();
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc1.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // Slide to A5
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
    osc2.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.2); // Slide to C6
    
    gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2); // Smooth fadeout
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 1.3);
    osc2.stop(audioCtx.currentTime + 1.3);
  }

  // ================= POMODORO TIMER ENGINE =================
  function setupTimerMode(mode) {
    state.timer.mode = mode;
    
    if (mode === 'work') {
      state.timer.duration = state.config.work * 60;
      elements.txtTimerModeLabel.textContent = "STUDYING";
      elements.txtTimerModeLabel.style.color = "var(--accent-purple)";
      elements.pomoPhaseIndicator.textContent = "Study Time";
      elements.pomoPhaseIndicator.style.borderColor = "rgba(139, 92, 246, 0.2)";
      elements.pomoPhaseIndicator.style.backgroundColor = "var(--accent-purple-glow)";
      elements.pomoPhaseIndicator.style.color = "var(--accent-purple)";
      elements.pomoRingProgress.style.stroke = "var(--accent-purple)";
    } 
    else if (mode === 'shortBreak') {
      state.timer.duration = state.config.shortBreak * 60;
      elements.txtTimerModeLabel.textContent = "SHORT BREAK";
      elements.txtTimerModeLabel.style.color = "var(--accent-emerald)";
      elements.pomoPhaseIndicator.textContent = "Short Break";
      elements.pomoPhaseIndicator.style.borderColor = "rgba(16, 185, 129, 0.2)";
      elements.pomoPhaseIndicator.style.backgroundColor = "var(--accent-emerald-glow)";
      elements.pomoPhaseIndicator.style.color = "var(--accent-emerald)";
      elements.pomoRingProgress.style.stroke = "var(--accent-emerald)";
    } 
    else if (mode === 'longBreak') {
      state.timer.duration = state.config.longBreak * 60;
      elements.txtTimerModeLabel.textContent = "LONG BREAK";
      elements.txtTimerModeLabel.style.color = "var(--accent-cyan)";
      elements.pomoPhaseIndicator.textContent = "Long Break";
      elements.pomoPhaseIndicator.style.borderColor = "rgba(6, 182, 212, 0.2)";
      elements.pomoPhaseIndicator.style.backgroundColor = "var(--accent-cyan-glow)";
      elements.pomoPhaseIndicator.style.color = "var(--accent-cyan)";
      elements.pomoRingProgress.style.stroke = "var(--accent-cyan)";
    }
    
    state.timer.timeLeft = state.timer.duration;
    updateTimerDisplays();
  }

  function updateTimerDisplays() {
    const minutes = Math.floor(state.timer.timeLeft / 60);
    const seconds = state.timer.timeLeft % 60;
    const padSeconds = seconds < 10 ? '0' + seconds : seconds;
    const padMinutes = minutes < 10 ? '0' + minutes : minutes;
    
    const formatted = `${padMinutes}:${padSeconds}`;
    
    elements.txtMainTimer.textContent = formatted;
    elements.txtQuickTimer.textContent = formatted;
    
    // Update SVG Pomodoro progress ring
    // Total stroke dasharray is 880
    const ratio = state.timer.timeLeft / state.timer.duration;
    const offset = 880 - (ratio * 880);
    elements.pomoRingProgress.style.strokeDashoffset = offset;
    
    // Update dashboard quick progress bar
    const barPercent = (state.timer.timeLeft / state.timer.duration) * 100;
    elements.quickTimerBar.style.width = `${barPercent}%`;
    
    // Tab title update
    document.title = `(${formatted}) Zenith Focus — Student Companion`;
  }

  function toggleTimer() {
    initAudioContext();
    if (state.timer.isRunning) {
      // Pause
      clearInterval(pomodoroTickInterval);
      state.timer.isRunning = false;
      elements.iconTimerPlay.setAttribute('data-lucide', 'play');
      elements.iconQuickPlay.setAttribute('data-lucide', 'play');
      elements.btnQuickPlayPause.innerHTML = '<i data-lucide="play"></i> Resume';
      lucide.createIcons();
      showToast('info', 'Timer paused.');
    } else {
      // Start
      state.timer.isRunning = true;
      elements.iconTimerPlay.setAttribute('data-lucide', 'pause');
      elements.iconQuickPlay.setAttribute('data-lucide', 'pause');
      elements.btnQuickPlayPause.innerHTML = '<i data-lucide="pause"></i> Pause';
      lucide.createIcons();
      showToast('success', 'Focus session running! Ambient sounds enabled.');
      
      // Auto enable sound if not muted
      if (selectedAmbientSound !== 'none') {
        startAmbientAudio(selectedAmbientSound);
      }
      
      pomodoroTickInterval = setInterval(function() {
        if (state.timer.timeLeft > 0) {
          state.timer.timeLeft--;
          
          // Accumulate study minutes every 60s
          if (state.timer.timeLeft % 60 === 0 && state.timer.mode === 'work') {
            state.productiveTime++;
            calculateFocusAndBurnout();
          }
          
          updateTimerDisplays();
        } else {
          // Timer finished!
          clearInterval(pomodoroTickInterval);
          state.timer.isRunning = false;
          playFinishChime();
          
          // Complete phase transitioning
          handleTimerCompleted();
        }
      }, 1000);
    }
  }

  function handleTimerCompleted() {
    if (state.timer.mode === 'work') {
      state.pomoRounds++;
      // Reward study completion!
      state.productiveTime += state.config.work;
      showToast('success', `Awesome! You completed a ${state.config.work}m Pomodoro round! Focus score boosted!`);
      ZenithTelemetry.trackPomodoroCompleted('work', state.config.work);
      
      // Transition to break
      if (state.timer.sessionCount < 4) {
        setupTimerMode('shortBreak');
        elements.txtTimerSession.textContent = `Session ${state.timer.sessionCount} of 4 — Take a Break`;
      } else {
        setupTimerMode('longBreak');
        elements.txtTimerSession.textContent = `Cycles Completed! Long Rest Active`;
      }
    } else {
      // Finished break, transition back to study
      ZenithTelemetry.trackPomodoroCompleted(state.timer.mode, state.timer.mode === 'shortBreak' ? state.config.shortBreak : state.config.longBreak);
      if (state.timer.mode === 'longBreak') {
        state.timer.sessionCount = 1;
      } else {
        state.timer.sessionCount++;
      }
      
      setupTimerMode('work');
      elements.txtTimerSession.textContent = `Session ${state.timer.sessionCount} of 4`;
      showToast('info', 'Break ended! Time to re-focus.');
    }
    
    calculateFocusAndBurnout();
    
    // Toggle buttons visual reset
    elements.iconTimerPlay.setAttribute('data-lucide', 'play');
    elements.iconQuickPlay.setAttribute('data-lucide', 'play');
    elements.btnQuickPlayPause.innerHTML = '<i data-lucide="play"></i> Start';
    lucide.createIcons();
  }

  function skipTimerPhase() {
    clearInterval(pomodoroTickInterval);
    state.timer.isRunning = false;
    handleTimerCompleted();
  }

  function resetTimerPhase() {
    clearInterval(pomodoroTickInterval);
    state.timer.isRunning = false;
    setupTimerMode(state.timer.mode);
    elements.iconTimerPlay.setAttribute('data-lucide', 'play');
    elements.iconQuickPlay.setAttribute('data-lucide', 'play');
    elements.btnQuickPlayPause.innerHTML = '<i data-lucide="play"></i> Start';
    lucide.createIcons();
    showToast('info', 'Timer reset.');
  }

  // ================= DYNAMIC VISIBILITY & TAB SENSORS =================
  function initVisibilitySensors() {
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        // Tab minimized or student changed tab
        if (state.timer.isRunning && state.timer.mode === 'work') {
          state.blurCount++;
          
          // Apply instant heavy scoring penalty
          calculateFocusAndBurnout();
          
          // Log distraction event
          logActivityEntry('distracted', 'Visibility lost! Student browsed away from Zenith Focus dashboard.');
          showToast('error', 'Focus penalty! Screen sensors detected page visibility blurring.');
          ZenithTelemetry.trackDistractionIncident('page_blur', 'Tab minimized or changed browser focus');
        }
      } else {
        // User returned to tab
        showToast('info', 'Welcome back! Re-activating focus sensors.');
      }
    });
  }

  // ================= INTERACTIVE TRACKING SIMULATOR =================
  function initScreenSimulator() {
    // Autopilot study tracker simulator: ticks every 10 seconds to mimic real time pacing
    simulatorTickInterval = setInterval(function() {
      if (!state.simulatorActive) return;
      
      const hourStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Check if student is study mode vs distracted
      if (state.timer.isRunning && state.timer.mode === 'work') {
        // High productive probability
        const isProductive = Math.random() < 0.88;
        if (isProductive) {
          state.productiveTime += 1;
          const studyLogs = [
            "Actively researching academic references.",
            "Drafting exam outline concepts.",
            "Solving advanced equations in subject workspace.",
            "Reviewing key vocabulary modules.",
            "Structuring summary spreadsheets."
          ];
          const randomMsg = studyLogs[Math.floor(Math.random() * studyLogs.length)];
          logActivityEntry('productive', randomMsg);
          ZenithTelemetry.trackStudySession(1, state.subject);
        } else {
          state.distractedTime += 1;
          const distractLogs = [
            "Briefly checked dynamic news aggregates.",
            "Browsed auxiliary discussion threads.",
            "Opened desktop folder to organize files."
          ];
          const randomMsg = distractLogs[Math.floor(Math.random() * distractLogs.length)];
          logActivityEntry('distracted', randomMsg);
          showToast('warning', 'Distraction alert: minor multitasking recorded.');
          ZenithTelemetry.trackDistractionIncident('simulated_autopilot_distraction', randomMsg);
        }
      } else if (!state.timer.isRunning) {
        // Idling, mixed random events
        const eventOdds = Math.random();
        if (eventOdds < 0.3) {
          state.productiveTime += 1;
          logActivityEntry('productive', 'Logged productive notes compilation offline.');
          ZenithTelemetry.trackStudySession(1, state.subject);
        } else if (eventOdds < 0.6) {
          state.distractedTime += 1;
          logActivityEntry('distracted', 'Browsed streaming videos or messaging feeds.');
          showToast('warning', 'External screen time distraction logged.');
          ZenithTelemetry.trackDistractionIncident('simulated_idle_distraction', 'Browsed external social feeds');
        }
      }
      
      // Inject historic ticker data every 60s
      if (Math.random() < 0.25) {
        appendHistoryEntry(hourStr);
      }
      
      calculateFocusAndBurnout();
    }, 10000); // 10s tick speed
  }

  function manualTriggerEvent(type) {
    const hourStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (type === 'study') {
      state.productiveTime += 15;
      logActivityEntry('productive', 'Manual study block added: Solved 15m subject questionnaire.');
      showToast('success', '+15 minutes productive focus recorded.');
      ZenithTelemetry.trackStudySession(15, state.subject);
    } 
    else if (type === 'social') {
      state.distractedTime += 10;
      logActivityEntry('distracted', 'Manual distraction logged: Checked social networks (+10m distraction).');
      showToast('error', 'Distraction logged. Focus score compromised.');
      ZenithTelemetry.trackDistractionIncident('manual_distraction_social', 'Checked chat & socials (+10m)');
    } 
    else if (type === 'gaming') {
      state.distractedTime += 15;
      state.stressLevel = Math.min(10, state.stressLevel + 1); // Gaming increases late-night stress
      logActivityEntry('distracted', 'Manual distraction logged: Played browser arcade game (+15m distraction).');
      showToast('error', 'Extended play session logged. Burnout warning.');
      ZenithTelemetry.trackDistractionIncident('manual_distraction_gaming', 'Played browser game (+15m)');
    }
    
    appendHistoryEntry(hourStr);
    calculateFocusAndBurnout();
  }

  function logActivityEntry(type, msg) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logItem = document.createElement('div');
    logItem.className = `log-entry ${type}`;
    
    let iconName = 'book-open';
    if (type === 'distracted') iconName = 'smartphone';
    if (type === 'warning') iconName = 'shield-alert';
    
    logItem.innerHTML = `
      <span class="log-time">${time}</span>
      <span class="log-message">${msg}</span>
      <i data-lucide="${iconName}"></i>
    `;
    
    // Prepend to show latest on top
    if (elements.trackerLogList.querySelector('.log-placeholder')) {
      elements.trackerLogList.innerHTML = '';
    }
    elements.trackerLogList.insertBefore(logItem, elements.trackerLogList.firstChild);
    lucide.createIcons();
    
    // Limit to latest 15 logs
    if (elements.trackerLogList.children.length > 15) {
      elements.trackerLogList.removeChild(elements.trackerLogList.lastChild);
    }
  }

  function appendHistoryEntry(timeStr) {
    // Add current snapshot to database
    state.history.push({
      time: timeStr,
      productive: state.productiveTime,
      distracted: state.distractedTime,
      focus: state.focusScore,
      burnout: state.burnoutScore
    });
    
    // Limit history memory arrays
    if (state.history.length > 8) {
      state.history.shift();
    }
    saveStateToStorage();
    syncCharts();
  }

  // ================= UI RENDERING & GAUGES =================
  function updateUIElements() {
    // 1. Update scores text
    elements.txtFocusScore.textContent = state.focusScore;
    elements.txtBurnoutScore.textContent = state.burnoutScore;
    
    elements.coachMetricFocus.textContent = state.focusScore;
    elements.coachMetricBurnout.textContent = state.burnoutScore;
    
    // 2. SVG Gauge ring calculations
    // Circumference = 440 (radius 70)
    const focusOffset = 440 - (state.focusScore / 100) * 440;
    document.querySelector('.focus-gauge-bar').style.strokeDashoffset = focusOffset;
    
    const burnoutOffset = 440 - (state.burnoutScore / 100) * 440;
    document.querySelector('.burnout-gauge-bar').style.strokeDashoffset = burnoutOffset;
    
    // 3. Score Rating labels
    if (state.focusScore >= 80) {
      elements.lblFocusStatus.textContent = "Outstanding Focus state!";
      elements.lblFocusStatus.className = "gauge-status focus-excellent";
    } else if (state.focusScore >= 50) {
      elements.lblFocusStatus.textContent = "Stable attention span.";
      elements.lblFocusStatus.className = "gauge-status focus-good";
    } else {
      elements.lblFocusStatus.textContent = "Heavy distractions logged!";
      elements.lblFocusStatus.className = "gauge-status focus-distracted";
    }
    
    if (state.burnoutScore >= 60) {
      elements.lblBurnoutStatus.textContent = "CRITICAL FATIGUE RANGE!";
      elements.lblBurnoutStatus.className = "gauge-status burnout-danger";
    } else if (state.burnoutScore >= 35) {
      elements.lblBurnoutStatus.textContent = "Moderate mental fatigue.";
      elements.lblBurnoutStatus.className = "gauge-status burnout-warning";
    } else {
      elements.lblBurnoutStatus.textContent = "Optimal mental balance.";
      elements.lblBurnoutStatus.className = "gauge-status burnout-optimal";
    }
    
    // 4. Focus Lab Panels sync
    elements.lblProductiveTime.textContent = `${state.productiveTime}m`;
    elements.lblDistractedTime.textContent = `${state.distractedTime}m`;
    elements.lblBlurCount.textContent = `${state.blurCount} times`;
    
    elements.lblTotalRounds.textContent = state.pomoRounds;
    elements.lblTotalMinutes.textContent = `${state.productiveTime}m`;
    
    // 5. AI suggestion live feed on dashboard
    elements.dashboardCoachText.innerHTML = AuraCoach.getLiveSuggestion(state.focusScore, state.burnoutScore, state.subject);
    
    // 6. Reports elements syncing
    elements.repTotalStudy.textContent = `${state.productiveTime}m`;
    elements.repTotalDistraction.textContent = `${state.distractedTime}m`;
    elements.repPomoCompleted.textContent = state.pomoRounds;
    elements.repDistractionCount.textContent = state.blurCount;
    elements.repFocusScore.textContent = state.focusScore;
    elements.repBurnoutScore.textContent = state.burnoutScore;
    
    if (state.focusScore >= 80) {
      elements.repFocusDesc.textContent = "Peak Performance";
      elements.repFocusDesc.style.color = "var(--accent-cyan)";
    } else if (state.focusScore >= 50) {
      elements.repFocusDesc.textContent = "Stable Focus";
      elements.repFocusDesc.style.color = "var(--accent-purple)";
    } else {
      elements.repFocusDesc.textContent = "Attention Fragmented";
      elements.repFocusDesc.style.color = "var(--accent-amber)";
    }
    
    if (state.burnoutScore >= 60) {
      elements.repBurnoutDesc.textContent = "Critical Overload";
      elements.repBurnoutDesc.style.color = "var(--accent-rose)";
    } else if (state.burnoutScore >= 35) {
      elements.repBurnoutDesc.textContent = "Moderate Fatigue";
      elements.repBurnoutDesc.style.color = "var(--accent-amber)";
    } else {
      elements.repBurnoutDesc.textContent = "Safe Balance";
      elements.repBurnoutDesc.style.color = "var(--accent-emerald)";
    }
    
    // Generate AI assessment report card contents
    const assessmentStats = {
      productiveTime: state.productiveTime,
      distractedTime: state.distractedTime,
      blurCount: state.blurCount,
      pomoRounds: state.pomoRounds,
      focusScore: state.focusScore,
      burnoutScore: state.burnoutScore,
      subject: state.subject
    };
    elements.repAiContentText.innerHTML = AuraCoach.generatePerformanceAnalysis(assessmentStats).replace(/\n/g, '<br>');
  }

  // ================= CHART.JS CREATION AND RENDERING =================
  function initCharts() {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = 'Inter';
    
    // 1. Dashboard Usage pie/doughnut Chart
    const ctxDash = elements.dashboardUsageChart.getContext('2d');
    dashboardUsageChart = new Chart(ctxDash, {
      type: 'doughnut',
      data: {
        labels: ['Productive Hours', 'Distracted Hours'],
        datasets: [{
          data: [state.productiveTime, state.distractedTime],
          backgroundColor: ['#06b6d4', '#f43f5e'],
          borderColor: 'rgba(255, 255, 255, 0.05)',
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        cutout: '75%'
      }
    });

    // 2. Focus Lab detailed tracking chart (Cumulative Activity)
    const ctxDetailed = elements.trackerDetailedChart.getContext('2d');
    trackerDetailedChart = new Chart(ctxDetailed, {
      type: 'bar',
      data: {
        labels: state.history.map(h => h.time),
        datasets: [
          {
            label: 'Productive Work (min)',
            data: state.history.map(h => h.productive),
            backgroundColor: 'rgba(6, 182, 212, 0.55)',
            borderColor: '#06b6d4',
            borderWidth: 1.5,
            borderRadius: 4
          },
          {
            label: 'Distracted Work (min)',
            data: state.history.map(h => h.distracted),
            backgroundColor: 'rgba(244, 63, 94, 0.55)',
            borderColor: '#f43f5e',
            borderWidth: 1.5,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(255,255,255,0.03)' } }
        },
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });

    // 3. Daily Report Timeline Graph
    const ctxReport = elements.reportTimelineChart.getContext('2d');
    reportTimelineChart = new Chart(ctxReport, {
      type: 'line',
      data: {
        labels: state.history.map(h => h.time),
        datasets: [
          {
            label: 'Focus Index',
            data: state.history.map(h => h.focus),
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.05)',
            tension: 0.35,
            fill: true,
            borderWidth: 2.5
          },
          {
            label: 'Burnout Index',
            data: state.history.map(h => h.burnout),
            borderColor: '#f43f5e',
            backgroundColor: 'rgba(244, 63, 94, 0.05)',
            tension: 0.35,
            fill: true,
            borderWidth: 2.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: { min: 0, max: 100 }
        },
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  function syncCharts() {
    if (!dashboardUsageChart || !trackerDetailedChart || !reportTimelineChart) return;
    
    // Update dashboard doughnut values (handle division by zero fallback)
    const pTime = state.productiveTime === 0 && state.distractedTime === 0 ? 1 : state.productiveTime;
    dashboardUsageChart.data.datasets[0].data = [pTime, state.distractedTime];
    dashboardUsageChart.update();
    
    // Update Focus Lab cumulative values
    trackerDetailedChart.data.labels = state.history.map(h => h.time);
    trackerDetailedChart.data.datasets[0].data = state.history.map(h => h.productive);
    trackerDetailedChart.data.datasets[1].data = state.history.map(h => h.distracted);
    trackerDetailedChart.update();
    
    // Update daily report index timeline values
    reportTimelineChart.data.labels = state.history.map(h => h.time);
    reportTimelineChart.data.datasets[0].data = state.history.map(h => h.focus);
    reportTimelineChart.data.datasets[1].data = state.history.map(h => h.burnout);
    reportTimelineChart.update();
  }

  // ================= CHATBOT ENGINE & INTERFACES =================
  function triggerAiCoachingMessage(rawQuery) {
    const container = elements.chatMessages;
    
    // 1. Render student message
    const studentBubble = document.createElement('div');
    studentBubble.className = 'chat-message user';
    
    let bubbleText = rawQuery;
    if (rawQuery === 'exam-stress') bubbleText = "Exams are stressing me out. How do I start?";
    if (rawQuery === 'burnout-prevention') bubbleText = "How do I prevent burnout today?";
    if (rawQuery === 'subject-routine') bubbleText = "Create a focus routine for my selected subject.";
    if (rawQuery === 'take-break') bubbleText = "Let's do a guided breathing exercises session.";
    
    studentBubble.innerHTML = `<div class="msg-bubble">${bubbleText}</div>`;
    container.appendChild(studentBubble);
    container.scrollTop = container.scrollHeight;
    
    // 2. Fetch processed response from Aura
    const coachStats = {
      productiveTime: state.productiveTime,
      distractedTime: state.distractedTime,
      blurCount: state.blurCount,
      pomoRounds: state.pomoRounds,
      focusScore: state.focusScore,
      burnoutScore: state.burnoutScore,
      subject: state.subject
    };
    
    const outcome = AuraCoach.processUserMessage(rawQuery, coachStats);
    
    // 3. Render coach reply with dynamic typing delay
    setTimeout(function() {
      const coachBubble = document.createElement('div');
      coachBubble.className = 'chat-message coach';
      
      let replyContent = outcome.reply;
      
      // Check for dynamic breathing break trigger action
      if (outcome.action === 'start-breathing') {
        replyContent += `
          <div class="breathing-session no-print">
            <div class="breathing-bubble-outer">
              <div class="breathing-bubble-inner" id="breathing-circle"></div>
            </div>
            <p class="breathing-guide-text" id="breathing-hint">Get Ready...</p>
          </div>
        `;
      }
      
      coachBubble.innerHTML = `<div class="msg-bubble">${replyContent.replace(/\n/g, '<br>')}</div>`;
      container.appendChild(coachBubble);
      container.scrollTop = container.scrollHeight;
      
      // If action is breathing, trigger cycle sequences
      if (outcome.action === 'start-breathing') {
        runBreathingVisualCycle();
      }
    }, 600);
  }

  function runBreathingVisualCycle() {
    ZenithTelemetry.trackBreathingExerciseStarted();
    const hint = document.getElementById('breathing-hint');
    const circle = document.getElementById('breathing-circle');
    if (!hint || !circle) return;
    
    let cycle = 0;
    const stages = [
      { text: "🌬️ Breathe In... Deeply.", scale: "scale(1.8)", duration: 4000 },
      { text: "⏳ Hold... Relax your shoulders.", scale: "scale(1.8)", duration: 4000 },
      { text: "💨 Breathe Out... Release stress.", scale: "scale(1.0)", duration: 4000 },
      { text: "⏳ Hold... Clear your mind.", scale: "scale(1.0)", duration: 4000 }
    ];
    
    function tickStage() {
      if (cycle >= 16) { // Run 4 complete cycles (1 minute)
        hint.textContent = "✨ Breathing exercise completed! Feel refreshed.";
        circle.style.transform = "scale(1.0)";
        return;
      }
      
      const current = stages[cycle % 4];
      hint.textContent = current.text;
      circle.style.transform = current.scale;
      
      // Add dynamic color shift during cycle
      if (cycle % 4 === 0) circle.style.background = "var(--accent-cyan)";
      if (cycle % 4 === 2) circle.style.background = "var(--accent-purple)";
      
      cycle++;
      setTimeout(tickStage, current.duration);
    }
    
    tickStage();
  }

  // ================= GENERAL UI CONTROLLERS =================
  function showToast(type, message) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconName = 'check-circle';
    if (type === 'info') iconName = 'info';
    if (type === 'warning') iconName = 'alert-triangle';
    if (type === 'error') iconName = 'x-circle';
    
    toast.innerHTML = `
      <div class="toast-icon">
        <i data-lucide="${iconName}"></i>
      </div>
      <span>${message}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => {
      toast.style.animation = 'fadeIn 0.3s reverse forwards';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  function handleTabNavigation(tabName) {
    elements.navButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-tab') === tabName) {
        btn.classList.add('active');
      }
    });

    elements.tabPanels.forEach(panel => {
      panel.classList.remove('active');
      if (panel.id === `tab-${tabName}`) {
        panel.classList.add('active');
      }
    });

    // Update Page Header Titles dynamically
    const headerDetails = {
      'dashboard': { title: "Dashboard Overview", subtitle: "Track focus scores and shield your mind from cognitive stress." },
      'pomodoro': { title: "Pomodoro Workspace", subtitle: "Immersive study timers coupled with customized audio generators." },
      'tracker': { title: "Focus Lab & Sensor Simulator", subtitle: "Analyze screen-time behaviors and evaluate distraction parameters." },
      'ai-coach': { title: "Aura Cognitive Advisor", subtitle: "Talk with the AI tutor to manage workload stress and routines." },
      'reports': { title: "Daily Performance Report", subtitle: "Comprehensive summary matrices calibrated for academic review." }
    };

    const details = headerDetails[tabName] || headerDetails.dashboard;
    elements.pageTitle.textContent = details.title;
    elements.pageSubtitle.textContent = details.subtitle;
    
    // Trigger chart refreshes to resolve any container layout scaling issues
    setTimeout(syncCharts, 50);
  }

  // ================= EVENT LISTENER INITIALIZATIONS =================
  function registerEventListeners() {
    
    // 1. Tab switches
    elements.navButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        handleTabNavigation(btn.getAttribute('data-tab'));
      });
    });
    
    // Direct dashboard advisor navigation helper
    elements.btnViewAiCoach.addEventListener('click', function() {
      handleTabNavigation('ai-coach');
    });

    // 2. Subject selection changing
    elements.subjectSelector.addEventListener('change', function() {
      state.subject = this.value;
      
      // Update subject specialized tips block in AI coach tab
      const subjData = AuraCoach.subjectStrategies[state.subject] || AuraCoach.subjectStrategies.general;
      elements.aiSubjectTips.textContent = subjData.tips[0];
      
      calculateFocusAndBurnout();
      ZenithTelemetry.trackSubjectChanged(state.subject);
      showToast('info', `Active study subject switched to ${this.options[this.selectedIndex].text}. Tips updated.`);
    });

    // 3. Quick timer widget controllers
    elements.btnQuickPlayPause.addEventListener('click', toggleTimer);
    elements.btnQuickSkip.addEventListener('click', skipTimerPhase);

    // 4. Main Pomodoro Workspace controllers
    elements.btnTimerPlayPause.addEventListener('click', toggleTimer);
    elements.btnTimerSkip.addEventListener('click', skipTimerPhase);
    elements.btnTimerReset.addEventListener('click', resetTimerPhase);
    
    elements.btnModeWork.addEventListener('click', () => { resetTimerPhase(); setupTimerMode('work'); });
    elements.btnModeShort.addEventListener('click', () => { resetTimerPhase(); setupTimerMode('shortBreak'); });
    elements.btnModeLong.addEventListener('click', () => { resetTimerPhase(); setupTimerMode('longBreak'); });

    // Ambient music buttons
    elements.audioButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        elements.audioButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        selectedAmbientSound = this.getAttribute('data-sound');
        
        // Start or stop music depending on state
        if (state.timer.isRunning) {
          startAmbientAudio(selectedAmbientSound);
        } else {
          // Play a small preview chime on hover/selection gesture
          startAmbientAudio(selectedAmbientSound);
          setTimeout(stopAmbientAudio, 1800);
          showToast('info', `Previewing soundscape. Continuous playback begins when timer starts.`);
        }
      });
    });

    // 5. Timer settings configuration
    elements.btnApplyTimerSettings.addEventListener('click', function() {
      const workVal = parseInt(elements.inputStudyTime.value);
      const shortVal = parseInt(elements.inputShortBreak.value);
      const longVal = parseInt(elements.inputLongBreak.value);
      
      if (isNaN(workVal) || workVal < 1 || isNaN(shortVal) || shortVal < 1 || isNaN(longVal) || longVal < 1) {
        showToast('error', 'Invalid timer values. Must be positive integers.');
        return;
      }
      
      state.config.work = workVal;
      state.config.shortBreak = shortVal;
      state.config.longBreak = longVal;
      
      resetTimerPhase();
      showToast('success', 'Timer configuration applied and reset.');
      saveStateToStorage();
    });

    // 6. Focus Lab Controls
    elements.chkAutoSimulator.addEventListener('change', function() {
      state.simulatorActive = this.checked;
      
      if (state.simulatorActive) {
        elements.lblActiveState.textContent = "ACTIVE FOCUS SENSORS RUNNING";
        elements.lblActiveState.className = "badge active-badge";
        showToast('success', 'Autopilot study sensors re-connected.');
      } else {
        elements.lblActiveState.textContent = "SENSORS PAUSED (MANUAL ONLY)";
        elements.lblActiveState.className = "badge btn-action-distract";
        showToast('warning', 'Autopilot simulation paused. Only manual logs recorded.');
      }
    });

    elements.btnSimStudy.addEventListener('click', () => manualTriggerEvent('study'));
    elements.btnSimSocial.addEventListener('click', () => manualTriggerEvent('social'));
    elements.btnSimGaming.addEventListener('click', () => manualTriggerEvent('gaming'));

    // 7. AI Coach chat queries
    elements.chatPresets.forEach(btn => {
      btn.addEventListener('click', function() {
        const query = this.getAttribute('data-query');
        triggerAiCoachingMessage(query);
      });
    });

    elements.btnSendChat.addEventListener('click', function() {
      const query = elements.inputChatQuery.value;
      if (!query.trim()) return;
      triggerAiCoachingMessage(query);
      elements.inputChatQuery.value = '';
    });

    elements.inputChatQuery.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        elements.btnSendChat.click();
      }
    });

    elements.btnAiAnalyze.addEventListener('click', function() {
      triggerAiCoachingMessage('analyze');
    });

    // 8. Reports print and clean actions
    elements.btnPrintReport.addEventListener('click', function() {
      window.print();
    });

    elements.btnResetData.addEventListener('click', function() {
      if (confirm('Are you sure you want to clear all focus statistics, history logs, and reset Zenith Focus state? This action is permanent.')) {
        localStorage.removeItem('zenith_focus_state_v1');
        showToast('error', 'LocalStorage purged. Reloading application...');
        setTimeout(() => window.location.reload(), 1000);
      }
    });

    // Live clock tick
    setInterval(function() {
      const now = new Date();
      elements.liveClock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }, 1000);
  }

  // ================= APP INITIALIZATION BLOCK =================
  function init() {
    lucide.createIcons();
    
    // Set current print metadata date
    elements.printDate.textContent = `Generated on: ${new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
    
    initPersistence();
    setupTimerMode('work');
    initCharts();
    calculateFocusAndBurnout();
    initVisibilitySensors();
    initScreenSimulator();
    registerEventListeners();
    
    // Set initial custom tips
    const subTips = AuraCoach.subjectStrategies[state.subject] || AuraCoach.subjectStrategies.general;
    elements.aiSubjectTips.textContent = subTips.tips[0];
  }

  // Fire engine
  init();

});
