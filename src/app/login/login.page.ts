import { Component, OnDestroy, OnInit } from '@angular/core';
import {LoginService} from '../services/login/login.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {

  public showPassword: boolean = false;
  subscription: Subscription = new Subscription();

  constructor(
    private loginService: LoginService,
    private router: Router,

    ) {
      localStorage.removeItem("currentUser");
    }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {

  }

  public onPasswordToggle(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    const frm = document.querySelector('#frmLogin') as HTMLFormElement;
    const fd = new FormData(frm);
    const email = fd.get('email').toString();
    const password = fd.get('password').toString();
    this.loginService.loginUser(email, password).subscribe(currenUser => {
      return currenUser;
    });
  }


}
