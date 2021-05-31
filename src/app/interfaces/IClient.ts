export interface IClient {
    AppCustId?: number;
    CustCode: string;
    CustName: string;
  }
  
  export interface IClientDetails {
    CustCode: string;
    CustName: string;
    contactperson: string;
    phone: string;
    addr1: string;
    taxregnno: string;
    creditlimit: number;
    paymentterms: string;
    OutstandingBalance: number;
    CurrentBal: number;
    CustTaxRate: number;
    email: string;
    PriceListName: string;
  }