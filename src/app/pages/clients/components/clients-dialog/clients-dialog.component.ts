import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NodeService } from 'src/app/demo/service/node.service';
import { Admin } from 'src/app/models/admin.model';

import { AdminsService } from 'src/app/services/admins/admins.service';


import { MessageService, SelectItem } from 'primeng/api';
import { MediaService } from 'src/app/services/media/media.service';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { ClientsService } from 'src/app/services/clients/clients.service';
import { Client } from 'src/app/models/client.model';



@Component({
  selector: 'app-admin-dialog',

  templateUrl: './clients-dialog.component.html',
  styles: ``
})
export class ClientsDialogComponent implements OnChanges {
  @Input() action: "create" | "update";
  @Input() display: boolean;
  @Input() clientToBeUpdated?: Admin;
  @Output() onOperationCompleted: EventEmitter<boolean> = new EventEmitter();
  @Output() displayChange = new EventEmitter<boolean>();
  
 
 


  

  public clientForm: FormGroup;
  public isWorking = false;

  constructor(
    private alertsService: AlertsService,
    private formBuilder: FormBuilder,
    private clienService: ClientsService,
    private messageService: MessageService,
    private mediaService: MediaService,
  ) {
    this.clientForm = this.formBuilder.group({
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
    let change = changes['clientToBeUpdated']?.currentValue;
    if (change == undefined || change == null) {
      this.clientForm.reset();
      return;
    }
    this.patchInitialClient(change);
  }

  patchInitialClient(client: Client) {
    this.clientForm.patchValue({
      "name":client.name,
      "phone": client.phone,
      "email": client.email,
      "rfc": client.rfc,
      "billingUse": client.billingUse,
      "address": client.address
    })
  }

  handleAction() {
    if (this.action == 'update') {
      this.updateClient();
      return;
    }
    this.createClient();
  }

  async createClient() {
    
    try {
      Object.keys(this.clientForm.controls).forEach(key => {
        this.clientForm.get(key).markAsDirty();
      })
      this.isWorking = true;
      if (!this.clientForm.valid) return;
      let values = this.clientForm.value;
      
      const response = 
       await this.clienService.createClient(values);
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


  async updateClient(): Promise<void> {
    try {
      Object.keys(this.clientForm.controls).forEach(key => {
        this.clientForm.get(key).markAsDirty();
      })
      this.isWorking = true;
      if (!this.clientForm.valid) return;
      let values = this.clientForm.value;

      let client: Client = {
        name: values['name'],
        rfc: values['rfc'],
        billingUse: values['billingUse'],
        email: values['email'],
        phone: values['phone'],
        address: values['address']
      }
      
      const response = await this.clienService.editClient(
        client,
        this.clientToBeUpdated._id
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
