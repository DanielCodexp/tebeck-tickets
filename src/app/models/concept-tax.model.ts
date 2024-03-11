

export interface TaxScheme {
    description: string;
    taxes: SATTax[]

}

export interface SATTax {
    type: TaxType,
    Base?: string,
    Impuesto: string;
    TasaOCuota: number;
    TipoFactor: string;
}

export enum TaxType {
    traslado,
    retencion
}   