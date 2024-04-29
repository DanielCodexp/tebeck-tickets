import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-graficas',
  templateUrl: './graficas.component.html',
  styleUrl: './graficas.component.scss'
})
export class GraficasComponent {
    chartData: any;
    items!: MenuItem[];
    chartOptions: any;

    constructor() {
        console.log("hola")
    }
}
