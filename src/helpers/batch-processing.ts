import { parentPort } from "node:worker_threads";
import { OrderParams } from "../modules/order/order";

const process = async (orders: OrderParams[]) => {
  const processOrders = orders.map<Promise<OrderParams>>((order) => {
    return new Promise((resolve, reject) => {
      const randomBinary = Math.floor(Math.random() * 2);
      let status = randomBinary === 1 ? true : false;
      if (!status) {
        reject(order);
      }

      resolve(order);
    });
  });

  return processOrders;
};

if (parentPort) {
  parentPort.on("message", async (msg: string) => {
    const data: { orders: OrderParams[]; tag: string } = JSON.parse(msg);
    const processOrders = await process(data.orders);

    const rejectedOrders: {
      order: OrderParams;
      tag: string;
      status: string;
      at: Date;
    }[] = [];

    const resolvedOrders: {
      order: OrderParams;
      tag: string;
      status: string;
      at: Date;
    }[] = [];

    await Promise.allSettled(processOrders).then((settledPromises) => {
      settledPromises.map((settledOrder) => {
        if (settledOrder.status === "rejected") {
          rejectedOrders.push({
            tag: data.tag,
            order: settledOrder.reason,
            status: "rejected",
            at: new Date()
          });
        } else {
          resolvedOrders.push({
            tag: data.tag,
            order: settledOrder.value,
            status: "resolved",
            at: new Date()
          });
        }
      });
    });

    parentPort?.postMessage(JSON.stringify(rejectedOrders ?? ""));
    parentPort?.postMessage(JSON.stringify(resolvedOrders ?? ""));
  });
}
