import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Client } from 'src/app/models/client.model';
import { DefaultResponse } from 'src/app/models/http.model';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Supplier } from 'src/app/models/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {
  public baseUrl: string = `${environment.URL_API}/suppliers/`;

  constructor(
    private http: HttpClient,
    private angularFirestore: AngularFirestore,

  ) { }

  async getAllSuppliers(): Promise<Supplier[]> {
    try {
      const response = await firstValueFrom(this.http.get<DefaultResponse>(this.baseUrl+ 'get-all'));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getSupplier(supplierId: string): Promise<Supplier> {
    try {
      const response = await firstValueFrom(this.http.get<DefaultResponse>(this.baseUrl + `id/${supplierId}`));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createSupplier(supplier: Supplier): Promise<string> {
    try {
      let response = await firstValueFrom(this.http.post<DefaultResponse>(this.baseUrl +'create', { ...supplier }));
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async editSupplier(suppliersData: any, suppliers_id: string): Promise<string> {
    console.log(suppliersData)
    console.log(suppliers_id)
    try {
      let response = await firstValueFrom(this.http.put<DefaultResponse>(this.baseUrl + 'update', { suppliersData, suppliers_id }));
      return response.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteSupplier(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete<DefaultResponse>(this.baseUrl + 'delete/' + id));
      return;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
