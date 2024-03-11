import { Client } from "./client.model";

export interface Payment{
    client: Client,
    invoicesId: string[];
    paymentsApplied: PaymentInvoiceDetailed[];
    paymentMethod: string;
    referenceNumber: string;
    total: number;
    paymentDate: string;
    destinationAccount: string;
    timbrado?: boolean
}

export interface PaymentInvoiceDetailed{
    invoiceId: string;
    amountApplied: number;
}