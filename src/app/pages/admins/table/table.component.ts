import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Admin } from 'src/app/models/admin.model';
import { AdminsService } from 'src/app/services/admins/admins.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  providers: [MessageService],
  styles: ``
})
export class TableComponent {
  public isLoading = false;
  public admins: Admin[] = [];


  public showingAdminDialog = false;
  public showingDeleteDialog = false;
  public adminDialogAction = "create";

  public adminToBeDeleted: Admin;
  public adminToBeUpdated: Admin;

  cols: any[] = [];

  constructor(
    private messageService: MessageService,
    private adminService: AdminsService,
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
      let response = await this.fetchAdmins();
      this.admins = response;
      this.isLoading = false;
    } catch (error) {
      this.showToaster({ severity: error, summary: "Error", detail: "Ocurrió un error al obtener la información" })

    }
  }

  async fetchAdmins(): Promise<Admin[]> {
    let response = await this.adminService.getAllAdmins();
    return response;
  }

  deleteAdmin(admin: Admin) {
    this.showingDeleteDialog = true;
    this.adminToBeDeleted = { ...admin };
  }

  deleteDialogDisplayChange(showing: boolean) {
    if (showing == false) {
      this.adminToBeDeleted = null;
    }
    this.showingDeleteDialog = showing;
  }


  openNew() {
    this.adminDialogAction = "create";
    this.adminToBeUpdated = null
    this.showingAdminDialog = true;
  }

  openEdit(admin: Admin) {
    this.adminDialogAction = "update";
    this.adminToBeUpdated = { ...admin };
    this.showingAdminDialog = true;

  }

  onOperationComplete(wasCompleted: boolean) {
    if (wasCompleted == true) {
      this.showToaster({ detail: "Operacion realizada con éxito" });
      this.getInformationRoutine();
    }
  }


  adminDialogDisplayChange(showing: boolean) {
    if (showing == false) {
      this.adminToBeUpdated = null;
    }
    this.showingAdminDialog = showing;
  }




  //////-------------
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }



  showToaster({ severity = "success", summary = "¡Éxito!", detail = "Accion realizada correctamente" }) {
    this.messageService.add({ key: 'tst', severity: severity, summary: summary, detail: detail });

  }
}
