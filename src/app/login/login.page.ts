import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import {LoginService} from '../services/login/login.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, AfterViewInit, OnDestroy {

  public showPassword: boolean = false;
  subscription: Subscription = new Subscription();

  constructor(
    private loginService: LoginService,
    private router: Router,
    public loadingController: LoadingController,
    private toastCtrl: ToastController,
    ) {
      localStorage.removeItem("currentUser");
    }
  ngAfterViewInit(): void {
    this.loginForm.reset();
  }

    loginForm = new FormGroup({
      email: new FormControl('', Validators.email),
      password: new FormControl('',  [Validators.required, Validators.minLength(8), Validators.maxLength(20)]),
    });

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.loginForm.reset();
  }
  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Login in...',
      duration: 3000
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
    // console.log('Loading dismissed!');
  }
  public onPasswordToggle(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.presentLoading();
    // const frm = document.querySelector('#frmLogin') as HTMLFormElement;
    // const fd = new FormData(frm);
    // const email = fd.get('email').toString();
    // const password = fd.get('password').toString();
    const reponse = this.loginService.loginUser(this.loginForm.getRawValue()).subscribe(currenUser => {
      // console.log(currenUser);
      // return currenUser;
    });
    this.subscription.add(reponse);
  }

  async presentToast(msg) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom',
      mode: 'ios',
      cssClass: 'toast'
    });
    toast.present();
  }

  showPasswordReset(){
    if(!this.loginForm.get('email').valid){
      this.presentToast("A valid email address is required!");
      return false;
    }
    this.router.navigate([`/password-reset/${this.loginForm.getRawValue().email}`]);
  }


}
