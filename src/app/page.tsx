import { ContactoIndiceService } from '@/lib/services/contacto-indice.service'
import { DirectoryHome } from '@/components/directorio/DirectoryHome'

/** Evita prerender en build (Firestore + índices) y sirve el catálogo en cada petición. */
export const dynamic = 'force-dynamic'

export default async function PaginaPublicaIndice() {
  const service = new ContactoIndiceService()
  const contactos = await service.getCatalogoPublico()
  return <DirectoryHome initialContacts={contactos} />
}
