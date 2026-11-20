import { describe, expect, it } from 'vitest';
import { assertAdminSelfUpdateAllowed } from '../src/modules/users/users.service.js';

describe('integridade administrativa', () => {
  it('impede administrador de rebaixar a própria conta', () => {
    expect(() =>
      assertAdminSelfUpdateAllowed('admin-1', 'admin-1', {
        role: 'MANAGER',
      }),
    ).toThrow('própria conta');
  });

  it('impede administrador de suspender a própria conta', () => {
    expect(() =>
      assertAdminSelfUpdateAllowed('admin-1', 'admin-1', {
        status: 'SUSPENDED',
      }),
    ).toThrow('própria conta');
  });

  it('permite atualizar dados não críticos da própria conta', () => {
    expect(() =>
      assertAdminSelfUpdateAllowed('admin-1', 'admin-1', {
        name: 'Nova identificação',
      }),
    ).not.toThrow();
  });

  it('permite gerenciar outra conta', () => {
    expect(() =>
      assertAdminSelfUpdateAllowed('operator-1', 'admin-1', {
        role: 'MANAGER',
        status: 'ACTIVE',
      }),
    ).not.toThrow();
  });
});
