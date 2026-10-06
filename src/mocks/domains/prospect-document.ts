import { HttpResponse, http } from 'msw';

const h = (path: string) => `/api/v1${path}`;

const mockDocumentTypes = [
  {
    id: '019e4011-e8bc-7063-97e8-4c752b075598',
    code: 'NPWP',
    name: 'Nomor Pokok Wajib Pajak',
    description: null,
    allowedFileTypes: null,
    allowedFileSize: null,
    isActive: true,
    createdAt: '2026-05-28T17:34:56.000000Z',
    updatedAt: '2026-05-28T17:34:56.000000Z',
  },
  {
    id: '019e4011-e8b8-7282-8744-d8c2b0cae9f9',
    code: 'KTP',
    name: 'Kartu Tanda Penduduk',
    description: null,
    allowedFileTypes: null,
    allowedFileSize: null,
    isActive: true,
    createdAt: '2026-05-28T17:34:56.000000Z',
    updatedAt: '2026-05-28T17:34:56.000000Z',
  },
];

const buildRequirement = (
  id: string,
  stage: string,
  documentType: (typeof mockDocumentTypes)[number]
) => ({
  id,
  stage,
  isMandatory: false,
  notes: null,
  isActive: true,
  documentType: {
    id: documentType.id,
    code: documentType.code,
    name: documentType.name,
  },
  createdAt: '2026-05-28T17:34:56.000000Z',
  updatedAt: '2026-05-28T17:34:56.000000Z',
});

export const mockProspectStageDocuments = [
  {
    stage: 'prospect_identify',
    stageName: 'Prospect Identify',
    documentRequirements: [
      buildRequirement(
        '019e6fa7-5115-7260-9d95-c6c0dc7bbef4',
        'prospect_identify',
        mockDocumentTypes[0]
      ),
      buildRequirement(
        '019e6fa7-511c-7248-a249-f8b2cf577624',
        'prospect_identify',
        mockDocumentTypes[1]
      ),
    ],
  },
  {
    stage: 'qualify',
    stageName: 'Qualify',
    documentRequirements: [
      buildRequirement('019e6fab-dc98-70af-afe7-143336262e4f', 'qualify', mockDocumentTypes[0]),
    ],
  },
  { stage: 'tender_preparation', stageName: 'Tender Preparation', documentRequirements: [] },
  { stage: 'bid_submit', stageName: 'Bid Submit', documentRequirements: [] },
  { stage: 'evaluation', stageName: 'Evaluation', documentRequirements: [] },
  { stage: 'negotiation', stageName: 'Negotiation', documentRequirements: [] },
  { stage: 'result', stageName: 'Result', documentRequirements: [] },
  { stage: 'won', stageName: 'Won', documentRequirements: [] },
  { stage: 'lost', stageName: 'Lost', documentRequirements: [] },
  { stage: 'cancel', stageName: 'Cancel', documentRequirements: [] },
];

export const prospectDocumentHandlers = [
  http.get(h('/prospect-stage-documents'), () => {
    return HttpResponse.json({
      success: true,
      message: 'Data dokumen persyaratan stage prospek berhasil diambil.',
      data: mockProspectStageDocuments,
    });
  }),

  http.get(h('/prospect-stage-documents/:stage'), ({ params }) => {
    const found = mockProspectStageDocuments.find((s) => s.stage === params.stage);
    if (!found) {
      return HttpResponse.json(
        { success: false, message: 'Stage tidak ditemukan.', data: null, errorCode: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      success: true,
      message: 'Detail dokumen persyaratan stage prospek berhasil diambil.',
      data: found,
    });
  }),

  http.post(h('/prospect-stage-documents/:stage/sync'), ({ params }) => {
    const found = mockProspectStageDocuments.find((s) => s.stage === params.stage);
    return HttpResponse.json({
      success: true,
      message: 'Pengaturan dokumen berhasil diperbarui.',
      data: found ?? { stage: params.stage, stageName: params.stage, documentRequirements: [] },
    });
  }),
];
