export const SPORTS = [
  { id: 'soccer', label: 'Soccer', emoji: '⚽' },
  { id: 'basketball', label: 'Basketball', emoji: '🏀' },
  { id: 'pickleball', label: 'Pickleball', emoji: '🏓' },
  { id: 'baseball', label: 'Baseball', emoji: '⚾' },
  { id: 'volleyball', label: 'Volleyball', emoji: '🏐' },
  { id: 'flag_football', label: 'Flag Football', emoji: '🏈' },
  { id: 'tennis', label: 'Tennis', emoji: '🎾' },
  { id: 'golf', label: 'Golf', emoji: '⛳' },
]

export function sportById(id) {
  return SPORTS.find((s) => s.id === id) || { id, label: id, emoji: '🏅' }
}
