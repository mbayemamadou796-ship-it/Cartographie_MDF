import { ReportAttachment } from '../types';

const DB_NAME = 'mbok_de_france_storage_v1';
const STORE_NAME = 'report_attachments';
const memoryAttachmentCache = new Map<string, string>();

/**
 * Open or initialize the IndexedDB database for local attachments
 */
function openAttachmentDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB non supporté'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Persist an attachment into IndexedDB to prevent localStorage quota exhaustion
 */
export async function saveAttachmentToDB(attachment: ReportAttachment): Promise<void> {
  if (!attachment.id || !attachment.url) return;
  memoryAttachmentCache.set(attachment.id, attachment.url);

  try {
    const db = await openAttachmentDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({
      id: attachment.id,
      name: attachment.name,
      size: attachment.size,
      type: attachment.type,
      url: attachment.url,
      uploadedAt: attachment.uploadedAt || new Date().toISOString()
    });
  } catch (err) {
    // If IndexedDB fails, memory cache is already set
    console.warn('Sauvegarde IndexedDB échouée, conservation en mémoire:', err);
  }
}

/**
 * Retrieve an attachment URL from memory cache or IndexedDB
 */
export async function getAttachmentUrlFromDB(id: string): Promise<string | undefined> {
  if (memoryAttachmentCache.has(id)) {
    return memoryAttachmentCache.get(id);
  }

  try {
    const db = await openAttachmentDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result?.url) {
          memoryAttachmentCache.set(id, req.result.url);
          resolve(req.result.url);
        } else {
          resolve(undefined);
        }
      };
      req.onerror = () => resolve(undefined);
    });
  } catch {
    return undefined;
  }
}

/**
 * Safely download an attachment to the user's computer
 */
export function downloadAttachment(doc: ReportAttachment): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const url = doc.url || memoryAttachmentCache.get(doc.id || '');
  const filename = doc.name || 'document_mdf';

  if (!url) {
    // If no URL, generate a fallback text file
    const fallbackText = `Document: ${filename}\nDate: ${doc.uploadedAt || new Date().toLocaleDateString('fr-FR')}\nTaille: ${formatFileSize(doc.size)}\nMbok de France - Remontée Référent`;
    const blob = new Blob([fallbackText], { type: 'text/plain;charset=utf-8' });
    triggerBlobDownload(blob, `${filename.replace(/\.[^/.]+$/, "")}.txt`);
    return;
  }

  // If Data URL, convert to Blob to ensure full download without browser URL length limits
  if (url.startsWith('data:')) {
    try {
      const blob = dataUrlToBlob(url, doc.type);
      triggerBlobDownload(blob, filename);
      return;
    } catch (e) {
      console.warn('Erreur conversion Blob pour téléchargement:', e);
    }
  }

  // Standard link download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Open an attachment in a new browser tab safely
 * Using a Blob URL ensures Chrome/Firefox do not block top-level data: navigation!
 */
export function openAttachmentInNewTab(doc: ReportAttachment): void {
  if (typeof window === 'undefined') return;

  const url = doc.url || memoryAttachmentCache.get(doc.id || '');

  if (!url) {
    alert("Le contenu de ce fichier n'est pas disponible pour l'affichage direct.");
    return;
  }

  if (url.startsWith('data:')) {
    try {
      const blob = dataUrlToBlob(url, doc.type);
      const blobUrl = URL.createObjectURL(blob);
      const newWin = window.open(blobUrl, '_blank');
      if (!newWin) {
        // Pop-up blocker fallback: trigger download instead
        downloadAttachment(doc);
      } else {
        // Clean up object URL after delay
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      }
      return;
    } catch (e) {
      console.warn('Erreur ouverture Blob:', e);
    }
  }

  // If already a normal URL
  window.open(url, '_blank');
}

/**
 * Converts a base64 data URI to a binary Blob
 */
export function dataUrlToBlob(dataUrl: string, fallbackType?: string): Blob {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : (fallbackType || 'application/octet-stream');
  const b64Data = parts[1];
  const byteCharacters = atob(b64Data);
  const byteArrays: Uint8Array[] = [];

  const sliceSize = 512;
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: mime });
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

/**
 * Format bytes to readable string
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return 'Taille inconnue';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/**
 * Identify file type category
 */
export function getFileTypeCategory(filename: string = '', mimeType: string = ''): 'pdf' | 'image' | 'excel' | 'word' | 'text' | 'archive' | 'other' {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const mime = mimeType.toLowerCase();

  if (ext === 'pdf' || mime.includes('pdf')) return 'pdf';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext) || mime.startsWith('image/')) return 'image';
  if (['xls', 'xlsx', 'csv'].includes(ext) || mime.includes('sheet') || mime.includes('excel') || mime.includes('csv')) return 'excel';
  if (['doc', 'docx'].includes(ext) || mime.includes('word') || mime.includes('document')) return 'word';
  if (['txt', 'log', 'json', 'md'].includes(ext) || mime.startsWith('text/')) return 'text';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mime.includes('zip') || mime.includes('compressed')) return 'archive';

  return 'other';
}

/**
 * Get visual badge colors and styling
 */
export function getFileTypeBadge(filename: string = '', mimeType: string = ''): { label: string; color: string; bgColor: string } {
  const cat = getFileTypeCategory(filename, mimeType);
  switch (cat) {
    case 'pdf':
      return { label: 'PDF', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' };
    case 'image':
      return { label: 'IMAGE', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' };
    case 'excel':
      return { label: 'TABLEUR', color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200' };
    case 'word':
      return { label: 'WORD', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' };
    case 'text':
      return { label: 'TEXTE', color: 'text-slate-700', bgColor: 'bg-slate-100 border-slate-300' };
    case 'archive':
      return { label: 'ARCHIVE', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' };
    default:
      return { label: 'FICHIER', color: 'text-slate-600', bgColor: 'bg-slate-50 border-slate-200' };
  }
}
