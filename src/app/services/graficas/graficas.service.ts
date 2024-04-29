import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { graficas } from 'src/app/models/graficas';
import { Ticket } from 'src/app/models/ticket';

@Injectable({
  providedIn: 'root'
})
export class GraficasService {
    private dbPath = '/graficasDashBoard';

    ticketRef: AngularFireList<graficas>;

    constructor(private db: AngularFireDatabase) {
      this.ticketRef = db.list(this.dbPath);
     }

     getAll(): AngularFireList<graficas> {
      return this.ticketRef
    }



}
