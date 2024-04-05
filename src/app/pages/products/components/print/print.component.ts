import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { ProductsService } from 'src/app/services/products/products.service';
import * as QRCode from 'qrcode';
import jsPDF from 'jspdf';

export interface print {
name: string;
value: string;
}

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrl: './print.component.scss'
})


export class PrintComponent {
    @ViewChild('qrCode', { static: true }) qrCodeElement: ElementRef;
    @ViewChild('ticketImage', { static: false }) ticketImageElement: ElementRef;
    public printer: string = '';
    printers;
    selectedPrinter;
    selectedPrinterData: string;
    imagenURL: string = '';
    printerSelect:print[]=[];

constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private router: Router,
) {
    this.printer = this.route.snapshot.paramMap.get('printer');
    console.log(this.printer)
}

async ngOnInit():Promise<void> {
    this.retrieveCurrentTickets();
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
                    name: key,
                    value: impresoras[key]
                }));


               this.printerSelect = this.printers.filter(printer => printer.name === this.printer);
                console.log(this.printerSelect)
                if (this.printerSelect.length > 0) {
                    this.showTicket().then(() => {
                        resolve();
                    });
                } else {
                    reject("No se encontró la impresora con el nombre especificado");
                }
            } else {
                reject("No se encontraron impresoras");
            }
        });
    });
}


async showTicket(): Promise<void> {
    return new Promise((resolve, reject) => {

        if (this.printerSelect) {
            this.selectedPrinterData = this.printerSelect[0].value;
            this.generarQR(this.selectedPrinterData);
            this.imprimirTicket(this.printerSelect[0]).then(() => {
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


}