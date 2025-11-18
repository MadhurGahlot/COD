/* Parallax hero slight move */
(function () {
  const hero = document.getElementById('hero');
  window.addEventListener('scroll', () => {
    const sc = window.scrollY;
    if (hero) hero.style.backgroundPosition = `center ${Math.max(-sc * 0.2, -120)}px`;
  });
})();

/* SAMPLE DATA - replace fetch calls with API endpoints */
const SAMPLE = {
  stats: { teams: 12, players: 60, matches: 28 },
  highlights: [
    { title: "Team Alpha crushed Match 3", text: "Score 54 - 32. MVP: Raghav" },
    { title: "Player of the Week", text: "Aayush — 47 kills" },
    { title: "Next: Team Bravo vs Phantom", text: "Today 5 PM, Venue: Lab Hall" }
  ],
  matches: [
    { id:1, teamA:"Team Alpha", teamB:"Team Bravo", status:"live", score:"34-28", mode:"BR" },
    { id:2, teamA:"Phantom", teamB:"Delta", status:"upcoming", time:"Today 5:30 PM", mode:"TDM" },
    { id:3, teamA:"Omega", teamB:"Sigma", status:"completed", score:"18-16", mode:"S&D" }
  ],
  leaderboard: [
    { id:1, name:"Raghav", kd:4.5, kills:150 },
    { id:2, name:"Aayush", kd:3.9, kills:110 },
    { id:3, name:"Ritik", kd:3.2, kills:95 }
  ]
};

function fillData(){
  document.getElementById('stat-teams').innerText = SAMPLE.stats.teams;
  document.getElementById('stat-players').innerText = SAMPLE.stats.players;
  document.getElementById('stat-matches').innerText = SAMPLE.stats.matches;

  const highlights = document.getElementById('highlights');
  SAMPLE.highlights.forEach(h => {
    const div = document.createElement('div');
    div.className = 'highlight-card';
    div.innerHTML = `<h4>${h.title}</h4><p>${h.text}</p>`;
    highlights.appendChild(div);
  });

  const matchesWrap = document.getElementById('matches-preview');
  SAMPLE.matches.forEach(m => {
    const c = document.createElement('div');
    c.className = 'match-card';
    c.innerHTML = `<div class="match-title">${m.status==='live'?'<span class="live-dot"></span>Live':'Upcoming'} • ${m.mode}</div>
                   <div style="margin-top:8px"><strong>${m.teamA}</strong> vs <strong>${m.teamB}</strong></div>
                   <div style="opacity:.9; margin-top:8px">${m.score || m.time || ''}</div>`;
    matchesWrap.appendChild(c);
  });

  const lb = document.getElementById('leaderboard-preview');
  SAMPLE.leaderboard.forEach(p=>{
    const el = document.createElement('div');
    el.className = 'player-card';
    el.innerHTML = `<div class="player-ava"></div>
                    <div class="player-info"><strong>${p.name}</strong><span>Kills: ${p.kills} • KD: ${p.kd}</span></div>`;
    lb.appendChild(el);
  });
}

/* Run on load */
document.addEventListener('DOMContentLoaded', fillData);
