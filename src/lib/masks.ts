export function maskCurrency(value: string): string {
  value = value.replace(/\D/g, '');
  const numeric = (parseFloat(value) / 100).toFixed(2);
  return numeric.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
