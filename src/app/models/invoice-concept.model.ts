import { TaxScheme } from "./concept-tax.model";
import { Product } from "./product.model";

export interface InvoiceConcept {
    ClaveProdServ: string;
    NoIdentificacion: string;
    Cantidad: string;
    ClaveUnidad: string;
    Unidad: string;
    Descripcion: string;
    ValorUnitario: string;
    Importe: string;
    Descuento: string;
    ObjetoImp: string;
    Impuestos: {

        Traslados?: ImpuestoConcepto[],
        Retenciones?: ImpuestoConcepto[]

    }
}

interface ImpuestoConcepto {
    Base: string;
    Importe: string;
    Impuesto: string;
    TasaOCuota: string;
    TipoFactor: string;
}

