import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom } from 'rxjs';
import { DefaultResponse } from 'src/app/models/http.model';
import { Notification } from 'src/app/models/notification.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private baseUrl: string = `${environment.URL_API}/stores`;


  constructor(
    private http: HttpClient,
  ) { }

  async getAllStores(): Promise<any[]> {
    try {
      const response = await firstValueFrom(this.http.get<DefaultResponse>(this.baseUrl));
      return response!.data
    } catch (error) {
      throw error;
    }
  }

  async getAllStoresWithContacts(): Promise<any[]> {
    try {
      const response = await firstValueFrom(this.http.get<DefaultResponse>(this.baseUrl + '/contacts'));
      return response!.data
    } catch (error) {
      throw error;
    }
  }

}
