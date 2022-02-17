import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PasswordResetService } from '../services/PasswordReset/password-reset.service';
import { AlertController } from '@ionic/angular';
import { DialogService } from '../services/Dialog/dialog.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.page.html',
  styleUrls: ['./password-reset.page.scss'],
})
export class PasswordResetPage implements OnInit, AfterViewInit {
  userEmail = this.activatedRoute.snapshot.paramMap.get('email');
  isOTPValid = false;
  isLoading= false;
  constructor(
    private toastCtrl: ToastController,
    private activatedRoute: ActivatedRoute,
    private passwordResetService: PasswordResetService,
    public alertController: AlertController,
    public loadingController: LoadingController,
    private router: Router,
    private dialogService: DialogService

  ) { }


  validateOTPForm = new FormGroup({
    email: new FormControl(this.userEmail, Validators.email),
    otp: new FormControl('',  [Validators.required, Validators.minLength(6), Validators.maxLength(6)]),
  });

// p = ''
  // password: string = ''


  resetPassword = new FormGroup({
    email: new FormControl(this.userEmail, Validators.email),
    password: new FormControl('',  [Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
    repeatPassword: new FormControl('',  [Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
  });

  ngOnInit() {
  }
  
  ngAfterViewInit(): void {
    // this.sendOTP(this.validateOTPForm.getRawValue().email);
  }

  async presentAlert(msg, status) {
    const alert = await this.alertController.create({
      cssClass: 'secondary',
      header: status,
      message: `${msg}`,
      mode: 'ios',
      buttons: ['OK']
    });

    await alert.present();
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Login in...',
      duration: 3000
    });
    await loading.present();
    const { role, data } = await loading.onDidDismiss();
  }


  getBackButtonText() {
    const win = window as any;
    const mode = win && win.Ionic && win.Ionic.mode;
    return mode === 'ios' ? 'Inbox' : '';
  }

  sendOTP(email){
    const self = this;
    this.dialogService.confirmDialog("Sending OTP", "Confirm that you meant to get a One Time Password to your email!", async function(){
      self.isLoading = true;
      const response = await self.passwordResetService.sendOTP(email);
      self.presentAlert(response['msg'], (response['updated'])? 'One Time Password': 'Failed');
      self.isLoading = false;
    })
 
  }

  setValidators(password){
    this.resetPassword.get('repeatPassword').setValidators([Validators.pattern(password),Validators.required, Validators.minLength(8), Validators.maxLength(8)])
  }

  async validateOTP(){
    this.isLoading = true;
    const response = await this.passwordResetService.validateOTP(this.validateOTPForm.getRawValue());
    this.isOTPValid = response.isOTPValid;
    this.presentAlert(response['msg'], (response['isOTPValid'])? "Success": "Failed")
    this.isLoading = false;

  }


  async resetUserPassword(){
    const self = this;
    this.dialogService.confirmDialog("Resetting Password", "Confirm that you meant to reset your password!", async function(){
      self.isLoading = true;
      const response = await self.passwordResetService.resetPassword(self.resetPassword.getRawValue());
      self.presentAlert(response['msg'], (response['updated'])? "Success": "Failed");
      self.isLoading = false;
      if(response['updated']){
        self.isOTPValid = false;
        self.router.navigate([`/login`]);
      }
    })
  }
}
