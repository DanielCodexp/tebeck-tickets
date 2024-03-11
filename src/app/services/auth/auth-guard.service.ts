import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

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
        if (!auth) {
          this.router.navigate(['login']);
          obs.next(false);
        }
        obs.next(true);
      });
    });
  }
}
