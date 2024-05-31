import request from 'supertest';
import express from 'express';
import { UserRoutes } from '../../src/routers/userRoutes';
import UserController from '../../src/controllers/userController';
import { User, Role } from '../../src/components/user';

jest.mock('../../src/controllers/userController');

const app = express();
app.use(express.json());

describe('UserRoutes Tests', () => {
    const authServiceMock = {
        login: jest.fn(),
        logout: jest.fn()
    };

    const userRoutes = new UserRoutes(authServiceMock as any);
    app.use('/users', userRoutes.getRouter());

    const testUser: User = {
        username: 'testUser',
        name: 'Test',
        surname: 'User',
        password: 'testPassword',
        role: Role.MANAGER,
        address: 'Test Address',
        birthdate: '2000-01-01'
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('POST /users - should create a user and return 200', async () => {
        (UserController.prototype.createUser as jest.Mock).mockResolvedValue(true);

        const response = await request(app)
            .post('/users')
            .send({
                username: testUser.username,
                name: testUser.name,
                surname: testUser.surname,
                password: testUser.password,
                role: testUser.role
            });

        expect(response.status).toBe(200);
        expect(UserController.prototype.createUser).toHaveBeenCalledTimes(1);
        expect(UserController.prototype.createUser).toHaveBeenCalledWith(
            testUser.username,
            testUser.name,
            testUser.surname,
            testUser.password,
            testUser.role
        );
    });

    test('GET /users - should return all users', async () => {
        (UserController.prototype.getUsers as jest.Mock).mockResolvedValue([testUser]);

        const response = await request(app).get('/users');

        expect(response.status).toBe(200);
        expect(UserController.prototype.getUsers).toHaveBeenCalledTimes(1);
        expect(response.body).toEqual([testUser]);
    });

    test('GET /users/roles/:role - should return users by role', async () => {
        (UserController.prototype.getUsersByRole as jest.Mock).mockResolvedValue([testUser]);

        const response = await request(app).get(`/users/roles/${testUser.role}`);

        expect(response.status).toBe(200);
        expect(UserController.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
        expect(UserController.prototype.getUsersByRole).toHaveBeenCalledWith(testUser.role);
        expect(response.body).toEqual([testUser]);
    });

    test('GET /users/:username - should return a user by username', async () => {
        const userMock = { ...testUser, role: Role.ADMIN };
        (UserController.prototype.getUserByUsername as jest.Mock).mockResolvedValue(testUser);

        const response = await request(app)
            .get(`/users/${testUser.username}`)
            .set('Authorization', `Bearer ${userMock}`); // Mock auth header

        expect(response.status).toBe(200);
        expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
        expect(UserController.prototype.getUserByUsername).toHaveBeenCalledWith(userMock, testUser.username);
        expect(response.body).toEqual(testUser);
    });

    test('DELETE /users/:username - should delete a user by username', async () => {
        const userMock = { ...testUser, role: Role.ADMIN };
        (UserController.prototype.deleteUser as jest.Mock).mockResolvedValue(true);

        const response = await request(app)
            .delete(`/users/${testUser.username}`)
            .set('Authorization', `Bearer ${userMock}`); // Mock auth header

        expect(response.status).toBe(200);
        expect(UserController.prototype.deleteUser).toHaveBeenCalledTimes(1);
        expect(UserController.prototype.deleteUser).toHaveBeenCalledWith(userMock, testUser.username);
    });

    test('DELETE /users - should delete all non-admin users', async () => {
        const userMock = { ...testUser, role: Role.ADMIN };
        (UserController.prototype.deleteAll as jest.Mock).mockResolvedValue(true);

        const response = await request(app)
            .delete('/users')
            .set('Authorization', `Bearer ${userMock}`); // Mock auth header

        expect(response.status).toBe(200);
        expect(UserController.prototype.deleteAll).toHaveBeenCalledTimes(1);
    });

    test('PATCH /users/:username - should update user information', async () => {
        const updatedUser = { ...testUser, name: 'UpdatedName' };
        const userMock = { ...testUser, role: Role.ADMIN };
        (UserController.prototype.updateUserInfo as jest.Mock).mockResolvedValue(updatedUser);

        const response = await request(app)
            .patch(`/users/${testUser.username}`)
            .set('Authorization', `Bearer ${userMock}`) // Mock auth header
            .send({
                name: 'UpdatedName',
                surname: testUser.surname,
                address: testUser.address,
                birthdate: testUser.birthdate
            });

        expect(response.status).toBe(200);
        expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
        expect(UserController.prototype.updateUserInfo).toHaveBeenCalledWith(
            userMock,
            'UpdatedName',
            testUser.surname,
            testUser.address,
            testUser.birthdate,
            testUser.username
        );
        expect(response.body).toEqual(updatedUser);
    });
});
