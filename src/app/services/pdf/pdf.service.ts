import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

export interface SimpleResponse {
  code: number
  message: string
  data: any
}

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  private PDF_URI: string = `${environment.URL_API}/get-pdf/`;

  constructor(
    private http: HttpClient
  ) { }

  async getPDFLink(data:any) {
    try {
      let response: any = await this.http.post<SimpleResponse>(`${this.PDF_URI}quote-pdf`, {data}).toPromise();
      return response?.data
    } catch (error) {
      console.log(error);
      throw error
    }
  }

  async getReportPDFLink(data:any) {
    try {
      let response: any = await this.http.post<SimpleResponse>(`${this.PDF_URI}report-pdf`, {data}).toPromise();
      return response?.data
    } catch (error) {
      console.log(error);
      throw error
    }
  }


}
