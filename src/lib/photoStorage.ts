import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

/**
 * Resize an image file to max dimension, returns a Blob.
 */
function resizeImage(file: File, maxDimension: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width <= maxDimension && height <= maxDimension) {
        resolve(file)
        return
      }

      const ratio = Math.min(maxDimension / width, maxDimension / height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Canvas toBlob failed'))
        },
        'image/jpeg',
        0.85
      )
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Upload a photo to Firebase Storage.
 * Creates a compressed original (max 2000px) and a thumbnail (max 400px).
 */
export async function uploadPhoto(
  file: File,
  userId: string,
  photoId: string
): Promise<{ storageUrl: string; thumbnailUrl: string }> {
  // Resize original and thumbnail in parallel
  const [originalBlob, thumbBlob] = await Promise.all([
    resizeImage(file, 2000),
    resizeImage(file, 400),
  ])

  const originalRef = ref(storage, `photos/${userId}/${photoId}.jpg`)
  const thumbRef = ref(storage, `photos/${userId}/${photoId}_thumb.jpg`)

  // Upload both in parallel
  const [originalSnap, thumbSnap] = await Promise.all([
    uploadBytes(originalRef, originalBlob, { contentType: 'image/jpeg' }),
    uploadBytes(thumbRef, thumbBlob, { contentType: 'image/jpeg' }),
  ])

  const [storageUrl, thumbnailUrl] = await Promise.all([
    getDownloadURL(originalSnap.ref),
    getDownloadURL(thumbSnap.ref),
  ])

  return { storageUrl, thumbnailUrl }
}
