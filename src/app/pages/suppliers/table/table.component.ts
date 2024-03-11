import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Admin } from 'src/app/models/admin.model';
import { Client } from 'src/app/models/client.model';
import { Supplier } from 'src/app/models/supplier.model';
import { AdminsService } from 'src/app/services/admins/admins.service';
import { ClientsService } from 'src/app/services/clients/clients.service';
import { SuppliersService } from 'src/app/services/suppliers/suppliers.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  providers: [MessageService],
  styles: ``
})
export class TableComponent {
  public isLoading = false;

  public suppliers: Supplier[] = [];


  public showingSupplierDialog = false;
  public showingDeleteDialog = false;
  public supplierDialogAction = "create";

  public supplierToBeDeleted: Client;
  public supplierToBeUpdated: Client;

  cols: any[] = [];

  constructor(
    private messageService: MessageService,
    private clientService: ClientsService,
    private supplierService: SuppliersService
  ) {
    this.cols = [
      { field: 'name', header: 'Nombre' },
      { field: 'phone', header: 'Telefono' },
      { field: 'email', header: 'Correo' },
    ];
    this.getInformationRoutine();
  }

  async getInformationRoutine(): Promise<void> {
    try {
      this.isLoading = true;
      let response = await this.fetchClients();
      this.suppliers = response;
      this.isLoading = false;
    } catch (error) {
      this.showToaster({ severity: error, summary: "Error", detail: "Ocurrió un error al obtener la información" })

    }
  }

  async fetchClients(): Promise<Supplier[]> {
    let response = await this.supplierService.getAllSuppliers();
    return response;
  }

  deleteSupplier(supplier: Supplier) {
    this.showingDeleteDialog = true;
    this.supplierToBeDeleted = { ...supplier};
  }

  deleteDialogDisplayChange(showing: boolean) {
    if (showing == false) {
      this.supplierToBeDeleted = null;
    }
    this.showingDeleteDialog = showing;
  }
  

  openNew() {
    this.supplierDialogAction = "create";
    this.supplierToBeUpdated = null
    this.showingSupplierDialog = true;
  }

  openEdit(supplier: Supplier) {
    this.supplierDialogAction = "update";
    this.supplierToBeUpdated = { ...supplier };
    this.showingSupplierDialog = true;

  }

  onOperationComplete(wasCompleted: boolean) {
    if (wasCompleted == true) {
      this.showToaster({ detail: "Operacion realizada con éxito" });
      this.getInformationRoutine();
    }
  }


  supplierDialogDisplayChange(showing: boolean) {
    if (showing == false) {
      this.supplierToBeUpdated = null;
    }
    this.showingSupplierDialog = showing;
  }




  //////-------------
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }



  showToaster({ severity = "success", summary = "¡Éxito!", detail = "Accion realizada correctamente" }) {
    this.messageService.add({ key: 'tst', severity: severity, summary: summary, detail: detail });

  }
}
