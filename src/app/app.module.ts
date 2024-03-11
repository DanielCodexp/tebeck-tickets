import { NgModule } from '@angular/core';
import { PathLocationStrategy, LocationStrategy, CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { ProductService } from './demo/service/product.service';
import { CountryService } from './demo/service/country.service';
import { CustomerService } from './demo/service/customer.service';
import { EventService } from './demo/service/event.service';
import { IconService } from './demo/service/icon.service';
import { NodeService } from './demo/service/node.service';
import { PhotoService } from './demo/service/photo.service';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from 'src/environments/environment';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es'

import { AngularFireDatabaseModule } from '@angular/fire/compat/database';

registerLocaleData(localeEs);

@NgModule({
    declarations: [
        AppComponent,
        NotfoundComponent,
    ],
    imports: [
        AppRoutingModule,
        AppLayoutModule,
        AngularFireModule,
        AngularFirestoreModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule
    ],
    providers: [
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        { provide: LOCALE_ID, useValue: "es-MX" },
        CountryService,
        CustomerService,
        EventService,
        IconService,
        NodeService,
        PhotoService,
        ProductService,

    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
