import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom } from 'rxjs';

import { environment } from 'src/environments/environment';
import { Admin } from 'src/app/models/admin.model';
import { DefaultResponse } from 'src/app/models/http.model';

@Injectable({
  providedIn: 'root'
})
export class AdminsService {
  public baseUrl: string = `${environment.URL_API}/admins/`;

  constructor(
    private http: HttpClient,
    private angularFirestore: AngularFirestore,
    private auth: AngularFireAuth
  ) { }

  async isEmailFree(email: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.http.post<DefaultResponse>(this.baseUrl + 'validate-email', { email }));
      return response!.data;
    } catch (error) {
      throw error;
    }
  }

  async createAdmin(adminData: Admin) {
    try {
      let response = await firstValueFrom(this.http.post<DefaultResponse>(this.baseUrl + 'create', { adminData }));
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAllAdmins(): Promise<Admin[]> {
    try {
      const response = await firstValueFrom(this.http.get<DefaultResponse>(this.baseUrl + 'get-all'));
      return response!.data
    } catch (error) {
      throw error;
    }
  }

  async getAdminByUid(adminUid: string) {
    try {
      let response: any = (await this.angularFirestore.collection('administrators').doc(adminUid).ref.get()).data();
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateAdmin(adminData: any, adminUid: string) {
    try {
      let response = await firstValueFrom(this.http.put<DefaultResponse>(this.baseUrl + 'update', { adminData, adminUid }));
      return response
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteAdmin(adminUid: string) {
    try {
      let response = await firstValueFrom(this.http.delete<DefaultResponse>(this.baseUrl + 'delete/' + adminUid ));
      return response
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async checkIfEmailExist(email: any) {
    try {
      const response = await firstValueFrom(this.http.post(this.baseUrl + 'validate-email', { email }));
      return response
    } catch (error) {
      console.log(error);
      throw error

    }
  }
}
