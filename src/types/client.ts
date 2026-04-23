export interface ICart {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  priceTotal: number;
}

export interface IClient {
  _id: string;
  name: string;
  lastname: string;
  email: string;
  password: string;
  birthdate: string;
  phone?: number;
  authProvider: string;
  carts: ICart[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}