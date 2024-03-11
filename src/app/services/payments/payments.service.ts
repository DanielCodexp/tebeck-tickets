import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, firstValueFrom, map, throwError } from 'rxjs';
import { DefaultResponse } from 'src/app/models/http.model';
import { Invoice } from 'src/app/models/invoice.model';
import { InstallmentElement, PaymentDetailsForm, PaymentElementQuantity, PaymentHash, PaymentTimbradoCreationRData } from 'src/app/models/payment-helpers.model';
import { Payment, PaymentInvoiceDetailed } from 'src/app/models/payments.model';
import { environment } from 'src/environments/environment';
import { SettingsService } from '../settings/settings.service';
import { Folios } from 'src/app/models/settings.model';
import { HelpersService } from '../helpers/helpers.service';
import { InvoiceMailRequest } from 'src/app/models/invoice-sat-data.model';
import { DateTime } from 'luxon';
import { ApiResponse } from 'src/app/models/api-response.model';
import ApiError from '../errors-helpers/api-error';


@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private baseUrl: string = `${environment.URL_API}/payments/`;

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService,
    private helpersService: HelpersService
  ) { }



  public getAllPayments(): Observable<Payment[]> {
    return this.http.get<ApiResponse<Payment[]>>(this.baseUrl).pipe(
      map(data => data.data),
      catchError((httpError: HttpErrorResponse) => {
        let apiErrorResponse = httpError.error as ApiResponse;
        return throwError(() => new ApiError(apiErrorResponse.message, apiErrorResponse.methodName!, apiErrorResponse.errorDetails!, apiErrorResponse.errorType!))
      })
    );
  }


  public async createOnlyPayment(paymentForm: PaymentDetailsForm, paymentsApplied: Map<string, PaymentElementQuantity>, invoices: Invoice[],) {
    let paymentToApply = this.createPaymentElement(paymentForm, paymentsApplied, invoices);
    return await firstValueFrom(this.http.post<DefaultResponse>(this.baseUrl, paymentToApply)).then(data => data).catch((error) => Promise.resolve({ status: error.status, data: error, callStatus: error.message, } as DefaultResponse))
  }

  public async createPaymentAndComplemento(paymentForm: PaymentDetailsForm, paymentsApplied: Map<string, PaymentElementQuantity>, invoices: Invoice[], installments: Map<string, InstallmentElement>) {
    let paymentToApply = this.createPaymentElement(paymentForm, paymentsApplied, invoices, true);
    let settingsResponse = await this.settingsService.getFolios();
    let folios = settingsResponse.data;
    let complemento = this.createComplementoRequest(paymentForm, paymentsApplied, invoices, folios, installments);
    console.log(complemento);
    return await firstValueFrom(this.http.post<DefaultResponse<PaymentTimbradoCreationRData>>(this.baseUrl + 'timbre', { "paymentData": paymentToApply, "swData": complemento })).then(data => data).catch((error) => Promise.resolve({ status: error.status, data: error.error, callStatus: error.message, } as DefaultResponse))
  }

  public async sendComplementEmail(emailRequest: InvoiceMailRequest) {
    return await firstValueFrom(this.http.post<DefaultResponse>(this.baseUrl + 'mail', emailRequest)).then(data => data).catch((error) => Promise.resolve({ status: error.status, data: error, callStatus: error.message, } as DefaultResponse))
  }

  private createPaymentElement(paymentForm: PaymentDetailsForm, paymentsApplied: Map<string, PaymentElementQuantity>, invoices: Invoice[], isTimbrado = false) {
    let payment: Payment = {
      client: paymentForm.client,
      destinationAccount: paymentForm.account,
      paymentDate: paymentForm.paymentDate.toISOString(),
      paymentMethod: paymentForm.paymentForm,
      total: paymentForm.total,
      invoicesId: [...invoices.map(invoice => { return invoice._id! })],
      paymentsApplied: this.transformPaymentHashToModel({ ...paymentsApplied }),
      referenceNumber: paymentForm.reference,
      timbrado: isTimbrado
    }
    return payment;
  }

  private transformPaymentHashToModel(payments: Map<string, PaymentElementQuantity>) {
    let paymentsApplied: PaymentInvoiceDetailed[] = [];
    Object.keys(payments).forEach(key => {
      paymentsApplied.push({ amountApplied: payments[key].total, invoiceId: key })
    })
    return paymentsApplied;

    // for (let i = 0, keys = Object.keys(payments), ii = keys.length; i < ii; i++) {
    //   console.log('key : ' + keys[i] + ' val : ' + payments[keys[i]]);
    //   paymentsApplied.push({ amountApplied: payments[keys[i]], invoiceId: keys[i] })
    // }
    // return paymentsApplied;
  }


  private createComplementoRequest(paymentForm: PaymentDetailsForm, paymentsApplied: Map<string, PaymentElementQuantity>, invoices: Invoice[], folios: Folios, installments: Map<string, InstallmentElement>) {
    //TODO NECESITA SERIE, FOLIO Y LUGAR DE EMISION
    //TODO EMISOR ESTA HARDCODEADO

    let object = {
      "Version": "4.0",
      "Serie": folios.serie,
      "Folio": folios.folio,
      "Fecha": DateTime.fromJSDate(paymentForm.paymentDate).toISO({ includeOffset: true })?.toString().substring(0, 10),
      "SubTotal": 0,
      "Moneda": "XXX",
      "Total": 0,
      "TipoDeComprobante": "P",
      "Exportacion": "01",
      "LugarExpedicion": "77500",
      "Emisor": {
        "Rfc": "DTE160510DB5",
        "Nombre": "DAPPER TECHNOLOGIES",
        "RegimenFiscal": "601"
      },
      "Receptor": {
        "Rfc": paymentForm.client.rfc,
        "Nombre": paymentForm.client.nombre,
        "DomicilioFiscalReceptor": paymentForm.client.cp,
        "RegimenFiscalReceptor": paymentForm.client.regimenFiscal,
        "UsoCFDI": "CP01"
      },
      "Conceptos": [
        {
          "ClaveProdServ": "84111506",
          "Cantidad": 1,
          "ClaveUnidad": "ACT",
          "Descripcion": "Pago",
          "ValorUnitario": 0,
          "Importe": 0,
          "ObjetoImp": "01"
        }
      ],
      "Complemento": {
        "Any": [
          {
            "Pago20:Pagos": {
              "Version": "2.0",
              "Totales": this.createTotalsObject(paymentForm.total),
              "Pago": [
                {
                  "FechaPago": DateTime.fromJSDate(paymentForm.paymentDate).toISO({ includeOffset: true })?.toString().substring(0, 10),
                  "FormaDePagoP": paymentForm.paymentForm,
                  "MonedaP": "MXN",
                  // "NumOperacion": "000051",
                  // "RfcEmisorCtaOrd": "DTE160510DB5",
                  // "NomBancoOrdExt": "BANAMEX",
                  // "CtaOrdenante": "12345678998",
                  // "RfcEmisorCtaBen": "DTE160510DB5",
                  // "CtaBeneficiario": "12345678998",
                  "TipoCambioP": "1",
                  "Monto": paymentForm.total.toFixed(2),
                  "DoctoRelacionado": [...this.createDocumentsObjectArray(invoices, paymentsApplied, installments)],
                  "ImpuestosP": {
                    "TrasladosP": [
                      {
                        "BaseP": (paymentForm.total / 1.16).toFixed(2),
                        "ImpuestoP": "002",
                        "TipoFactorP": "Tasa",
                        "TasaOCuotaP": "0.160000",
                        "ImporteP": (paymentForm.total - (paymentForm.total / 1.16)).toFixed(2)
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
    return object;
  }

  private createDocumentsObjectArray(invoices: Invoice[], paymentsApplied: Map<string, PaymentElementQuantity>, installments: Map<string, InstallmentElement>) {

    return invoices.map(invoiceElement => {
      var invoicePayment = paymentsApplied[invoiceElement._id!];
      return {
        "IdDocumento": invoiceElement.uuid,
        "Serie": invoiceElement.Serie,
        "Folio": invoiceElement.Folio,
        "MonedaDR": invoiceElement.Moneda,
        "EquivalenciaDR": "1",
        "NumParcialidad": installments[invoiceElement._id].installment.toString(),
        "ImpSaldoAnt": invoiceElement.Saldo?.toFixed(2),
        "ImpPagado": invoicePayment.total.toFixed(2),
        "ImpSaldoInsoluto": (invoiceElement.Saldo! - invoicePayment.total).toFixed(2),
        "ObjetoImpDR": "02",
        "ImpuestosDR": {
          "TrasladosDR": [
            {
              "BaseDR": (invoicePayment.total / 1.16).toFixed(2),
              "ImpuestoDR": "002",
              "TipoFactorDR": "Tasa",
              "TasaOCuotaDR": "0.160000",
              "ImporteDR": (invoicePayment.total - (invoicePayment.total / 1.16)).toFixed(2)
            }
          ]
        }
      }
    });
  }

  private createTotalsObject(total: number) {
    return {
      "TotalTrasladosBaseIVA16": (total / 1.16).toFixed(2),
      "TotalTrasladosImpuestoIVA16": (total - (total / 1.16)).toFixed(2),
      "MontoTotalPagos": total.toFixed(2)
    };
  }
}
