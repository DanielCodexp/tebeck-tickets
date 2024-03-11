import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Admin } from 'src/app/models/admin.model';
import { AdminsService } from 'src/app/services/admins/admins.service';
import { ClientsService } from 'src/app/services/clients/clients.service';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styles: ``
})
export class DeleteDialogComponent {
  @Input() clientToBeDeleted: Admin;
  @Input() display: boolean;
  @Output() onClientDeleted: EventEmitter<boolean> = new EventEmitter();
  @Output() displayChange = new EventEmitter<boolean>();
  public isWorking = false;

  constructor(
    private clienteService: ClientsService
  ){

  }

  onClose() {
    this.displayChange.emit(false);
  }

  cancelDelete() {
    this.display = false;
  }

  async confirmDelete() {
    try {
      if (this.clientToBeDeleted == null) return;
      this.isWorking = true;
      await this.clienteService.deleteClient(this.clientToBeDeleted._id)
      this.onClientDeleted.emit(true);
      this.onClose();
    } catch (error) {
      // TODO ERROR HANDLING
    } finally {
      this.isWorking = false;
    }
  }

}
