import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class SignInGuard implements CanActivate {
  constructor(private auth: AngularFireAuth, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    return new Observable<boolean>((obs) => {
      
      this.auth.authState.subscribe((auth: any) => {
        console.log(auth);
        if (auth) {
          this.router.navigate(['']);
          obs.next(false);
        }
        obs.next(true);
      });
    });
  }
}
