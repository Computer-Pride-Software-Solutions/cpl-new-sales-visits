import { Component, OnDestroy, OnInit } from '@angular/core';
import {LoginService} from '../services/login/login.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingController } from '@ionic/angular';

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
    public loadingController: LoadingController

    ) {
      localStorage.removeItem("currentUser");
    }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {

  }
  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Login in...',
      duration: 3000
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
    console.log('Loading dismissed!');
  }
  public onPasswordToggle(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.presentLoading();
    const frm = document.querySelector('#frmLogin') as HTMLFormElement;
    const fd = new FormData(frm);
    const email = fd.get('email').toString();
    const password = fd.get('password').toString();
    this.loginService.loginUser(email, password).subscribe(currenUser => {
      return currenUser;
    });
  }


}
