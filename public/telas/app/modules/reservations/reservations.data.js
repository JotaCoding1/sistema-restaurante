// reservations.data — fonte das reservas do dia.
// O back-end ainda não tem módulo de reservas: estes são dados de demonstração.
// Quando existir /api/reservations, troque fetchReservations por uma chamada
// HTTP (shared/http) mantendo o formato { time, name, people, tableId }.

const DEMO = [
  { time: "12:30", name: "Paulo Mendes",   people: 2, tableId: 1 },
  { time: "19:00", name: "Mariana Costa",  people: 4, tableId: 3 },
  { time: "19:30", name: "Rafael Almeida", people: 2, tableId: 7 },
  { time: "20:00", name: "Helena Duarte",  people: 4, tableId: 10 },
  { time: "21:00", name: "Família Lima",   people: 6, tableId: 12 }
];

export async function fetchReservations() {
  return DEMO.slice().sort((a, b) => a.time.localeCompare(b.time));
}
