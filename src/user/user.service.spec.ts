import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MESSAGES } from '../common';
import { User } from '../database/models';
import { UserJwtService } from '../user_jwt/user_jwt.service';
import { UserService } from './user.service';

// Create a fake user object for testing
const fakeUser = {
  id: '123',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'hashedPassword',
  status: 'active',
  lastLoggedInAt: null,
  toJSON: function () {
    return { id: this.id, email: this.email, status: this.status };
  },
  validatePassword: jest.fn(),
  update: jest.fn().mockResolvedValue(true),
};

jest.mock('../database/models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

describe('UserService', () => {
  let service: UserService;
  let userJwtService: UserJwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserJwtService,
          useValue: {
            signJWT: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userJwtService = module.get<UserJwtService>(UserJwtService);

    service.client = {
      emit: jest.fn(),
    } as any;
  });

  describe('getProfile', () => {
    it('should return a user profile if user exists', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(fakeUser);

      const result = await service.getProfile('123');

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        data: fakeUser,
        message: [],
      });
      expect(User.findOne).toHaveBeenCalledWith({ where: { id: '123' } });
    });

    it('should return NOT_FOUND if user does not exist', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.getProfile('123');

      expect(result.statusCode).toEqual(HttpStatus.NOT_FOUND);
      expect(result.message).toEqual([MESSAGES.RECORD_NOT_FOUND('profile')]);
    });
  });

  describe('register', () => {
    it('should return BAD_REQUEST if email already exists', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(fakeUser);
      const { email, password, firstName, lastName } = fakeUser;
      const payload = { email, password, firstName, lastName };

      await service.register(payload);

      const result = await service.register(payload);

      expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST);
      expect(result.message).toEqual([MESSAGES.USER_WITH_EMAIL_EXIST]);
    });

    it('should create a new user and emit welcome email', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(fakeUser);
      // Simulate successful email token generation.
      (userJwtService.signJWT as jest.Mock).mockReturnValue({
        statusCode: HttpStatus.OK,
        data: 'access-token',
      });

      const { email, password, firstName, lastName } = fakeUser;
      const payload = { email, password, firstName, lastName };

      const result = await service.register(payload);

      expect(User.create).toHaveBeenCalledWith({ ...payload });
      expect(result.statusCode).toEqual(HttpStatus.CREATED);
      expect(result.message).toEqual([MESSAGES.REGISTRATION_SUCCESS]);
    });
  });

  describe('login', () => {
    it('should return BAD_REQUEST if user not found', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const payload = { email: 'notfound@example.com', password: 'pass' };

      const result = await service.login(payload);

      expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST);
      expect(result.message).toEqual([MESSAGES.LOGIN_CREDENTIALS_INVALID]);
    });

    it('should return BAD_REQUEST if password is invalid', async () => {
      const userWithInvalidPassword = {
        ...fakeUser,
        validatePassword: jest.fn().mockReturnValue(false),
      };
      (User.findOne as jest.Mock).mockResolvedValue(userWithInvalidPassword);

      const { email } = fakeUser;
      const payload = { email, password: 'wrongpass' };

      const result = await service.login(payload);

      expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST);
      expect(result.message).toEqual([MESSAGES.LOGIN_CREDENTIALS_INVALID]);
    });

    it('should return BAD_REQUEST if user status is not active', async () => {
      const inactiveUser = {
        ...fakeUser,
        status: 'inactive',
        validatePassword: jest.fn().mockReturnValue(true),
      };
      (User.findOne as jest.Mock).mockResolvedValue(inactiveUser);

      const payload = { email: 'test@example.com', password: 'pass' };

      const result = await service.login(payload);

      expect(result.statusCode).toEqual(HttpStatus.BAD_REQUEST);
      expect(result.message).toEqual(['account is not active']);
    });

    it('should successfully log in a user and update lastLoggedInAt', async () => {
      // Simulate a valid user and password check.
      const validUser = {
        ...fakeUser,
        validatePassword: jest.fn().mockReturnValue(true),
        lastLoggedInAt: null,
        update: jest.fn().mockResolvedValue(true),
      };
      (User.findOne as jest.Mock).mockResolvedValue(validUser);
      (userJwtService.signJWT as jest.Mock).mockReturnValue({
        statusCode: HttpStatus.OK,
        data: 'access-token',
      });

      const payload = { email: 'test@example.com', password: 'pass' };

      const result = await service.login(payload);

      expect(result.statusCode).toEqual(HttpStatus.OK);
      expect(result.message).toEqual([MESSAGES.LOGIN_SUCCESS]);
      expect(result.data).toHaveProperty('accessToken', 'access-token');
      expect(validUser.update).toHaveBeenCalled();
    });
  });
});
