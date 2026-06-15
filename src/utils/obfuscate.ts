/**
 * Obfuscates a UUID by stripping hyphens and encoding the raw bytes as a URL-safe Base64 string.
 * Supports a "sub-" prefix fallback.
 */
export function obfuscateId(id: string): string {
  if (!id) return '';
  
  let prefix = '';
  let uuidPart = id;
  
  if (id.startsWith('sub-')) {
    prefix = 'sub-';
    uuidPart = id.substring(4);
  }
  
  // Remove hyphens
  const hex = uuidPart.replace(/-/g, '');
  if (hex.length !== 32) return id; // Fallback if not a UUID
  
  try {
    // Convert hex to bytes
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    const binaryString = String.fromCharCode(...bytes);
    const base64 = btoa(binaryString);
    
    // Make base64 URL-safe (replace + with -, / with _, and remove padding =)
    const safeBase64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `${prefix}${safeBase64}`;
  } catch {
    return id;
  }
}

/**
 * Reverses the obfuscation of a UUID, restoring the hyphens and decoding the URL-safe Base64 string.
 * Supports a "sub-" prefix fallback.
 */
export function deobfuscateId(obfuscated: string): string {
  if (!obfuscated) return '';
  
  let prefix = '';
  let part = obfuscated;
  
  if (obfuscated.startsWith('sub-')) {
    prefix = 'sub-';
    part = obfuscated.substring(4);
  }
  
  // Restore base64 padding and characters
  let base64 = part.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  
  try {
    const binaryString = atob(base64);
    let hex = '';
    for (let i = 0; i < binaryString.length; i++) {
      const code = binaryString.charCodeAt(i).toString(16);
      hex += code.padStart(2, '0');
    }
    if (hex.length !== 32) return obfuscated; // Fallback
    
    // Restore hyphens: 8-4-4-4-12
    const uuid = `${hex.substr(0, 8)}-${hex.substr(8, 4)}-${hex.substr(12, 4)}-${hex.substr(16, 4)}-${hex.substr(20)}`;
    return `${prefix}${uuid}`;
  } catch {
    return obfuscated; // Fallback
  }
}
