import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators'; // Importa map de 'rxjs/operators'
import { ProductsService } from 'src/app/services/products/products.service';
import * as QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { Observable } from 'rxjs'; // Importa Observable de 'rxjs'
import { Subject } from 'rxjs';
import html2canvas from 'html2canvas';

interface PrinterData {
    name: string;
    key: string;
}

@Component({
    selector: 'app-print',
    templateUrl: './print.component.html',
    styleUrls: ['./print.component.scss']
})
export class PrintComponent {
    @ViewChild('ticketImage', { static: false }) ticketImageElement: ElementRef;
    public printer: string = '';
    printers: any[];
    selectedPrinter: any;
    imagenURL$: Observable<string>;
    printerSelect: any;
    imagenURLSubject: Subject<string> = new Subject<string>();
    public previousTicket;

    constructor(
        private route: ActivatedRoute,
        private productsService: ProductsService,
        private router: Router,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.printer = this.route.snapshot.paramMap.get('printer');
        console.log(this.printer)
    }

    async ngOnInit(): Promise<void> {
        await this.retrieveCurrentTickets();
    }

    async retrieveCurrentTickets(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.productsService.getAll().snapshotChanges().pipe(
                map(changes =>
                    changes.map(c =>
                        ({ key: c.payload.key, ...c.payload.val() })
                    )
                )
            ).subscribe(async data => {
                const res = data;

                this.printers = res;

                if (this.printers) {
                    this.printerSelect = this.printers.filter(printer => printer.key === this.printer);
                    console.log("printerSelect", this.printerSelect)
                    if (this.printerSelect[0].codigoQR !== this.previousTicket || this.previousTicket === undefined) {
                        console.log('La clave ha cambiado:', this.printerSelect[0].key);
                        this.renderizarQR()
                    }
                } else {
                    reject("No se encontraron impresoras");
                }
            });
        });
    }

    async renderizarQR(): Promise<void> {
        if (this.printerSelect && this.printerSelect.length > 0) {
            const selectedPrinterData = this.printerSelect[0].codigoQR;
            await this.generarQR(selectedPrinterData);
        } else {
            console.error("No se encontró la impresora seleccionada");
        }
    }

    async generarQR(id: string): Promise<void> {
        QRCode.toDataURL(id, { errorCorrectionLevel: 'H' }, (err, url) => {
            if (err) {
                console.error(err);
                return;
            }
            this.convertirUrlImagen(url);
        });
    }

    convertirUrlImagen(url: string): void {
        const byteString = atob(url.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: 'image/png' });
        this.imagenURL$ = new Observable(observer => {
            observer.next(URL.createObjectURL(blob));
            observer.complete();
        });
        this.imagenURLSubject.next(URL.createObjectURL(blob));
        this.changeDetectorRef.detectChanges();
    }

    async showTicket(): Promise<void> {
        console.log("Invocando showTicket");
        if (this.printerSelect[0].codigoQR === this.previousTicket) {
            console.log("La clave no ha cambiado, no se imprime.");
        } else {
            console.log("La clave ha cambiado, se imprime.");
            await this.imprimirTablaHTML();
            this.previousTicket = this.printerSelect[0].codigoQR;
        }
    }




    async imprimirTablaHTML(): Promise<void> {

        console.log("entro funcion para imprimir")

        const anchoEtiqueta = 100; // Ancho de la etiqueta en mm
        const largoEtiqueta = 150; // Largo de la etiqueta en mm

        // Selecciona el contenedor completo de la tabla
        const ticketContainer = document.getElementById('ticketContainer');

        if (ticketContainer) {
            try {
                // Captura el contenido del contenedor como un canvas
                const canvas = await html2canvas(ticketContainer, {
                    scale: 2, // Escala para mejorar la calidad de la captura
                    useCORS: true, // Permite cargar imágenes de otros dominios
                    allowTaint: true, // Habilita el acceso a recursos externos
                    backgroundColor: null, // Permite fondos transparentes
                });

                // Redimensiona el canvas para que se ajuste a las dimensiones de la etiqueta
                const imgWidth = anchoEtiqueta; // en mm
                const imgHeight = largoEtiqueta; // en mm

                // Redimensionamos el canvas a las dimensiones deseadas en píxeles
                const ratio = canvas.width / canvas.height;
                let resizedCanvas = document.createElement('canvas');
                let resizedCtx = resizedCanvas.getContext('2d');
                if (resizedCtx) {
                    resizedCanvas.width = imgWidth * 3.68;  // Convertimos mm a píxeles (1mm ≈ 3.78px)
                  resizedCanvas.height = imgHeight * 3.68;

                    resizedCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, resizedCanvas.width, resizedCanvas.height);
                }

                // Convierte el canvas redimensionado a una imagen base64
                const imageData = resizedCanvas.toDataURL('image/png');

                // Configura el documento PDF
                const doc = new jsPDF({
                    orientation: 'p',
                    unit: 'mm',
                    format: [anchoEtiqueta, largoEtiqueta],
                });

                // Agrega la imagen al PDF con las dimensiones especificadas
                doc.addImage(imageData, 'PNG', 0, 0, anchoEtiqueta, largoEtiqueta);

                // Genera el PDF en formato base64
                const pdfDataUri = doc.output('datauristring');

                // Abre una nueva ventana para incrustar el PDF
                const anchoVentana = anchoEtiqueta * 3.78;
                const largoVentana = largoEtiqueta * 3.78;
                const ventanaImpresion = window.open("", "_blank", `width=${anchoVentana},height=${largoVentana}`);

                if (ventanaImpresion) {
                    // Escribe el contenido en la nueva ventana
                    ventanaImpresion.document.open();
                    ventanaImpresion.document.write(`
                        <html>
                        <head>
                            <title>Imprimir</title>
                        </head>
                        <body style="margin: 0; padding: 0;">
                            <iframe
                                src="${imageData}"
                                style="border: none; width: 100%; height: 100%;"
                                frameborder="0">
                            </iframe>
                        </body>
                        </html>
                    `);
                    ventanaImpresion.document.close();

                    // Opcional: Imprime automáticamente al cargar el contenido
                    ventanaImpresion.onload = () => {
                        ventanaImpresion.print();
                        setTimeout(() => {
                            ventanaImpresion.close();
                        }, 500); // Cierra la ventana tras un breve retraso
                    };
                } else {
                    console.error('No se pudo abrir la ventana de impresión.');
                }
            } catch (error) {
                console.error('Error al capturar y generar el PDF:', error);
            }
        } else {
            console.error('El contenedor de la tabla no está disponible.');
        }
    }





}


