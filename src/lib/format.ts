export function units(count: number): string {
  return `${count} ${count === 1 ? 'unidade' : 'unidades'}`;
}

/** Ex.: "18/10/2026 às 14:30". */
export function dateTime(date: Date): string {
  const day = date.toLocaleDateString('pt-BR');
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${day} às ${time}`;
}
