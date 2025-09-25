const MeditationTool = (function() {
  let interval;
  let secondsLeft = 300; // default 5 minutes
  let sessionsCount = 0;
  let minutesCount = 0;

  const timerDisplay = document.getElementById('meditation-timer');
  const sessionsElem = document.getElementById('meditation-sessions');
  const minutesElem = document.getElementById('meditation-minutes');

  function updateDisplay() {
    let minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
    let seconds = (secondsLeft % 60).toString().padStart(2, '0');
    if (timerDisplay) {
      timerDisplay.textContent = `${minutes}:${seconds}`;
    }
  }

  function setTimer(seconds) {
    clearInterval(interval);
    secondsLeft = seconds;
    updateDisplay();
  }
    function startSession() {
  clearInterval(interval);
  
  // Start meditation music
  const music = document.getElementById('meditation-music');
  if (music) {
    music.loop = true;
    music.play().catch(error => {
      console.log('Music play failed:', error);
    });
  }
  
  interval = setInterval(() => {
    if (secondsLeft > 0) {
      secondsLeft--;
      updateDisplay();
    } else {
      clearInterval(interval);
      
      // Stop meditation music
      if (music) {
        music.pause();
        music.currentTime = 0;
      }
      
      // Play bell sound
      const bellSound = document.getElementById('end-sound');
      if (bellSound) {
        bellSound.play();
      }
      
      sessionsCount++;
      minutesCount += (parseInt(timerDisplay.textContent.split(':')[0], 10));
      if (sessionsElem) sessionsElem.textContent = sessionsCount;
      if (minutesElem) minutesElem.textContent = minutesCount;
      alert('Meditation session completed!');
    }
  }, 1000);
}

  function pauseSession() {
    clearInterval(interval);
    
    // Pause meditation music when session is paused
    const music = document.getElementById('meditation-music');
    if (music) {
      music.pause();
    }
  }

  return {
    setTimer,
    startSession,
    pauseSession
  };
})();
