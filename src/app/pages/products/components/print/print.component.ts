import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { ProductsService } from 'src/app/services/products/products.service';
import * as QRCode from 'qrcode';
import jsPDF from 'jspdf';
import ConectorPluginV3 from './ConectorPluginV3';

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

    // mandar a imprimir automaticamente
    impresoras= [];
    impresoraSeleccionada: string = "";
    mensaje: string = "";


constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private router: Router,
) {
    this.printer = this.route.snapshot.paramMap.get('printer');
    console.log(this.printer)

}
async ngOnInit(): Promise<void> {
    await this.retrieveCurrentTickets(); // Esperamos a que los datos de las impresoras estén disponibles
    this.renderizarQR(); // Una vez que los datos estén disponibles, generamos el QR y renderizamos la imagen
    this.impresoras = await ConectorPluginV3.obtenerImpresoras();
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
        const selectedPrinterData = this.printerSelect[0].value;
        await this.generarQR(selectedPrinterData);
        this.showTicket(); // Llama a showTicket() una vez que la imagen esté lista
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
    this.imagenURL = URL.createObjectURL(blob);
}

async showTicket(): Promise<void> {
    console.log("Mostrando ticket...");
    if (this.printerSelect && this.printerSelect.length > 0) {
        await this.imprimirTicket(this.printerSelect[0]);
    } else {
        console.error("No se encontró la impresora seleccionada");
    }
}

async imprimirTicket(selectedPrinterInfo: any): Promise<void> {
    console.log("Imprimiendo...");
    const anchoEtiqueta = 48;
    const largoEtiqueta = 50;

    if (this.ticketImageElement && this.ticketImageElement.nativeElement) {
        const ticketImage = this.ticketImageElement.nativeElement;

        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: [anchoEtiqueta, largoEtiqueta]
        });
        const imgData = ticketImage.src;
        doc.addImage(imgData, 'PNG', 0, 0, anchoEtiqueta, largoEtiqueta);

        // Imprimir directamente
        doc.autoPrint();

        // Guardar el documento en una variable de tipo ArrayBuffer
        const pdfOutput = doc.output();

        // Crear un blob a partir del ArrayBuffer
        const blob = new Blob([pdfOutput], { type: 'application/pdf' });

        // Crear una URL del blob
        const url = URL.createObjectURL(blob);

        // Crear un objeto de tipo iframe para cargar la URL
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;

        // Adjuntar el iframe al cuerpo del documento
        document.body.appendChild(iframe);

        // Esperar un corto tiempo para asegurar que el archivo se cargue en el iframe
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Imprimir el documento
        iframe.contentWindow.print();

        // Eliminar el iframe después de la impresión
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1500);
    } else {
        console.error('El elemento de la imagen no está disponible.');
    }
}


async probarImpresion() {
    if (!this.impresoraSeleccionada) {
      return alert("Seleccione una impresora");
    }

    if (!this.mensaje) {
      return alert("Escribe un mensaje");
    }
    const conector = new ConectorPluginV3();
    conector
      .Iniciar()
      .EstablecerAlineacion(ConectorPluginV3.ALINEACION_CENTRO)
      .EscribirTexto("Hola Angular desde parzibyte.me")
      .Feed(1)
      .EscribirTexto(this.mensaje)
      .Feed(1)
      .DescargarImagenDeInternetEImprimir("https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Angular_full_color_logo.svg/1200px-Angular_full_color_logo.svg.png", ConectorPluginV3.TAMAÑO_IMAGEN_NORMAL, 400)
      .Iniciar()
      .Feed(1);
    const respuesta = await conector.imprimirEn(this.impresoraSeleccionada);
    if (respuesta == true) {
      console.log("Impresión correcta");
    } else {
      console.log("Error: " + respuesta);
    }
  }

}
