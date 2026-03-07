/**
 * @fileoverview Testes unitários para o service de pedidos.
 * Testa a lógica de negócio com mocks do model e do mapper.
 * @author Vinicius (viniciuslks7)
 */

const orderService = require('../../src/services/orderService');
const orderModel = require('../../src/models/orderModel');

// Mock do model inteiro para isolar o service
jest.mock('../../src/models/orderModel');

describe('OrderService — Lógica de Negócio', () => {

  // Limpa mocks após cada teste
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Dados de entrada (formato PT-BR)
  const validInput = {
    numeroPedido: 'v10089015vdb-01',
    valorTotal: 10000,
    dataCriacao: '2023-07-19T12:24:11.5299601+00:00',
    items: [
      {
        idItem: '2434',
        quantidadeItem: 1,
        valorItem: 1000
      }
    ]
  };

  // Dados retornados pelo banco (simulados)
  const mockDbResult = {
    order: {
      orderId: 'v10089015vdb-01',
      value: '10000.00',
      creationDate: new Date('2023-07-19T12:24:11.529Z')
    },
    items: [
      {
        productId: 2434,
        quantity: 1,
        price: '1000.00'
      }
    ]
  };

  // ==========================================
  // Testes de createOrder
  // ==========================================
  describe('createOrder', () => {
    it('deve criar um pedido com sucesso e retornar dados transformados', async () => {
      orderModel.orderExists.mockResolvedValue(false);
      orderModel.createOrder.mockResolvedValue(mockDbResult);

      const result = await orderService.createOrder(validInput);

      expect(orderModel.orderExists).toHaveBeenCalledWith('v10089015vdb-01');
      expect(orderModel.createOrder).toHaveBeenCalled();
      expect(result.orderId).toBe('v10089015vdb-01');
      expect(result.value).toBe(10000);
      expect(result.items[0].productId).toBe(2434);
    });

    it('deve lançar erro 409 quando pedido já existe', async () => {
      orderModel.orderExists.mockResolvedValue(true);

      await expect(orderService.createOrder(validInput))
        .rejects
        .toMatchObject({
          statusCode: 409,
          errorCode: 'DUPLICATE_ORDER'
        });

      expect(orderModel.createOrder).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // Testes de getOrderById
  // ==========================================
  describe('getOrderById', () => {
    it('deve retornar o pedido quando encontrado', async () => {
      orderModel.getOrderById.mockResolvedValue(mockDbResult);

      const result = await orderService.getOrderById('v10089015vdb-01');

      expect(result.orderId).toBe('v10089015vdb-01');
      expect(result.value).toBe(10000);
    });

    it('deve lançar erro 404 quando pedido não encontrado', async () => {
      orderModel.getOrderById.mockResolvedValue(null);

      await expect(orderService.getOrderById('nao-existe'))
        .rejects
        .toMatchObject({
          statusCode: 404,
          errorCode: 'ORDER_NOT_FOUND'
        });
    });
  });

  // ==========================================
  // Testes de getAllOrders
  // ==========================================
  describe('getAllOrders', () => {
    it('deve retornar lista de pedidos transformados', async () => {
      orderModel.getAllOrders.mockResolvedValue([mockDbResult, mockDbResult]);

      const result = await orderService.getAllOrders();

      expect(result).toHaveLength(2);
      expect(result[0].orderId).toBe('v10089015vdb-01');
    });

    it('deve retornar array vazio quando não há pedidos', async () => {
      orderModel.getAllOrders.mockResolvedValue([]);

      const result = await orderService.getAllOrders();

      expect(result).toEqual([]);
    });
  });

  // ==========================================
  // Testes de updateOrder
  // ==========================================
  describe('updateOrder', () => {
    it('deve atualizar pedido com sucesso', async () => {
      orderModel.updateOrder.mockResolvedValue(mockDbResult);

      const result = await orderService.updateOrder('v10089015vdb-01', validInput);

      expect(result.orderId).toBe('v10089015vdb-01');
      expect(orderModel.updateOrder).toHaveBeenCalled();
    });

    it('deve lançar erro 404 quando pedido não existe para atualização', async () => {
      orderModel.updateOrder.mockResolvedValue(null);

      await expect(orderService.updateOrder('nao-existe', validInput))
        .rejects
        .toMatchObject({
          statusCode: 404,
          errorCode: 'ORDER_NOT_FOUND'
        });
    });
  });

  // ==========================================
  // Testes de deleteOrder
  // ==========================================
  describe('deleteOrder', () => {
    it('deve deletar pedido com sucesso', async () => {
      orderModel.deleteOrder.mockResolvedValue(true);

      await expect(orderService.deleteOrder('v10089015vdb-01'))
        .resolves
        .not
        .toThrow();

      expect(orderModel.deleteOrder).toHaveBeenCalledWith('v10089015vdb-01');
    });

    it('deve lançar erro 404 quando pedido não existe para exclusão', async () => {
      orderModel.deleteOrder.mockResolvedValue(false);

      await expect(orderService.deleteOrder('nao-existe'))
        .rejects
        .toMatchObject({
          statusCode: 404,
          errorCode: 'ORDER_NOT_FOUND'
        });
    });
  });
});
