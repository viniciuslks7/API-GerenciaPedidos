/**
 * @fileoverview Configuração do Swagger/OpenAPI para documentação interativa da API.
 * Define schemas, endpoints, modelos e autenticação JWT.
 * Acessível em GET /api-docs.
 * @author Vinicius (viniciuslks7)
 */

const swaggerJsdoc = require('swagger-jsdoc');

// Definição da especificação OpenAPI
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Jitterbit Order API',
    version: '1.0.0',
    description: 'API REST para gerenciamento de pedidos — Teste Técnico Jitterbit. Permite criar, listar, atualizar e deletar pedidos com transformação automática de dados (PT-BR → EN).',
    contact: {
      name: 'Vinicius',
      email: 'vinicius.oliveiratwt@gmail.com',
      url: 'https://github.com/viniciuslks7'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de desenvolvimento'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o token JWT obtido no endpoint POST /auth/login'
      }
    },
    schemas: {
      // Schema de entrada do pedido (formato PT-BR)
      OrderInput: {
        type: 'object',
        required: ['numeroPedido', 'valorTotal', 'dataCriacao', 'items'],
        properties: {
          numeroPedido: {
            type: 'string',
            example: 'v10089015vdb-01',
            description: 'Número único do pedido'
          },
          valorTotal: {
            type: 'number',
            example: 10000,
            description: 'Valor total do pedido'
          },
          dataCriacao: {
            type: 'string',
            format: 'date-time',
            example: '2023-07-19T12:24:11.5299601+00:00',
            description: 'Data de criação do pedido'
          },
          items: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/ItemInput'
            },
            description: 'Lista de itens do pedido'
          }
        }
      },
      // Schema de entrada do item (formato PT-BR)
      ItemInput: {
        type: 'object',
        required: ['idItem', 'quantidadeItem', 'valorItem'],
        properties: {
          idItem: {
            type: 'string',
            example: '2434',
            description: 'ID do produto (será convertido para integer)'
          },
          quantidadeItem: {
            type: 'integer',
            example: 1,
            description: 'Quantidade do item'
          },
          valorItem: {
            type: 'number',
            example: 1000,
            description: 'Valor unitário do item'
          }
        }
      },
      // Schema de saída do pedido (formato EN)
      OrderOutput: {
        type: 'object',
        properties: {
          orderId: {
            type: 'string',
            example: 'v10089015vdb-01'
          },
          value: {
            type: 'number',
            example: 10000
          },
          creationDate: {
            type: 'string',
            format: 'date-time',
            example: '2023-07-19T12:24:11.529Z'
          },
          items: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/ItemOutput'
            }
          }
        }
      },
      // Schema de saída do item (formato EN)
      ItemOutput: {
        type: 'object',
        properties: {
          productId: {
            type: 'integer',
            example: 2434
          },
          quantity: {
            type: 'integer',
            example: 1
          },
          price: {
            type: 'number',
            example: 1000
          }
        }
      },
      // Schema de resposta de sucesso
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: {
            type: 'object'
          },
          message: {
            type: 'string',
            example: 'Operação realizada com sucesso'
          }
        }
      },
      // Schema de resposta de erro
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Descrição do erro'
          },
          error: {
            type: 'string',
            example: 'CODIGO_DO_ERRO'
          }
        }
      },
      // Schema de login
      LoginInput: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: {
            type: 'string',
            example: 'admin',
            description: 'Nome de usuário'
          },
          password: {
            type: 'string',
            example: 'admin123',
            description: 'Senha do usuário'
          }
        }
      },
      // Schema de resposta de login
      LoginResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: {
            type: 'object',
            properties: {
              token: {
                type: 'string',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
              },
              expiresIn: {
                type: 'string',
                example: '24h'
              },
              username: {
                type: 'string',
                example: 'admin'
              }
            }
          },
          message: {
            type: 'string',
            example: 'Login realizado com sucesso'
          }
        }
      }
    }
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Realizar login e obter token JWT',
        description: 'Autentica o usuário e retorna um token JWT válido por 24 horas. Usuário padrão: admin / admin123',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginInput'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login bem-sucedido',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginResponse'
                }
              }
            }
          },
          400: {
            description: 'Campos obrigatórios faltando',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          401: {
            description: 'Credenciais inválidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/order': {
      post: {
        tags: ['Pedidos'],
        summary: 'Criar novo pedido',
        description: 'Cria um novo pedido com transformação automática dos campos de PT-BR para EN. O JSON de entrada usa campos em português e é salvo no banco em inglês.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/OrderInput'
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Pedido criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/OrderOutput' }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: {
            description: 'Dados de entrada inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          401: {
            description: 'Token JWT ausente ou inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          409: {
            description: 'Pedido já existe (duplicado)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/order/list': {
      get: {
        tags: ['Pedidos'],
        summary: 'Listar todos os pedidos',
        description: 'Retorna uma lista de todos os pedidos cadastrados com seus respectivos itens.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de pedidos retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/OrderOutput' }
                    },
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          401: {
            description: 'Token JWT ausente ou inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/order/{orderId}': {
      get: {
        tags: ['Pedidos'],
        summary: 'Obter pedido por ID',
        description: 'Retorna os dados de um pedido específico pelo número do pedido (orderId).',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'orderId',
            in: 'path',
            required: true,
            description: 'Número do pedido (ex: v10089015vdb-01)',
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'Pedido encontrado',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/OrderOutput' }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: {
            description: 'Token JWT ausente ou inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          404: {
            description: 'Pedido não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Pedidos'],
        summary: 'Atualizar pedido',
        description: 'Atualiza um pedido existente pelo número do pedido. Os dados de entrada seguem o mesmo formato da criação (PT-BR).',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'orderId',
            in: 'path',
            required: true,
            description: 'Número do pedido a ser atualizado',
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/OrderInput'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Pedido atualizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/OrderOutput' }
                      }
                    }
                  ]
                }
              }
            }
          },
          400: {
            description: 'Dados de entrada inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          401: {
            description: 'Token JWT ausente ou inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          404: {
            description: 'Pedido não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Pedidos'],
        summary: 'Deletar pedido',
        description: 'Remove um pedido e todos os seus itens do banco de dados (cascade).',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'orderId',
            in: 'path',
            required: true,
            description: 'Número do pedido a ser deletado',
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'Pedido deletado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' }
              }
            }
          },
          401: {
            description: 'Token JWT ausente ou inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          404: {
            description: 'Pedido não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Health check',
        description: 'Verifica se o servidor e o banco de dados estão funcionando corretamente.',
        responses: {
          200: {
            description: 'Servidor saudável',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'healthy' },
                        uptime: { type: 'number', example: 12345.67 },
                        database: { type: 'string', example: 'connected' },
                        timestamp: { type: 'string', example: '2026-03-07T12:00:00.000Z' }
                      }
                    },
                    message: { type: 'string', example: 'Servidor operacional' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Autenticação',
      description: 'Endpoints de autenticação e gerenciamento de tokens JWT'
    },
    {
      name: 'Pedidos',
      description: 'Endpoints CRUD para gerenciamento de pedidos'
    },
    {
      name: 'Sistema',
      description: 'Endpoints de monitoramento e saúde do sistema'
    }
  ]
};

// Opções do swagger-jsdoc
const options = {
  swaggerDefinition,
  apis: [] // Definições inline acima, não precisa de anotações nos arquivos
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
