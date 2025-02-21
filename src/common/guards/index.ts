import { SetMetadata } from '@nestjs/common';

export { AuthGuard } from './auth.guard';

export const Roles = (roles: string[]) => SetMetadata('roles', roles);

export const Authorized = () => SetMetadata('requireJWT', true);

export const UnAuthorized = () => SetMetadata('unauthorized', true);
