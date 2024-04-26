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
  printerSelect: PrinterData[] = [];
  imagenURLSubject: Subject<string> = new Subject<string>();


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
 // await  this.renderizarQR();
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








        const impresoras = result;
         this.printers = impresoras;
        console.log(impresoras)
        if (impresoras) {
          this.printerSelect = this.printers.filter(printer => printer.name === this.printer);
          console.log("this.printerSelect",this.printerSelect)
           this.renderizarQR()
          if (this.printerSelect.length > 0) {
            resolve();
          } else {
            reject("No se encontró la impresora con el nombre especificado");
          }
        } else {
          reject("No se encontraron impresoras");
        }
      });
    });
  }


  async renderizarQR(): Promise<void> {
    if (this.printerSelect && this.printerSelect.length > 0) {
      const selectedPrinterData = this.printerSelect[0].key;
      console.log("selec", selectedPrinterData)
      await this.generarQR(selectedPrinterData);
    } else {
      console.error("No se encontró la impresora seleccionada");
    }
  }

  async generarQR(id: string): Promise<void> {
    console.log(id)
    QRCode.toDataURL(id, { errorCorrectionLevel: 'H' }, (err, url) => {
      if (err) {
        console.error(err);
        return;
      }
      this.convertirUrlImagen(url);
    });
  }

  convertirUrlImagen(url: string): void {
    console.log("url", url)
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
    console.log("Mostrando ticket...");
    // Aquí no necesitas verificar this.printerSelect, ya que esta función es llamada después de renderizar el QR
    await this.imprimirTicket(this.printerSelect[0]);
  }

  async imprimirTicket(selectedPrinterInfo: any): Promise<void> {
    console.log("Imprimiendo...");
    const anchoEtiqueta = 25;
    const largoEtiqueta = 25;

    if (this.ticketImageElement && this.ticketImageElement.nativeElement) {
      const ticketImage = this.ticketImageElement.nativeElement;

      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [anchoEtiqueta, largoEtiqueta]
      });

      this.imagenURL$.subscribe(imgData => {
        doc.addImage(imgData, 'PNG', 0, 0, anchoEtiqueta, largoEtiqueta);
        // Open a new window to display the PDF
        const ventanaImpresion = window.open('', '_blank', 'height=400,width=600');
        // Write PDF content to the new window
        doc.autoPrint();
     // doc.output('dataurlnewwindow');
        ventanaImpresion.document.write('<embed width="100%" height="100%" name="plugin" src="' + doc.output('datauristring') + '" type="application/pdf" />');
        ventanaImpresion.onload = () => {
          // Trigger print dialog when the window is loaded
          ventanaImpresion.print();
        };
      });
    } else {
      console.error('El elemento de la imagen no está disponible.');
    }
  }


  async imprimirTicket1(): Promise<void> {
    console.log("Imprimiendo...");
    const anchoEtiqueta = 38;
    const largoEtiqueta = 40;

    if (this.ticketImageElement && this.ticketImageElement.nativeElement) {
      const ticketImage = this.ticketImageElement.nativeElement;

      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [anchoEtiqueta, largoEtiqueta]
      });

      const canvas = await html2canvas(ticketImage);
      const imageData = canvas.toDataURL('image/png');

      doc.addImage(imageData, 'PNG', 0, 0, anchoEtiqueta, largoEtiqueta);

      // Imprimir directamente
      doc.autoPrint();
      doc.output('dataurlnewwindow'); // Esta línea envía el PDF a imprimir sin abrir una nueva ventana
    } else {
      console.error('El elemento de la imagen no está disponible.');
    }
  }
}


