export interface IProduct {
    ItemId: number;
    ItemCode: string;
    ItemName: string;
    SaleTaxRate: number;
    SalePriceExcl: number;
    InclPrice: number;
    UOM: string;
    QtyOnHand: number;
    ItemImg:string;
  }
  
  export interface IItemGroup {
    ItemGroup: string;
  }
  
  export interface IPriceList {
    PriceListID: number;
    PriceListName: string;
  }