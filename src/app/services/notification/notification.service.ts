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
export class NotificationService {
  private baseUrl: string = `${environment.URL_API}/notifications/`;


  constructor(
    private http: HttpClient,
  ) { }

  async getAllNotifications(): Promise<Notification[]> {
    try {
      const response = await firstValueFrom(this.http.get<DefaultResponse>(this.baseUrl));
      return response!.data
    } catch (error) {
      throw error;
    }
  }

  async sendNotification(appNotification: Notification) {
    try {
      let response = await firstValueFrom(this.http.post<DefaultResponse>(this.baseUrl + 'send-notification', { ...appNotification }));
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
