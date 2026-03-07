/**
 * @fileoverview Testes unitários para o módulo de mapeamento de dados (mapper).
 * Valida a transformação de campos PT-BR → EN conforme Seção 7 da Constituição.
 * @author Vinicius (viniciuslks7)
 */

const { mapOrderInput, mapOrderOutput, normalizeDate } = require('../../src/utils/mapper');

describe('Mapper — Transformação de Dados', () => {

  // ==========================================
  // Testes da função normalizeDate
  // ==========================================
  describe('normalizeDate', () => {
    it('deve normalizar data com fuso horário para ISO 8601 UTC', () => {
      const input = '2023-07-19T12:24:11.5299601+00:00';
      const result = normalizeDate(input);

      // Deve retornar no formato ISO 8601 com Z (UTC)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(result).toBe('2023-07-19T12:24:11.529Z');
    });

    it('deve normalizar data sem fuso horário', () => {
      const input = '2023-07-19T12:24:11';
      const result = normalizeDate(input);

      expect(result).toMatch(/Z$/);
    });

    it('deve normalizar data com fuso horário diferente de UTC', () => {
      const input = '2023-07-19T15:24:11.000-03:00';
      const result = normalizeDate(input);

      // -03:00 deve ser convertido para UTC (18:24:11)
      expect(result).toBe('2023-07-19T18:24:11.000Z');
    });
  });

  // ==========================================
  // Testes da função mapOrderInput
  // ==========================================
  describe('mapOrderInput', () => {
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

    it('deve transformar numeroPedido para orderId', () => {
      const result = mapOrderInput(validInput);
      expect(result.orderId).toBe('v10089015vdb-01');
    });

    it('deve transformar valorTotal para value', () => {
      const result = mapOrderInput(validInput);
      expect(result.value).toBe(10000);
    });

    it('deve transformar dataCriacao para creationDate normalizada', () => {
      const result = mapOrderInput(validInput);
      expect(result.creationDate).toBe('2023-07-19T12:24:11.529Z');
    });

    it('deve converter idItem de string para integer (productId)', () => {
      const result = mapOrderInput(validInput);
      expect(result.items[0].productId).toBe(2434);
      expect(typeof result.items[0].productId).toBe('number');
    });

    it('deve transformar quantidadeItem para quantity', () => {
      const result = mapOrderInput(validInput);
      expect(result.items[0].quantity).toBe(1);
    });

    it('deve transformar valorItem para price', () => {
      const result = mapOrderInput(validInput);
      expect(result.items[0].price).toBe(1000);
    });

    it('deve mapear múltiplos itens corretamente', () => {
      const inputWithMultipleItems = {
        ...validInput,
        items: [
          { idItem: '2434', quantidadeItem: 1, valorItem: 1000 },
          { idItem: '5678', quantidadeItem: 3, valorItem: 2500 },
          { idItem: '9012', quantidadeItem: 2, valorItem: 500 }
        ]
      };

      const result = mapOrderInput(inputWithMultipleItems);

      expect(result.items).toHaveLength(3);
      expect(result.items[0].productId).toBe(2434);
      expect(result.items[1].productId).toBe(5678);
      expect(result.items[2].productId).toBe(9012);
    });

    it('deve retornar array vazio de items quando items é undefined', () => {
      const inputWithoutItems = {
        numeroPedido: 'v10089015vdb-01',
        valorTotal: 10000,
        dataCriacao: '2023-07-19T12:24:11.5299601+00:00'
      };

      const result = mapOrderInput(inputWithoutItems);
      expect(result.items).toEqual([]);
    });

    it('deve retornar o objeto completo no formato correto', () => {
      const result = mapOrderInput(validInput);

      expect(result).toEqual({
        orderId: 'v10089015vdb-01',
        value: 10000,
        creationDate: '2023-07-19T12:24:11.529Z',
        items: [
          {
            productId: 2434,
            quantity: 1,
            price: 1000
          }
        ]
      });
    });
  });

  // ==========================================
  // Testes da função mapOrderOutput
  // ==========================================
  describe('mapOrderOutput', () => {
    it('deve formatar dados do banco para resposta da API', () => {
      const order = {
        orderId: 'v10089015vdb-01',
        value: '10000.00', // PostgreSQL retorna NUMERIC como string
        creationDate: new Date('2023-07-19T12:24:11.529Z')
      };

      const items = [
        { productId: 2434, quantity: 1, price: '1000.00' }
      ];

      const result = mapOrderOutput(order, items);

      expect(result.orderId).toBe('v10089015vdb-01');
      expect(result.value).toBe(10000);
      expect(typeof result.value).toBe('number');
      expect(result.creationDate).toBe('2023-07-19T12:24:11.529Z');
      expect(result.items[0].price).toBe(1000);
      expect(typeof result.items[0].price).toBe('number');
    });

    it('deve retornar array vazio quando não há itens', () => {
      const order = {
        orderId: 'test-01',
        value: '500.00',
        creationDate: '2023-01-01T00:00:00.000Z'
      };

      const result = mapOrderOutput(order);
      expect(result.items).toEqual([]);
    });

    it('deve converter creationDate do tipo Date para string ISO', () => {
      const order = {
        orderId: 'test-01',
        value: '100.00',
        creationDate: new Date('2023-07-19T12:24:11.529Z')
      };

      const result = mapOrderOutput(order, []);
      expect(typeof result.creationDate).toBe('string');
      expect(result.creationDate).toContain('Z');
    });

    it('deve manter creationDate como string quando já é string', () => {
      const order = {
        orderId: 'test-01',
        value: '100.00',
        creationDate: '2023-07-19T12:24:11.529Z'
      };

      const result = mapOrderOutput(order, []);
      expect(result.creationDate).toBe('2023-07-19T12:24:11.529Z');
    });
  });
});
