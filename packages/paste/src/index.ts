export interface ClipboardData {
  html?: string;
  text?: string;
}

export async function readClipboard(): Promise<ClipboardData> {
  if (!navigator.clipboard) {
    throw new Error('Clipboard API not available');
  }

  const clipboardItems = await navigator.clipboard.read();
  const data: ClipboardData = {};

  for (const item of clipboardItems) {
    if (item.types.includes('text/html')) {
      const blob = await item.getType('text/html');
      data.html = await blob.text();
    }
    if (item.types.includes('text/plain')) {
      const blob = await item.getType('text/plain');
      data.text = await blob.text();
    }
  }

  return data;
}

export async function writeClipboard(data: ClipboardData): Promise<void> {
  if (!navigator.clipboard) {
    throw new Error('Clipboard API not available');
  }

  const items: Record<string, Blob> = {};

  if (data.html) {
    items['text/html'] = new Blob([data.html], { type: 'text/html' });
  }
  if (data.text) {
    items['text/plain'] = new Blob([data.text], { type: 'text/plain' });
  }

  const clipboardItem = new ClipboardItem(items);
  await navigator.clipboard.write([clipboardItem]);
}
