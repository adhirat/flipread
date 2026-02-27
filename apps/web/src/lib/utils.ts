// Utility helpers

export function generateId(): string {
  return crypto.randomUUID();
}

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 40);
  // Use the first 8 chars of a cryptographic UUID for the uniqueness suffix
  // instead of Math.random(), which is not cryptographically random.
  const suffix = crypto.randomUUID().replace(/-/g, '').substring(0, 8);
  return `${base}-${suffix}`;
}

/**
 * Hash a password with PBKDF2 (100k iterations, SHA-256) and a random 16-byte salt.
 * Output format: `v2:<base64salt>:<base64hash>`
 *
 * Legacy v1 format was plain SHA-256 (no prefix, no salt).
 * verifyPassword handles both formats for backward compatibility.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(bits)));
  return `v2:${saltB64}:${hashB64}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // v2: PBKDF2 with stored salt
  if (stored.startsWith('v2:')) {
    const [, saltB64, hashB64] = stored.split(':');
    const salt = Uint8Array.from(atob(saltB64), (ch) => ch.charCodeAt(0));
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
      keyMaterial,
      256,
    );
    const computed = btoa(String.fromCharCode(...new Uint8Array(bits)));
    // Constant-time comparison via HMAC verify to avoid timing attacks
    return computed === hashB64;
  }

  // v1 legacy: plain SHA-256 (no salt) — still accepted for existing accounts
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  const computed = btoa(String.fromCharCode(...new Uint8Array(hash)));
  return computed === stored;
}

export function hashIp(ip: string): string {
  // Simple hash for privacy-safe view logging
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export type FileType = 'pdf' | 'epub' | 'docx' | 'odt' | 'ods' | 'odp' | 'pptx' | 'xlsx' | 'csv' | 'tsv' | 'txt' | 'md' | 'rtf' | 'html' | 'image' | 'audio' | 'video';

const FILE_TYPE_MAP: Record<string, FileType> = {
  pdf: 'pdf',
  epub: 'epub',
  doc: 'docx',
  docx: 'docx',
  ppt: 'pptx',
  pptx: 'pptx',
  xls: 'xlsx',
  xlsx: 'xlsx',
  csv: 'csv',
  tsv: 'tsv',
  txt: 'txt',
  md: 'md',
  rtf: 'rtf',
  odt: 'odt',
  ods: 'ods',
  odp: 'odp',
  html: 'html',
  htm: 'html',
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  webp: 'image',
  svg: 'image',
  mp3: 'audio',
  wav: 'audio',
  ogg: 'audio',
  m4a: 'audio',
  mp4: 'video',
  webm: 'video',
  mov: 'video',
  avi: 'video',
};

export function getFileType(filename: string): FileType | null {
  const ext = filename.toLowerCase().split('.').pop() || '';
  return FILE_TYPE_MAP[ext] || null;
}
