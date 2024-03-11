import { Injectable } from '@angular/core';
import { SATTax, TaxType } from 'src/app/models/concept-tax.model';
import { FormInvoiceConcept, TaxDetail } from 'src/app/models/invoice-helpers.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceCalculationsService {

  constructor() { }


  calculateSubTotal(elements: FormInvoiceConcept[]): number {
    if (elements.length == 0) return 0;
    var subTotal = 0;
    for (var concept of elements) {
      subTotal += (concept.Cantidad * concept.Precio);
    }
    return subTotal;
  }

  calculateTotal(subtotal: number, elements: FormInvoiceConcept[]) {
    let traslados = 0;
    let retenciones = 0;
    for (let concept of elements) {
      let taxList = concept.Impuestos.taxes;
      for (let tax of taxList) {
        if (tax.type == TaxType.traslado) {
          traslados += (concept.Cantidad * concept.Precio) * tax.TasaOCuota;
        } else if (tax.type == TaxType.retencion) {
          retenciones += (concept.Cantidad * concept.Precio) * tax.TasaOCuota;
        }
      }
    }
    return subtotal + traslados - retenciones;
  }

  calculateTaxDetails(elements: FormInvoiceConcept[]) {
    let taxDetails: TaxDetail[] = []
    for (let concept of elements) {
      let taxList = concept.Impuestos.taxes;
      for (let tax of taxList) {
        taxDetails =  this.checkIfTaxDetailsContainsTax(tax, (concept.Cantidad * concept.Precio) * tax.TasaOCuota, taxDetails);
      }
    }
    return taxDetails;
  }


  checkIfTaxDetailsContainsTax(taxElement: SATTax, taxtTotal: number, taxDetails: TaxDetail[]) {
    var tempDetails = taxDetails;
    let index = taxDetails.findIndex(element => element.type == taxElement.type && element.Impuesto == taxElement.Impuesto && element.TasaOCuota == taxElement.TasaOCuota && element.TipoFactor == taxElement.TipoFactor);

    if (index == -1) {
      tempDetails.push({
        Impuesto: taxElement.Impuesto,
        ImpuestoString: this.taxToString(taxElement.Impuesto),
        TasaOCuota: taxElement.TasaOCuota,
        TipoFactor: taxElement.TipoFactor,
        type: taxElement.type,
        typeString: taxElement.type == 0 ? "Traslado" : "Retención",
        total: taxtTotal
      })
    } else {
      tempDetails[index].total += taxtTotal
    }
    return tempDetails;
  }

  taxToString(taxCode: string): string {
    switch (taxCode) {
      case "001":
        return "ISR"
      case "002":
        return "IVA"
      case "003":
        return "IEPS"
      default:
        return "Otro"
    }
  }

}
