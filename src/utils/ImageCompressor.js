/**
 * Checks if a file is an image
 * @param {File} file - The file to check
 * @returns {boolean} - True if the file is an image
 */
export function isImageFile(file) {
  if (!file || !file.type) return false
  return file.type.startsWith('image/')
}

/**
 * Processes files by compressing images to a maximum size
 * Handles both single files and arrays of files
 * @param {File|File[]|null} files - Single file, array of files, or null
 * @param {number} maxSizeKB - Maximum file size in KB for images (default: 100)
 * @param {Function} onError - Optional error callback function
 * @returns {Promise<File|File[]|null>} - Processed file(s) or null
 */
export async function processFiles(files, maxSizeKB = 100, onError = null) {
  if (!files) return null

  // Handle single file
  if (!Array.isArray(files)) {
    if (isImageFile(files)) {
      try {
        return await compressImage(files, maxSizeKB)
      } catch (error) {
        console.error('Error compressing image:', error)
        const errorMessage = `שגיאה בדחיסת התמונה "${files.name}". הקובץ המקורי יועלה.`
        if (onError && typeof onError === 'function') {
          onError(error, files, errorMessage)
        } else {
          alert(errorMessage)
        }
        // Fallback to original file if compression fails
        return files
      }
    }
    return files
  }

  // Handle multiple files
  if (files.length === 0) return []

  const processedFiles = []
  
  for (const file of files) {
    if (isImageFile(file)) {
      try {
        // Compress image to max size
        const compressedFile = await compressImage(file, maxSizeKB)
        processedFiles.push(compressedFile)
      } catch (error) {
        console.error('Error compressing image:', error)
        const errorMessage = `שגיאה בדחיסת התמונה "${file.name}". הקובץ המקורי יועלה.`
        if (onError && typeof onError === 'function') {
          onError(error, file, errorMessage)
        } else {
          alert(errorMessage)
        }
        // Fallback to original file if compression fails
        processedFiles.push(file)
      }
    } else {
      // Keep non-image files as-is
      processedFiles.push(file)
    }
  }

  return processedFiles
}

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

