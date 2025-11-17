/**
 * Compresses an image file to a specified maximum size
 * @param {File} file - The image file to compress
 * @param {number} maxSizeKB - Maximum file size in KB (default: 100)
 * @returns {Promise<File>} - A Promise that resolves to the compressed File object
 */
export async function compressImage(file, maxSizeKB = 100) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        let quality = 0.9
        
        // Calculate initial dimensions to reduce file size
        const maxDimension = 1920 // Max width or height
        if (width > height) {
          if (width > maxDimension) {
            height = (height / width) * maxDimension
            width = maxDimension
          }
        } else {
          if (height > maxDimension) {
            width = (width / height) * maxDimension
            height = maxDimension
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        // Try to compress to target size
        const tryCompress = (q) => {
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }
            
            const sizeKB = blob.size / 1024
            
            if (sizeKB <= maxSizeKB || q <= 0.1) {
              // Create a new File object with the same name and type
              const compressedFile = new File([blob], file.name, {
                type: file.type || 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              // Reduce quality and try again
              tryCompress(q - 0.1)
            }
          }, file.type || 'image/jpeg', q)
        }
        
        tryCompress(quality)
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

