/**
 * Restricts phone input to digits only
 * Usage: @input="restrictPhoneToDigits"
 * This function filters the input value to only allow digits
 * Works with Vuetify v-text-field where @input receives the value directly
 */
export function restrictPhoneToDigits(value) {
  // If value is a string (from v-text-field @input), filter and return
  if (typeof value === 'string') {
    return value.replace(/\D/g, '')
  }
  
  // If it's an event object (from native input), handle it
  if (value && value.target) {
    const input = value.target
    const originalValue = input.value
    const digitsOnly = originalValue.replace(/\D/g, '')
    
    if (originalValue !== digitsOnly) {
      input.value = digitsOnly
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
      nativeInputValueSetter.call(input, digitsOnly)
      const inputEvent = new Event('input', { bubbles: true })
      input.dispatchEvent(inputEvent)
    }
    return digitsOnly
  }
  
  return value
}

