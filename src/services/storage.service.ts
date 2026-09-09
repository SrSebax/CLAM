import type { PostAttachment } from '@/types'

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'text/plain',
]

// Tope real de Cloudinary para uploads "unsigned" en el plan gratuito: 10MB por archivo.
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10 MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024 // 10 MB

export type UploadKind = 'cover' | 'images' | 'documents'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  // eslint-disable-next-line no-console
  console.warn(
    '[storage] Falta configurar VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET en .env.',
  )
}

interface CloudinaryUploadResponse {
  secure_url: string
  public_id: string
  bytes: number
}

function validate(file: File, kind: UploadKind) {
  const isDocument = kind === 'documents'
  const allowedTypes = isDocument ? DOCUMENT_TYPES : IMAGE_TYPES
  const maxSize = isDocument ? MAX_DOCUMENT_SIZE : MAX_IMAGE_SIZE

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      isDocument
        ? 'Tipo de documento no permitido. Usa PDF, Word, Excel, ZIP o texto plano.'
        : 'Tipo de imagen no permitido. Usa JPG, PNG, WEBP o GIF.',
    )
  }
  if (file.size > maxSize) {
    throw new Error(`El archivo supera el tamaño máximo permitido (${maxSize / (1024 * 1024)}MB).`)
  }
}

/** Sube un archivo a Cloudinary usando un upload preset "unsigned" (sin backend).
 * El preset debe restringir formatos/tamaño del lado de Cloudinary como defensa adicional. */
function uploadToCloudinary(
  file: File,
  resourceType: 'image' | 'raw',
  folder: string,
  onProgress?: (percent: number) => void,
): Promise<CloudinaryUploadResponse> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return Promise.reject(new Error('Cloudinary no está configurado (ver .env).'))
  }

  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('folder', folder)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        reject(new Error('No se pudo subir el archivo. Intenta de nuevo.'))
      }
    }
    xhr.onerror = () => reject(new Error('Error de red al subir el archivo.'))
    xhr.send(formData)
  })
}

export async function uploadPostFile(
  postId: string,
  kind: UploadKind,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<PostAttachment> {
  validate(file, kind)
  const resourceType = kind === 'documents' ? 'raw' : 'image'
  const data = await uploadToCloudinary(file, resourceType, `posts/${postId}/${kind}`, onProgress)
  return { name: file.name, url: data.secure_url, path: data.public_id, size: data.bytes, contentType: file.type }
}

export async function uploadSiteBannerFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<PostAttachment> {
  if (!IMAGE_TYPES.includes(file.type)) {
    throw new Error('Tipo de imagen no permitido. Usa JPG, PNG, WEBP o GIF.')
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(`El archivo supera el tamaño máximo permitido (${MAX_IMAGE_SIZE / (1024 * 1024)}MB).`)
  }
  const data = await uploadToCloudinary(file, 'image', 'site/banner', onProgress)
  return { name: file.name, url: data.secure_url, path: data.public_id, size: data.bytes, contentType: file.type }
}

/** Borrar en Cloudinary requiere firmar la petición con el API secret, que nunca debe
 * vivir en el cliente. Sin backend, no podemos borrar el archivo remoto de forma segura:
 * solo se quita la referencia en Firestore. El archivo queda huérfano en Cloudinary
 * (cuenta contra tu cuota, no afecta la seguridad ni el contenido del blog). Para
 * limpiarlo periódicamente, usa el Media Library de Cloudinary o un script local con
 * el API secret (igual que scripts/setAdminClaim.mjs).
 */
export async function deletePostFile(_path: string): Promise<void> {
  return Promise.resolve()
}
