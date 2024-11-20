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

                if ( this.printers) {
                    this.printerSelect = this.printers.filter(printer => printer.key === this.printer);
                    console.log("printerSelect",this.printerSelect)
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
        console.log("printerSelect", this.printerSelect[0].codigoQR)
        console.log("previousTicket", this.previousTicket)
        if (this.printerSelect[0].codigoQR === this.previousTicket) {
            console.log("funcion para imprimir igual")

        } else {
            await this.imprimirSeccionHTML();
            console.log("funcion para imprimir no es igual")
            this.previousTicket = this.printerSelect[0].codigoQR;
        }
    }

    async imprimirSeccionHTML(): Promise<void> {
        const anchoEtiqueta = 100;
        const largoEtiqueta = 150;

        const seccionElement = document.querySelector('section');
        if (!seccionElement) {
          console.error('La sección HTML no está disponible.');
          return;
        }

        try {
          // Captura la sección como un canvas
          const canvas = await html2canvas(seccionElement, {
            scale: 2,
            useCORS: true,
          });

          // Convierte el canvas a una imagen
          const imgData = canvas.toDataURL('image/png');

          // Muestra la imagen capturada en la consola para verificarla
          console.log('Imagen capturada:', imgData);

          // Crea un documento PDF
          const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: [anchoEtiqueta, largoEtiqueta],
          });

          // Agrega la imagen al documento
          doc.addImage(imgData, 'PNG', 0, 0, anchoEtiqueta, largoEtiqueta);

          // Abre una ventana emergente para mostrar el PDF
          const ventanaImpresion = window.open('', '_blank', 'height=400,width=600');
          if (ventanaImpresion) {
            // Genera el PDF y lo inyecta en la ventana
            const pdfDataUri = doc.output('datauristring');
          //  console.log('PDF generado:', pdfDataUri);

            ventanaImpresion.document.open();
            ventanaImpresion.document.write(
              `<embed width="100%" height="100%" name="plugin" src="${pdfDataUri}" type="application/pdf" />`
            );
            ventanaImpresion.document.close();

            ventanaImpresion.onload = () => {
              ventanaImpresion.print();
              setTimeout(() => {
                ventanaImpresion.close();
              }, 500);
            };
          } else {
            console.error('No se pudo abrir la ventana de impresión.');
          }
        } catch (error) {
          console.error('Error al capturar la sección HTML:', error);
        }
      }




}


