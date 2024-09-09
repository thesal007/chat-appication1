import { Controller, Route, Get } from 'tsoa';

export interface IItem {
  id: number;  // Added the missing id property
  name: string;
  category: string;
  price: number;
}

@Route("/v1/products")
export class ProductController extends Controller {

  @Get("/")
  public async getAllProducts(): Promise<IItem[]> {
    // Adjusted the mock data to match the IItem interface
    return [
      { id: 1, name: "Cherrie", category: "fruit", price: 10.2 }
    ];
  }
}
