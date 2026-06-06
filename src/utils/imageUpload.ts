export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImage(file: File, type: 'logo' | 'cover'): ValidationResult {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Allowed image types are JPG, PNG, and WEBP formats only.',
    };
  }

  const maxSize = type === 'logo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024; // 2MB or 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size too large. Maximum size for ${type} is ${type === 'logo' ? '2MB' : '5MB'}.`,
    };
  }

  return { valid: true };
}

export function createPreview(file: File): string {
  return URL.createObjectURL(file);
}
