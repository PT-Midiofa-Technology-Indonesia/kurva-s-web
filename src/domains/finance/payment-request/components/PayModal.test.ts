import { describe, expect, it } from 'vitest';

type PaymentRequestUploadedDocument = {
  id: string;
  fileName: string;
  fileSize: number;
  url: string;
  createdAt?: string;
};

function normalizeUploadedDoc(doc: any): PaymentRequestUploadedDocument | null {
  if (!doc) return null;
  return {
    id: String(doc.id ?? ''),
    fileName: String(doc.fileName ?? doc.name ?? doc.filename ?? ''),
    fileSize: Number(doc.fileSize ?? doc.size ?? 0),
    url: String(doc.url ?? doc.fileUrl ?? ''),
    createdAt: doc.createdAt ? String(doc.createdAt) : undefined,
  };
}

describe('normalizeUploadedDoc', () => {
  it('normalizes backend array item response with url field', () => {
    const result = normalizeUploadedDoc({
      id: '01a02a03-fae2-7163-90e3-76223d2de296',
      documentTypeId: '019f801a-817e-7170-8926-ab29328b0e69',
      fileName: 'Frame 52.png',
      fileSize: 52091,
      url: 'http://103.191.92.202:8080/storage/payment_requests/test.png',
      createdAt: '2026-08-22T15:08:19+00:00',
    });

    expect(result).toEqual({
      id: '01a02a03-fae2-7163-90e3-76223d2de296',
      fileName: 'Frame 52.png',
      fileSize: 52091,
      url: 'http://103.191.92.202:8080/storage/payment_requests/test.png',
      createdAt: '2026-08-22T15:08:19+00:00',
    });
  });
});
