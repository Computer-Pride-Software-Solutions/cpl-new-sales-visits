import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { IPriceList, IProduct } from '../interfaces/IProducts';
import { ProductService } from '../services/product/product.service';
import { ActivatedRoute } from '@angular/router';
import { ClientService } from '../services/client/client.service';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit, OnDestroy {
  subscription: Subscription = new Subscription();
  isLoading = true;
  pricelists: IPriceList[] = [];
  page:number = 0;

  constructor(
    private productService: ProductService,
    private clientService: ClientService,

  ) { }

  ngOnInit() {
    this.getPriceList();
    this.getProducts(this.page);
  }

  ngOnDestroy() {
    // releasing resources
    this.subscription.unsubscribe();
  }

  // Refreshing page
  doRefresh(event) {
    // Begin async operation
    this.getProducts(this.page);
    setTimeout(() => {
      // Async operation has ended
      event.target.complete();
    }, 2000);
  }


  products: IProduct[] = [];
  getProducts(chunk: number, hint = null){
    this.subscription.add(
      this.productService.getAllProducts(chunk, hint).subscribe((products: IProduct[]) => {
        this.products = products;
        // console.log(products);
        this.isLoading = false;

      })
    )
  }

  //check first if the product is already on the frontend before making another API request
  hint: string = '';
  searchProducts(event): boolean{
    this.hint = (event)? event.target.value.toString().toLowerCase(): '';
    // let regex = new RegExp(this.hint);
    // let searchedProducts = this.products.filter(product => regex.test(product.ItemName.toLowerCase()));

    // if(searchedProducts.length < 1){
    //   this.getProducts(this.initialChunk, this.hint);
    //   return false;
    // }
    // this.products = searchedProducts;
    this.getProducts(this.page, this.hint);
    return true;

  }

  loadData(event) {
    this.page = this.page + 1;
    setTimeout(() => {
      event.target.complete();

      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      this.getProducts(this.page, this.hint); // Fetching new orders
    }, 500);
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
