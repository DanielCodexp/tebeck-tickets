import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NodeService } from 'src/app/demo/service/node.service';
import { Admin } from 'src/app/models/admin.model';

import { AdminsService } from 'src/app/services/admins/admins.service';


import { MessageService, SelectItem } from 'primeng/api';
import { MediaService } from 'src/app/services/media/media.service';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';



interface UploadEvent {
  originalEvent: Event;
  files: File[];
}


@Component({
  selector: 'app-admin-dialog',

  templateUrl: './admin-dialog.component.html',
  styles: `




  `
})
export class AdminDialogComponent implements OnChanges {
  @Input() action: "create" | "update";
  @Input() display: boolean;
  @Input() adminToBeUpdated?: Admin;
  @Output() onOperationCompleted: EventEmitter<boolean> = new EventEmitter();
  @Output() displayChange = new EventEmitter<boolean>();
  userType: any[];
  selecteduserType: string;
  uploadedFiles: any[] = [];


  public productsFiles: any = [];
  public profileUrl: any = [];
  files: File[] = [];

  public adminForm: FormGroup;
  public isWorking = false;

  constructor(
    private alertsService: AlertsService,
    private formBuilder: FormBuilder,
    private adminService: AdminsService,
    private messageService: MessageService,
    private mediaService: MediaService,
  ) {
    this.adminForm = this.formBuilder.group({
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
      "photoURL": new FormControl(""),
      "password": new FormControl<string>("", Validators.compose([Validators.required, Validators.minLength(6)])),
      "userType": new FormControl<string>("", Validators.required)
    });

    this.userType = [
      { label: 'Administrador', value: 'Administrador' },
      { label: 'Editor', value: 'Editor' },
      { label: 'Lector', value: 'Lector' }
    ];


  }


  onUpload(event, form) {
    const file = event.files[0]; // Obtén el primer archivo del array de archivos

    if (file && file.size < 1907000) {
      this.productsFiles = [file]; // Agrega el archivo al array productsFiles
    }

    console.log(this.productsFiles);
    form.clear();
  }


  removeFile(fileToRemove: any) {
    const index = this.productsFiles.indexOf(fileToRemove);
    if (index !== -1) {
      this.productsFiles.splice(index, 1);
    }
  }




  ngOnChanges(changes: SimpleChanges): void {
    let change = changes['adminToBeUpdated']?.currentValue;
    if (change == undefined || change == null) {
      this.adminForm.reset();
      return;
    }
    if (this.action == 'update') {
      this.adminForm.controls['password'].clearValidators();
    } else {
      this.adminForm.controls['password'].addValidators(Validators.compose([Validators.required, Validators.minLength(6)]));

    }
    this.patchInitialAdmin(change);
  }

  patchInitialAdmin(admin: Admin) {
    this.profileUrl = admin.photoURL
    this.selecteduserType = admin.userType;
    console.log(this.profileUrl)
    this.adminForm.patchValue({
      "name": admin.name,
      "phone": admin.phone,
      "email": admin.email,
    })
  }

  handleAction() {
    if (this.action == 'update') {
      this.updateAdmin();
      return;
    }
    this.createAdmin();
  }

  async createAdmin() {

    try {
      Object.keys(this.adminForm.controls).forEach(key => {
        this.adminForm.get(key).markAsDirty();
      })
      this.isWorking = true;
      if (!this.adminForm.valid) return;
      let values = this.adminForm.value;

      if (this.productsFiles.length >= 1) {
        const url =
            await this.mediaService.createList(
              this.productsFiles,
              'administrators',
              'profile'
            );
          values.photoURL = url[0] ?? '';
          console.log(url)
          this.productsFiles= []
      } else {
        values.photoURL = "https://user-images.githubusercontent.com/11250/39013954-f5091c3a-43e6-11e8-9cac-37cf8e8c8e4e.jpg"
      }

      const response =
      await this.adminService.createAdmin(values);
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


  async updateAdmin(): Promise<void> {
    console.log("ho")
    try {
      Object.keys(this.adminForm.controls).forEach(key => {
        this.adminForm.get(key).markAsDirty();
      })
      this.isWorking = true;
      if (!this.adminForm.valid) return;
      let values = this.adminForm.value;
      console.log(values)
      if (this.productsFiles.length >=1) {
        values.photoURL =
          (
            await this.mediaService.createList(
              this.productsFiles,
              'administrators',
              'profile'
            )
          )[0] ?? '';
          this.productsFiles= []
            }  else {
              if(!this.productsFiles){
                console.log('entra');
                values.photoURL = 'https://firebasestorage.googleapis.com/v0/b/ankyra-a7868.appspot.com/o/profile_placeholder.png?alt=media&token=9a26e099-ecde-4289-8570-6037a98e08dc';
              }
            }
            console.log(values)
      // let admin: Admin = {
      //   email: values['email'],
      //   name: values['name'],
      //   photoURL: "https://user-images.githubusercontent.com/11250/39013954-f5091c3a-43e6-11e8-9cac-37cf8e8c8e4e.jpg",
      //   phone: values['phone'],
      //   userType: "Administrador",
      //   creationDate: this.adminToBeUpdated.creationDate
      // }

      const response =
       await this.adminService.updateAdmin(
        values,
        this.adminToBeUpdated.uid
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
