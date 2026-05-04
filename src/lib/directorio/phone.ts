/** Prefijo municipal según documento oficial */
export const PHONE_PREFIX = '752760'

export function fullPhoneNumber(extension: string): string {
  return `${PHONE_PREFIX}${extension}`
}

/** Enlace tel: para Chile (+56 sin espacios) */
export function telHref(extension: string): string {
  return `tel:+56${fullPhoneNumber(extension)}`
}
