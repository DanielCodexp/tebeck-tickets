export interface InvoiceSATData{
    cadenaOriginalSAT:string;
    noCertificadoSAT: string;
    noCertificadoCFDI:string;
    uuid:string;
    selloSAT: string;
    selloCFDI:string;
    fechaTimbrado:string;
    qrCode:string;
    cfdi: string;
    pdfUrl?: string;
    pdfBase64?:string;
    xmlUrl?: string;
}


export interface InvoiceMailRequest{
    pdfUrl: string;
    xmlUrl:string;
    uuid: string;
    ccList:string[];
    emailList:string[];
    subject: string;
    body: string;
}