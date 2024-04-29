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
    chartData: any;
    chartOptions: any;
    subscription!: Subscription;

    public isLoading = false;
    currentTicket: any;
    currentIndex = -1;

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
       this.items = [
            { label: 'Add New', icon: 'pi pi-fw pi-plus' },
            { label: 'Remove', icon: 'pi pi-fw pi-minus' }
        ];
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.chartData = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
                {
                    label: 'First Dataset',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--bluegray-700'),
                    borderColor: documentStyle.getPropertyValue('--bluegray-700'),
                    tension: .4
                },
                {
                    label: 'Second Dataset',
                    data: [28, 48, 40, 19, 86, 27, 90],
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--green-600'),
                    borderColor: documentStyle.getPropertyValue('--green-600'),
                    tension: .4
                }
            ]
        };

        this.chartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
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

                const newData = {
                    labels: res.map(item => item.key),
                    datasets: [
                        {
                            label: 'Actual',
                            data: res.map(item => parseInt(item.actual)),
                            fill: false,
                            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bluegray-700'),
                            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bluegray-700'),
                            tension: .4
                        },
                        {
                            label: 'Anterior',
                            data: res.map(item => parseInt(item.anterior)),
                            fill: false,
                            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--green-600'),
                            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--green-600'),
                            tension: .4
                        },
                        {
                            label: 'Anterior de Anterior',
                            data: res.map(item => parseInt(item.anteriorDeAnterior)),
                            fill: false,
                            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--orange-600'),
                            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--orange-600'),
                            tension: .4
                        }
                    ]
                };

                this.chartData = newData;

                console.log(this.chartData);

            });
        });
    }




}
