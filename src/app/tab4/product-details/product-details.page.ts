import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product/product.service';
import { Subscription } from 'rxjs';
import { IonContent } from '@ionic/angular';

import { Camera, CameraResultType } from '@capacitor/camera';
import { DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import { ActionSheetController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Directive, ElementRef } from '@angular/core';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.page.html',
  styleUrls: ['./product-details.page.scss'],
})
export class ProductDetailsPage implements OnInit, OnDestroy {

  subscription: Subscription = new Subscription();
  itemGroup = this.activatedRoute.snapshot.paramMap.get('itemGroup');
  itemCode = this.activatedRoute.snapshot.paramMap.get('itemCode');
  pricelistId = this.activatedRoute.snapshot.paramMap.get('pricelistId');


  isLoading = true;

  products: any[] = [];
  slideOpts = {
    grabCursor: true,
  cubeEffect: {
    shadow: true,
    slideShadows: true,
    shadowOffset: 20,
    shadowScale: 0.30,
  },
  on: {
    beforeInit: function() {
      const swiper = this;
      swiper.classNames.push(`${swiper.params.containerModifierClass}cube`);
      swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);

      const overwriteParams = {
        slidesPerView: 1,
        slidesPerColumn: 1,
        slidesPerGroup: 1,
        watchSlidesProgress: true,
        resistanceRatio: 0,
        spaceBetween: 0,
        centeredSlides: false,
        virtualTranslate: true,
      };

      this.params = Object.assign(this.params, overwriteParams);
      this.originalParams = Object.assign(this.originalParams, overwriteParams);
    },
    setTranslate: function() {
      const swiper = this;
      const {
        $el, $wrapperEl, slides, width: swiperWidth, height: swiperHeight, rtlTranslate: rtl, size: swiperSize,
      } = swiper;
      const params = swiper.params.cubeEffect;
      const isHorizontal = swiper.isHorizontal();
      const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
      let wrapperRotate = 0;
      let $cubeShadowEl;
      if (params.shadow) {
        if (isHorizontal) {
          $cubeShadowEl = $wrapperEl.find('.swiper-cube-shadow');
          if ($cubeShadowEl.length === 0) {
            $cubeShadowEl = swiper.$('<div class="swiper-cube-shadow"></div>');
            $wrapperEl.append($cubeShadowEl);
          }
          $cubeShadowEl.css({ height: `${swiperWidth}px` });
        } else {
          $cubeShadowEl = $el.find('.swiper-cube-shadow');
          if ($cubeShadowEl.length === 0) {
            $cubeShadowEl = swiper.$('<div class="swiper-cube-shadow"></div>');
            $el.append($cubeShadowEl);
          }
        }
      }

      for (let i = 0; i < slides.length; i += 1) {
        const $slideEl = slides.eq(i);
        let slideIndex = i;
        if (isVirtual) {
          slideIndex = parseInt($slideEl.attr('data-swiper-slide-index'), 10);
        }
        let slideAngle = slideIndex * 90;
        let round = Math.floor(slideAngle / 360);
        if (rtl) {
          slideAngle = -slideAngle;
          round = Math.floor(-slideAngle / 360);
        }
        const progress = Math.max(Math.min($slideEl[0].progress, 1), -1);
        let tx = 0;
        let ty = 0;
        let tz = 0;
        if (slideIndex % 4 === 0) {
          tx = -round * 4 * swiperSize;
          tz = 0;
        } else if ((slideIndex - 1) % 4 === 0) {
          tx = 0;
          tz = -round * 4 * swiperSize;
        } else if ((slideIndex - 2) % 4 === 0) {
          tx = swiperSize + (round * 4 * swiperSize);
          tz = swiperSize;
        } else if ((slideIndex - 3) % 4 === 0) {
          tx = -swiperSize;
          tz = (3 * swiperSize) + (swiperSize * 4 * round);
        }
        if (rtl) {
          tx = -tx;
        }

         if (!isHorizontal) {
          ty = tx;
          tx = 0;
        }

         const transform$$1 = `rotateX(${isHorizontal ? 0 : -slideAngle}deg) rotateY(${isHorizontal ? slideAngle : 0}deg) translate3d(${tx}px, ${ty}px, ${tz}px)`;
        if (progress <= 1 && progress > -1) {
          wrapperRotate = (slideIndex * 90) + (progress * 90);
          if (rtl) wrapperRotate = (-slideIndex * 90) - (progress * 90);
        }
        $slideEl.transform(transform$$1);
        if (params.slideShadows) {
          // Set shadows
          let shadowBefore = isHorizontal ? $slideEl.find('.swiper-slide-shadow-left') : $slideEl.find('.swiper-slide-shadow-top');
          let shadowAfter = isHorizontal ? $slideEl.find('.swiper-slide-shadow-right') : $slideEl.find('.swiper-slide-shadow-bottom');
          if (shadowBefore.length === 0) {
            shadowBefore = swiper.$(`<div class="swiper-slide-shadow-${isHorizontal ? 'left' : 'top'}"></div>`);
            $slideEl.append(shadowBefore);
          }
          if (shadowAfter.length === 0) {
            shadowAfter = swiper.$(`<div class="swiper-slide-shadow-${isHorizontal ? 'right' : 'bottom'}"></div>`);
            $slideEl.append(shadowAfter);
          }
          if (shadowBefore.length) shadowBefore[0].style.opacity = Math.max(-progress, 0);
          if (shadowAfter.length) shadowAfter[0].style.opacity = Math.max(progress, 0);
        }
      }
      $wrapperEl.css({
        '-webkit-transform-origin': `50% 50% -${swiperSize / 2}px`,
        '-moz-transform-origin': `50% 50% -${swiperSize / 2}px`,
        '-ms-transform-origin': `50% 50% -${swiperSize / 2}px`,
        'transform-origin': `50% 50% -${swiperSize / 2}px`,
      });

       if (params.shadow) {
        if (isHorizontal) {
          $cubeShadowEl.transform(`translate3d(0px, ${(swiperWidth / 2) + params.shadowOffset}px, ${-swiperWidth / 2}px) rotateX(90deg) rotateZ(0deg) scale(${params.shadowScale})`);
        } else {
          const shadowAngle = Math.abs(wrapperRotate) - (Math.floor(Math.abs(wrapperRotate) / 90) * 90);
          const multiplier = 1.5 - (
            (Math.sin((shadowAngle * 2 * Math.PI) / 360) / 2)
            + (Math.cos((shadowAngle * 2 * Math.PI) / 360) / 2)
          );
          const scale1 = params.shadowScale;
          const scale2 = params.shadowScale / multiplier;
          const offset$$1 = params.shadowOffset;
          $cubeShadowEl.transform(`scale3d(${scale1}, 1, ${scale2}) translate3d(0px, ${(swiperHeight / 2) + offset$$1}px, ${-swiperHeight / 2 / scale2}px) rotateX(-90deg)`);
        }
      }

      const zFactor = (swiper.browser.isSafari || swiper.browser.isUiWebView) ? (-swiperSize / 2) : 0;
      $wrapperEl
        .transform(`translate3d(0px,0,${zFactor}px) rotateX(${swiper.isHorizontal() ? 0 : wrapperRotate}deg) rotateY(${swiper.isHorizontal() ? -wrapperRotate : 0}deg)`);
    },
    setTransition: function(duration) {
      const swiper = this;
      const { $el, slides } = swiper;
      slides
        .transition(duration)
        .find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
        .transition(duration);
      if (swiper.params.cubeEffect.shadow && !swiper.isHorizontal()) {
        $el.find('.swiper-cube-shadow').transition(duration);
      }
    },
  }
  };
  constructor(
    private productService: ProductService,
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    public actionSheetController: ActionSheetController,
    private toastCtrl: ToastController,
    private el: ElementRef,
    private router: Router,
  ) { }

  ngOnInit() {
    this.getProductDetails(this.itemCode, parseInt(this.pricelistId));
    // this.getProductsPerGroup(this.itemGroup);

  }

  ngOnDestroy() {
    // releasing resources
    // this.subscription.unsubscribe();
    this.products = [];
  }

  @ViewChild(IonContent, { static: false }) content: IonContent;

  isScrolling = false;
  ScrollToTop() {
    this.content.scrollToTop(1500);
  }

  logScrollStart(event) {
    // this.isScrolling = true;
  }

  logScrolling(event) {
    // this.isScrolling = true;
  }

  logScrollEnd(event) {
    // this.isScrolling = false;
  }

  scrollTo(anchor) {
    let yOffset = document.getElementById(anchor)?.offsetTop;
    this.content.scrollToPoint(0, yOffset, 8000)
  }


  getBackButtonText() {
    const win = window as any;
    const mode = win && win.Ionic && win.Ionic.mode;
    return mode === 'ios' ? 'Inbox' : '';
  }

  async presentActionSheet(index) {
    const actionSheet = await this.actionSheetController.create({
      header: 'ACTION',
      cssClass: 'my-custom-class',
      mode: 'ios',
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
           
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    await actionSheet.present();

    const { role } = await actionSheet.onDidDismiss();
    // console.log('onDidDismiss resolved with role', role);

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

  similarProducts: any[] = [];

  getProductsPerGroup(itemGroup){
    this.isLoading = true;
    this.subscription.add(
      this.productService.getProductsPerGroup(itemGroup, this.pricelistId).subscribe((response) => {
        this.similarProducts = response;
        this.isLoading = false;
          // document.getElementById('viewSelectedItem').click();
        // this.scrollTo(this.itemCode);
      })
    )
  }

  hint: any;
  searchProduct(event = null){
    this.hint = (event)? event.target.value.toString().toLowerCase(): '';
    var regex = new RegExp(this.hint);
    var results = this.products.filter(report => regex.test(report.ItemName.toLowerCase()));
    if(this.hint.length === 0 || results.length === 0){
      this.getProductsPerGroup(this.itemGroup);
    }else{
      this.products = results;
    }
  }



  defaultSRC: any = "https://via.placeholder.com/250";
  thumbnails:any = [ {img : "https://via.placeholder.com/250"},{img : "https://via.placeholder.com/250"},{img : "https://via.placeholder.com/250"}];
  itemImagesToSubmit = [];
  async changeImage(img, itemCode, index){
    const image = await Camera.getPhoto({
      quality: 50,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      width:350,
      height:350
    })
    .then(CameraPhoto => {

      let b64 = {}
      let newImage = {}
      newImage[itemCode] = this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64, ${CameraPhoto.base64String}`);
      this.thumbnails[index] = newImage;
      //img.src = this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64, ${CameraPhoto.base64String}`)

      // to submit
      b64[itemCode] = CameraPhoto.base64String
      this.itemImagesToSubmit.push(b64);

    })
  }

  updateProduct(itemCode){
    this.isLoading = true;
    this.subscription.add(
      this.productService.updateProduct(this.itemImagesToSubmit, itemCode).subscribe((response)=> {
        this.presentToast(response['msg']);
        this.getProductsPerGroup(this.itemGroup);
      })
    )
  }

  getProductDetails(itemCode, pricelistId){
    this.isLoading = true;
    this.subscription.add(
      this.productService.getProductDetails(itemCode, pricelistId).subscribe((response)=> {
        this.products = response;
        this.isLoading = false;
        // this.presentToast(response['msg']);
        this.getProductsPerGroup(this.itemGroup);
        // console.log(response);
      })
    )
  }
  viewItemDetails(itemGroup, itemCode, pricelistId){
    this.router.navigate([`tabs/tab4/product-details/${itemGroup}/${itemCode}/${pricelistId}`]);
  }

}
