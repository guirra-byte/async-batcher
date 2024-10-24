import expressFramework from "./app";
import { nanoid } from "nanoid";
import orderEvent from "./helpers/batch";
import { Order, OrderParams } from "./modules/order/order";

expressFramework.listen(5555, () => {
  console.log("Server already is running on port: 5555");
  for (let i = 0; i < 500; i++) {
    const order = new Order({
      owner_name: `Customer ${i + 1}`,
      items: [
        {
          id: nanoid(),
          name: `Item ${i + 1}A`,
          amount: `${Math.floor(Math.random() * 10) + 1}`
        },
        {
          id: nanoid(),
          name: `Item ${i + 1}B`,
          amount: `${Math.floor(Math.random() * 10) + 1}`
        }
      ],
      at: new Date()
    });

    const fakeReqData = order.params;
    orderEvent.receiveOrder(fakeReqData);
  }
});
