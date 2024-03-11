import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Admin } from 'src/app/models/admin.model';
import { AdminsService } from 'src/app/services/admins/admins.service';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styles: ``
})
export class DeleteDialogComponent {
  @Input() adminToBeDeleted: Admin;
  @Input() display: boolean;
  @Output() onAdminDeleted: EventEmitter<boolean> = new EventEmitter();
  @Output() displayChange = new EventEmitter<boolean>();
  public isWorking = false;

  constructor(
    private adminService: AdminsService
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
      if (this.adminToBeDeleted == null) return;
      this.isWorking = true;
      await this.adminService.deleteAdmin(this.adminToBeDeleted.uid)
      this.onAdminDeleted.emit(true);
      this.onClose();
    } catch (error) {
      // TODO ERROR HANDLING
    } finally {
      this.isWorking = false;
    }
  }

}
