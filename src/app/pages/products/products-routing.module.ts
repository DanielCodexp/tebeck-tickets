import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsTableComponent } from './table/table.component';
import { PrintComponent } from './components/print/print.component';

const routes: Routes = [
  { path: '', component: ProductsTableComponent },
  {path: 'print/:printer', component: PrintComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
