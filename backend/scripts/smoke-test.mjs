const apiBaseUrl = process.env.API_BASE_URL ?? 'http://localhost:3333/api';
const email = process.env.DEMO_EMAIL ?? 'admin@urbanlink.local';
const password = process.env.DEMO_PASSWORD ?? 'UrbanLink@2026';

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : undefined;

  if (!response.ok || body?.success === false) {
    throw new Error(
      `${options.method ?? 'GET'} ${path} falhou (${response.status}): ${
        body?.error?.message ?? text
      }${body?.error?.details ? ` — ${JSON.stringify(body.error.details)}` : ''}`,
    );
  }

  return body?.data ?? body;
}

async function expectFailure(path, expectedStatus, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
  });
  const body = await response.json();
  if (response.status !== expectedStatus || body?.success !== false) {
    throw new Error(
      `${options.method ?? 'GET'} ${path} deveria retornar ${expectedStatus}, mas retornou ${response.status}.`,
    );
  }
  return body.error;
}

async function main() {
  const health = await request('/health');
  console.log(`✓ API: ${health.status ?? 'online'}`);

  await expectFailure('/auth/login', 401, {
    method: 'POST',
    body: JSON.stringify({ email, password: 'senha-incorreta' }),
  });
  console.log('✓ Login inválido rejeitado sem expor detalhes');

  const login = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const token = login.token;
  const authenticated = { Authorization: `Bearer ${token}` };
  console.log(`✓ Login: ${login.user.name} (${login.user.role})`);

  const me = await request('/auth/me', { headers: authenticated });
  console.log(`✓ Sessão: ${me.email}`);

  const [vehicles, deliveries, routes, simulations, dashboard] = await Promise.all([
    request('/vehicles?page=1&pageSize=3', { headers: authenticated }),
    request('/deliveries?page=1&pageSize=3', { headers: authenticated }),
    request('/routes?page=1&pageSize=3', { headers: authenticated }),
    request('/simulations?page=1&pageSize=3', { headers: authenticated }),
    request('/dashboard/summary', { headers: authenticated }),
  ]);

  const listOf = (value) => (Array.isArray(value) ? value : (value?.items ?? value?.results ?? []));

  console.log(`✓ Frota consultada: ${listOf(vehicles).length} amostras`);
  console.log(`✓ Entregas consultadas: ${listOf(deliveries).length} amostras`);
  console.log(`✓ Rotas consultadas: ${listOf(routes).length} amostras`);
  console.log(
    `✓ Dashboard: ${dashboard.metrics.pendingDeliveries} pendentes, ${dashboard.metrics.availableVehicles} veículos disponíveis`,
  );

  const operatorLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'operator@urbanlink.local',
      password,
    }),
  });
  await expectFailure('/vehicles', 403, {
    method: 'POST',
    headers: { Authorization: `Bearer ${operatorLogin.token}` },
    body: JSON.stringify({
      plate: 'TST0A00',
      model: 'Tentativa sem permissão',
      type: 'VAN',
      capacityKg: 500,
      averageSpeedKmh: 35,
      fuelConsumption: 10,
      status: 'AVAILABLE',
    }),
  });
  console.log('✓ RBAC: operador impedido de cadastrar veículo');

  const suffix = Date.now().toString(36).toUpperCase();
  const testPlate = `TST${Date.now() % 10}${suffix.at(-3) ?? 'A'}${String(
    Date.now() % 100,
  ).padStart(2, '0')}`;
  const createdVehicle = await request('/vehicles', {
    method: 'POST',
    headers: authenticated,
    body: JSON.stringify({
      plate: testPlate,
      model: 'Van de validação integrada',
      type: 'VAN',
      capacityKg: 850,
      averageSpeedKmh: 38,
      fuelConsumption: 9.8,
      status: 'AVAILABLE',
      currentLatitude: -23.55052,
      currentLongitude: -46.633308,
    }),
  });
  const updatedVehicle = await request(`/vehicles/${createdVehicle.id}`, {
    method: 'PATCH',
    headers: authenticated,
    body: JSON.stringify({ status: 'MAINTENANCE' }),
  });
  if (updatedVehicle.status !== 'MAINTENANCE') {
    throw new Error('O PATCH do veículo não persistiu o novo status.');
  }
  const deactivatedVehicle = await request(`/vehicles/${createdVehicle.id}`, {
    method: 'DELETE',
    headers: authenticated,
  });
  if (deactivatedVehicle.status !== 'INACTIVE') {
    throw new Error('O DELETE lógico do veículo não o tornou inativo.');
  }
  console.log(`✓ CRUD de veículo: ${testPlate} criado, atualizado e desativado`);

  const simulation = listOf(simulations)[0];
  if (!simulation) {
    throw new Error('O seed não disponibilizou uma simulação para o smoke test.');
  }

  const executed = await request(`/simulations/${simulation.id}/run`, {
    method: 'POST',
    headers: authenticated,
  });
  const result = executed.result ?? executed.results?.[0];

  console.log(
    `✓ Simulação executada: ${simulation.name} (${Number(result.improvementPercentage).toFixed(1)}% de melhoria)`,
  );
  console.log('Smoke test integrado concluído com sucesso.');
}

main().catch((error) => {
  console.error(`✗ ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
