const successResponse = (description: string) => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessEnvelope' },
    },
  },
});

const errorResponses = {
  '401': {
    description: 'Não autenticado',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorEnvelope' },
      },
    },
  },
  '403': {
    description: 'Sem permissão',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorEnvelope' },
      },
    },
  },
  '404': {
    description: 'Recurso não encontrado',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorEnvelope' },
      },
    },
  },
  '409': {
    description: 'Conflito com o estado atual ou regra de negócio',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorEnvelope' },
      },
    },
  },
  '422': {
    description: 'Dados inválidos',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorEnvelope' },
      },
    },
  },
};

const bearer = [{ bearerAuth: [] }];
const idParameter = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};
const paginationParameters = [
  {
    name: 'page',
    in: 'query',
    schema: { type: 'integer', minimum: 1, default: 1 },
  },
  {
    name: 'pageSize',
    in: 'query',
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
  },
  {
    name: 'search',
    in: 'query',
    schema: { type: 'string' },
  },
  {
    name: 'sortOrder',
    in: 'query',
    schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
  },
] as const;
const jsonBody = (schema: string) => ({
  required: true,
  content: {
    'application/json': {
      schema: { $ref: `#/components/schemas/${schema}` },
    },
  },
});

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'UrbanLink Flow API',
    version: '1.0.0',
    description:
      'API REST para gestão, monitoramento, roteirização e simulação de logística urbana.',
  },
  servers: [{ url: '/api', description: 'Servidor atual' }],
  tags: [
    { name: 'Auth' },
    { name: 'Users' },
    { name: 'Vehicles' },
    { name: 'Distribution Centers' },
    { name: 'Deliveries' },
    { name: 'Routes' },
    { name: 'Simulations' },
    { name: 'Dashboard' },
    { name: 'Reports' },
    { name: 'Health' },
    { name: 'Public Website' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ContactSubmission: {
        type: 'object',
        required: ['name', 'email', 'subject', 'message', 'consent'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 120 },
          email: { type: 'string', format: 'email', maxLength: 255 },
          company: { type: 'string', maxLength: 160 },
          phone: { type: 'string', maxLength: 30 },
          subject: { type: 'string', enum: ['ORCAMENTO', 'DUVIDA_ENTREGA', 'PARCERIA', 'OUTRO'] },
          message: { type: 'string', minLength: 10, maxLength: 1000 },
          consent: { type: 'boolean', const: true },
          website: {
            type: 'string',
            maxLength: 0,
            description: 'Campo antispam; deve permanecer vazio.',
          },
        },
      },
      SuccessEnvelope: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: { type: 'boolean', const: true },
          data: {},
          meta: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              pageSize: { type: 'integer', example: 20 },
              total: { type: 'integer', example: 42 },
              totalPages: { type: 'integer', example: 3 },
            },
          },
        },
      },
      ErrorEnvelope: {
        type: 'object',
        required: ['success', 'error'],
        properties: {
          success: { type: 'boolean', const: false },
          error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Os dados enviados são inválidos.' },
              details: {},
            },
          },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@urbanlink.local' },
          password: { type: 'string', format: 'password', example: 'UrbanLink@2026' },
          remember: {
            type: 'boolean',
            default: false,
            description:
              '"Manter conectado": o cookie da sessão dura até o token vencer. Sem ele, some ao fechar o navegador.',
          },
        },
      },
      PasswordResetRequestInput: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@urbanlink.local' },
        },
      },
      PasswordResetConfirmInput: {
        type: 'object',
        required: ['token', 'password'],
        properties: {
          token: { type: 'string', description: 'O token do link /nova-senha/<token>.' },
          password: { type: 'string', format: 'password', minLength: 8, maxLength: 128 },
        },
      },
      UserCreateInput: {
        type: 'object',
        required: ['name', 'email', 'password', 'role'],
        properties: {
          name: { type: 'string', example: 'Marina Costa' },
          email: { type: 'string', format: 'email', example: 'marina@urbanlink.local' },
          password: {
            type: 'string',
            format: 'password',
            minLength: 8,
            example: 'SenhaLocal@2026',
          },
          role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'OPERATOR'] },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
        },
      },
      UserUpdateInput: {
        type: 'object',
        minProperties: 1,
        properties: {
          name: { type: 'string', example: 'Marina Costa' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password', minLength: 8 },
          role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'OPERATOR'] },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
        },
      },
      VehicleInput: {
        type: 'object',
        required: ['plate', 'model', 'type', 'capacityKg', 'averageSpeedKmh', 'fuelConsumption'],
        properties: {
          plate: { type: 'string', example: 'ULK1A23' },
          model: { type: 'string', example: 'Renault Master' },
          type: {
            type: 'string',
            enum: ['MOTORCYCLE', 'VAN', 'TRUCK', 'BICYCLE'],
          },
          capacityKg: { type: 'number', example: 1500 },
          averageSpeedKmh: { type: 'number', example: 32 },
          fuelConsumption: { type: 'number', example: 9.5 },
          status: {
            type: 'string',
            enum: ['AVAILABLE', 'IN_ROUTE', 'MAINTENANCE', 'INACTIVE'],
            default: 'AVAILABLE',
          },
          currentLatitude: { type: ['number', 'null'], minimum: -90, maximum: 90 },
          currentLongitude: { type: ['number', 'null'], minimum: -180, maximum: 180 },
        },
      },
      VehicleUpdateInput: {
        type: 'object',
        minProperties: 1,
        description: 'Qualquer subconjunto dos campos de VehicleInput.',
        additionalProperties: true,
        example: { status: 'MAINTENANCE' },
      },
      DistributionCenterInput: {
        type: 'object',
        required: ['name', 'address', 'latitude', 'longitude', 'operatingHours'],
        properties: {
          name: { type: 'string', example: 'CD Vila Leopoldina' },
          address: { type: 'string', example: 'Av. Dr. Gastão Vidigal, 1000 - São Paulo' },
          latitude: { type: 'number', minimum: -90, maximum: 90, example: -23.5324 },
          longitude: { type: 'number', minimum: -180, maximum: 180, example: -46.7348 },
          operatingHours: { type: 'string', example: 'Seg-Sáb 06:00-22:00' },
        },
      },
      DistributionCenterUpdateInput: {
        type: 'object',
        minProperties: 1,
        description: 'Qualquer subconjunto dos campos de DistributionCenterInput.',
        additionalProperties: true,
        example: { operatingHours: 'Seg-Dom 06:00-23:00' },
      },
      DeliveryInput: {
        type: 'object',
        required: [
          'trackingCode',
          'originCenterId',
          'destinationAddress',
          'destinationLatitude',
          'destinationLongitude',
          'weightKg',
          'priority',
          'serviceDeadline',
        ],
        properties: {
          trackingCode: { type: 'string', example: 'ULF-2026-0025' },
          originCenterId: { type: 'string', format: 'uuid' },
          destinationAddress: {
            type: 'string',
            example: 'Av. Paulista, 1000 - Bela Vista, São Paulo',
          },
          destinationLatitude: { type: 'number', example: -23.5614 },
          destinationLongitude: { type: 'number', example: -46.6559 },
          weightKg: { type: 'number', example: 18.5 },
          priority: {
            type: 'string',
            enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
          },
          assignedVehicleId: {
            type: 'string',
            format: 'uuid',
            description:
              'Opcional. Quando informado, criação e atribuição são atômicas e validam a capacidade.',
          },
          serviceDeadline: { type: 'string', format: 'date-time' },
        },
      },
      DeliveryUpdateInput: {
        type: 'object',
        minProperties: 1,
        description: 'Subconjunto editável de DeliveryInput; somente entregas pendentes.',
        additionalProperties: true,
        example: { priority: 'URGENT', weightKg: 22.5 },
      },
      AssignDeliveryInput: {
        type: 'object',
        required: ['vehicleId'],
        properties: {
          vehicleId: { type: 'string', format: 'uuid' },
        },
      },
      DeliveryStatusInput: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELED'],
          },
        },
      },
      RouteCalculationInput: {
        type: 'object',
        description:
          'Parâmetros persistidos na rota. Na criação, os valores omitidos recebem os defaults abaixo.',
        properties: {
          trafficLevel: {
            type: 'string',
            enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
            default: 'MODERATE',
          },
          fuelPrice: { type: 'number', exclusiveMinimum: 0, default: 6.19 },
          co2Factor: { type: 'number', exclusiveMinimum: 0, default: 2.31 },
          serviceMinutesPerStop: { type: 'integer', minimum: 1, default: 8 },
        },
      },
      RouteCalculationOverrides: {
        type: 'object',
        description:
          'Sobrescritas opcionais. Campos omitidos preservam os parâmetros já persistidos na rota.',
        properties: {
          trafficLevel: {
            type: 'string',
            enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
          },
          fuelPrice: { type: 'number', exclusiveMinimum: 0 },
          co2Factor: { type: 'number', exclusiveMinimum: 0 },
          serviceMinutesPerStop: { type: 'integer', minimum: 1 },
        },
      },
      RouteInput: {
        allOf: [
          { $ref: '#/components/schemas/RouteCalculationInput' },
          {
            type: 'object',
            required: ['vehicleId', 'name', 'deliveryIds'],
            properties: {
              vehicleId: { type: 'string', format: 'uuid' },
              name: { type: 'string', example: 'Centro → Zona Leste / manhã' },
              deliveryIds: {
                type: 'array',
                minItems: 1,
                uniqueItems: true,
                items: { type: 'string', format: 'uuid' },
              },
              optimize: { type: 'boolean', default: true },
            },
          },
        ],
      },
      RouteNameInput: {
        type: 'object',
        required: ['name'],
        properties: { name: { type: 'string', example: 'Centro → Zona Norte / tarde' } },
      },
      ReorderStopsInput: {
        allOf: [
          { $ref: '#/components/schemas/RouteCalculationOverrides' },
          {
            type: 'object',
            required: ['orderedStopIds'],
            properties: {
              orderedStopIds: {
                type: 'array',
                minItems: 1,
                uniqueItems: true,
                items: { type: 'string', format: 'uuid' },
              },
            },
          },
        ],
      },
      RouteStopStatusInput: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['PENDING', 'ARRIVED', 'COMPLETED', 'SKIPPED', 'FAILED'],
          },
        },
      },
      SimulationInput: {
        type: 'object',
        required: [
          'name',
          'trafficLevel',
          'availableVehicles',
          'averageSpeedKmh',
          'fuelPrice',
          'co2Factor',
        ],
        properties: {
          name: { type: 'string', example: 'Pico da tarde - frota reduzida' },
          trafficLevel: {
            type: 'string',
            enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'],
          },
          availableVehicles: { type: 'integer', example: 4 },
          averageSpeedKmh: { type: 'number', example: 24 },
          fuelPrice: { type: 'number', example: 6.19 },
          co2Factor: { type: 'number', example: 2.31 },
          parameters: { type: 'object', additionalProperties: true },
        },
      },
      SimulationUpdateInput: {
        type: 'object',
        minProperties: 1,
        description: 'Subconjunto editável de SimulationInput.',
        additionalProperties: true,
        example: { trafficLevel: 'HIGH', availableVehicles: 3 },
      },
    },
  },
  paths: {
    '/public/tracking/{code}': {
      get: {
        tags: ['Public Website'],
        summary: 'Consulta pública do andamento de uma entrega',
        description:
          'Retorna trackingCode, status, estimatedArrival, serviceDeadline, deliveredAt, createdAt, updatedAt e events: o histórico de status em ordem, cada um com status, occurredAt e location (só "Cidade, UF"). O histórico é gravado pelo trigger deliveries_record_event a cada troca de status. Não expõe dados pessoais, endereço ou veículo. Limite de 60 consultas por IP a cada 15 minutos; Cache-Control: no-store.',
        parameters: [
          {
            name: 'code',
            in: 'path',
            required: true,
            schema: { type: 'string', minLength: 3, maxLength: 40, pattern: '^[a-zA-Z0-9-]+$' },
          },
        ],
        responses: {
          '200': successResponse('Código, status e datas da entrega'),
          '404': errorResponses['404'],
          '422': errorResponses['422'],
          '429': { description: 'Limite de consultas atingido' },
        },
      },
    },
    '/public/contact': {
      post: {
        tags: ['Public Website'],
        summary: 'Registra uma solicitação de contato',
        description:
          'Persiste a mensagem no banco e retorna id, protocol (ex.: ULS20260001, gerado pelo banco) e createdAt. Não envia e-mail automaticamente. Limite de 8 solicitações por IP por hora.',
        requestBody: jsonBody('ContactSubmission'),
        responses: {
          '201': successResponse('Protocolo de contato registrado'),
          '422': errorResponses['422'],
          '429': { description: 'Limite de solicitações atingido' },
        },
      },
    },
    '/public/inquiries': {
      get: {
        tags: ['Public Website'],
        security: bearer,
        summary: 'Lista as 100 solicitações mais recentes para ADMIN ou MANAGER',
        responses: {
          '200': successResponse('Solicitações recebidas'),
          '401': errorResponses['401'],
          '403': errorResponses['403'],
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Autentica o usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginInput' },
            },
          },
        },
        description:
          'Devolve o JWT no corpo, pra usar no cabeçalho Authorization, e grava o mesmo token no cookie httpOnly urbanlink_session (SameSite=Lax), que é como o site guarda a sessão.',
        responses: {
          '200': successResponse('JWT e usuário autenticado; cookie da sessão gravado'),
          '401': errorResponses['401'],
          '422': errorResponses['422'],
          '429': { description: 'Limite de tentativas excedido' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Retorna o usuário autenticado',
        description: 'Aceita o token pelo cabeçalho Authorization ou pelo cookie urbanlink_session.',
        security: bearer,
        responses: { '200': successResponse('Usuário'), ...errorResponses },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Encerra a sessão do site apagando o cookie urbanlink_session',
        description:
          'Não exige estar logado. O JWT em si continua válido até vencer: quem usa o cabeçalho Authorization só precisa descartá-lo.',
        responses: { '204': { description: 'Cookie da sessão apagado' } },
      },
    },
    '/auth/password-reset/request': {
      post: {
        tags: ['Auth'],
        summary: 'Pede o link de senha nova',
        description:
          'Responde 202 exista ou não a conta, pra não revelar quais e-mails estão cadastrados. O link vale PASSWORD_RESET_TTL_MINUTES (30 por padrão) e uma vez só; um pedido novo cancela os anteriores. Ainda não há envio de e-mail: fora de produção, o link aparece no terminal da API. Todo pedido conta pro limite de tentativas.',
        requestBody: jsonBody('PasswordResetRequestInput'),
        responses: {
          '202': successResponse('Pedido aceito (data: null)'),
          '422': errorResponses['422'],
          '429': { description: 'Limite de pedidos atingido' },
        },
      },
    },
    '/auth/password-reset/confirm': {
      post: {
        tags: ['Auth'],
        summary: 'Cria a senha nova com o token do link',
        responses: {
          '204': { description: 'Senha trocada; o link deixa de valer' },
          '400': {
            description: 'INVALID_RESET_TOKEN: link inexistente, já usado ou vencido',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } },
            },
          },
          '422': errorResponses['422'],
          '429': { description: 'Limite de tentativas excedido' },
        },
        requestBody: jsonBody('PasswordResetConfirmInput'),
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Lista usuários (ADMIN)',
        security: bearer,
        parameters: paginationParameters,
        responses: { '200': successResponse('Lista paginada'), ...errorResponses },
      },
      post: {
        tags: ['Users'],
        summary: 'Cria usuário (ADMIN)',
        security: bearer,
        requestBody: jsonBody('UserCreateInput'),
        responses: { '201': successResponse('Usuário criado'), ...errorResponses },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        security: bearer,
        parameters: [idParameter],
        responses: { '200': successResponse('Usuário'), ...errorResponses },
      },
      patch: {
        tags: ['Users'],
        security: bearer,
        parameters: [idParameter],
        requestBody: jsonBody('UserUpdateInput'),
        responses: { '200': successResponse('Usuário atualizado'), ...errorResponses },
      },
      delete: {
        tags: ['Users'],
        security: bearer,
        parameters: [idParameter],
        responses: { '200': successResponse('Usuário desativado'), ...errorResponses },
      },
    },
    '/vehicles': {
      get: {
        tags: ['Vehicles'],
        security: bearer,
        parameters: [
          ...paginationParameters,
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['AVAILABLE', 'IN_ROUTE', 'MAINTENANCE', 'INACTIVE'],
            },
          },
          { name: 'type', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': successResponse('Lista paginada'), ...errorResponses },
      },
      post: {
        tags: ['Vehicles'],
        security: bearer,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VehicleInput' },
            },
          },
        },
        responses: { '201': successResponse('Veículo criado'), ...errorResponses },
      },
    },
    '/vehicles/{id}': {
      get: {
        tags: ['Vehicles'],
        security: bearer,
        parameters: [idParameter],
        responses: { '200': successResponse('Veículo'), ...errorResponses },
      },
      patch: {
        tags: ['Vehicles'],
        security: bearer,
        parameters: [idParameter],
        requestBody: jsonBody('VehicleUpdateInput'),
        responses: { '200': successResponse('Veículo atualizado'), ...errorResponses },
      },
      delete: {
        tags: ['Vehicles'],
        security: bearer,
        parameters: [idParameter],
        responses: { '200': successResponse('Veículo desativado'), ...errorResponses },
      },
    },
    '/distribution-centers': {
      get: {
        tags: ['Distribution Centers'],
        security: bearer,
        parameters: paginationParameters,
        responses: { '200': successResponse('Centros'), ...errorResponses },
      },
      post: {
        tags: ['Distribution Centers'],
        security: bearer,
        requestBody: jsonBody('DistributionCenterInput'),
        responses: { '201': successResponse('Centro criado'), ...errorResponses },
      },
    },
    '/distribution-centers/{id}': {
      get: {
        tags: ['Distribution Centers'],
        security: bearer,
        parameters: [idParameter],
        responses: { '200': successResponse('Centro'), ...errorResponses },
      },
      patch: {
        tags: ['Distribution Centers'],
        security: bearer,
        parameters: [idParameter],
        requestBody: jsonBody('DistributionCenterUpdateInput'),
        responses: { '200': successResponse('Centro atualizado'), ...errorResponses },
      },
      delete: {
        tags: ['Distribution Centers'],
        security: bearer,
        parameters: [idParameter],
        responses: { '204': { description: 'Excluído' }, ...errorResponses },
      },
    },
    '/deliveries': {
      get: {
        tags: ['Deliveries'],
        security: bearer,
        parameters: [
          ...paginationParameters,
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELED'],
            },
          },
          {
            name: 'priority',
            in: 'query',
            schema: { type: 'string', enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'] },
          },
          { name: 'vehicleId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          {
            name: 'originCenterId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
          },
          { name: 'overdue', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: { '200': successResponse('Entregas'), ...errorResponses },
      },
      post: {
        tags: ['Deliveries'],
        security: bearer,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DeliveryInput' },
            },
          },
        },
        responses: { '201': successResponse('Entrega criada'), ...errorResponses },
      },
    },
    '/deliveries/{id}': {
      get: {
        tags: ['Deliveries'],
        security: bearer,
        parameters: [idParameter],
        responses: { '200': successResponse('Entrega'), ...errorResponses },
      },
      patch: {
        tags: ['Deliveries'],
        security: bearer,
        parameters: [idParameter],
        requestBody: jsonBody('DeliveryUpdateInput'),
        responses: { '200': successResponse('Entrega atualizada'), ...errorResponses },
      },
      delete: {
        tags: ['Deliveries'],
        security: bearer,
        parameters: [idParameter],
        responses: { '200': successResponse('Entrega cancelada'), ...errorResponses },
      },
    },
    '/deliveries/{id}/assign': {
      post: {
        tags: ['Deliveries'],
        security: bearer,
        parameters: [idParameter],
        summary: 'Atribui veículo validando capacidade',
        requestBody: jsonBody('AssignDeliveryInput'),
        responses: { '200': successResponse('Entrega atribuída'), ...errorResponses },
      },
    },
    '/deliveries/{id}/status': {
      patch: {
        tags: ['Deliveries'],
        security: bearer,
        parameters: [idParameter],
        summary: 'Executa transição válida de status',
        requestBody: jsonBody('DeliveryStatusInput'),
        responses: { '200': successResponse('Entrega atualizada'), ...errorResponses },
      },
    },
    '/routes': {
      get: {
        tags: ['Routes'],
        security: bearer,
        parameters: [
          ...paginationParameters,
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELED'],
            },
          },
          { name: 'vehicleId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: { '200': successResponse('Rotas'), ...errorResponses },
      },
      post: {
        tags: ['Routes'],
        security: bearer,
        summary: 'Cria rota, calcula métricas e ordena paradas',
        requestBody: jsonBody('RouteInput'),
        responses: { '201': successResponse('Rota criada'), ...errorResponses },
      },
    },
    '/routes/{id}': {
      get: {
        tags: ['Routes'],
        security: bearer,
        parameters: [idParameter],
        responses: { '200': successResponse('Rota'), ...errorResponses },
      },
      patch: {
        tags: ['Routes'],
        security: bearer,
        parameters: [idParameter],
        requestBody: jsonBody('RouteNameInput'),
        responses: { '200': successResponse('Rota atualizada'), ...errorResponses },
      },
      delete: {
        tags: ['Routes'],
        security: bearer,
        parameters: [idParameter],
        responses: { '200': successResponse('Rota cancelada'), ...errorResponses },
      },
    },
    '/routes/{id}/optimize': {
      post: {
        tags: ['Routes'],
        security: bearer,
        parameters: [idParameter],
        summary: 'Aplica vizinho mais próximo e 2-opt, preservando parâmetros omitidos',
        requestBody: jsonBody('RouteCalculationOverrides'),
        responses: { '200': successResponse('Rota otimizada'), ...errorResponses },
      },
    },
    '/routes/{id}/start': {
      post: {
        tags: ['Routes'],
        security: bearer,
        parameters: [idParameter],
        responses: { '200': successResponse('Rota iniciada'), ...errorResponses },
      },
    },
    '/routes/{id}/stops/order': {
      put: {
        tags: ['Routes'],
        security: bearer,
        parameters: [idParameter],
        summary: 'Reordena todas as paradas de uma rota planejada',
        requestBody: jsonBody('ReorderStopsInput'),
        responses: { '200': successResponse('Paradas reordenadas'), ...errorResponses },
      },
    },
    '/routes/{id}/stops/{stopId}/status': {
      patch: {
        tags: ['Routes'],
        security: bearer,
        parameters: [
          idParameter,
          {
            name: 'stopId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        summary: 'Atualiza uma parada da rota ativa',
        requestBody: jsonBody('RouteStopStatusInput'),
        responses: { '200': successResponse('Parada atualizada'), ...errorResponses },
      },
    },
    '/routes/{id}/complete': {
      post: {
        tags: ['Routes'],
        security: bearer,
        parameters: [idParameter],
        responses: { '200': successResponse('Rota concluída'), ...errorResponses },
      },
    },
    '/simulations': {
      get: {
        tags: ['Simulations'],
        security: bearer,
        parameters: [
          ...paginationParameters,
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['DRAFT', 'RUNNING', 'COMPLETED', 'FAILED'] },
          },
          { name: 'userId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: { '200': successResponse('Simulações'), ...errorResponses },
      },
      post: {
        tags: ['Simulations'],
        security: bearer,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SimulationInput' },
            },
          },
        },
        responses: { '201': successResponse('Simulação criada'), ...errorResponses },
      },
    },
    '/simulations/{id}/run': {
      post: {
        tags: ['Simulations'],
        security: bearer,
        parameters: [idParameter],
        summary: 'Executa e persiste comparação original/otimizada',
        responses: { '200': successResponse('Resultado persistido'), ...errorResponses },
      },
    },
    '/simulations/{id}/results': {
      get: {
        tags: ['Simulations'],
        security: bearer,
        parameters: [idParameter],
        summary: 'Consulta o resultado persistido da simulação',
        responses: { '200': successResponse('Resultado da simulação'), ...errorResponses },
      },
    },
    '/simulations/{id}': {
      get: {
        tags: ['Simulations'],
        security: bearer,
        parameters: [idParameter],
        responses: { '200': successResponse('Simulação e resultado'), ...errorResponses },
      },
      patch: {
        tags: ['Simulations'],
        security: bearer,
        parameters: [idParameter],
        requestBody: jsonBody('SimulationUpdateInput'),
        responses: { '200': successResponse('Simulação atualizada'), ...errorResponses },
      },
      delete: {
        tags: ['Simulations'],
        security: bearer,
        parameters: [idParameter],
        responses: { '204': { description: 'Excluída' }, ...errorResponses },
      },
    },
    '/dashboard/summary': {
      get: {
        tags: ['Dashboard'],
        security: bearer,
        responses: { '200': successResponse('Indicadores consolidados'), ...errorResponses },
      },
    },
    '/dashboard/timeseries': {
      get: {
        tags: ['Dashboard'],
        security: bearer,
        parameters: [
          {
            name: 'days',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 90, default: 7 },
          },
        ],
        responses: { '200': successResponse('Séries temporais'), ...errorResponses },
      },
    },
    '/dashboard/map': {
      get: {
        tags: ['Dashboard'],
        security: bearer,
        parameters: [
          { name: 'routeId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'vehicleId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'deliveryId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          {
            name: 'deliveryStatus',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELED'],
            },
          },
        ],
        responses: { '200': successResponse('Camadas do mapa'), ...errorResponses },
      },
    },
    '/dashboard/city': {
      get: {
        tags: ['Dashboard'],
        security: bearer,
        parameters: [
          { name: 'routeId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          {
            name: 'simulationId',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: { '200': successResponse('Cena 3D derivada da operação'), ...errorResponses },
      },
    },
    '/dashboard/live': {
      get: {
        tags: ['Dashboard'],
        security: bearer,
        summary: 'Stream SSE determinístico, identificado como DEMO',
        parameters: [{ name: 'routeId', in: 'query', schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': {
            description: 'Eventos snapshot',
            content: { 'text/event-stream': { schema: { type: 'string' } } },
          },
          ...errorResponses,
        },
      },
    },
    '/reports/operations': {
      get: {
        tags: ['Reports'],
        security: bearer,
        parameters: [
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } },
        ],
        responses: { '200': successResponse('Relatório operacional'), ...errorResponses },
      },
    },
    '/reports/performance': {
      get: {
        tags: ['Reports'],
        security: bearer,
        parameters: [
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } },
        ],
        responses: { '200': successResponse('Relatório de desempenho'), ...errorResponses },
      },
    },
    '/health': {
      get: {
        tags: ['Health'],
        responses: {
          '200': successResponse('API e banco disponíveis'),
          '503': { description: 'Banco indisponível' },
        },
      },
    },
    '/health/live': {
      get: {
        tags: ['Health'],
        responses: { '200': successResponse('Processo ativo') },
      },
    },
  },
} as const;
