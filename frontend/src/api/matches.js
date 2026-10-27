import client from './client';

// Match Results
export const getMatchResults = (year) =>
  client.get('/matches/results', { params: { year } });

export const addMatchResult = (data) =>
  client.post('/matches/results', data);

export const deleteMatchResult = (matchId) =>
  client.delete(`/matches/results/${matchId}`);

export const saveTeamMatch = (data) =>
  client.post('/matches/save_team_match_json', data);

// Schedules
export const getSchedules = (year) =>
  client.get('/matches/schedules', { params: { year } });

export const createSchedule = (data) =>
  client.post('/matches/schedules', data);

export const deleteSchedule = (sid) =>
  client.delete(`/matches/schedules/${sid}`);

// Brackets
export const getBrackets = (year) =>
  client.get('/matches/brackets', { params: { year } });

export const createBracketMatch = (data) =>
  client.post('/matches/brackets', data);

export const setBracketWinner = (matchId, winnerId) =>
  client.post('/matches/brackets/set_winner', { match_id: matchId, winner_id: winnerId });
