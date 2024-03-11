import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    constructor(private primengConfig: PrimeNGConfig,
        private config: PrimeNGConfig) { }

    ngOnInit() {
        this.primengConfig.ripple = true;
        this.config.setTranslation(this.getPrimeTranslations());

    }


    getPrimeTranslations() {
        return {
            "dayNames": ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
            "dayNamesShort": ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
            "dayNamesMin": ["D", "L", "M", "X", "J", "V", "S"],
            "monthNames": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            "monthNamesShort": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
            "today": "Hoy",
            "weekHeader": "Sem",
            "startsWith": "Empieza con",
            "contains": "Contiene",
            "apply": "Aplicar",
            "clear": "Limpiar",
            "addRule": "Agregar Regla",
            "accept": "Sí",
            "reject": "No",
            "choose": "Elegir",
            "dateFormat": "dd/mm/yy"
        }
    }

}
