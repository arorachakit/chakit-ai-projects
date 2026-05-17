// types/pdf-parse-fixed.d.ts
declare module 'pdf-parse-fixed' {
  import { Readable } from 'node:stream';

  export interface PdfParseOptions {
    max?: number;
    version?: string;
    pagerender?(pageData: any): Promise<string> | string;
  }

  export interface PdfParseResult {
    numpages: number;
    numrender: number;
    info?: Record<string, any>;
    metadata?: any;
    text: string;
    version?: string;
  }

  function pdf(
    data: Buffer | Uint8Array | ArrayBuffer | Readable,
    options?: PdfParseOptions
  ): Promise<PdfParseResult>;

  // The package is CommonJS; this form works with/without esModuleInterop
  export = pdf;
}
