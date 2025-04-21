// src/services/speedTestService.js

console.log ("Module:SpeedTestService");


  export const testDownloadSpeed = async () => {
    console.log("[SpeedTest] Starting download speed test...");
  
    const startTime = Date.now();
    const fileUrl = 'https://ipv4.download.thinkbroadband.com/10MB.zip';
  
    try {
      const response = await fetch(fileUrl);
      const endTime = Date.now();
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const contentLength = response.headers.get('content-length');
  
      if (!contentLength) {
        console.warn("[SpeedTest] No content-length header. Cannot determine speed.");
        return null;
      }
  
      const bytes = parseInt(contentLength, 10);
      const duration = (endTime - startTime) / 1000;
      const speedMbps = ((bytes * 8) / duration / 1_000_000).toFixed(2);
  
      console.log("[SpeedTest] Download speed:", speedMbps, "Mbps");
      return parseFloat(speedMbps);
  
    } catch (error) {
      console.error("[SpeedTest] Error during speed test:", error);
      return null;
    }
  };
  
  
  export const testUploadSpeed = async () => {
    console.log ("Module:SpeedTest Activity:Get testUploadSpeed");

    const dataSizeBytes = 1_000_000; // 1MB dummy file
    const dummyData = new Uint8Array(dataSizeBytes).fill(1);
    const startTime = Date.now();
  
    await fetch('https://httpbin.org/post', {
      method: 'POST',
      body: dummyData,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });
  
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    const speedMbps = ((dataSizeBytes * 8) / duration / 1_000_000).toFixed(2);
  
    return parseFloat(speedMbps);
  };
  