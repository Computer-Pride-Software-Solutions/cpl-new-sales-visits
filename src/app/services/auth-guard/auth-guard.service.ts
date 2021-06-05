import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { LoginService } from '../login/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  private headers = new HttpHeaders();

  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private logingService: LoginService
    ) { 
      this.headers = this.headers.set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    }
  auth = false;
    
  canActivate(route: ActivatedRouteSnapshot): boolean {


      this.logingService.auth().subscribe((r)=>console.log(r));

      let isAuthenticated = false;
      if (localStorage.getItem('currentUser')) {
          isAuthenticated = JSON.parse(localStorage.getItem('currentUser')).isAuthenticated;
      }

      if (!isAuthenticated) {
        this.router.navigate(["/login"]);
        return false;
      }

      return true;
  }

}
