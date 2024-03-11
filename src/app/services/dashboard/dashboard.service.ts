import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DefaultResponse } from 'src/app/models/http.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  public baseUrl: string = `${environment.URL_API}/dashboard/`;

  constructor(
    private http: HttpClient,
  ) { }

  async getDashboard(): Promise<any> {
    try {
      const response = await lastValueFrom(this.http.get<DefaultResponse>(this.baseUrl + `get-info`));
      return response!.data
    } catch (error) {
      throw error;
    }
  }
  async getDashboardByDateRange(dateFrom: Date, dateTo: Date): Promise<any> {
  
    try {
      const response = await lastValueFrom(this.http.get<DefaultResponse>(this.baseUrl + `get-by-date/${dateFrom}/${dateTo}`));
      return response!.data
    } catch (error) {
      throw error;
    }
  }

}
