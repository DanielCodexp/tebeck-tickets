import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NodeService } from 'src/app/demo/service/node.service';
import { Admin } from 'src/app/models/admin.model';


import { MessageService, SelectItem } from 'primeng/api';
import { MediaService } from 'src/app/services/media/media.service';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { ClientsService } from 'src/app/services/clients/clients.service';
import { Client } from 'src/app/models/client.model';
import { Supplier } from 'src/app/models/supplier.model';
import { SuppliersService } from 'src/app/services/suppliers/suppliers.service';



@Component({
  selector: 'app-admin-dialog',

  templateUrl: './suppliers-dialog.component.html',
  styles: ``
})
export class SuppliersDialogComponent implements OnChanges {
  @Input() action: "create" | "update";
  @Input() display: boolean;
  @Input() supplierToBeUpdated?: Supplier;
  @Output() onOperationCompleted: EventEmitter<boolean> = new EventEmitter();
  @Output() displayChange = new EventEmitter<boolean>();
  
  public supplierForm: FormGroup;
  public isWorking = false;

  constructor(
    private alertsService: AlertsService,
    private formBuilder: FormBuilder,
    private supplierService: SuppliersService,
    private messageService: MessageService,
    private mediaService: MediaService,
  ) {
    this.supplierForm = this.formBuilder.group({
      "name": new FormControl<string>("", Validators.required),
      "phone": new FormControl<string>("", Validators.required),
      "email": [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,6}$'
          ),
        ],
      ],
      "rfc": new FormControl<string>(""),
      "billingUse": new FormControl<string>(""),
      "address": new FormControl<string>("", Validators.required),
      
    });

  }

 
  ngOnChanges(changes: SimpleChanges): void {
    let change = changes['supplierToBeUpdated']?.currentValue;
    if (change == undefined || change == null) {
      this.supplierForm.reset();
      return;
    }
    this.patchInitialSupplier(change);
  }

  patchInitialSupplier(supplier: Supplier) {
    this.supplierForm.patchValue({
      "name":supplier.name,
      "phone": supplier.phone,
      "email": supplier.email,
      "rfc": supplier.rfc,
      "billingUse": supplier.billingUse,
      "address": supplier.address
    })
  }

  handleAction() {
    if (this.action == 'update') {
      this.updateSupplier();
      return;
    }
    this.createSupplier();
  }

  async createSupplier() {
    
    try {
      Object.keys(this.supplierForm.controls).forEach(key => {
        this.supplierForm.get(key).markAsDirty();
      })
      this.isWorking = true;
      if (!this.supplierForm.valid) return;
      let values = this.supplierForm.value;
      
      const response = 
       await this.supplierService.createSupplier(values);
      if (response) {
        this.onOperationCompleted.emit(true);
        this.onClose();
      }
    } catch (error) {
      //TODO ERROR HANDLING!!!
    } finally {
      this.isWorking = false;
    }
  }

  onClose() {
    this.displayChange.emit(false);
  }


  async updateSupplier(): Promise<void> {
    try {
      Object.keys(this.supplierForm.controls).forEach(key => {
        this.supplierForm.get(key).markAsDirty();
      })
      this.isWorking = true;
      if (!this.supplierForm.valid) return;
      let values = this.supplierForm.value;

      let supplier: Supplier = {
        name: values['name'],
        rfc: values['rfc'],
        billingUse: values['billingUse'],
        email: values['email'],
        phone: values['phone'],
        address: values['address']
      }
      
      const response = await this.supplierService.editSupplier(
        supplier,
        this.supplierToBeUpdated._id
      );
      if (response) {
        this.onOperationCompleted.emit(true);
        this.onClose();
      }

    } catch (error) {

    } finally {
      this.isWorking = false;
    }
  }
}
