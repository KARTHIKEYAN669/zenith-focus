/**
 * Zenith Focus — AI Focus & Wellness Coach Engine ("Aura AI")
 * Implements local intelligent cognitive heuristics, subject study strategies,
 * dynamic feedback based on metrics, and guided mental recovery procedures.
 */

const AuraCoach = (function() {
  
  // Custom exam study tips per subject
  const subjectStrategies = {
    'mathematics': {
      title: 'Mathematics Study Strategies',
      tips: [
        'Break down problems: Work through 3 core proofs or mathematical concepts, then take a physical break.',
        'Anti-Burnout tip: Avoid math after 9 PM. Visual-spatial reasoning drops sharply with sleep deprivation.',
        'Active recall: Write down formulas from memory on a blank sheet before doing practice exercises.',
        'Recommended rhythm: 35 minutes study (deep problem-solving) + 7 minutes physical break (hydrate).'
      ],
      motto: 'Solve with structure. Rest to consolidate numerical patterns.'
    },
    'computer-science': {
      title: 'Computer Science & Coding Strategies',
      tips: [
        'Coding focus: Code in blocks of 40 minutes, followed by an immediate screen-free break to avoid eye strain.',
        'Rubber duck debugging: Explaining code logic to an imaginary partner reduces mental frustration and cortisol.',
        'Anti-Burnout tip: Stand up, stretch, and focus your eyes on an object 20 feet away during your breaks.',
        'Code-Break Balance: Avoid continuous typing for more than 1 hour. Carpal and cognitive fatigue build together.'
      ],
      motto: 'Compile your knowledge in modules. Execute breaks without errors.'
    },
    'physics': {
      title: 'Physics & Chemistry Formulas & Application',
      tips: [
        'Concept Mapping: Visualize formulas as physical systems (e.g. gravity, energy transfer, chemical bonding).',
        'Anti-Burnout tip: Alternate between formula memorization and practice calculations to keep different cognitive zones active.',
        'Break Activity: Do 10 jumping jacks or a deep stretch to circulate oxygen to your brain.',
        'Rhythm: 30m deep reading + 5m physical stretching.'
      ],
      motto: 'Energy is conserved. Manage your mental energy just like thermodynamics.'
    },
    'literature': {
      title: 'Literature, Humanities & Languages',
      tips: [
        'Semantic overload: Reading text for hours causes semantic fatigue. Switch to summary note writing every 25 minutes.',
        'Vocal reading: Read difficult paragraphs aloud to stimulate auditory memory and prevent zone-outs.',
        'Anti-Burnout tip: Close your eyes for 3 minutes between chapters. Let your visual cortex relax.',
        'Rhythm: 25m active text reading + 5m soft mental review.'
      ],
      motto: 'Translate information into wisdom. Rest between paragraphs.'
    },
    'general': {
      title: 'General Exam Conditioning',
      tips: [
        'Spaced Repetition: Review high-yield summary cards for 20 minutes, then rest for 5 minutes.',
        'Anti-Burnout tip: Protect your sleep. Studying while tired has a 60% lower consolidation rate.',
        'Hydration check: Dehydration reduces concentration by 15%. Drink a glass of water every break.',
        'Rhythm: Standard 25-minute Pomodoro is optimal for continuous study endurance.'
      ],
      motto: 'Consistency beats cramming. Protect your mental stamina.'
    }
  };

  // Preset responses mapping
  const presetResponses = {
    'exam-stress': {
      reply: "Exam stress is a natural sympathetic response, but if left uncontrolled, it spikes your Burnout Index and impairs active recall. Here is a **3-step stress regulation routine**:\n\n1. **Box Breathing**: Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold for 4 seconds. Let's do it together using the 'guided breathing exercise' option!\n2. **Break down the syllabus**: Write down only the next *single task* you need to do, ignoring the rest of the syllabus for the next hour.\n3. **Subject Check**: Ensure you select your current study subject at the top header to align your study rhythms perfectly.",
      action: null
    },
    'burnout-prevention': {
      reply: "To prevent burnout, we need to balance **Cognitive Load** with **Parasympathetic Reset**. Here are my key rules based on cognitive science:\n\n1. **The 50-10 Rule**: Never study continuously for more than 50 minutes without a 10-minute pure screen-free break.\n2. **Tech-Free Breaks**: Looking at your phone during a study break is NOT a break! Your brain still processes pixels, blocking memory consolidation. Walk around or drink water.\n3. **Early Warning Indicator**: Keep an eye on your **Burnout Index** gauge on the dashboard. If it climbs past 50, it is an automatic signal that your focus efficiency has dropped and breaks are mandatory.",
      action: null
    },
    'subject-routine': {
      reply: "I will generate a customized routine based on your selected subject. Please ensure your active subject is correct in the top header. Here is your optimal plan:",
      action: 'subject-routine-custom'
    },
    'take-break': {
      reply: "Let's take a quick guided breathing break to lower your cortisol levels and clear your mental workspace. I've activated the visual breathing bubble below. Focus on the bubble and synchronize your breathing:",
      action: 'start-breathing'
    }
  };

  /**
   * Generates dynamic live suggestions for the dashboard based on focus & burnout scores.
   * @param {number} focusScore - Current focus score (0-100)
   * @param {number} burnoutScore - Current burnout score (0-100)
   * @param {string} subject - Active study subject
   * @returns {string} Live feedback text.
   */
  function getLiveSuggestion(focusScore, burnoutScore, subject) {
    const subjData = subjectStrategies[subject] || subjectStrategies.general;
    
    if (burnoutScore >= 75) {
      return `⚠️ **CRITICAL BURNOUT WARNING (${burnoutScore}/100)**: Your cognitive load is saturated and mental fatigue is severe. Stop studying immediately! Aura recommends a 15-minute Long Break and a guided breathing session to prevent exam-cram failure.`;
    }
    
    if (burnoutScore >= 50) {
      return `⚠️ **Elevated Burnout (${burnoutScore}/100)**: Fatigue is building up. Your focus efficiency is dropping. Tip: ${subjData.tips[1] || 'Take a pure tech-free screen break.'} Finish your current Pomodoro round and take a mandatory 10-minute break.`;
    }
    
    if (focusScore < 40) {
      return `🎯 **Low Focus Detected (${focusScore}/100)**: Distractions or tab blurring have interrupted your rhythm. Let's restart your attention span. Subject strategy tip: *"${subjData.tips[2]}"* Let's start a new Study Session right now.`;
    }
    
    if (focusScore >= 80 && burnoutScore < 30) {
      return `🚀 **Superb Performance!** Focus: **${focusScore}**, Burnout: **${burnoutScore}**. You are in a flow state studying **${subjData.title}**. Action tip: *"${subjData.tips[0]}"* Keep going!`;
    }
    
    return `✨ Aura Coach: You are doing great studying **${subjData.title}**. Remember: *"${subjData.motto}"* Take your breaks on time to maximize long-term memory retrieval!`;
  }

  /**
   * Evaluates user query and returns structured reply and action code.
   * @param {string} rawQuery - Text query typed by the user or preset key
   * @param {object} stats - Current application statistics
   * @returns {object} { reply: string, action: string|null }
   */
  function processUserMessage(rawQuery, stats) {
    const query = rawQuery.trim().toLowerCase();
    
    // Check for exact preset matches
    if (presetResponses[rawQuery]) {
      const preset = presetResponses[rawQuery];
      if (preset.action === 'subject-routine-custom') {
        const subData = subjectStrategies[stats.subject] || subjectStrategies.general;
        const subReply = `${preset.reply} **${subData.title}**:\n\n* **Ideal Rhythm**: ${subData.tips[3] || '25m study + 5m break'}\n* **Active recall technique**: ${subData.tips[2]}\n* **Anti-Burnout Rule**: ${subData.tips[1]}\n\nLet's apply these guidelines! Reset your timer and start studying.`;
        return { reply: subReply, action: null };
      }
      return preset;
    }
    
    // Heuristic NLP matching for free text queries
    if (query.includes('stress') || query.includes('anxious') || query.includes('pressure') || query.includes('panic')) {
      return presetResponses['exam-stress'];
    }
    
    if (query.includes('burnout') || query.includes('tired') || query.includes('fatigue') || query.includes('exhaust') || query.includes('headache')) {
      return presetResponses['burnout-prevention'];
    }
    
    if (query.includes('break') || query.includes('breath') || query.includes('meditate') || query.includes('relax')) {
      return presetResponses['take-break'];
    }
    
    if (query.includes('routine') || query.includes('schedule') || query.includes('subject') || query.includes('plan')) {
      // Return custom subject routine
      const subData = subjectStrategies[stats.subject] || subjectStrategies.general;
      const subReply = `Generating customized focus routine for your selected subject **${subData.title}**:\n\n* **Ideal Rhythm**: ${subData.tips[3] || '25m study + 5m break'}\n* **Active Recall strategy**: ${subData.tips[2]}\n* **Daily Consolidator rule**: ${subData.tips[1]}\n* **Motto**: *"${subData.motto}"*`;
      return { reply: subReply, action: null };
    }
    
    if (query.includes('analyze') || query.includes('performance') || query.includes('report') || query.includes('how am i')) {
      const summary = generatePerformanceAnalysis(stats);
      return { reply: summary, action: null };
    }

    // Default intelligent fallbacks based on statistics
    let fallbackMsg = `I've analyzed your current focus logs. You have studied for **${stats.productiveTime} minutes** today with **${stats.blurCount} tab-blur distractions**.\n\n`;
    
    if (stats.burnoutScore >= 50) {
      fallbackMsg += `Looking at your **Burnout Index (${stats.burnoutScore}/100)**, you are showing high mental exhaust patterns. I suggest asking me about **"burnout prevention"** or taking a **guided breathing break**.`;
    } else if (stats.focusScore < 50) {
      fallbackMsg += `Your **Focus Score (${stats.focusScore}/100)** is on the lower side due to distractions. Try selecting **"subject-routine"** to see how to restructure your attention workspace.`;
    } else {
      fallbackMsg += `Your metrics are in excellent balance! Focus: **${stats.focusScore}**, Burnout: **${stats.burnoutScore}**. Keep up this consistency. Is there a specific subject strategy or stress control tips you would like to ask me about?`;
    }
    
    return { reply: fallbackMsg, action: null };
  }

  /**
   * Evaluates overall metrics and builds a premium daily cognitive report text.
   * @param {object} stats - Application statistics
   * @returns {string} Text summary
   */
  function generatePerformanceAnalysis(stats) {
    let rating = "";
    let recommendation = "";
    
    // Evaluate Focus Rating
    if (stats.focusScore >= 80) {
      rating = "🏆 **Outstanding Flow State Performance**";
      recommendation = "Your cognitive attention channels are synchronized perfectly. You minimized browser distractions and completed your Pomodoro study cycles flawlessly.";
    } else if (stats.focusScore >= 50) {
      rating = "📈 **Healthy Productive Focus**";
      recommendation = "Good overall consistency. You completed study cycles, though minor tab blurs interrupted your flow. Try putting your phone in another room to elevate your concentration further.";
    } else {
      rating = "⚠️ **Distraction-Heavy Performance**";
      recommendation = "Your attention span was highly fragmented today due to tab-blur events or self-reported distraction activities. Focus on starting single 25-minute Pomodoro sessions without opening other apps.";
    }
    
    // Evaluate Burnout Score
    let burnoutAnalysis = "";
    if (stats.burnoutScore >= 60) {
      burnoutAnalysis = "⚠️ **HIGH COGNITIVE FATIGUE INDEX**: Your brain is operating under severe stress or late-night fatigue. Continuous focus is causing micro-errors. You *must* sleep, take screen breaks, or do guided meditation.";
    } else if (stats.burnoutScore >= 35) {
      burnoutAnalysis = "⚖️ **Moderate Mental Fatigue**: Your fatigue levels are elevated but manageable. Ensure you respect break timers and do not push past study rounds continuously.";
    } else {
      burnoutAnalysis = "✅ **Optimal Balance State**: Exceptional fatigue management. You took timely rest rounds, allowing your hippocampus to rest and consolidate long-term memory perfectly.";
    }

    return `### **AURA COGNITIVE ASSESSMENT REPORT**\n\n**Focus Rating:** ${rating}\n\n**Attention Metrics Summary:**\n* **Focus Score:** ${stats.focusScore}/100\n* **Burnout Index:** ${stats.burnoutScore}/100\n* **Study Time:** ${stats.productiveTime} minutes\n* **Screen Distractions:** ${stats.distractedTime} minutes\n* **Tab Blurs:** ${stats.blurCount} incidents\n* **Completed Pomodoros:** ${stats.pomoRounds} rounds\n\n**Fatigue Analysis:**\n${burnoutAnalysis}\n\n**Strategic Recommendation:**\n${recommendation}\n\n*Aura Cognitive health system, calibrated for academic longevity.*`;
  }

  // Export methods
  return {
    getLiveSuggestion: getLiveSuggestion,
    processUserMessage: processUserMessage,
    generatePerformanceAnalysis: generatePerformanceAnalysis,
    subjectStrategies: subjectStrategies
  };

})();
