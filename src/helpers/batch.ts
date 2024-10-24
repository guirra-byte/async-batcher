import { Order, OrderParams } from "../modules/order/order";
import { Worker } from "node:worker_threads";
import path from "node:path";
import fs from "node:fs";

type Batch = Record<string, OrderParams[]>;
type SwitchCapacity = Record<string, boolean>;
type BatchWorkers = Record<string, Worker>;

export class OrderEvent {
  private MAX_BATCH_SIZE: number = 5000;
  private incomming_orders: Batch = {};
  private reprocess_queue: Batch = {};
  private workers: BatchWorkers = {};
  private allBatchesCapacityReached: SwitchCapacity = {};
  private capacityReachedCount: number = 0;
  private processedCount: number = 0;
  private incommingItemsCount: number = 0;

  async receiveOrder({ owner_name, at, items }: OrderParams) {
    const batchesToProcessing = 5;
    //Preparar Batches e seus respectivos Workers;
    for (let tag = 0; tag < batchesToProcessing; tag++) {
      if (!this.workers[`batch${tag}`]) {
        const workerPath = path.resolve(__dirname, "./batch-processing.ts");
        this.workers[`batch${tag}`] = new Worker(workerPath);
      }

      if (!this.incomming_orders[`batch${tag}`]) {
        this.incomming_orders[`batch${tag}`] = [];
      }
    }

    //Distribuir o pedido entre os batches;
    for (const [tag, batches] of Object.entries(this.incomming_orders)) {
      if (
        this.allBatchesCapacityReached[tag] ||
        this.capacityReachedCount === batchesToProcessing
      )
        continue;

      if (batches.length < this.MAX_BATCH_SIZE / batchesToProcessing) {
        const newOrder = new Order({ owner_name, at, items });
        this.incomming_orders[tag].push(newOrder.params);
        this.incommingItemsCount += 1;

        if (batches.length === this.MAX_BATCH_SIZE / batchesToProcessing) {
          //Marca batch como cheio;
          if (!this.allBatchesCapacityReached[tag]) {
            this.capacityReachedCount += 1;
            this.allBatchesCapacityReached[tag] = true;
          }
        }

        break;
      }
    }

    //Escreve arquivo de log para auditar "requisições";
    if (this.capacityReachedCount === batchesToProcessing) {
      const logFilepath = "./log-batches.json";
      fs.writeFile(
        logFilepath,
        JSON.stringify(this.incomming_orders),
        async (err) => {
          if (err) throw err;
          console.log(`${this.incommingItemsCount} items recebidos!`);
          await this.capacityReached();
        }
      );
    }
  }

  async capacityReached() {
    for (const [batchTag, _] of Object.entries(this.incomming_orders)) {
      const worker = this.workers[batchTag];

      if (worker) {
        const batchToProcess = this.incomming_orders[batchTag];

        let tmp: OrderParams[] = [];
        let smallBatches: OrderParams[][] = [];
        for (
          let smallBatchIndex = 0;
          smallBatchIndex < batchToProcess.length;
          smallBatchIndex++
        ) {
          tmp.push(batchToProcess[smallBatchIndex]);
          if (tmp.length === batchToProcess.length / 5) {
            smallBatches.push(tmp);
            tmp = [];
          }
        }

        let settledSmallBatch = 0;
        const sendToProcessing = (nxtBatch: number) => {
          worker.postMessage(
            JSON.stringify({ orders: smallBatches[nxtBatch], tag: batchTag })
          );
        };

        this.incomming_orders[batchTag] = [];
        sendToProcessing(settledSmallBatch);
        worker.on("message", (back_msg: string) => {
          if (back_msg !== "") {
            const orders: {
              order: OrderParams;
              tag: string;
              status: string;
            }[] = JSON.parse(back_msg);

            for (const {
              order: { id, at, items, owner_name },
              status,
              tag
            } of orders) {
              this.processedCount += 1;
              if (status === "rejected") {
                if (!this.reprocess_queue[tag])
                  this.reprocess_queue[tag] = [{ id, at, items, owner_name }];
                else
                  this.reprocess_queue[tag].push({
                    id,
                    at,
                    items,
                    owner_name
                  });
              }

              if (this.processedCount === this.MAX_BATCH_SIZE) {
                console.log(`${this.processedCount} itens foram processados!`);
                process.exit();
              }
            }
          }

          settledSmallBatch = settledSmallBatch + 1;
          if (smallBatches[settledSmallBatch]) {
            sendToProcessing(settledSmallBatch);
          }
        });
      }
    }
  }
}

const orderEvent = new OrderEvent();
export default orderEvent;
