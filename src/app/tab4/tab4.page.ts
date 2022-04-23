import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { IPriceList, IProduct } from '../interfaces/IProducts';
import { ProductService } from '../services/product/product.service';
import { ActivatedRoute } from '@angular/router';
import { ClientService } from '../services/client/client.service';
import { FormControl, Validators } from '@angular/forms';
import { debounce, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit, OnDestroy, AfterViewInit {
  subscription: Subscription = new Subscription();
  isLoading = true;
  pricelists: IPriceList[] = [];
  page:number = 0;
  itemHint = new FormControl('', [Validators.minLength(3), Validators.min(3)]);

  constructor(
    private productService: ProductService,
    private clientService: ClientService,

  ) { }
  ngAfterViewInit(): void {
    this.getPriceList();
    this.getProducts(this.page);
    this.searchProducts();
  }

  ngOnInit() {
   
  }

  ngOnDestroy() {
    // releasing resources
    this.subscription.unsubscribe();
  }

  // Refreshing page
  doRefresh(event) {
    // Begin async operation
    this.page = 0;
    this.getProducts(this.page);
    setTimeout(() => {
      // Async operation has ended
      event.target.complete();
    }, 500);
  }


  products: IProduct[] = [];
  getProducts(chunk: number, hint = ''){
    this.subscription.add(
      this.productService.getAllProducts(chunk, hint)
      .subscribe((products: IProduct[]) => {
        this.products = products;
        // console.log(products);
        this.isLoading = false;

      })
    )
  }

  //check first if the product is already on the frontend before making another API request
  // hint: string = '';
  searchProducts(): void{
    const result = this.itemHint.valueChanges.pipe(debounceTime(600));
    result.subscribe((hint) => this.getProducts(this.page, hint.toLowerCase()));
  }

  loadData(event) {
    this.products = [];
    this.page = this.page + 1;
    setTimeout(() => {
      event.target.complete();

      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      this.getProducts(this.page, this.itemHint.value); // Fetching new orders
    }, 200);
  }


  getPriceList(): void{
    this.subscription.add(
      this.clientService.getPriceList().subscribe( pricelist => {
        this.pricelists = pricelist;
        // console.log(JSON.stringify(this.pricelists));
      })
    );
  }

  plistId: number;
  getSelectedPriceList(pricelistId){
    // console.log(pricelistId);
    this.plistId = pricelistId;


  }

}
