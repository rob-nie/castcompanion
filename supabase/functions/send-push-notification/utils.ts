
// Function to convert base64url to base64
export function base64urlToBase64(base64url: string): string {
  return base64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(base64url.length + (4 - base64url.length % 4) % 4, '=');
}

// Function to convert base64url to Uint8Array
export function base64urlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64urlToBase64(base64url);
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
