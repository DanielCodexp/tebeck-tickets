import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Product } from '../../api/product';
import { ProductService } from '../../service/product.service';
import { Subscription, debounceTime, map } from 'rxjs';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { ProductsService } from 'src/app/services/products/products.service';
import { GraficasService } from '../../../services/graficas/graficas.service';
import { graficas } from 'src/app/models/graficas';

@Component({
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {

    items!: MenuItem[];
   // chartData: any;
    chartOptions: any;
    subscription!: Subscription;

    public isLoading = false;
    currentTicket: any;
    currentIndex = -1;

    public datos: any[] = [];
    chartData = {
        labels: ['actual', 'anterior', 'anteriorDeAnterior'],
        datasets: []
      };

    constructor(
        private productService: ProductService,
        public layoutService: LayoutService,
        private graficasService: GraficasService

    ) {
        this.subscription = this.layoutService.configUpdate$
        .pipe(debounceTime(25))
        .subscribe((config) => {
            this.initChart();
        });
    }

    ngOnInit() {
        this.initChart();
        this.getInformationRoutine();
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    async getInformationRoutine(): Promise<void> {
        try {
            this.isLoading = true;
            this.currentIndex = -1;
            await this.retrieveCurrentTickets();
            this.isLoading = false;
        } catch (error) {
           console.log(error)
        }
    }


    async retrieveCurrentTickets(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.graficasService.getAll().snapshotChanges().pipe(
                map(changes =>
                    changes.map(c =>
                        ({ key: c.payload.key, ...c.payload.val() })
                    )
                )
            ).subscribe(data => {
                const res = data;
                this.datos = res;

               this.procesarDatos()
            });
        });
    }


    procesarDatos() {

        this.datos.sort((a, b) => a.key.localeCompare(b.key));
        this.chartData.datasets = this.datos.map(item => {
          return {
            label: item.key,
            data: [parseInt(item.actual), parseInt(item.anterior), parseInt(item.anteriorDeAnterior)],
            fill: false,
            backgroundColor: this.getColor(item.key),
            borderColor: this.getColor(item.key),
            tension: 0.4
          };
        });
 this.isLoading = true;
        console.log( this.chartData.datasets)
      }

      getColor(key: string): string {
        return key === 'T1' ? '#37474F' : '#2E7D32';
      }







}
