export const MAX_PDF_SIZE =
  10 * 1024 * 1024;

export async function validatePdfFile(file) {
  if (!file) {
    return {
      valid: false,
      error: "No file provided",
    };
  }

  if (file.type !== "application/pdf") {
    return {
      valid: false,
      error: "Only PDF files are allowed",
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: "The uploaded PDF is empty",
    };
  }

  if (file.size > MAX_PDF_SIZE) {
    return {
      valid: false,
      error: "PDF must be smaller than 10 MB",
    };
  }

  const buffer =
    await file.arrayBuffer();

  const header = new TextDecoder()
    .decode(buffer.slice(0, 5));

  if (header !== "%PDF-") {
    return {
      valid: false,
      error:
        "Uploaded file is not a valid PDF",
    };
  }

  return {
    valid: true,
  };
}