export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '')

  if (cleaned.startsWith('+34')) {
    const number = cleaned.slice(3)
    return `+34 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`
  }

  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }

  return phone
}
