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

/** Gera um código aleatório de alta entropia para resgate */
export function generateSecureCode(length: number = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Evita 0, O, 1, I por clareza
  let result = '';
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}
