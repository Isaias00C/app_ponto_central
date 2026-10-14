export function units(count: number): string {
  return `${count} ${count === 1 ? 'unidade' : 'unidades'}`;
}
