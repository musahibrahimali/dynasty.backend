import {Document} from "mongoose";

interface IProduct extends Document {
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
    colours: string[];
    sizes: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export default IProduct;
