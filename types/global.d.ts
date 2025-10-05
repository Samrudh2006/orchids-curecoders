declare global {
  interface Window {
    html2canvas: any;
    jspdf: {
      jsPDF: any;
    };
    XLSX: any;
    PptxGenJS: any;
    Chart: any;
  }
}

export {};