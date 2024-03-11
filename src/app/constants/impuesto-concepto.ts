import { TaxScheme, TaxType } from "../models/concept-tax.model";

export var taxConceptConstant: TaxScheme[] = [
    {
        description: "IVA 16%",
        taxes: [
            {
                Impuesto: "002",
                TasaOCuota: 0.16,
                TipoFactor: "Tasa",
                type: TaxType.traslado
            }
        ]
    },
    {
        description: "IVA 10%",
        taxes: [
            {
                Impuesto: "002",
                TasaOCuota: 0.1,
                TipoFactor: "Tasa",
                type: TaxType.traslado
            }
        ]
    },
    {
        description: "IVA 16% - RET ISR 1.25% RET IVA 10%",
        taxes: [
            {
                Impuesto: "002",
                TasaOCuota: 0.16,
                TipoFactor: "Tasa",
                type: TaxType.traslado
            },
            {
                Impuesto: "002",
                TasaOCuota: 0.10,
                TipoFactor: "Tasa",
                type: TaxType.retencion
            },
            {
                Impuesto: "001",
                TasaOCuota: 0.0125,
                TipoFactor: "Tasa",
                type: TaxType.retencion
            },
        ]
    },

]