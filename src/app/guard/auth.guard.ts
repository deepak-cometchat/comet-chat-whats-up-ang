import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
      private router: Router,
      private service: AuthService
  ) { }

  canActivate(): boolean {
    let user = localStorage.getItem('user');
    if (user) {
      return true;
    } else {
      this.router.navigate(['/auth/login']);
      return false;
    }
   }
  
}
