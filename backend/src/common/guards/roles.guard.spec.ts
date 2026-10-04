import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { Role } from '@skillverify/shared';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockContext = (user: any): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as any);

  it('should allow access if no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext({ role: Role.APPLICANT });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow ADMIN superuser access regardless of required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.EMPLOYER]);
    const context = createMockContext({ role: Role.ADMIN });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow user if their role matches the required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.EMPLOYER]);
    const context = createMockContext({ role: Role.EMPLOYER });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user role does not match', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.EMPLOYER]);
    const context = createMockContext({ role: Role.APPLICANT });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if no user session is present', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.APPLICANT]);
    const context = createMockContext(null);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
