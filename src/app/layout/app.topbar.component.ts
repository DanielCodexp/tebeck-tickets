import { Component, ElementRef, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { AuthService } from '../services/auth/auth.service';
import { LayoutService } from "./service/app.layout.service";

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    providers: [ConfirmationService]
})
export class AppTopBarComponent {

    items!: MenuItem[];

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(
        public layoutService: LayoutService, 
        public authService : AuthService,
        private confirmationService: ConfirmationService,
    ) { }

    confirmLogOut(event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: '¿Seguro que desea cerrar sesión?',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                await this.authService.logout();
            },
            reject: () => {
                
            }
        });
    }
}
