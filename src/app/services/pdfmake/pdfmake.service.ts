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

   printSalesOrder(){

    const body:any = [
        [
          {text: 'ITEM', style: 'tableHeader'}, {text: 'QTY', style: 'tableHeader'},
          {text: 'PRICE', style: 'tableHeader'}, {text: 'TOTAL', style: 'tableHeader', alignment:'right'},            
        ]
    ];
    const today = new Date().toLocaleString();
    const docDefinition = {
      header: '',
      pageSize: 'A6',
      content: [
        {text: 'COMPUTER PRIDE LTD', style: 'header'},
        {text:  'IT Training and buisiness software solution\n\n', style:'headerContent'},

        {text: 'PIN No.: P0567353N', style: 'subheader'},
        {text: `Date: ${today}` , style: 'subheader'},
        {text: 'Receipt No: 78657', style: 'subheader'},
        {text:'---------------------------------------------------------------------------------------'},
  
        {
          columns:[
            {text: 'CODE', style: 'tableHeader', alignment:'left'},
            {text: 'ITEM', style: 'tableHeader', alignment:'left'},
            {text: 'QTY', style: 'tableHeader', alignment:'center'},
            {text: 'PRICE', style: 'tableHeader', alignment:'center'},
            {text: 'VAT', style: 'tableHeader', alignment:'center'},
            {text: 'TOTAL', style: 'tableHeader', alignment:'right'},  
          ]
        },
        {text:'---------------------------------------------------------------------------------------'},

        {
          columns:[
            {text:'CB', alignment:'left', style:'itemStyle'},
            {text:'Chocolate Biscuit', alignment:'left', style:'itemStyle'},
            {text:'2', alignment:'center', style:'itemStyle'},
            {text:'3,780', alignment:'center', style:'itemStyle'},
            {text:'300', alignment:'center', style:'itemStyle'},
            {text:'7,560', alignment:'right', style:'itemStyle'}
          ],
        },
        {text:'\n'},
        {
          columns:[
            {text:'CK', alignment:'left', style:'itemStyle'},
            {text:'Coke', alignment:'left', style:'itemStyle'},
            {text:'1', alignment:'center', style:'itemStyle'},
            {text:'200', alignment:'center', style:'itemStyle'},
            {text:'2', alignment:'center', style:'itemStyle'},
            {text:'200', alignment:'right', style:'itemStyle'}
          ],
        },
        {text:'\n---------------------------------------------------------------------------------------'},
        {
          text:'VAT: 400', bold:true, alignment:'right', fontSize:7, margin: [0, 0, 0, 0],
        },
        {
          text:'TOTAL: 7706', bold:true, alignment:'right', fontSize:7, margin: [0, 0, 0, 0],
        },
        {text:'---------------------------------------------------------------------------------------'},
        
        {text:'\nVAT SUMMARY', bold:true, fontsize:7, alignment:'left'},
        {text:'---------------------------------------------------------------------------------------'},
        {
          columns:[
            {text:'RATE', alignment:'left', bold:true, style:'tableHeader'},
            {text:'VAT', alignment:'center',bold:true, style:'tableHeader'},
            {text:'TOTAL', alignment:'right',bold:true, style:'tableHeader'},
          ]
        },
        {
          columns:[
            {text:'16%', alignment:'left', style:'tableHeader'},
            {text:'1234', alignment:'center', style:'tableHeader'},
            {text:'7706', alignment:'right', style:'tableHeader'},
          ]
        },
        {text:'---------------------------------------------------------------------------------------'},

        {
          text:'You were served by: Yousuf Marvi', bold:true, alignment:'left', fontSize:7
        },
        {text: '\n\nSolution provided by Computer Pride Ltd', style: 'subheader', alignment:'center'},
        {text: 'www.computer-pride.com', style: 'subheader', alignment:'center'},

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
        columnGap: 5,
        fontSize:9
      }
    }
    pdfMake.createPdf(docDefinition).open();

  }
}
