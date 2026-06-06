import { toast } from 'sonner';

/**
 * Copies plain text to clipboard and displays a success toast.
 * @param text The text string to copy.
 */
export function copyToClipboard(text: string): void {
  if (!text || text === '—') return;
  
  navigator.clipboard.writeText(text)
    .then(() => {
      toast.success('Copied to clipboard', {
        description: `"${text.length > 30 ? text.substring(0, 27) + '...' : text}" is ready to paste.`,
        duration: 2000,
      });
    })
    .catch((err) => {
      console.error('Failed to copy to clipboard:', err);
      toast.error('Failed to copy text.');
    });
}
