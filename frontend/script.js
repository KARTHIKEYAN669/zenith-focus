document.addEventListener('DOMContentLoaded', () => {
    // Auth elements
    const authSection = document.getElementById('auth-section');
    const appSection = document.getElementById('app-section');
    const authForm = document.getElementById('auth-form');
    const authTitle = document.getElementById('auth-title');
    const toggleAuthBtn = document.getElementById('toggle-auth');
    const authError = document.getElementById('auth-error');
    const authSubmit = document.getElementById('auth-submit');
    const logoutBtn = document.getElementById('logout-btn');
    
    let isLoginMode = true;

    // Check Auth State on Load
    checkAuth();

    async function checkAuth() {
        try {
            const res = await fetch('/api/user', { credentials: 'include' });
            const data = await res.json();
            if (data.logged_in) {
                showApp(data.is_admin);
            } else {
                showAuth();
            }
        } catch(e) {
            showAuth();
        }
    }

    function showApp(isAdmin) {
        authSection.style.display = 'none';
        appSection.style.display = 'block';
        logoutBtn.style.display = 'block';
        document.getElementById('feedback-fab').style.display = 'block';
        if (isAdmin) {
            document.getElementById('nav-admin').style.display = 'block';
        } else {
            document.getElementById('nav-admin').style.display = 'none';
        }
    }

    function showAuth() {
        authSection.style.display = 'block';
        appSection.style.display = 'none';
        logoutBtn.style.display = 'none';
        document.getElementById('feedback-fab').style.display = 'none';
    }

    // Toggle Login/Register
    toggleAuthBtn.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        authTitle.textContent = isLoginMode ? 'Login' : 'Register';
        authSubmit.textContent = isLoginMode ? 'Login' : 'Register';
        toggleAuthBtn.innerHTML = isLoginMode ? 'Need an account? <strong>Register here</strong>' : 'Already have an account? <strong>Login here</strong>';
        authError.style.display = 'none';
    });

    // Handle Auth Submission
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const endpoint = isLoginMode ? '/api/login' : '/api/register';
        
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });
            const data = await res.json();
            
            if (res.ok) {
                authError.style.display = 'none';
                authForm.reset();
                showApp(data.is_admin);
                if (!isLoginMode) {
                    document.getElementById('onboarding-modal').style.display = 'block';
                }
            } else {
                authError.textContent = data.error || 'Authentication failed';
                authError.style.display = 'block';
            }
        } catch(err) {
            authError.textContent = 'Server error. Try again.';
            authError.style.display = 'block';
        }
    });

    // Handle Logout
    logoutBtn.addEventListener('click', async () => {
        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
        showAuth();
    });

    // App elements
    const form = document.getElementById('prediction-form');
    const scoreCircle = document.getElementById('score-circle');
    const scoreValue = document.getElementById('score-value');
    const scoreMessage = document.getElementById('score-message');
    const submitBtn = form.querySelector('.glow-button');
    
    // Wearable Sync Simulation
    const syncBtn = document.getElementById('sync-wearable-btn');
    if (syncBtn) {
        syncBtn.addEventListener('click', async () => {
            syncBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Connecting to Wearable...';
            syncBtn.disabled = true;
            
            // Simulate Bluetooth/API delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Auto-fill realistic values
            document.getElementById('sleep').value = '7.5';
            document.getElementById('study').value = '3.5';
            document.getElementById('screen_time').value = '4.0';
            document.getElementById('breaks').value = '3';
            
            syncBtn.innerHTML = '<i class="fa-solid fa-check" style="margin-right: 8px;"></i> Synced Successfully';
            syncBtn.style.background = 'linear-gradient(45deg, #00b09b, #96c93d)';
            
            // Reset button after 3 seconds
            setTimeout(() => {
                syncBtn.innerHTML = '<i class="fa-solid fa-stopwatch" style="margin-right: 8px;"></i> Sync Smartwatch Data';
                syncBtn.style.background = 'linear-gradient(45deg, #1e3c72, #2a5298)';
                syncBtn.disabled = false;
            }, 3000);
        });
    }

    // Tabs
    const tabBtns = document.querySelectorAll('.tab-btn[data-target]');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.style.display = 'none');
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).style.display = 'block';
            
            if (btn.dataset.target === 'tab-history') {
                fetchAndDrawHistory();
            } else if (btn.dataset.target === 'tab-admin') {
                fetchAdminStats();
            }
        });
    });

    // Feedback and Onboarding Listeners
    const feedbackFab = document.getElementById('feedback-fab');
    const feedbackModal = document.getElementById('feedback-modal');
    const closeFeedback = document.getElementById('close-feedback');
    const feedbackForm = document.getElementById('feedback-form');
    
    feedbackFab.addEventListener('click', () => feedbackModal.style.display = 'block');
    closeFeedback.addEventListener('click', () => feedbackModal.style.display = 'none');
    
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const category = document.getElementById('feedback-category').value;
        const message = document.getElementById('feedback-message').value;
        
        try {
            await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, message }),
                credentials: 'include'
            });
            feedbackModal.style.display = 'none';
            feedbackForm.reset();
            alert('Thank you for your feedback!');
        } catch (error) {
            alert('Error submitting feedback.');
        }
    });

    document.getElementById('close-onboarding').addEventListener('click', () => {
        document.getElementById('onboarding-modal').style.display = 'none';
    });

    // Admin Data
    async function fetchAdminStats() {
        try {
            const res = await fetch('/api/admin/stats', { credentials: 'include' });
            if (!res.ok) return;
            const data = await res.json();
            
            document.getElementById('admin-total-users').textContent = data.total_users;
            document.getElementById('admin-total-scores').textContent = data.total_scores;
            
            const list = document.getElementById('admin-feedback-list');
            list.innerHTML = data.feedback.length === 0 
                ? '<p style="color:var(--text-secondary)">No feedback yet.</p>' 
                : data.feedback.map(f => `
                    <div style="background:rgba(0,0,0,0.3); padding:1rem; border-radius:12px; margin-bottom:1rem; border-left:4px solid var(--accent-color);">
                        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; color:var(--text-secondary); font-size:0.9rem;">
                            <span><strong>${f.username}</strong> [${f.category}]</span>
                            <span>${f.timestamp.split(' ')[0]}</span>
                        </div>
                        <p>${f.message}</p>
                    </div>
                `).join('');
                
        } catch (error) {
            console.error('Failed to load admin stats:', error);
        }
    }

    let historyChartInstance = null;
    let radarChartInstance = null;

    async function fetchAndDrawHistory() {
        try {
            const response = await fetch('/api/history', { credentials: 'include' });
            const payload = await response.json();
            
            if (payload.error || !payload.history) return;
            
            const data = payload.history;
            const insights = payload.insights;
            
            if (data.length === 0) return;

            const labels = data.map(item => item.timestamp.split(' ')[0]); // just date
            const focusScores = data.map(item => item.focus_score);
            const burnoutScores = data.map(item => item.burnout_score);
            
            // --- Line Chart ---
            const ctx = document.getElementById('historyChart').getContext('2d');
            if (historyChartInstance) {
                historyChartInstance.destroy();
            }
            historyChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Focus Score',
                            data: focusScores,
                            borderColor: '#00f0ff',
                            backgroundColor: 'rgba(0, 240, 255, 0.1)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Burnout Risk',
                            data: burnoutScores,
                            borderColor: '#ff4b4b',
                            backgroundColor: 'rgba(255, 75, 75, 0.1)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a0a5b5' } },
                        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a0a5b5' } }
                    },
                    plugins: { legend: { labels: { color: '#fff' } } }
                }
            });

            // --- Radar Chart (Latest Habits) ---
            const latest = data[data.length - 1];
            const radarCtx = document.getElementById('radarChart').getContext('2d');
            if (radarChartInstance) radarChartInstance.destroy();
            
            radarChartInstance = new Chart(radarCtx, {
                type: 'radar',
                data: {
                    labels: ['Sleep (hrs)', 'Study (hrs)', 'Screen Time (hrs)', 'Breaks (count)'],
                    datasets: [{
                        label: 'Current Habits',
                        data: [latest.sleep, latest.study, latest.screen_time, latest.breaks],
                        backgroundColor: 'rgba(157, 0, 255, 0.2)',
                        borderColor: '#9d00ff',
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#9d00ff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        r: {
                            beginAtZero: true,
                            suggestedMax: 10,
                            grid: { color: 'rgba(255,255,255,0.1)' },
                            angleLines: { color: 'rgba(255,255,255,0.1)' },
                            pointLabels: { color: '#a0a5b5', font: { size: 12 } },
                            ticks: { display: false } // Hide numbers on the web
                        }
                    },
                    plugins: { legend: { display: false } }
                }
            });

            // --- Trends ---
            if (data.length > 1) {
                const prev = data[data.length - 2];
                const focusDiff = latest.focus_score - prev.focus_score;
                const burnoutDiff = latest.burnout_score - prev.burnout_score;
                
                const focusTrendEl = document.getElementById('trend-focus');
                const burnoutTrendEl = document.getElementById('trend-burnout');
                
                if (focusDiff >= 0) {
                    focusTrendEl.innerHTML = `<span style="color:#00f0ff">▲ +${focusDiff}</span>`;
                } else {
                    focusTrendEl.innerHTML = `<span style="color:#ff4b4b">▼ ${focusDiff}</span>`;
                }

                if (burnoutDiff > 0) {
                    burnoutTrendEl.innerHTML = `<span style="color:#ff4b4b">▲ +${burnoutDiff}</span>`;
                } else {
                    burnoutTrendEl.innerHTML = `<span style="color:#00f0ff">▼ ${burnoutDiff}</span>`;
                }
            } else {
                document.getElementById('trend-focus').innerHTML = `<span style="color:var(--text-secondary)">--</span>`;
                document.getElementById('trend-burnout').innerHTML = `<span style="color:var(--text-secondary)">--</span>`;
            }
            
            // --- Tips ---
            const tipsList = document.getElementById('tips-list');
            if (tipsList.innerHTML.includes('Generate a score')) {
                renderTips(latest.tips);
            }
            
            // --- Insights ---
            renderInsights(insights);
            
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    }

    function renderInsights(insightsArray) {
        const container = document.getElementById('insights-list');
        if (!insightsArray || insightsArray.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No insights available.</p>';
            return;
        }
        
        let html = '<ul>';
        insightsArray.forEach(insight => {
            html += `<li style="border-left-color: var(--accent-secondary);">${insight}</li>`;
        });
        html += '</ul>';
        container.innerHTML = html;
    }

    function renderTips(tipsArray) {
        const tipsContainer = document.getElementById('tips-list');
        if (!tipsArray || tipsArray.length === 0) {
            tipsContainer.innerHTML = '<p style="color: var(--text-secondary);">No tips available.</p>';
            return;
        }
        
        let html = '<ul>';
        tipsArray.forEach(tip => {
            html += `<li>${tip}</li>`;
        });
        html += '</ul>';
        tipsContainer.innerHTML = html;
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Button loading state
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Calculating...';
        submitBtn.style.opacity = '0.7';

        // Gather data
        const formData = {
            sleep: parseFloat(document.getElementById('sleep').value),
            study: parseFloat(document.getElementById('study').value),
            screen_time: parseFloat(document.getElementById('screen_time').value),
            breaks: parseInt(document.getElementById('breaks').value),
            mood: document.getElementById('mood').value
        };

        try {
            // Make API request to our backend
            const response = await fetch('/api/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch prediction');
            }

            const data = await response.json();
            const score = Math.round(data.focus_score);
            
            // Animate UI updates
            updateScoreUI(score, data);
            
        } catch (error) {
            console.error('Error:', error);
            scoreMessage.textContent = 'An error occurred while calculating your score. Please try again.';
            scoreMessage.style.color = '#ff4b4b';
        } finally {
            // Restore button state
            submitBtn.textContent = originalText;
            submitBtn.style.opacity = '1';
        }
    });

    // Function to update the circular chart and text dynamically
    function updateScoreUI(targetScore, fullData = null) {
        // Update circle stroke dasharray
        // Full circle is 100, so we map the score (0-100) directly to stroke-dasharray
        scoreCircle.setAttribute('stroke-dasharray', `${targetScore}, 100`);
        
        // Change color based on score
        let color = '#00f0ff'; // Cyan (good)
        let glow = 'rgba(0, 240, 255, 0.4)';
        let message = 'Excellent habits! Your focus potential is very high.';
        
        if (targetScore < 40) {
            color = '#ff007a'; // Pink/Red (poor)
            glow = 'rgba(255, 0, 122, 0.4)';
            message = 'Your focus potential is low. Consider more sleep and breaks.';
        } else if (targetScore < 70) {
            color = '#ffb800'; // Yellow/Orange (average)
            glow = 'rgba(255, 184, 0, 0.4)';
            message = 'Decent potential. Small habit tweaks could improve focus.';
        }
        
        scoreCircle.style.stroke = color;
        scoreCircle.style.filter = `drop-shadow(0 0 8px ${glow})`;
        scoreMessage.textContent = message;
        scoreMessage.style.color = '#fff';

        if (fullData) {
            document.getElementById('detailed-stats').style.display = 'block';
            document.getElementById('stat-rule').textContent = Math.round(fullData.rule_score);
            document.getElementById('stat-ml').textContent = fullData.ml_score;
            document.getElementById('stat-burnout').textContent = fullData.burnout_score + '%';
            
            let burnoutColor = '#00f0ff'; // cyan
            if (fullData.burnout_score > 60) burnoutColor = '#ff007a'; // high risk
            else if (fullData.burnout_score > 30) burnoutColor = '#ffb800'; // med risk
            document.getElementById('stat-burnout').style.color = burnoutColor;
            
            document.getElementById('stat-status').textContent = fullData.status;
            document.getElementById('stat-status').style.color = color;
            
            // Render tips if available
            if (fullData.tips) {
                renderTips(fullData.tips);
            }
        }

        // Animate numbers counting up
        animateValue(scoreValue, parseInt(scoreValue.textContent) || 0, targetScore, 1500);
    }

    // Number counting animation
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease out cubic function for smoother ending
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            obj.innerHTML = Math.floor(easeOut * (end - start) + start);
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});
