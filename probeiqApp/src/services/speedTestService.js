export const testDownloadSpeed = async () => {
    const startTime = Date.now();
    const fileUrl = 'https://speed.hetzner.de/10MB.bin';
  
    const response = await fetch(fileUrl);
    const endTime = Date.now();
  
    const bytes = parseInt(response.headers.get('content-length'), 10);
    const duration = (endTime - startTime) / 1000;
    const speedMbps = ((bytes * 8) / duration / 1_000_000).toFixed(2);
  
    return parseFloat(speedMbps);
  };
  