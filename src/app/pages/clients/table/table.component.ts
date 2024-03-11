import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Admin } from 'src/app/models/admin.model';
import { Client } from 'src/app/models/client.model';
import { AdminsService } from 'src/app/services/admins/admins.service';
import { ClientsService } from 'src/app/services/clients/clients.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  providers: [MessageService],
  styles: ``
})
export class TableComponent {
  public isLoading = false;

  public client:Client[] = [];


  public showingClientDialog = false;
  public showingDeleteDialog = false;
  public clientDialogAction = "create";

  public clientToBeDeleted: Client;
  public clientToBeUpdated: Client;

  cols: any[] = [];

  constructor(
    private messageService: MessageService,
    private clientService: ClientsService
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
      this.client = response;
      this.isLoading = false; 
    } catch (error) {
      this.showToaster({ severity: error, summary: "Error", detail: "Ocurrió un error al obtener la información" })
    }
  }

  async fetchClients(): Promise<Client[]> {
    let response = await this.clientService.getAllClients();
    return response;
  }

  deleteClient(client: Client) {
    this.showingDeleteDialog = true;
    this.clientToBeDeleted = { ...client };
  }

  deleteDialogDisplayChange(showing: boolean) {
    if (showing == false) {
      this.clientToBeDeleted = null;
    }
    this.showingDeleteDialog = showing;
  }
  

  openNew() {
    this.clientDialogAction = "create";
    this.clientToBeUpdated = null
    this.showingClientDialog = true;
  }

  openEdit(client: Client) {
    this.clientDialogAction = "update";
    this.clientToBeUpdated = { ...client };
    this.showingClientDialog = true;

  }

  onOperationComplete(wasCompleted: boolean) {
    if (wasCompleted == true) {
      this.showToaster({ detail: "Operacion realizada con éxito" });
      this.getInformationRoutine();
    }
  }


  clientDialogDisplayChange(showing: boolean) {
    if (showing == false) {
      this.clientToBeUpdated = null;
    }
    this.showingClientDialog = showing;
  }


  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  showToaster({ severity = "success", summary = "¡Éxito!", detail = "Accion realizada correctamente" }) {
    this.messageService.add({ key: 'tst', severity: severity, summary: summary, detail: detail });
  }
}
