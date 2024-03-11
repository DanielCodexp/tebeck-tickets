import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import * as firebase from 'firebase/auth';
import { first, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EmailAuthProvider, getAuth, reauthenticateWithCredential } from "firebase/auth";
import { DefaultResponse } from 'src/app/models/http.model';
import { User } from 'src/app/models/auth.model';

interface Authenticated {
  res?: boolean;
  user?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private ADMIN_URI: string = `${environment.URL_API}/admins/`;


  constructor(
    private http: HttpClient,
    private firebase: AngularFirestore,
    private auth: AngularFireAuth,
    private router: Router,
  ) { }

  async isAuthenticated(): Promise<Authenticated> {
    const user: any = await this.isLoggedIn();
    if (user) {
      return { res: true, user: user.uid };
    } else {
      return { res: false };
    }
  }

  async isLoggedIn() {
    return await firstValueFrom(this.auth.authState.pipe(first()));
  }

  async login(email: string, password: string) {
    try {
      const sigInSnapshot = await this.auth.signInWithEmailAndPassword(
        email,
        password
      );
      if (!sigInSnapshot.user) {
        console.log(sigInSnapshot);
        throw false;
      }
      //window.location.reload();
      //return this.router.navigate(['inventory'])
    } catch (error: any) {
      console.log(error);

      let errorMessage;
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No existe una cuenta creada con el correo ingresado"
          break;

        case "auth/invalid-email":
          errorMessage = "Correo electrónico incorrecto"
          break;

        case "auth/wrong-password":
          errorMessage = "Contraseña incorrecta"
          break;

        case "auth/invalid-password":
          errorMessage = "Contraseña inválida"
          break;

        case "auth/too-many-requests":
            errorMessage = "Cuenta inhabilitada temporalmente"
            break;

        default:
          errorMessage = "Ocurrió un error, intente nuevamente"
          break;
      }

      if (error.code == undefined) {
        errorMessage = "No existe una cuenta con el correo ingresado."
      }

      throw { error: true, message: errorMessage };
    }
  }

  async logout(): Promise<any> {
    try {
      return await this.auth.signOut();
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(password: string, id: string){
    try {
      let response = await this.http.post<{code: number, message: number}>(this.ADMIN_URI + 'update-password', { password, id }).toPromise();
      return response
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getUser(uid: string){
    try {
      const user = await this.firebase.collection('administrators').doc(uid).get().toPromise();
      return user?.data() as User;
    } catch (error) {
      console.log(error);
      throw error
    }
  }

  async getUserType(){
    try {
      let admin = await this.isLoggedIn()
      let adminUid = admin?.uid;
      let response = await this.http.get<DefaultResponse>(`${this.ADMIN_URI}get/${adminUid}`).toPromise();
      return response!.data?.userType
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAdminFromMongo(){
    try {
      let admin = await this.isLoggedIn()
      
      let adminUid = admin?.uid;
      let response = await firstValueFrom(this.http.get<DefaultResponse>(`${this.ADMIN_URI}get/${adminUid}`));
      return response!.data
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  checkIfEmailExist(email: any) {
    return new Promise((resolve, reject) => {
      var ref = this.firebase.collection("administrators/", (ref:any) => ref.where('email', '==', email));
      var obs$ = ref.valueChanges();
      let sub = obs$.subscribe((data:any) => {
        console.log(data);
        if (data.length > 0) {
          resolve(true);

        } else {
          reject(false);
        }
        sub.unsubscribe()
      })
    })
  }

  sendRecoveryEmail(email:any) {
    return new Promise((resolve, reject) => {
      this.auth.sendPasswordResetEmail(email).then((res:any) => {
        resolve(true);
      }).catch((err:any) => {
        reject(false)
      })
    })
  }

  async reutenticateUser(email:string, password:string){
    try{
      const user:any = await this.isLoggedIn();
    const credential = EmailAuthProvider.credential(
        email,
        password
    );
    // Now you can use that to reauthenticate
    let reauth = await user.reauthenticateWithCredential(credential);
    return reauth;
    }catch(e){
      console.log("error")
      return false;
    }
  }
}
