/*
  Go-Kart Racing Track - Telemetry & Leaderboard Scripts
  Simulates live racing telemetry (speed, RPM, G-forces) and provides
  interactive speedometer ring animations and live updating leaderboard rankings.
*/

document.addEventListener('DOMContentLoaded', () => {
  initTelemetrySimulation();
});

// Run this on DOM load and when page transitions swap content
window.initTelemetry = function() {
  initTelemetrySimulation();
};

function initTelemetrySimulation() {
  // 1. Live Speedometer Dial Animations
  const speedometerFills = document.querySelectorAll('.speedometer-fill');
  const speedNumbers = document.querySelectorAll('.speed-number');
  
  speedometerFills.forEach((fill, index) => {
    const numberEl = speedNumbers[index];
    const maxSpeed = parseInt(fill.dataset.maxSpeed || '45', 10);
    
    // Animate dial from 0 to simulated value on load using GSAP
    let targetSpeed = Math.floor(maxSpeed * 0.85); // Default display speed
    
    if (typeof gsap !== 'undefined') {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetSpeed,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => {
          const currentSpeed = Math.floor(obj.val);
          if (numberEl) numberEl.innerText = currentSpeed;
          
          // Calculate circle stroke offset
          // max offset is 330, representing 0 speed. 0 offset represents full speed.
          const offset = 330 - (obj.val / maxSpeed) * 330;
          fill.style.strokeDashoffset = offset;
        }
      });

      // Keep speedometer slightly fluctuating to simulate real-time engine revs
      let speedInterval = setInterval(() => {
        if (!document.body.contains(fill)) {
          clearInterval(speedInterval);
          return;
        }
        
        // Random fluctuation around target
        const offsetPercent = 0.9 + Math.random() * 0.1;
        const currentTarget = Math.floor(maxSpeed * offsetPercent);
        
        gsap.to(obj, {
          val: currentTarget,
          duration: 0.6,
          ease: "sine.inOut",
          onUpdate: () => {
            const currentSpeed = Math.floor(obj.val);
            if (numberEl) numberEl.innerText = currentSpeed;
            const offset = 330 - (obj.val / maxSpeed) * 330;
            fill.style.strokeDashoffset = offset;
          }
        });
      }, 2000);
    }
  });

  // 2. Fluctuating Telemetry Numbers (G-Force, Throttle, Brake, RPM)
  const gforceVal = document.getElementById('telemetry-gforce');
  const rpmVal = document.getElementById('telemetry-rpm');
  const throttleVal = document.getElementById('telemetry-throttle');
  const brakeVal = document.getElementById('telemetry-brake');
  
  if (gforceVal || rpmVal || throttleVal || brakeVal) {
    let telemetryInterval = setInterval(() => {
      // If none of the elements are on the current screen, stop the interval
      if (!document.getElementById('telemetry-gforce') && 
          !document.getElementById('telemetry-rpm')) {
        clearInterval(telemetryInterval);
        return;
      }
      
      // Update G-Force (fluctuates between 1.2 and 2.4 Gs)
      if (gforceVal) {
        gforceVal.innerText = (1.2 + Math.random() * 1.2).toFixed(2) + ' G';
      }
      
      // Update RPM (fluctuates between 7500 and 8800)
      if (rpmVal) {
        rpmVal.innerText = Math.floor(7400 + Math.random() * 1400) + ' RPM';
      }

      // Update Throttle and Brake percentages (inverse relation)
      if (throttleVal && brakeVal) {
        const throttle = Math.floor(75 + Math.random() * 25);
        const brake = throttle > 90 ? Math.floor(Math.random() * 10) : Math.floor(Math.random() * 20);
        throttleVal.innerText = throttle + '%';
        brakeVal.innerText = brake + '%';
        
        // Set flex/width visual bars if they exist
        const tBar = document.getElementById('telemetry-throttle-bar');
        const bBar = document.getElementById('telemetry-brake-bar');
        if (tBar) tBar.style.width = throttle + '%';
        if (bBar) bBar.style.width = brake + '%';
      }
    }, 500);
  }

  // 3. Simulated Live Leaderboard Updating
  const leaderboardRows = document.querySelectorAll('.ranking-row');
  if (leaderboardRows.length > 0) {
    let leaderboardInterval = setInterval(() => {
      if (!document.querySelector('.ranking-row')) {
        clearInterval(leaderboardInterval);
        return;
      }

      // Randomly pick a row to update its lap time (simulating a live driver finishing a lap)
      const randomIndex = Math.floor(Math.random() * leaderboardRows.length);
      const row = leaderboardRows[randomIndex];
      const timeCell = row.querySelector('.lap-time');
      
      if (timeCell) {
        // Read current time e.g., "34.520s"
        const currentString = timeCell.innerText.replace('s', '');
        const currentSeconds = parseFloat(currentString);
        
        // Improve by a tiny fraction (0.01 - 0.05 seconds) or fluctuate slightly
        const delta = (Math.random() > 0.6) ? -(0.005 + Math.random() * 0.035) : (Math.random() - 0.5) * 0.02;
        const newSeconds = Math.max(31.2, currentSeconds + delta);
        const newString = newSeconds.toFixed(3) + 's';
        
        timeCell.innerText = newString;
        
        // Visual flash highlight
        timeCell.style.color = '#00E16D';
        timeCell.style.textShadow = '0 0 10px rgba(0, 225, 109, 0.6)';
        row.style.background = 'rgba(0, 225, 109, 0.08)';
        
        setTimeout(() => {
          timeCell.style.color = '';
          timeCell.style.textShadow = '';
          row.style.background = '';
        }, 1500);
        
        // Sort rows in the table based on lap time
        sortLeaderboard();
      }
    }, 4000);
  }
}

// Helper to sort the leaderboard DOM based on floating-point times
function sortLeaderboard() {
  const tableBody = document.querySelector('.ranking-table tbody');
  if (!tableBody) return;
  
  const rows = Array.from(tableBody.querySelectorAll('.ranking-row'));
  
  rows.sort((rowA, rowB) => {
    const timeA = parseFloat(rowA.querySelector('.lap-time').innerText.replace('s', ''));
    const timeB = parseFloat(rowB.querySelector('.lap-time').innerText.replace('s', ''));
    return timeA - timeB;
  });
  
  // Re-append sorted rows
  rows.forEach((row, index) => {
    tableBody.appendChild(row);
    // Update Rank text and badge stylings
    const rankBadge = row.querySelector('.rank-badge');
    const newRank = index + 1;
    if (rankBadge) {
      rankBadge.innerText = newRank;
      
      // Clean up previous rank classes
      rankBadge.className = 'rank-badge';
      if (newRank === 1) rankBadge.classList.add('rank-1');
      else if (newRank === 2) rankBadge.classList.add('rank-2');
      else if (newRank === 3) rankBadge.classList.add('rank-3');
    }
  });
}
