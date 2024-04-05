import { Component, ElementRef, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';

import { ProductsService } from 'src/app/services/products/products.service';
import { Ticket } from 'src/app/models/ticket';
import { map } from 'rxjs';
import * as QRCode from 'qrcode';
import jsPDF from 'jspdf';

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

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private productsService: ProductsService
    ) {
        this.selectedPrinter = '';
        this.printers = [];
        this.selectedPrinterData = '';
        this.imagenURL = '';
    }

    ngOnInit() {
        this.getInformationRoutine();
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
                const impresoras = res.find(ticket => ticket.key === 'impresoras');
                console.log(impresoras)
                if (impresoras) {
                    delete impresoras.key;
                    this.printers = Object.keys(impresoras).map((key, index) => ({
                        key: 'impresora' + index,
                        name: key,
                        value: impresoras[key]
                    }));
                    if (this.selectedPrinter === '') {
                        this.selectedPrinter = this.printers[0].name; // Establece la primera impresora como seleccionada por defecto
                    }
                    this.showTicket().then(() => {
                        resolve();
                    });
                } else {
                    reject("No se encontraron impresoras");
                }
            });
        });
    }

    async showTicket(): Promise<void> {
        return new Promise((resolve, reject) => {
            const selectedPrinterInfo = this.printers.find(printer => printer.name === this.selectedPrinter);
            if (selectedPrinterInfo) {
                this.selectedPrinterData = selectedPrinterInfo.value;
                this.generarQR(this.selectedPrinterData);
                this.imprimirTicket(selectedPrinterInfo).then(() => {
                    resolve();
                }).catch((error) => {
                    reject(error);
                });
            } else {
                reject("No se encontró la impresora seleccionada");
            }
        });
    }

    async imprimirTicket(selectedPrinterInfo: any): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log("Imprimiendo...");
            const anchoEtiqueta = 48;
            const largoEtiqueta = 50;
            const margenVertical = 10;

            if (this.ticketImageElement && this.ticketImageElement.nativeElement) {
                const ticketImage = this.ticketImageElement.nativeElement;

                const doc = new jsPDF({
                    orientation: 'p',
                    unit: 'mm',
                    format: [anchoEtiqueta, largoEtiqueta]
                });
                const imgData = ticketImage.src;
                doc.addImage(imgData, 'PNG', 0, 0, anchoEtiqueta, largoEtiqueta);

                // Abrir una nueva ventana con el PDF incrustado
                const ventanaImpresion = window.open('', '_blank', 'height=400,width=600');
                ventanaImpresion.document.write('<embed width="100%" height="100%" name="plugin" src="' + doc.output('datauristring') + '" type="application/pdf" />');

                // Esperar a que el PDF se cargue completamente en la ventana de impresión
                ventanaImpresion.onload = () => {
                    // Iniciar la impresión del PDF
                    ventanaImpresion.print();
                    resolve();
                };
            } else {
                console.error('El elemento de la imagen no está disponible.');
                reject("El elemento de la imagen no está disponible.");
            }
        });
    }

    generarQR(id: string) {
        QRCode.toDataURL(id, { errorCorrectionLevel: 'H' }, (err, url) => {
            if (err) {
                console.error(err);
                return;
            }
            this.renderizarQR(url);
        });
    }

    renderizarQR(url: string) {
        const byteString = atob(url.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: 'image/png' });
        this.imagenURL = URL.createObjectURL(blob);
    }

    downloadPDFWithImage(): void {
        const anchoEtiqueta = 48;
        const largoEtiqueta = 50;
        const margenVertical = 10;

        if (this.ticketImageElement && this.ticketImageElement.nativeElement) {
            const ticketImage = this.ticketImageElement.nativeElement;

            const doc = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: [anchoEtiqueta, largoEtiqueta]
            });
            const imgData = ticketImage.src;
            doc.addImage(imgData, 'PNG', 0, 0, anchoEtiqueta, largoEtiqueta);

            doc.save('ticket.pdf');
        } else {
            console.error('El elemento de la imagen no está disponible.');
        }
    }
}
