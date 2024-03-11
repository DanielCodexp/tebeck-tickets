import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Client } from 'src/app/models/client.model';
import { DefaultResponse } from 'src/app/models/http.model';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  public baseUrl: string = `${environment.URL_API}/clients/`;

  constructor(
    private http: HttpClient,
    private angularFirestore: AngularFirestore,

  ) { }

  async getAllClients(): Promise<Client[]> {
    try {
      const response = await firstValueFrom(this.http.get<DefaultResponse>(this.baseUrl+ 'get-all'));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getClient(clientId: string): Promise<Client> {
    try {
      const response = await firstValueFrom(this.http.get<DefaultResponse>(this.baseUrl + `id/${clientId}`));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createClient(client: Client): Promise<string> {
    try {
      let response = await firstValueFrom(this.http.post<DefaultResponse>(this.baseUrl +'create', { ...client }));
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async editClient(clientData: any, client_id: string): Promise<string> {
    console.log(clientData)
    console.log(client_id)
    try {
      let response = await firstValueFrom(this.http.put<DefaultResponse>(this.baseUrl + 'update', { clientData, client_id }));
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteClient(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete<DefaultResponse>(this.baseUrl + 'delete/' + id));
      return;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
