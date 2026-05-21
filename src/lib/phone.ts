import { parsePhoneNumberWithError } from 'libphonenumber-js';

/**
 * Normaliza un número de teléfono al formato E.164.
 * Asume 'ES' (España) por defecto si no se provee código de país.
 * Devuelve null si el teléfono es inválido.
 */
export function normalizeE164(phone: string, defaultCountry: 'ES' | 'AD' | 'FR' | 'PT' | 'GB' | 'DE' | 'IT' | 'US' = 'ES'): string | null {
  if (!phone) return null;
  try {
    const phoneNumber = parsePhoneNumberWithError(phone, defaultCountry);
    if (phoneNumber.isValid()) {
      return phoneNumber.format('E.164');
    }
    return null;
  } catch {
    return null;
  }
}
