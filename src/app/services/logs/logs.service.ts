import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { lastValueFrom } from 'rxjs';
import { DefaultResponse } from 'src/app/models/http.model';

@Injectable({
  providedIn: 'root'
})
export class LogsService {

  public propertiesBaseUrl: string = `${environment.URL_API}/logs/properties/`;
  public adminsBaseUrl: string = `${environment.URL_API}/logs/admins/`;

  constructor(
    private http: HttpClient,
  ) { }

  // ADMINS
  async createAdminLog(adminId: string, user: any, type: number): Promise<any> {
    try {
      let response = await lastValueFrom(this.http.post<DefaultResponse>(this.adminsBaseUrl + 'new-log', { adminId, user, type }));
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAdminLogs(): Promise<any[]> {
    try {
      const response = await lastValueFrom(this.http.get<DefaultResponse>(this.adminsBaseUrl + 'get-all'));
      return response!.data
    } catch (error) {
      throw error;
    }
  }

  async getAdminLogsByDateRange(dateFrom: Date, dateTo: Date): Promise<any[]> {

    try {
      const response = await lastValueFrom(this.http.get<DefaultResponse>(this.adminsBaseUrl + `get-by-date/${dateFrom}/${dateTo}`));
      return response!.data
    } catch (error) {
      throw error;
    }
  }
}
