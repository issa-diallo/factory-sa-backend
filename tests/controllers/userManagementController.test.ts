import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { prisma } from '../../src/database/prismaClient';
import userRoutes from '../../src/routes/api/v1/userManagement';

jest.mock('../../src/middlewares/authenticate', () => ({
  authenticate: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

jest.mock('../../src/middlewares/authorize', () => ({
  authorize: () => (_req: Request, _res: Response, next: NextFunction) =>
    next(),
}));

const app = express();
app.use(express.json());
app.use('/users', userRoutes);

describe('UserManagementController - full integration', () => {
  beforeEach(async () => {
    // Delete in order of dependency to avoid foreign key constraint errors
    await prisma.userRole.deleteMany();
    await prisma.companyDomain.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.company.deleteMany();
    await prisma.domain.deleteMany();
    await prisma.permission.deleteMany();
  });

  afterAll(async () => {
    // Delete in order of dependency to avoid foreign key constraint errors
    await prisma.userRole.deleteMany();
    await prisma.companyDomain.deleteMany();
    await prisma.rolePermission.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.company.deleteMany();
    await prisma.domain.deleteMany();
    await prisma.permission.deleteMany();
    await prisma.$disconnect();
  });

  describe('User Management', () => {
    it('should create a user', async () => {
      const res = await request(app).post('/users').send({
        email: 'Test.User@domain.com',
        password: 'StrongPass123',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe('test.user@domain.com');
      expect(res.body.firstName).toBe('Test');
      expect(res.body.lastName).toBe('User');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should return 400 if email is missing when creating a user', async () => {
      const res = await request(app).post('/users').send({
        password: 'StrongPass123',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Email is required');
    });

    it('should return 400 if password is too short when creating a user', async () => {
      const res = await request(app).post('/users').send({
        email: 'Test.User@domain.com',
        password: 'short',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain(
        'Password must be at least 8 characters long'
      );
    });

    it('should get all users', async () => {
      await request(app).post('/users').send({
        email: 'Test.User2@domain.com',
        password: 'StrongPass123',
        firstName: 'Test2',
        lastName: 'User2',
      });

      const res = await request(app).get('/users');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('email');
    });

    it('should get user by id', async () => {
      const createUserRes = await request(app).post('/users').send({
        email: 'Test.User3@domain.com',
        password: 'StrongPass123',
        firstName: 'Test3',
        lastName: 'User3',
      });
      const userId = createUserRes.body.id;

      const res = await request(app).get(`/users/${userId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', userId);
      expect(res.body.email).toBe('test.user3@domain.com');
    });

    it('should return 404 if user is not found when getting by id', async () => {
      const nonExistentUserId = 'non-existent-id';
      const res = await request(app).get(`/users/${nonExistentUserId}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });

    it('should update user', async () => {
      const createUserRes = await request(app).post('/users').send({
        email: 'Test.User4@domain.com',
        password: 'StrongPass123',
        firstName: 'Test4',
        lastName: 'User4',
      });
      const userId = createUserRes.body.id;

      const res = await request(app).put(`/users/${userId}`).send({
        firstName: 'Updated',
        lastName: 'User4Updated',
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', userId);
      expect(res.body.firstName).toBe('Updated');
      expect(res.body.lastName).toBe('User4Updated');
    });

    it('should return 404 if user is not found when updating user', async () => {
      const nonExistentUserId = 'non-existent-id';
      const res = await request(app).put(`/users/${nonExistentUserId}`).send({
        firstName: 'Updated',
      });
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });

    it('should delete user', async () => {
      const createUserRes = await request(app).post('/users').send({
        email: 'Test.User5@domain.com',
        password: 'StrongPass123',
        firstName: 'Test5',
        lastName: 'User5',
      });
      const userId = createUserRes.body.id;

      const res = await request(app).delete(`/users/${userId}`);
      expect(res.status).toBe(204);

      const getRes = await request(app).get(`/users/${userId}`);
      expect(getRes.status).toBe(404);
    });

    it('should return 404 if user is not found when deleting user', async () => {
      const nonExistentUserId = 'non-existent-id';
      const res = await request(app).delete(`/users/${nonExistentUserId}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });

    it('should return 500 if an unexpected error occurs when getting user by id', async () => {
      const spy = jest
        .spyOn(prisma.user, 'findUnique')
        .mockRejectedValueOnce(new Error('Unexpected DB error'));

      const res = await request(app).get('/users/some-id');
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message', 'Unexpected DB error');

      spy.mockRestore();
    });
  });

  describe('User Role Management', () => {
    let userId: string;
    let roleId: string;
    let companyId: string;

    beforeEach(async () => {
      const company = await prisma.company.create({
        data: { name: 'TestCoForRole' },
      });
      const role = await prisma.role.create({
        data: { name: 'USER_ROLE_TEST' },
      });
      const user = await prisma.user.create({
        data: {
          email: 'user.for.role@domain.com',
          password: 'StrongPass123',
          firstName: 'Role',
          lastName: 'User',
        },
      });

      userId = user.id;
      roleId = role.id;
      companyId = company.id;
    });

    it('should return 400 if userId is missing when creating a user role', async () => {
      const res = await request(app).post('/users/user-role').send({
        roleId,
        companyId,
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('User ID is required');
    });

    it('should return 400 if roleId is missing when creating a user role', async () => {
      const res = await request(app).post('/users/user-role').send({
        userId,
        companyId,
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Role ID is required');
    });

    it('should return 400 if companyId is missing when creating a user role', async () => {
      const res = await request(app).post('/users/user-role').send({
        userId,
        roleId,
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Company ID is required');
    });

    it('should create a user role', async () => {
      const res = await request(app).post('/users/user-role').send({
        userId,
        roleId,
        companyId,
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.userId).toBe(userId);
      expect(res.body.roleId).toBe(roleId);
      expect(res.body.companyId).toBe(companyId);
    });

    it('should delete user role', async () => {
      const createUserRoleRes = await prisma.userRole.create({
        data: {
          userId,
          roleId,
          companyId,
        },
      });
      const userRoleId = createUserRoleRes.id;

      const res = await request(app).delete(`/users/user-role/${userRoleId}`);
      expect(res.status).toBe(204);

      const deletedUserRole = await prisma.userRole.findUnique({
        where: { id: userRoleId },
      });
      expect(deletedUserRole).toBeNull();
    });

    it('should return 404 if user role is not found when deleting user role', async () => {
      const nonExistentUserRoleId = 'non-existent-id';
      const res = await request(app).delete(
        `/users/user-role/${nonExistentUserRoleId}`
      );
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'User role not found');
    });
  });
});
