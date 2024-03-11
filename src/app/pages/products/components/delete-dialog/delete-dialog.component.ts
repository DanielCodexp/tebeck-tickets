import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from 'src/app/models/product.model';
import { ProductsService } from 'src/app/services/products/products.service';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styles: ``
})
export class DeleteDialogComponent {

  @Input() productToBeDeleted: Product;
  @Input() display: boolean;
  @Output() onProductDeleted: EventEmitter<boolean> = new EventEmitter();
  @Output() displayChange = new EventEmitter<boolean>();
  public isWorking = false;

  constructor(
    private productsService: ProductsService
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
      if (this.productToBeDeleted == null) return;
      this.isWorking = true;
     // await this.productsService.deleteProduct(this.productToBeDeleted._id)
      this.onProductDeleted.emit(true);
      this.onClose();
    } catch (error) {
      // TODO ERROR HANDLING
    } finally {
      this.isWorking = false;
    }
  }

}
