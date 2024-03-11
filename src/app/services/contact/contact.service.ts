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
export class ContactService {
  private baseUrl: string = `${environment.URL_API}/contacts`;


  constructor(
    private http: HttpClient,
  ) { }

  async getAllContacts(): Promise<any[]> {
    try {
      const response = await firstValueFrom(this.http.get<DefaultResponse>(this.baseUrl));
      return response!.data
    } catch (error) {
      throw error;
    }
  }
}
