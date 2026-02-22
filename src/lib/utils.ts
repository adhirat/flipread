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
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
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

export type FileType = 'pdf' | 'epub' | 'docx' | 'odt' | 'ods' | 'odp' | 'pptx' | 'xlsx' | 'csv' | 'txt' | 'md' | 'rtf' | 'html' | 'image' | 'audio' | 'video';

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
