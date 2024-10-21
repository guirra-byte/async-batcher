# `Desafio: Sistema de Processamento de Pedidos em Lote com Execução Paralela`
> [!CAUTION]
> **`Classificação de dificuldade do desafio`**: **Média/Alta**

Você vai desenvolver uma aplicação que simula um sistema de processamento de pedidos para uma loja online. A loja recebe milhares de pedidos por hora, e você precisa processá-los em lotes de forma eficiente utilizando paralelismo, garantindo que os dados sejam processados sob demanda.

## Requisitos do Desafio:

### Simulação de Pedidos:
- A aplicação deve gerar dinamicamente pedidos de clientes. Cada pedido conterá:
  - **ID do pedido**
  - **Nome do cliente**
  - **Itens comprados** (array de produtos)
  - **Valor total do pedido**
  - **Data e hora do pedido**
- Os pedidos são gerados de forma contínua e armazenados em uma fila de processamento.

### Batch Processing:
- Os pedidos devem ser agrupados em lotes para serem processados.
- Você deve definir um limite de tamanho para cada lote (por exemplo, 100 pedidos por lote) ou um intervalo de tempo para processar o lote (por exemplo, a cada 5 minutos).
- A aplicação deve processar os lotes sob demanda, ou seja, sempre que houver um lote disponível para ser processado, ele deve ser enviado para execução.

### Processamento Paralelo:
- Cada lote de pedidos deve ser processado de forma paralela para otimizar o tempo de execução.
- Use **threads** ou **promises** para simular o processamento paralelo de pedidos. O tempo de processamento de cada pedido deve ser simulado com um **delay aleatório** (por exemplo, entre 1 a 5 segundos).
- O processamento de cada lote deve ser feito de forma que todos os pedidos dentro do lote sejam processados simultaneamente, e o sistema deve esperar até que todos os pedidos no lote estejam concluídos.

### Relatório de Processamento:
- Ao final do processamento de cada lote, a aplicação deve gerar um relatório com:
  - O número total de pedidos processados no lote.
  - O tempo total de processamento do lote (o tempo máximo entre os pedidos).
  - Quais pedidos foram processados com sucesso e quais falharam (simule falhas em alguns pedidos com uma probabilidade aleatória).
  - O tempo que cada pedido individual levou para ser processado.

### Tolerância a Falhas:
- Se um pedido falhar, ele deve ser reprocessado automaticamente no próximo lote disponível.
- A aplicação deve registrar os pedidos falhos para garantir que eles não sejam perdidos e sejam reprocessados.

### Processamento Sob Demanda:
- Implemente uma API simples (com Node.js e Express) que permita aos administradores da loja:
  - Iniciar manualmente o processamento de um lote.
  - Visualizar o status dos pedidos, como pedidos processados, em andamento e falhos.
  - Reiniciar manualmente o processamento de um pedido que tenha falhado.
