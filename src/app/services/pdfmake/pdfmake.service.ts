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

    let totalIncl = orders.reduce((n, {STKPriceIncl}) => n + STKPriceIncl, 0);
    let totalExcl = orders.reduce((n, {STKPriceExcl}) => n + STKPriceExcl, 0);
    const totalVAT = new Intl.NumberFormat('en-US',
      { style: 'currency', currency: 'KES' }
    ).format(totalIncl - totalExcl);
    
    totalIncl = new Intl.NumberFormat('en-US',
      { style: 'currency', currency: 'KES' }
    ).format(totalIncl);

    totalExcl = new Intl.NumberFormat('en-US',
      { style: 'currency', currency: 'KES' }
    ).format(totalExcl);

    const body:any = [
        [
          {text: 'CODE', style: 'tableHeader', alignment:'left'},
          {text: 'ITEM', style: 'tableHeader', alignment:'left'},
          {text: 'QTY', style: 'tableHeader', alignment:'center'},
          {text: 'PRICE', style: 'tableHeader', alignment:'center'},
          {text: 'TAX', style: 'tableHeader', alignment:'center'},
          {text: 'TOTAL', style: 'tableHeader', alignment:'right'},           
        ]
    ];
    
    orders.forEach((item:any)=> {
      const tax = item.STKPriceIncl - item.STKPriceExcl;
      const UnitPriceIncl = new Intl.NumberFormat('en-US',
        { style: 'currency', currency: 'KES' }
      ).format(item.UnitPriceIncl);

      const vat = new Intl.NumberFormat('en-US',
        { style: 'currency', currency: 'KES' }
      ).format(tax);

      const StkPriceIncl = new Intl.NumberFormat('en-US',
        { style: 'currency', currency: 'KES' }
      ).format(item.STKPriceIncl);

      const row = [
        {text:`${item.ItemCode}`, alignment:'left', fontSize:7},
        {text:`${item.ItemName}`, alignment:'left', fontSize:7},
        {text:`${item.STKQTY}`, alignment:'center', fontSize:7},
        {text:`${UnitPriceIncl}`, alignment:'center', fontSize:7},
        {text:`${vat}`, alignment:'center', fontSize:7},
        {text:`${StkPriceIncl}`, alignment:'right', fontSize:7},
      ];
       body.push(row)
     });

    const today = new Date().toLocaleString();
    const docDefinition = {
      header: '',
      footer: {
          text: `Printed on: ${today}\n\n
          Solution provided by Computer Pride Ltd \n 
          www.computer-pride.com  
         
          `, style: 'serviceProvider', alignment:'center' 
      },
      pageSize: 'A5',
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
            {text: `${customer.CustName}\n ${!customer.addr1 || customer.addr1 === ''? customer.addr2: customer.addr1}`, alignment:'left'},
            {text: `${company.custname}\n
            PIN No.: ${company.pin}\n
            Tel: ${company.tel}\n
            Cell: ${company.cell}\n
            Email: ${company.email}\n
            Website: ${company.website}\n\n
            `, style: 'subheader'},

          ]

        },

        {text: `VISIT NO.: ${visitInfo.VSTNo}`, alignment:'right'},
        {text: `\nDate: ${visitInfo.VSTDate}\n\n` , style: 'subheader', alignment:'right'},
  
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
            widths:'auto',
            body: body,
            layout: 'lightHorizontalLines'
          },
          layout: 'headerLineOnly'
        },
                
        {text:'\n----------------------------------------------------------------------------------------------------------------------------------------'},
        {
          text:`VAT: ${totalVAT}`, bold:true, alignment:'right', fontSize:7, margin: [0, 0, 0, 0],
        },
        {
          text:`TOTAL: ${totalIncl}`, bold:true, alignment:'right', fontSize:7, margin: [0, 0, 0, 0],
        },
        {text:'----------------------------------------------------------------------------------------------------------------------------------------'},
        
        {text:'\nVAT SUMMARY', bold:true, fontsize:7, alignment:'left'},
        {text:'----------------------------------------------------------------------------------------------------------------------------------------'},
        {
          columns:[
            {text:'RATE', alignment:'left', bold:true, style:'tableHeader'},
            {text:'Excl.', alignment:'center', bold:true, style:'tableHeader'},
            {text:'VAT', alignment:'center',bold:true, style:'tableHeader'},
            {text:'TOTAL', alignment:'right',bold:true, style:'tableHeader'},
          ]
        },
        {
          columns:[
            {text:'16%', alignment:'left', style:'tableHeader'},
            {text:`${totalExcl}`, alignment:'center', style:'tableHeader'},
            {text:`${totalVAT}`, alignment:'center', style:'tableHeader'},
            {text:`${totalIncl}`, alignment:'right', style:'tableHeader'},
          ]
        },
        {text:'----------------------------------------------------------------------------------------------------------------------------------------'},

        {
          text:`YOU WERE SERVED BY: ${visitInfo.VSTRep.toUpperCase()}`, bold:true, alignment:'left', fontSize:7
        },

        {
          text:`\n${company.custname} ${company.payments} \n\n`, bold:true, alignment:'left', fontSize:7
        },

        {
          columns: [
            { qr: `\n\n\n ${visitInfo.QRCodeURL} \n\n`, alignment:'right', fit: 90},

            {text:`\n\nKRA CU No.: ${visitInfo.TaxCUNo }\n
             Trader Invoice No.: ${visitInfo.ERPInvoiceNo }\n
             KRA Invoice No.: ${visitInfo.TaxInvoiceNo }`, alignment:'left'},
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
          style: { wordWrap: false },
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

    /** Avoinding automatic file download */
    // pdfMake.createPdf(docDefinition).getBlob((blob) => {
    //   var fileURL = URL.createObjectURL(blob);
    //   window.open(`https://mozilla.github.io/pdf.js/web/viewer.html?file=${fileURL}`, '_blank');
    // });

  }
}
