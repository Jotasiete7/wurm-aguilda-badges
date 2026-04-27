/** Normaliza string de raridade para classe CSS segura.
 * Ex: "Épica" → "epica", "Lendária" → "lendaria"
 */
export function rarityToClass(rarity: string): string {
  return rarity
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Valida se uma URL é segura para uso como imagem de badge */
export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Trunca string para tamanho máximo */
export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) : str;
}
