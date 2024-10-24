import { nanoid } from "nanoid";
import orderEvent from "../../helpers/batch";

interface ItemParams {
  id: string;
  name: string;
  amount: string;
}

export interface OrderParams {
  id: string;
  owner_name: string;
  items: ItemParams[];
  at: Date;
}

export class Order {
  private _params: OrderParams;
  constructor(order: { owner_name: string; items: ItemParams[]; at: Date }) {
    this._params = { ...order, id: nanoid() };
  }

  get params() {
    return this._params;
  }
}
