
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';

import { ProductsService } from 'src/app/services/products/products.service';
import { Product } from 'src/app/models/product.model';
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
    productDialog: boolean = false;
    product!: Product[];
    selectedProducts!: Product[] | null;
    submitted: boolean = false;
    statuses!: any[];
    public showingDeleteDialog = false;
    public showingProductDialog = false;
    public productDialogAction = "create";

    public productToBeDeleted: Product;
    public productToBeUpdated: Product;


    tickets?: Ticket[];
    currentTicket?: Ticket;
    currentIndex = -1;
    selectedPrinter: string | undefined;
    printers;
    filteredTickets: Ticket[];
    imagenURL: string = '';
    imageLoaded: boolean = false;
ticketImage: HTMLImageElement | undefined;


  selectedPrinterData: string;
  qrCodeURL: string;

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private productsService: ProductsService
    ) {
    }

    ngOnInit() {
        this.getInformationRoutine();
    }

    async getInformationRoutine(): Promise<void> {
        try {
            this.isLoading = true;
            this.currentTicket = undefined;
            this.currentIndex = -1;
            this.retrieveCurrentTickets();

            this.isLoading = false;
        } catch (error) {
            this.showToaster({ severity: error, summary: "Error", detail: "Ocurrió un error al obtener la información" })

        }
    }



    generateQRCode(id: string): void {
        const canvas = document.createElement('canvas');
        QRCode.toCanvas(canvas, id, (error: Error) => {
            if (error) {
                console.error(error);
                return;
            }
            this.tickets?.forEach(ticket => {
                if (ticket.key === id) {
                    ticket.qrCode = canvas.toDataURL();
                }
            });
        });
    }
    generateTicketsContent(): string {
        let content = '';
        this.tickets?.forEach(ticket => {
            if (ticket.key && ticket.qrCode) {
                content += `ID: ${ticket.key}\n`;
                content += `Nombre: ${ticket.NombreOperador}\n`;
                content += `Status: ${ticket.status}\n\n`;
                content += `QR Code: ${ticket.qrCode}\n\n`;
            }
        });
        return content;
    }

    onImageLoad(event: Event): void {
        this.ticketImage = event.target as HTMLImageElement;
        this.imageLoaded = true;
      }



      downloadTickets(ticketImage: HTMLImageElement): void {
        const anchoEtiqueta = 48; // Ancho de la etiqueta en mm
        const largoEtiqueta = 50; // Largo de la etiqueta en mm
        const margenVertical = 10; // Margen vertical entre etiquetas en mm

        // Configuración del tamaño del documento según el tamaño de la etiqueta
        const doc = new jsPDF({
          orientation: 'p', // Orientación vertical
          unit: 'mm', // Unidades en milímetros
          format: [anchoEtiqueta, largoEtiqueta] // Establecer el tamaño del documento
        });

        let y = margenVertical; // Ajuste para que la primera etiqueta no comience en el borde superior

        let isFirstPage = true;
        this.imagenURL

        // Guardar el documento completo (con todas las páginas)
        doc.save('tickets.pdf');
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
    retrieveCurrentTickets(): void {
        this.productsService.getAll().snapshotChanges().pipe(
          map(changes =>
            changes.map(c =>
              ({ key: c.payload.key, ...c.payload.val() })
            )
          )
        ).subscribe(data => {
          const res = data;
          const impresoras = res.filter(ticket => ticket.key === 'impresoras')[0];

          if (impresoras) {
            delete impresoras.key;
            this.printers = Object.keys(impresoras).map((key, index) => ({
              key: 'impresora' + index,
              name: 'Impresora ' + index,
              value: impresoras[key]
            }));
            console.log( this.printers)
          }
        });
      }

      showTicket(): void {
        if (this.selectedPrinter) {
          const selectedPrinterInfo = this.printers.find(printer => printer.key === this.selectedPrinter);
          if (selectedPrinterInfo) {
            this.selectedPrinterData = selectedPrinterInfo.value;
            console.log(this.selectedPrinterData);
            this.generarQR(this.selectedPrinterData);

            // Guardar la impresora seleccionada en el localStorage
            localStorage.setItem('selectedPrinter', JSON.stringify(selectedPrinterInfo));
            this.imprimirTicket(selectedPrinterInfo);
          }
        }
      }

      imprimirTicket(selectedPrinterInfo: any): void {
        console.log("hola")
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
          };
        } else {
          console.error('El elemento de la imagen no está disponible.');
        }
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
  updateSelectedPrinter(newPrinterKey: string) {
    // Guardar el valor actual de selectedPrinter
    const previousPrinter = this.selectedPrinter;

    // Actualizar el valor de selectedPrinter
    this.selectedPrinter = newPrinterKey;

    // Verificar si el valor actualizado de selectedPrinter existe en el arreglo de impresoras
    const printerExists = this.printers.some(printer => printer.key === this.selectedPrinter);

    // Si no existe, asignar el valor anterior de selectedPrinter
    if (!printerExists) {
        this.selectedPrinter = previousPrinter;
    }
}



    }







