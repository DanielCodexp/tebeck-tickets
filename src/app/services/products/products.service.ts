import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DefaultResponse } from 'src/app/models/http.model';
import { environment } from 'src/environments/environment';

import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { Ticket } from 'src/app/models/ticket';


@Injectable({
  providedIn: 'root'
})
export class ProductsService {
    private dbPath = '/BucketImpresoras';

    ticketRef: AngularFireList<Ticket>;

  constructor(private db: AngularFireDatabase) {
    this.ticketRef = db.list(this.dbPath);
   }

   getAll(): AngularFireList<Ticket> {
    return this.ticketRef
  }

  }
