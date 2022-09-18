export class ProductResponseInfoDto{
    _id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    brand: string;
    rating: number;
    numReviews: number;
    numInStock: number;
    colors: string[];
    sizes: string[];
    createdAt: Date;
    updatedAt: Date;
}