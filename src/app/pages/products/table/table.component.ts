
import { Component } from '@angular/core';
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
      this.retrievecurrentTickets();

      this.isLoading = false;
    } catch (error) {
      this.showToaster({ severity: error, summary: "Error", detail: "Ocurrió un error al obtener la información" })

    }
  }
  retrievecurrentTickets(): void {
    this.productsService.getAll().snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ key: c.payload.key, ...c.payload.val() })
        )
      )
    ).subscribe(data => {
      console.log(data);
      this.tickets = data;
      // Genera los códigos QR para cada ticket
      this.tickets.forEach(ticket => {
        if (ticket.key) {
          this.generateQRCode(ticket.key);
        }
      });
    });
  }

  generateQRCode(id: string): void {
    const canvas = document.createElement('canvas');
    QRCode.toCanvas(canvas, id, (error: Error) => {
      if (error) {
        console.error(error);
        return;
      }
      // Convierte el canvas en una URL de imagen y la asigna al campo qrCode de tu objeto ticket
      this.tickets?.forEach(ticket => {
        if (ticket.key === id) {
          ticket.qrCode = canvas.toDataURL();
        }
      });
    });
  }


  downloadTickets(): void {
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

    this.tickets?.forEach(ticket => {
        if (ticket.key && ticket.qrCode) {
            // Si no es la primera página, agregar un salto de página
            if (!isFirstPage) {
                doc.addPage();
            } else {
                isFirstPage = false;
            }

            // Agregar código QR a la página actual
            const qrImage = new Image();
            qrImage.src = ticket.qrCode;
            doc.addImage(qrImage, 'PNG', 0, 0, anchoEtiqueta, largoEtiqueta);
        }
    });

    // Guardar el documento completo (con todas las páginas)
    doc.save('tickets.pdf');
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



  deleteProduct(product: Product) {
    this.showingDeleteDialog = true;
    this.productToBeDeleted = { ...product };
  }
  deleteDialogDisplayChange(showing: boolean) {
    if (showing == false) {
      this.productToBeDeleted = null;
    }
    this.showingDeleteDialog = showing;
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
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

  productDialogDisplayChange(showing: boolean) {
    if (showing == false) {
      this.productToBeUpdated = null;
    }
    this.showingProductDialog = showing;
  }


  openNew() {
    this.productDialogAction = "create";
    this.productToBeUpdated = null
    this.showingProductDialog = true;
  }


  editProduct(product: Product) {
    this.productDialogAction = "update";
    this.productToBeUpdated = {...product};
    this.showingProductDialog = true;
  }






}
