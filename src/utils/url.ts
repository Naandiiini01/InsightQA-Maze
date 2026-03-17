/**
 * Generates a shareable URL for testers.
 * In AI Studio, the development URL (ais-dev-*) is private to the developer.
 * The shared/preview URL (ais-pre-*) is accessible to external users.
 */
export function getShareableUrl(path: string = ''): string {
  const origin = window.location.origin;
  
  // Replace 'ais-dev' with 'ais-pre' to ensure the link works for external testers
  const shareableOrigin = origin.replace('ais-dev-', 'ais-pre-');
  
  // Ensure path starts with / if it's not empty and doesn't already
  const formattedPath = path && !path.startsWith('/') && !path.startsWith('?') ? `/${path}` : path;
  
  return `${shareableOrigin}${formattedPath}`;
}

/**
 * Robust copy to clipboard utility with fallback for iframe environments.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Clipboard API failed, falling back', err);
    }
  }

  // Fallback for non-secure contexts or failed API
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Ensure it's not visible but still part of the DOM
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  textArea.style.top = "0";
  document.body.appendChild(textArea);
  
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copy failed', err);
    document.body.removeChild(textArea);
    return false;
  }
}
