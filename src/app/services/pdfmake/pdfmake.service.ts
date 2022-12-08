import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
@Injectable({
  providedIn: 'root'
})
export class PdfmakeService {

  constructor() {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
   }

   async printSalesOrder({orders, visitInfo, companyDetails, customer}){
    const company = await companyDetails;

    // let totalIncl = orders.reduce((n, {STKPriceIncl, STKPriceExcl, Discount, STKQTY}) =>
    //  n + Math.round(((Math.round((STKPriceExcl/STKQTY *(1-(Discount/100)))*100))/100*STKQTY * (1+((STKPriceIncl - STKPriceExcl)/STKPriceExcl)))*100)/100, 0);

    // let totalIncl = orders.reduce((n, {STKPriceIncl, STKPriceExcl, Discount, STKQTY}) =>
    //  n + ((Math.round((STKPriceIncl/STKQTY / (1+((STKPriceIncl - STKPriceExcl)/STKPriceExcl)) *(1-(Discount/100)))*100))/100*STKQTY) * (1+((STKPriceIncl - STKPriceExcl)/STKPriceExcl)), 0);

    let totalExcl = orders.reduce((n, {STKPriceExcl, Discount, STKQTY}) => n + (Math.round((STKPriceExcl/STKQTY *(1-(Discount/100)))*100))/100*STKQTY, 0);
    
    // let totalExcl = orders.reduce((n, {STKPriceIncl,STKPriceExcl, Discount, STKQTY}) => n + (Math.round((STKPriceIncl/STKQTY / (1+((STKPriceIncl - STKPriceExcl)/STKPriceExcl)) *(1-(Discount/100)))*100))/100*STKQTY, 0);
    let totalVAT = orders.reduce((n, {STKPriceExcl, STKPriceIncl, Discount, STKQTY}) => n + ((Math.round((STKPriceExcl/STKQTY * (1-(Discount/100)))*100))/100*STKQTY * ((STKPriceIncl - STKPriceExcl)/STKPriceExcl)), 0)
    
    
    let totalIncl = new Intl.NumberFormat('en-US',
      { style: 'currency', currency: 'KES' }
    ).format(totalExcl + totalVAT);

    totalVAT = new Intl.NumberFormat('en-US',
    { style: 'currency', currency: 'KES' }
  ).format(totalVAT);

    totalExcl = new Intl.NumberFormat('en-US',
      { style: 'currency', currency: 'KES' }
    ).format(totalExcl);

    const body:any = [
        [
          {text: 'ITEM', style: 'tableHeader', alignment:'left'},
          {text: 'QTY', style: 'tableHeader', alignment:'center'},
          {text: 'DIS.', style: 'tableHeader', alignment:'center'},
          {text: 'PRICE', style: 'tableHeader', alignment:'center'},
          {text: 'TAX', style: 'tableHeader', alignment:'center'},
          {text: 'TOTAL', style: 'tableHeader', alignment:'right'},           
        ]
    ];
    
    orders.forEach((item:any)=> {
      const tax = item.STKPriceIncl - item.STKPriceExcl;

      const disUnitPriceExcl = Math.round((item.STKPriceExcl/item.STKQTY * (1-(item.Discount/100))) * 100)/100;
      const disUnitPriceTax = disUnitPriceExcl * (tax/item.STKPriceExcl);
      // const disUnitPriceIncl = disUnitPriceExcl + disUnitPriceTax;
      const disLinePriceExcl = disUnitPriceExcl * item.STKQTY;

     const formatedDisUnitPriceExcl = new Intl.NumberFormat('en-US',
        { style: 'currency', currency: 'KES' }
      ).format(disUnitPriceExcl);

      const formatedDisUnitPriceTax = new Intl.NumberFormat('en-US',
        { style: 'currency', currency: 'KES' }
      ).format(disUnitPriceTax);


      const formatedDisLinePriceExcl = new Intl.NumberFormat('en-US',
        { style: 'currency', currency: 'KES' }
      ).format(disLinePriceExcl);

      const row = [
        {text:`${item.ItemCode} | ${item.ItemName}`, alignment:'left', fontSize:7},
        {text:`${item.STKQTY}`, alignment:'center', fontSize:7},
        {text:`${item.Discount}`, alignment:'center', fontSize:7},
        {text:`${formatedDisUnitPriceExcl}`, alignment:'center', fontSize:7},
        {text:`${formatedDisUnitPriceTax}`, alignment:'center', fontSize:7},
        {text:`${formatedDisLinePriceExcl}`, alignment:'right', fontSize:7},
      ];
       body.push(row)
     });

    const today = new Date().toLocaleString();
    const docDefinition = {
      header: '',
      footer: {
          text: `Solution provided by Computer Pride Ltd \n www.computer-pride.com \n\nPrinted on: ${today}`, style: 'serviceProvider', alignment:'center' 
      },
      pageSize: 'A6',
      pageMargins: [ 15, 10, 15, 30 ],

      info: {
        title: `${company.custname} Invoice No. - ${visitInfo.ERPInvoiceNo}`,
        author: 'Sam Tomashi',
        subject: `${company.custname} Invoice Receipt`,
        keywords: 'Receipt, KRA, QRCode',
      },
      
      content: [
        {
          image: `${company.logo}`,
          width: 80,
          alignment:'right',
          fontsize: 13,
          bold:true,
        },
        {
          columns:[
            {text: `Customer Name: ${customer.CustName}\n PIN: ${customer.taxregnno}`, alignment:'left'},
            {text: `${company.custname}\n
            PIN No.: ${company.pin}\n
            Tel: ${company.tel}\n
            Email: ${company.email}\n
            Website: ${company.website}\n
            `, style: 'subheader'},

          ]

        },

        {text: `Visit No.: ${visitInfo.VSTNo}`, alignment:'right'},
        {text: `\nDate: ${visitInfo.VSTDate}\n\n` , style: 'subheader', alignment:'right'},
  
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
            widths: ['auto', 'auto','auto','auto', 'auto', 'auto'],
            body: body,
            layout: 'lightHorizontalLines'
          },
          layout: 'lightHorizontalLines'
        },
                
        {
          text:`VAT: ${totalVAT}`, bold:true, alignment:'right', fontSize:7, margin: [0, 0, 0, 0],
        },
        {
          text:`TOTAL: ${totalIncl}`, bold:true, alignment:'right', fontSize:7, margin: [0, 0, 0, 0],
        },
        
        {text:'\nVAT SUMMARY', bold:true, fontsize:7, alignment:'left'},
        
        {
          style: 'tableExample',
          table: {
            // headerRows: 1,
            widths: ['auto', '*','*','auto'],
            body: [
              [
                { text: 'RATE', alignment:'left'}, { text: 'EXCL.', alignment:'center'},
                { text: 'VAT', alignment:'center'}, { text: 'TOTAL', alignment:'right'}
              ],
              [
                { text: '16%', alignment:'left'}, { text: `${totalExcl}`, alignment:'center'},
                { text: `${totalVAT}`, alignment:'center'}, { text: `${totalIncl}`, alignment:'right'}
              ]
            ],
            layout: 'lightHorizontalLines'
          },
          layout: 'lightHorizontalLines'
        },

        {
          text:`YOU WERE SERVED BY: ${visitInfo.VSTRep.toUpperCase()}`, bold:true, alignment:'left', fontSize:7
        },

        {
          text:`\n${company.custname} LIPA NA MPESA BUY GOODS 5702585\n\n`, bold:true, alignment:'left', fontSize:7
        },

        {
          columns: [
            { qr: `\n\n\n ${visitInfo.QRCodeURL} \n\n`, alignment:'right', fit: 50},

            {
              text:`KRA CU No.: ${visitInfo.TaxCUNo }\n Trader Invoice No.: ${visitInfo.ERPInvoiceNo }\n KRA Invoice No.: ${visitInfo.TaxInvoiceNo }`,
               alignment:'left',
               fontSize: 8
            },
          ]
        },

      ],
      styles: {
        header: {
          fontSize: 8,
          bold: true,
          // margin: [0, 0, 0, 7],
          alignment: 'center'
        },
        subheader: {
          fontSize: 8,
          bold: true,
          alignment:"right",
          margin:0
        },
        serviceProvider: {
          fontSize: 5,
          bold: true,
          alignment:"left"
        },
        headerContent:{
          fontSize: 7,
          bold: false,
          alignment:"center"
        },
        tableStyle: {
          // margin: [0, 5, 0, 10],
          // fontSize:9
          alignment:'center'
        },
        itemStyle:{
          fontSize: 7,
        },
        tableHeader: {
          fontSize: 7,
          bold: true,
          alignment:"center"
        }
      },
      defaultStyle: {
        columnGap: 3,
        fontSize:9
      }
    }
    pdfMake.createPdf(docDefinition).open();
    
  }
}
