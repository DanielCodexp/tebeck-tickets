import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PhotoService } from 'src/app/demo/service/photo.service';
import { Product } from 'src/app/models/product.model';
import { MediaService } from 'src/app/services/media/media.service';
import { ProductsService } from 'src/app/services/products/products.service';



interface UploadEvent {
  originalEvent: Event;
  files: File[];
}



@Component({
  selector: 'app-product-dialog',
  templateUrl: './product-dialog.component.html',
  styles: `

:host ::ng-deep {
    .product-item {
        .product-item-content {
            border: 1px solid var(--surface-d);
            border-radius: 3px;
            margin: .3rem;
            text-align: center;
            padding: 2rem 0;
        }

        .product-image {
            width: 50%;
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)
        }
    }
}





  `
})
export class ProductDialogComponent implements OnChanges {
  @Input() action: "create" | "update";
  @Input() display: boolean;
  @Input() productToBeUpdated?: Product;
  @Output() onOperationCompleted: EventEmitter<boolean> = new EventEmitter();
  @Output() displayChange = new EventEmitter<boolean>();
  productsFiles: any[] = [];

  images: any[] | undefined;

  public productForm: FormGroup;
  public isWorking = false;

  constructor(
    private formBuilder: FormBuilder,
    private productService: ProductsService,
    private messageService: MessageService,
    private mediaService: MediaService,
    private photoService: PhotoService
  ) {
    this.productForm = this.formBuilder.group({
      "Nombre": new FormControl<string>("", Validators.required),
      "ClaveProdServ": new FormControl<string>("", Validators.required),
      "ClaveUnidad": new FormControl<string>("", Validators.required),
      "Unidad": new FormControl<string>("", Validators.required),
      "Descripcion": new FormControl<string>("", Validators.required),
      "ValorUnitario": new FormControl<string>("", Validators.required),
      "ObjetoImp": "https://www.libreriahuequito.com/public/images/productos/default.png",
    });

  }

  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];


  onUpload(event, form) {
    for (let file of event.files) {
      this.productsFiles.push(file);
    }
    form.clear();
  }

  removeFile(fileToRemove: any) {
    const index = this.productsFiles.indexOf(fileToRemove);
    if (index !== -1) {
      this.productsFiles.splice(index, 1);
    }
  }


  ngOnChanges(changes: SimpleChanges): void {
    let change = changes['productToBeUpdated']?.currentValue;
    if (change == undefined || change == null) {
      this.productForm.reset();
      return;
    }
    this.patchInitialAdmin(change);
  }

  patchInitialAdmin(product: Product) {
    this.images = [...product.ObjetoImp]
    this.productForm.patchValue({
      "Nombre": product.Nombre,
      "ClaveProdServ": product.ClaveProdServ,
      "ClaveUnidad": product.ClaveUnidad,
      "Unidad": product.Unidad,
      "Descripcion": product.Descripcion,
      "ValorUnitario": product.ValorUnitario,
      "ObjetoImp": [...product.ObjetoImp]
    })
  }

  handleAction() {
    if (this.action == 'update') {
      this.updateProduct();
      return;
    }
    this.createProduct();
  }

  onClose() {
    this.productsFiles = [];
    this.displayChange.emit(false);
  }

  async createProduct() {
    try {
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key).markAsDirty();
      })
      this.isWorking = true;
      if (!this.productForm.valid) return;
      let values = this.productForm.value;
      if (this.productsFiles.length >= 1) {
        const urls = await this.mediaService.createList(
          this.productsFiles,
          'images',
          'products'
        );
        values.ObjetoImp = urls ?? [];
        this.productsFiles = [];
      } else {
        values.ObjetoImp = ["https://www.libreriahuequito.com/public/images/productos/default.png"];
      }
      const response = await Response
       // await this.productService.createProduct(this.productForm.value);
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

  async updateProduct(): Promise<void> {
    try {
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key).markAsDirty();
      })
      this.isWorking = true;
      if (!this.productForm.valid) return;
      let values = this.productForm.value;

      if (this.productsFiles.length >= 1) {
        const urls = await this.mediaService.createList(
          this.productsFiles,
          'images',
          'products'
        );
        values.ObjetoImp = values.ObjetoImp.concat(urls ?? []);
        this.productsFiles = [];
      } else {
      }

      let product: Product = {
        Nombre: values['Nombre'],
        ClaveProdServ: values['ClaveProdServ'],
        ClaveUnidad: values['ClaveUnidad'],
        Unidad: values['Unidad'],
        Descripcion: values['Descripcion'],
        ValorUnitario: values['ValorUnitario'],
        ObjetoImp: values['ObjetoImp']
      }
      const response = Response
      // await this.productService.updateProduct(
      //  product,
        //this.productToBeUpdated._id
    //  );
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
