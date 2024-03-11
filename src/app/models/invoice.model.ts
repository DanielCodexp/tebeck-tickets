import { InvoiceConcept } from "./invoice-concept.model";

export interface Invoice{
    _id?: string;
    Version: string;
    Serie: string;
    Folio: string;
    Fecha: string;
    MetodoPago: string;
    // Sello: string;
    CondicionesDePago?: string;
    SubTotal: string;
    Descuento: string;
    Moneda: string;
    TipoCambio: string;
    Total: string;
    TipoDeComprobante: string;
    Exportacion: string;
    LugarExpedicion: string;
    Emisor: InvoiceEmitter;
    Receptor: InvoiceReceiver;
    Conceptos: InvoiceConcept[];
    Impuestos: ImpuestoGeneral;
    Timbrado?: boolean;
    PagosAsociados: string[];
    uuid?: string;
    Saldo?: number;
    FechaLimite? :string;
    Pagado?: boolean;
    AliasCliente?: string;
    FechaObj?: Date;
    FechaLimObj?: Date;
    HelperPago?:number;
}

export interface InvoiceAdditionalInformation{
    FechaLimite: string;
    Status: 0;
    PagosAsociados: string[];
    Saldo?:number;
    Pagado?: boolean;
    Timbrado?: boolean
}


export interface InvoiceEmitter {
    Rfc: string;
    Nombre: string;
    RegimenFiscal: string;
}

export interface InvoiceReceiver {
    Rfc: string;
    Nombre: string;
    DomicilioFiscalReceptor: string;
    RegimenFiscalReceptor: string;
    UsoCFDI: string;
}

interface ImpuestoGeneral {
    TotalImpuestosTrasladados?: string;
    TotalImpuestosRetenidos?: string;

    Retenciones?: [{ Importe: string; Impuesto: string }],
    Traslados?: ImpuestoConcepto[]
}

interface ImpuestoConcepto {
    Base: string;
    Importe: string;
    Impuesto: string;
    TasaOCuota: string;
    TipoFactor: string;
}

