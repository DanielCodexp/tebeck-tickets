import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EmailDefaults, Folios } from 'src/app/models/settings.model';
import { DefaultResponse } from 'src/app/models/http.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private baseUrl: string = `${environment.URL_API}/settings/`;

  constructor(
    private http: HttpClient,
  ) { }

  public async getFolios(): Promise<DefaultResponse<Folios>> {
    return await firstValueFrom(this.http.get<DefaultResponse<Folios>>(this.baseUrl + 'folios')).then(data => data).catch((error) => Promise.resolve({ status: error.status, data: error, callStatus: error.message, } as DefaultResponse))
  }

  public async getEmailDefaults(): Promise<DefaultResponse<EmailDefaults>> {
    return await firstValueFrom(this.http.get<DefaultResponse<EmailDefaults>>(this.baseUrl + 'email-defaults')).then(data => data).catch((error) => Promise.resolve({ status: error.status, data: error, callStatus: error.message, } as DefaultResponse))

  }
}
