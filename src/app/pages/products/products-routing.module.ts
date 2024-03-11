import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsTableComponent } from './table/table.component';

const routes: Routes = [
  { path: '', component: ProductsTableComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
