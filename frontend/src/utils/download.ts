import api from '../api/client';

export async function downloadBlob(url: string, fallbackName = 'download.pdf'): Promise<void> {
  const response = await api.get(url, {
    responseType: 'blob',
  });

  // Extract filename from Content-Disposition header if available
  let filename = fallbackName;
  const disposition = typeof response.headers['content-disposition'] === 'string' ? response.headers['content-disposition'] : '';
  if (disposition && disposition.includes('filename=')) {
    const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, '').trim();
    }
  }

  // Create blob and trigger download in browser
  const contentType = typeof response.headers['content-type'] === 'string' ? response.headers['content-type'] : 'application/pdf';
  const blob = new Blob([response.data], { type: contentType });
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
}
