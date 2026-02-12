/**
 * Copies text to the clipboard
 * @param {string} text - The text to copy to clipboard
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise
 */
export async function copyToClipboard(text) {
  if (!text) {
    console.error('No text provided to copy')
    return false
  }

  try {
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      return successful
    } catch (err) {
      console.error('Fallback copy failed:', err)
      document.body.removeChild(textArea)
      return false
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

