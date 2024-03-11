import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Admin } from 'src/app/models/admin.model';
import { Supplier } from 'src/app/models/supplier.model';
import { AdminsService } from 'src/app/services/admins/admins.service';
import { ClientsService } from 'src/app/services/clients/clients.service';
import { SuppliersService } from 'src/app/services/suppliers/suppliers.service';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styles: ``
})
export class DeleteDialogComponent {
  @Input() supplierToBeDeleted: Supplier;
  @Input() display: boolean;
  @Output() onSupplierDeleted: EventEmitter<boolean> = new EventEmitter();
  @Output() displayChange = new EventEmitter<boolean>();
  public isWorking = false;

  constructor(
    private supplierService: SuppliersService
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
      if (this.supplierToBeDeleted == null) return;
      this.isWorking = true;
      await this.supplierService.deleteSupplier(this.supplierToBeDeleted._id)
      this.onSupplierDeleted.emit(true);
      this.onClose();
    } catch (error) {
      // TODO ERROR HANDLING
    } finally {
      this.isWorking = false;
    }
  }

}
