import { Client } from "./client.model";
import { TaxScheme, TaxType } from "./concept-tax.model";
import { Product } from "./product.model";

export interface FormInvoiceClient {
  client: Client;
  cfdi: string;
  folio: string;
  serie: string;
  paymentMethod: string;
  paymentForm: string;
  invoiceDate: Date;
  invoiceLimit: Date
}


export interface FormInvoiceConcept {
  Producto: Product;
  ClaveProdServ: string;
  ClaveUnidad: string;
  Unidad: string;
  Descripcion: string;
  Cantidad: number;
  Precio: number;
  Impuestos: TaxScheme

}

export interface TaxDetail {
  type: TaxType;
  typeString: string;
  Impuesto: string;
  ImpuestoString: string;
  TasaOCuota: number;
  TipoFactor: string;
  total: number;
}