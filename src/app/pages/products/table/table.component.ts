import { Component, ElementRef, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';

import { ProductsService } from 'src/app/services/products/products.service';
import { Ticket } from 'src/app/models/ticket';
import { map } from 'rxjs';
import * as QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { Router } from '@angular/router';
//import ConectorPluginV3 from "./ConectorPluginV3";


interface PrinterData {
    [key: string]: string | number; // Definir la interfaz para los datos de la impresora
}

interface FormattedPrinterData {
    key: string;
    [key: string]: string;
}


@Component({
    selector: 'app-products-table',
    templateUrl: './table.component.html',
    styles: ``,
    providers: [MessageService, ConfirmationService],
})
export class ProductsTableComponent {
    @ViewChild('qrCode', { static: true }) qrCodeElement: ElementRef;
    @ViewChild('ticketImage', { static: false }) ticketImageElement: ElementRef;
    public isLoading = false;
    tickets?: Ticket[];
    currentTicket?: Ticket;
    currentIndex = -1;
    selectedPrinter: string | undefined;
    printers;
    imagenURL: string = '';
    imageLoaded: boolean = false;
    ticketImage: HTMLImageElement | undefined;
    selectedPrinterData: string;
    qrCodeURL: string;
    selectedPrinterKey: string;

    impresoras = [];
    impresoraSeleccionada: string = "";
    mensaje: string = "";

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private productsService: ProductsService,
        private router: Router,
    ) {
        this.selectedPrinter = '';
        this.printers = [];
        this.selectedPrinterData = '';
        this.imagenURL = '';
    }

    async ngOnInit() {
        this.getInformationRoutine();
        //  this.impresoras = await ConectorPluginV3.obtenerImpresoras();
    }

    async getInformationRoutine(): Promise<void> {
        try {
            this.isLoading = true;
            this.currentTicket = undefined;
            this.currentIndex = -1;
            await this.retrieveCurrentTickets(); // Wait for retrieving tickets
            this.isLoading = false;
        } catch (error) {
            this.showToaster({ severity: error, summary: "Error", detail: "Ocurrió un error al obtener la información" })
        }
    }

    showToaster({ severity = "success", summary = "¡Éxito!", detail = "Accion realizada correctamente" }) {
        this.messageService.add({ key: 'tst', severity: severity, summary: summary, detail: detail });
    }

    onOperationComplete(wasCompleted: boolean) {
        if (wasCompleted == true) {
            this.showToaster({ detail: "Operacion realizada con éxito" });
            this.getInformationRoutine();
        }
    }

    async retrieveCurrentTickets(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.productsService.getAll().snapshotChanges().pipe(
                map(changes =>
                    changes.map(c =>
                        ({ key: c.payload.key, ...c.payload.val() })
                    )
                )
            ).subscribe(data => {
                const res = data;
                console.log(res)
                function getString(item: Record<string, any>): string {
                    let string = '';
                    for (let i = 0; i < Object.keys(item).length; i++) {
                        if (item.hasOwnProperty(i.toString())) {
                            string += item[i];
                        }
                    }
                    return string;
                }
                const sortedData = data.sort((a, b) => {
                    const stringA = getString(a);
                    const stringB = getString(b);
                    if (stringA < stringB) return -1;
                    if (stringA > stringB) return 1;
                    return 0;
                });
                const result = sortedData.map(item => ({
                    name: item.key,
                    key: getString(item).replace(/"/g, "")

                }));
                this.printers = result;
                console.log(this.printers);
            });
        });
    }





    async goTo(printer: string) {
        this.router.navigate(['products/print/' + printer])
    }

}
