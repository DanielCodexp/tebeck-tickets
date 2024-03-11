import { Client } from "./client.model";
import { InvoiceSATData } from "./invoice-sat-data.model";
import { Invoice } from "./invoice.model";

export interface PaymentElementQuantity {
    total: number,
    row: Invoice, 
    isValid: boolean
}

export interface InstallmentElement {
    installment: number,
    row: Invoice, 
}


export interface PaymentDetailsForm {
    client: Client,
    paymentDate: Date,
    paymentForm: string,
    reference: string,
    account: string,
    total: number
}

export interface PaymentHash {
    [id: string]: number;
}

export interface PaymentTimbradoCreationRData {
    swResponse: InvoiceSATData,
    paymentDocumentId: string,
    timbreDocumentId: string,
}

