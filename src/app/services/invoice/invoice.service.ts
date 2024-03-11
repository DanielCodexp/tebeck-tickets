import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormInvoiceClient, FormInvoiceConcept } from 'src/app/models/invoice-helpers.model';
import { environment } from 'src/environments/environment';
import { InvoiceCalculationsService } from '../invoice-calculations/invoice-calculations.service';
import { TaxType } from 'src/app/models/concept-tax.model';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { DefaultResponse } from 'src/app/models/http.model';
import { ConfigService, CustomHttpError } from 'src/app/config/config/config.service';
import { InvoiceMailRequest, InvoiceSATData } from 'src/app/models/invoice-sat-data.model';
import { InvoiceAdditionalInformation } from 'src/app/models/invoice.model';
import { DateTime } from 'luxon';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private baseUrl: string = `${environment.URL_API}/billing-request/`;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private calculationService: InvoiceCalculationsService,
  ) { }

  public async getAllInvoices() {
    return await firstValueFrom(this.http.get<DefaultResponse>(this.baseUrl)).then(data => data).catch((error) => Promise.resolve({ status: error.status, data: error, callStatus: error.message, } as DefaultResponse))
  }

  public async getPendingInvoicesFromClient(clientRfc: string) {
    return await firstValueFrom(this.http.get<DefaultResponse>(this.baseUrl + "pending/" + clientRfc)).then(data => data).catch((error) => Promise.resolve({ status: error.status, data: error, callStatus: error.message, } as DefaultResponse))
  }

  public async createTypeIAndTimbre(clientForm: FormInvoiceClient, concepts: FormInvoiceConcept[]) {

    let object = this.createInvoiceObject(clientForm, concepts);
    let additionalInformation = this.createInvoiceAdditionalInformation(clientForm, concepts);
    return await firstValueFrom(this.http.post<DefaultResponse>(this.baseUrl + "timbre", { "swData": object, "additionalInformation": additionalInformation })).then(data => data).catch((error) => Promise.resolve({ status: error.status, data: error, callStatus: error.message, } as DefaultResponse))

  }
  public async createTypeIInvoice(clientForm: FormInvoiceClient, concepts: FormInvoiceConcept[]) {

    let object = this.createInvoiceObject(clientForm, concepts);
    let additionalInformation = this.createInvoiceAdditionalInformation(clientForm, concepts);
    return await firstValueFrom(this.http.post<DefaultResponse>(this.baseUrl, { "swData": object, "additionalInformation": additionalInformation })).then(data => data).catch((error) => Promise.resolve({ status: error.status, data: error, callStatus: error.message, } as DefaultResponse))

  }

  public async createInvoiceDBRegistry(invoiceData: InvoiceSATData) {
    return await firstValueFrom(this.http.post<DefaultResponse>(this.baseUrl + 'documents', invoiceData)).then(data => data).catch((error) => Promise.resolve({ status: error.status, data: error, callStatus: error.message, } as DefaultResponse))
  }

  public async sendInvoiceEmail(emailRequest: InvoiceMailRequest) {
    return await firstValueFrom(this.http.post<DefaultResponse>(this.baseUrl + 'mail', emailRequest)).then(data => data).catch((error) => Promise.resolve({ status: error.status, data: error, callStatus: error.message, } as DefaultResponse))
  }

  private createInvoiceAdditionalInformation(clientForm: FormInvoiceClient, concepts: FormInvoiceConcept[]): InvoiceAdditionalInformation {
    let subTotal = this.calculationService.calculateSubTotal(concepts)
    let total = this.calculationService.calculateTotal(subTotal, concepts)
    return { FechaLimite: clientForm.invoiceLimit.toISOString(), PagosAsociados: [], Status: 0, Pagado: false, Saldo: total, Timbrado: false }
  }


  private createInvoiceObject(clientForm: FormInvoiceClient, concepts: FormInvoiceConcept[]) {
    //TODO LUGAR DE EMISION ESTA HARDCODEADO
    //TODO EMISOR ESTA HARDCODEADO
    let subTotal = this.calculationService.calculateSubTotal(concepts)
    let total = this.calculationService.calculateTotal(subTotal, concepts)
    let totalTaxObject = this.calcualteTotalTax(concepts)

    let object = {
      "Version": "4.0",
      "FormaPago": clientForm.paymentForm,
      "Serie": clientForm.serie,
      "Folio": clientForm.folio,
      "Fecha": DateTime.fromJSDate(clientForm.invoiceDate).toISO({ includeOffset: true })?.toString().substring(0, 10),
      "MetodoPago": clientForm.paymentMethod,
      "CondicionesDePago": " ",
      "SubTotal": subTotal.toFixed(2),
      "Descuento": "0.00",
      "Moneda": "MXN",
      "TipoCambio": "1",
      "Total": total.toFixed(2),
      "TipoDeComprobante": "I",
      "Exportacion": "01",
      "LugarExpedicion": "77533",
      "Emisor": {
        "Rfc": "DTE160510DB5",
        "Nombre": "DAPPER TECHNOLOGIES",
        "RegimenFiscal": "601"
      },
      "Receptor": {
        "Rfc": clientForm.client.rfc,
        "Nombre": clientForm.client.nombre,
        "DomicilioFiscalReceptor": clientForm.client.cp,
        "RegimenFiscalReceptor": clientForm.client.regimenFiscal,
        "UsoCFDI": clientForm.cfdi
      },
      "Conceptos": [
        ...concepts.map(element => {
          return {
            "ClaveProdServ": element.ClaveProdServ,
            "NoIdentificacion": "None",
            "Cantidad": element.Cantidad.toString(),
            "ClaveUnidad": element.ClaveUnidad,
            "Unidad": element.Unidad,
            "Descripcion": element.Descripcion,
            "ValorUnitario": element.Precio.toString(),
            "Importe": (element.Cantidad * element.Precio).toFixed(2),
            "Descuento": "0.00",
            "ObjetoImp": "02",
            "Impuestos": this.createConceptTaxObject(element)
          }
        })
      ],
      "Impuestos": totalTaxObject,
    }
    return object;
  }

  private calcualteTotalTax(concepts: FormInvoiceConcept[]) {
    let taxDetails = this.calculationService.calculateTaxDetails(concepts);
    let trasladosTotal = 0;
    let retencionesTotal = 0;
    for (let detail of taxDetails) {
      if (detail.type == TaxType.traslado) {
        trasladosTotal += detail.total;
      } else {
        retencionesTotal += detail.total;
      }
    }
    let onlyTraslados = taxDetails.filter(element => element.type == TaxType.traslado);
    let onlyRetenciones = taxDetails.filter(element => element.type == TaxType.retencion);
    let resultObject: any = {};

    let trasladosObject = onlyTraslados.map(element => {
      return {
        "Base": (element.total * 100 / (element.TasaOCuota * 100)).toFixed(2),
        "Importe": element.total.toFixed(2),
        "Impuesto": element.Impuesto,
        "TasaOCuota": element.TasaOCuota.toFixed(6),
        "TipoFactor": "Tasa"
      }
    })

    let retencionesObject = onlyRetenciones.map(element => {
      return {
        "Importe": element.total.toFixed(2),
        "Impuesto": element.Impuesto,

      }
    })


    if (trasladosTotal > 0) {
      resultObject['TotalImpuestosTrasladados'] = trasladosTotal.toFixed(2);
    }
    if (retencionesTotal > 0) {
      resultObject['TotalImpuestosRetenidos'] = retencionesTotal.toFixed(2);
    }
    if (onlyTraslados.length > 0) {
      resultObject['Traslados'] = trasladosObject;
    }
    if (onlyRetenciones.length > 0) {
      resultObject['Retenciones'] = retencionesObject;
    }
    return resultObject;
  }

  private createConceptTaxObject(concept: FormInvoiceConcept): any {
    let taxes = concept.Impuestos.taxes;
    let traslados = taxes.filter(element => element.type == TaxType.traslado);
    let retenciones = taxes.filter(element => element.type == TaxType.retencion);
    var trasladosObject = traslados.map(element => {
      return {
        'Base': (concept.Precio * concept.Cantidad).toFixed(2),
        "Importe": (element.TasaOCuota * (concept.Precio * concept.Cantidad)).toFixed(2),
        "Impuesto": element.Impuesto,
        "TasaOCuota": element.TasaOCuota.toFixed(6),
        "TipoFactor": element.TipoFactor
      }
    })
    var retencionesObject = retenciones.map(element => {
      return {
        'Base': (concept.Precio * concept.Cantidad).toFixed(2),
        "Importe": (element.TasaOCuota * (concept.Precio * concept.Cantidad)).toFixed(2),
        "Impuesto": element.Impuesto,
        "TasaOCuota": element.TasaOCuota.toFixed(6),
        "TipoFactor": element.TipoFactor
      }
    })
    var responseObject: any = {};
    if (trasladosObject.length > 0) {
      responseObject['Traslados'] = trasladosObject;
    }
    if (retencionesObject.length > 0) {
      responseObject['Retenciones'] = retencionesObject;
    }
    return responseObject;
  }
}
