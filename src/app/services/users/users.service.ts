import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom } from 'rxjs';
import { DefaultResponse } from 'src/app/models/http.model';
import { UserInformation } from 'src/app/models/user.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private baseUrl: string = `${environment.URL_API}/users/`;


  constructor(
    private http: HttpClient,
  ) { }

  async getAllUsers(): Promise<UserInformation[]> {
    try {
      const response = await firstValueFrom(this.http.get<DefaultResponse>(this.baseUrl + 'list/all'));
      return response!.data
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(uid: string) {
    try {
      let response = await firstValueFrom(this.http.delete<DefaultResponse>(this.baseUrl + 'delete/' + uid));
      return response
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createUser(user: UserInformation) {
    try {
      let response = await firstValueFrom(this.http.post<DefaultResponse>(this.baseUrl + 'create', { user }));
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateUser(user: any, uid: string) {
    try {
      let response = await firstValueFrom(this.http.put<DefaultResponse>(this.baseUrl + 'panel/update', { user, uid }));
      return response
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
