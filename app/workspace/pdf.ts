const MAX_PDF_BYTES = 15 * 1024 * 1024;
const MAX_PDF_PAGES = 20;

export async function extractPdfText(file: File): Promise<string> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Hãy chọn tệp PDF.");
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new Error("PDF vượt quá 15 MB. Hãy chọn tệp nhỏ hơn.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const signature = new TextDecoder().decode(bytes.subarray(0, 5));
  if (signature !== "%PDF-") {
    throw new Error("Tệp đã chọn không phải PDF hợp lệ.");
  }

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const loadingTask = pdfjs.getDocument({ data: bytes });
  const document = await loadingTask.promise;
  try {
    if (document.numPages > MAX_PDF_PAGES) {
      throw new Error("PDF có hơn 20 trang. Hãy chọn bản CV ngắn hơn.");
    }
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => "str" in item ? item.str : "").join(" "));
    }
    const text = pages.join("\n").trim();
    if (!text) {
      throw new Error("PDF không có văn bản có thể đọc. Hãy dán nội dung CV vào ô bên dưới.");
    }
    return text;
  } finally {
    await loadingTask.destroy();
  }
}
