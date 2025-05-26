export interface SaleItem {
    idProduct: number;
    codeProduct: string;
    nameProduct: string;
    quantityProduct: number;
    priceProduct: number;
  }
  
  export interface Sale {
    orderId: number;
    commission: number;
    priceSale: number;
    dateSale: string;
    itemsSales: SaleItem[];
  }
  