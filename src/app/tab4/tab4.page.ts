import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { IProduct } from '../interfaces/IProducts';
import { ProductService } from '../services/product/product.service';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {
  subscription: Subscription = new Subscription();

  constructor(private productService: ProductService) { }

  ngOnInit() {
    this.getProducts(this.initialChunk);
  }

  ngOnDestroy() {
    // releasing resources
    this.subscription.unsubscribe();
  }

  // Refreshing page
  doRefresh(event) {
    // Begin async operation
    this.getProducts(this.initialChunk);
    setTimeout(() => {
      // Async operation has ended
      event.target.complete();
    }, 2000);
  }


  products: IProduct[] = [];
  getProducts(chunk: number, hint:string = ''){
    this.subscription.add(
      this.productService.getAllProducts(chunk, hint).subscribe((products) => {
        this.products = products;
      })
    )
  }

  //check first if the product is already on the frontend before making another API request
  hint: string = '';
  searchProducts(event): boolean{
    this.hint = (event)? event.target.value.toString().toLowerCase(): '';
    let regex = new RegExp(this.hint);
    let searchedProducts = this.products.filter(product => regex.test(product.ItemName.toLowerCase()));

    if(this.hint.length < 1 || searchedProducts.length < 1){
      this.getProducts(this.initialChunk);
      return false;
    }
    this.products = searchedProducts;
  }

  initialChunk:number = 100;
  loadData(event) {
    // this.clients = []; 
    // this.page = this.page + 1; // setting new page to load
    this.initialChunk += this.initialChunk;
    setTimeout(() => {
      event.target.complete();

      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      this.getProducts(this.initialChunk, this.hint); // Fetching new orders

    }, 500);
  }
  

}
