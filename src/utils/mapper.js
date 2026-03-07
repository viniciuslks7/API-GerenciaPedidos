/**
 * @fileoverview Funções de mapeamento (transformação) de dados de pedidos.
 * Converte o formato de entrada (PT-BR) para o formato do banco (EN)
 * e vice-versa, conforme definido na Seção 7 da Constituição.
 * @author Vinicius (viniciuslks7)
 */

/**
 * Normaliza uma data para o formato ISO 8601 UTC.
 * Exemplo: "2023-07-19T12:24:11.5299601+00:00" → "2023-07-19T12:24:11.529Z"
 * @param {string} dateString - Data em formato string
 * @returns {string} Data normalizada em ISO 8601 UTC
 */
const normalizeDate = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString();
};

/**
 * Transforma o JSON de entrada (campos em PT-BR) para o formato do banco (campos em EN).
 * Realiza as seguintes conversões:
 * - numeroPedido → orderId (string)
 * - valorTotal → value (number)
 * - dataCriacao → creationDate (ISO 8601 UTC)
 * - items[].idItem → items[].productId (string → integer)
 * - items[].quantidadeItem → items[].quantity (integer)
 * - items[].valorItem → items[].price (number)
 * @param {Object} input - JSON de entrada com campos em PT-BR
 * @returns {Object} JSON transformado com campos em EN para o banco
 */
const mapOrderInput = (input) => {
  return {
    orderId: input.numeroPedido,
    value: input.valorTotal,
    creationDate: normalizeDate(input.dataCriacao),
    items: (input.items || []).map((item) => ({
      productId: parseInt(item.idItem, 10),
      quantity: item.quantidadeItem,
      price: item.valorItem
    }))
  };
};

/**
 * Transforma os dados do banco (EN) para o formato de resposta da API.
 * Mantém o formato em inglês conforme especificado no teste.
 * @param {Object} order - Dados do pedido vindos do banco
 * @param {Array} items - Lista de itens do pedido vindos do banco
 * @returns {Object} JSON formatado para resposta da API
 */
const mapOrderOutput = (order, items = []) => {
  return {
    orderId: order.orderId,
    value: parseFloat(order.value),
    creationDate: order.creationDate instanceof Date
      ? order.creationDate.toISOString()
      : order.creationDate,
    items: items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: parseFloat(item.price)
    }))
  };
};

module.exports = {
  mapOrderInput,
  mapOrderOutput,
  normalizeDate
};
