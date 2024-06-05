import { test, expect, jest, afterEach, describe } from "@jest/globals";
import request from "supertest";
import { app } from "../../index";
import Authenticator from "../../src/routers/auth";
import UserController from "../../src/controllers/userController";
import { User, Role } from "../../src/components/user";
import {
    BirthdateError,
    UserAlreadyExistsError,
    UserIsAdminError,
    UserNotAdminError,
    UserNotFoundError,
} from "../../src/errors/userError";

const baseURL = "/ezelectronics/users";

jest.mock("../../src/routers/auth");
jest.mock("../../src/controllers/userController");

afterEach(() => {
    jest.resetAllMocks();
});

describe("UserRoutes", () => {
    describe(`POST ${baseURL}/`, () => {
        test("Returns 200 if successful", async () => {
            jest.spyOn(
                UserController.prototype,
                "createUser",
            ).mockResolvedValueOnce(true);

            const response = await request(app).post(`${baseURL}/`).send({
                username: "testUser",
                name: "Test",
                surname: "User",
                password: "password",
                role: Role.CUSTOMER,
            });

            expect(response.status).toBe(200);
            expect(UserController.prototype.createUser).toHaveBeenCalledWith(
                "testUser",
                "Test",
                "User",
                "password",
                Role.CUSTOMER,
            );
        });

        test("Returns 409 if user already exists", async () => {
            jest.spyOn(
                UserController.prototype,
                "createUser",
            ).mockRejectedValue(new UserAlreadyExistsError());

            const response = await request(app).post(`${baseURL}/`).send({
                username: "testUser",
                name: "Test",
                surname: "User",
                password: "password",
                role: Role.CUSTOMER,
            });

            expect(response.status).toBe(409);
            expect(UserController.prototype.createUser).toHaveBeenCalledWith(
                "testUser",
                "Test",
                "User",
                "password",
                Role.CUSTOMER,
            );
        });

        test("Returns 422 if username is missing", async () => {
            jest.spyOn(
                UserController.prototype,
                "createUser",
            ).mockResolvedValueOnce(true);

            const response = await request(app).post(`${baseURL}/`).send({
                name: "Test",
                surname: "User",
                password: "password",
                role: Role.CUSTOMER,
            });

            expect(response.status).toBe(422);
            expect(UserController.prototype.createUser).not.toHaveBeenCalled();
        });

        test("Returns 422 if name is missing", async () => {
            jest.spyOn(
                UserController.prototype,
                "createUser",
            ).mockResolvedValueOnce(true);

            const response = await request(app).post(`${baseURL}/`).send({
                username: "testUser",
                surname: "User",
                password: "password",
                role: Role.CUSTOMER,
            });

            expect(response.status).toBe(422);
            expect(UserController.prototype.createUser).not.toHaveBeenCalled();
        });

        test("Returns 422 if surname is missing", async () => {
            jest.spyOn(
                UserController.prototype,
                "createUser",
            ).mockResolvedValueOnce(true);

            const response = await request(app).post(`${baseURL}/`).send({
                username: "testUser",
                name: "Test",
                password: "password",
                role: Role.CUSTOMER,
            });

            expect(response.status).toBe(422);
            expect(UserController.prototype.createUser).not.toHaveBeenCalled();
        });

        test("Returns 422 if password is missing", async () => {
            jest.spyOn(
                UserController.prototype,
                "createUser",
            ).mockResolvedValueOnce(true);

            const response = await request(app).post(`${baseURL}/`).send({
                username: "testUser",
                name: "Test",
                surname: "User",
                role: Role.CUSTOMER,
            });

            expect(response.status).toBe(422);
            expect(UserController.prototype.createUser).not.toHaveBeenCalled();
        });

        test("Returns 422 if role is missing", async () => {
            jest.spyOn(
                UserController.prototype,
                "createUser",
            ).mockResolvedValueOnce(true);

            const response = await request(app).post(`${baseURL}/`).send({
                username: "testUser",
                name: "Test",
                surname: "User",
                password: "password",
            });

            expect(response.status).toBe(422);
            expect(UserController.prototype.createUser).not.toHaveBeenCalled();
        });

        test("Returns 422 if role is invalid", async () => {
            jest.spyOn(
                UserController.prototype,
                "createUser",
            ).mockResolvedValueOnce(true);

            const response = await request(app).post(`${baseURL}/`).send({
                username: "testUser",
                name: "Test",
                surname: "User",
                password: "password",
                role: "Invalid",
            });

            expect(response.status).toBe(422);
            expect(UserController.prototype.createUser).not.toHaveBeenCalled();
        });
    });

    describe(`GET ${baseURL}/`, () => {
        test("Returns 200 if successful", async () => {
            const users: User[] = [
                new User(
                    "testUser1",
                    "Test1",
                    "User1",
                    Role.CUSTOMER,
                    "Address1",
                    "2000-01-01",
                ),
                new User(
                    "testUser2",
                    "Test2",
                    "User2",
                    Role.MANAGER,
                    "Address2",
                    "1990-01-01",
                ),
            ];
            jest.spyOn(
                UserController.prototype,
                "getUsers",
            ).mockResolvedValueOnce(users);
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation(
                (_req: any, _res: any, next: any) => next(),
            );

            const response = await request(app).get(`${baseURL}/`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(users);
            expect(UserController.prototype.getUsers).toHaveBeenCalled();
        });

        test("Returns 401 if user is not an admin", async () => {
            jest.spyOn(
                UserController.prototype,
                "getUsers",
            ).mockResolvedValueOnce([]);
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation(
                (_req: any, res: any, _next: any) =>
                    res
                        .status(401)
                        .json({ error: "Unauthorized", status: 401 }),
            );

            const response = await request(app).get(`${baseURL}/`);

            expect(response.status).toBe(401);
            expect(UserController.prototype.getUsers).not.toHaveBeenCalled();
        });
    });

    describe(`GET ${baseURL}/roles/:role`, () => {
        test("Returns 200 if successful", async () => {
            const users: User[] = [
                new User(
                    "testUser1",
                    "Test1",
                    "User1",
                    Role.CUSTOMER,
                    "Address1",
                    "2000-01-01",
                ),
            ];
            jest.spyOn(
                UserController.prototype,
                "getUsersByRole",
            ).mockResolvedValueOnce(users);
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation(
                (_req: any, _res: any, next: any) => next(),
            );

            const response = await request(app).get(
                `${baseURL}/roles/${Role.CUSTOMER}`,
            );

            expect(response.status).toBe(200);
            expect(response.body).toEqual(users);
            expect(
                UserController.prototype.getUsersByRole,
            ).toHaveBeenCalledWith(Role.CUSTOMER);
        });

        test("Returns 401 if user is not an admin", async () => {
            jest.spyOn(
                UserController.prototype,
                "getUsersByRole",
            ).mockResolvedValueOnce([]);
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation(
                (_req: any, res: any, _next: any) =>
                    res
                        .status(401)
                        .json({ error: "Unauthorized", status: 401 }),
            );

            const response = await request(app).get(
                `${baseURL}/roles/${Role.CUSTOMER}`,
            );

            expect(response.status).toBe(401);
            expect(
                UserController.prototype.getUsersByRole,
            ).not.toHaveBeenCalled();
        });
    });

    describe(`GET ${baseURL}/:username`, () => {
        test("Returns 200 if successful, customer calling on its username", async () => {
            const user = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Address",
                "2000-01-01",
            );
            jest.spyOn(
                UserController.prototype,
                "getUserByUsername",
            ).mockResolvedValueOnce(user);
            jest.spyOn(
                Authenticator.prototype,
                "isLoggedIn",
            ).mockImplementation((_req: any, _res: any, next: any) => next());

            const response = await request(app).get(`${baseURL}/testUser`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(user);
            expect(
                UserController.prototype.getUserByUsername,
            ).toHaveBeenCalled();
        });

        test("Returns 200 if user is an admin and tries to retrieve another user's information", async () => {
            const userToRetrieve = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Address",
                "2000-01-01",
            );
            jest.spyOn(
                UserController.prototype,
                "getUserByUsername",
            ).mockResolvedValueOnce(userToRetrieve);
            jest.spyOn(
                Authenticator.prototype,
                "isLoggedIn",
            ).mockImplementation((_req: any, _res: any, next: any) => next());

            const response = await request(app).get(`${baseURL}/testUser`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(userToRetrieve);
            expect(
                UserController.prototype.getUserByUsername,
            ).toHaveBeenCalled();
        });

        test("Returns 401 if user is not an admin and tries to retrieve another user's information", async () => {
            jest.spyOn(
                UserController.prototype,
                "getUserByUsername",
            ).mockRejectedValueOnce(new UserNotAdminError());
            jest.spyOn(
                Authenticator.prototype,
                "isLoggedIn",
            ).mockImplementation((_req: any, _res: any, next: any) => next());

            const response = await request(app).get(`${baseURL}/testUser2`);

            expect(response.status).toBe(401);
            expect(
                UserController.prototype.getUserByUsername,
            ).toHaveBeenCalled();
        });

        test("Returns 401 if the calling user is an Admin an `username` represents a different Admin user", async () => {
            jest.spyOn(
                UserController.prototype,
                "getUserByUsername",
            ).mockRejectedValueOnce(new UserIsAdminError());
            jest.spyOn(
                Authenticator.prototype,
                "isLoggedIn",
            ).mockImplementation((_req: any, _res: any, next: any) => next());

            const response = await request(app).get(`${baseURL}/admin`);

            expect(response.status).toBe(401);
            expect(
                UserController.prototype.getUserByUsername,
            ).toHaveBeenCalled();
        });

        test("Returns 404 if user does not exist", async () => {
            jest.spyOn(
                UserController.prototype,
                "getUserByUsername",
            ).mockRejectedValueOnce(new UserNotFoundError());
            jest.spyOn(
                Authenticator.prototype,
                "isLoggedIn",
            ).mockImplementation((_req: any, _res: any, next: any) => next());

            const response = await request(app).get(`${baseURL}/testUser`);

            expect(response.status).toBe(404);
            expect(
                UserController.prototype.getUserByUsername,
            ).toHaveBeenCalled();
        });
    });

    describe(`DELETE ${baseURL}/:username`, () => {
        test("Returns 200 if successful", async () => {
            jest.spyOn(
                UserController.prototype,
                "deleteUser",
            ).mockResolvedValueOnce(true);

            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation(
                (_req: any, _res: any, next: any) => next(),
            );

            const response = await request(app).delete(`${baseURL}/testUser`);

            expect(response.status).toBe(200);
            expect(UserController.prototype.deleteUser).toHaveBeenCalled();
        });

        test("Returns 401 if user is not an admin", async () => {
            jest.spyOn(
                UserController.prototype,
                "deleteUser",
            ).mockResolvedValueOnce(true);

            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation(
                (_req: any, res: any, _next: any) =>
                    res
                        .status(401)
                        .json({ error: "Unauthorized", status: 401 }),
            );

            const response = await request(app).delete(`${baseURL}/testUser`);

            expect(response.status).toBe(401);
            expect(UserController.prototype.deleteUser).not.toHaveBeenCalled();
        });
    });

    describe(`DELETE ${baseURL}/`, () => {
        test("Returns 200 if successful", async () => {
            jest.spyOn(UserController.prototype, "deleteAll").mockResolvedValue(
                true,
            );
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation(
                (_req: any, _res: any, next: any) => next(),
            );

            const response = await request(app).delete(`${baseURL}/`);

            expect(response.status).toBe(200);
            expect(UserController.prototype.deleteAll).toHaveBeenCalled();
        });

        test("Returns 401 if user is not an admin", async () => {
            jest.spyOn(UserController.prototype, "deleteAll").mockResolvedValue(
                true,
            );
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation(
                (_req: any, res: any, _next: any) =>
                    res
                        .status(401)
                        .json({ error: "Unauthorized", status: 401 }),
            );

            const response = await request(app).delete(`${baseURL}/`);

            expect(response.status).toBe(401);
            expect(UserController.prototype.deleteAll).not.toHaveBeenCalled();
        });
    });

    describe(`PATCH ${baseURL}/:username`, () => {
        test("Returns 200 if successful", async () => {
            const user = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Address",
                "2000-01-01",
            );
            const updatedUser = new User(
                "testUser",
                "Updated",
                "User",
                Role.CUSTOMER,
                "New Address",
                "2000-01-01",
            );
            jest.spyOn(
                UserController.prototype,
                "updateUserInfo",
            ).mockResolvedValue(updatedUser);

            const response = await request(app)
                .patch(`${baseURL}/testUser`)
                .set("user", JSON.stringify(user))
                .send({
                    name: "Updated",
                    surname: "User",
                    address: "New Address",
                    birthdate: "2000-01-01",
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedUser);
            expect(
                UserController.prototype.updateUserInfo,
            ).toHaveBeenCalledWith(
                undefined,
                "Updated",
                "User",
                "New Address",
                "2000-01-01",
                "testUser",
            );
        });

        test("Returns 200 if successful, admin updating another user's information", async () => {
            const user = new User(
                "admin",
                "Admin",
                "User",
                Role.ADMIN,
                "Admin Address",
                "1990-01-01",
            );
            const updatedUser = new User(
                "testUser",
                "Updated",
                "User",
                Role.CUSTOMER,
                "New Address",
                "2000-01-01",
            );
            jest.spyOn(
                UserController.prototype,
                "updateUserInfo",
            ).mockResolvedValue(updatedUser);

            const response = await request(app)
                .patch(`${baseURL}/testUser`)
                .set("user", JSON.stringify(user))
                .send({
                    name: "Updated",
                    surname: "User",
                    address: "New Address",
                    birthdate: "2000-01-01",
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedUser);
            expect(
                UserController.prototype.updateUserInfo,
            ).toHaveBeenCalledWith(
                undefined,
                "Updated",
                "User",
                "New Address",
                "2000-01-01",
                "testUser",
            );
        });

        test("Returns 404 if user does not exist", async () => {
            const user = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Address",
                "2000-01-01",
            );
            jest.spyOn(
                UserController.prototype,
                "updateUserInfo",
            ).mockRejectedValue(new UserNotFoundError());

            const response = await request(app)
                .patch(`${baseURL}/testUser`)
                .set("user", JSON.stringify(user))
                .send({
                    name: "Updated",
                    surname: "User",
                    address: "New Address",
                    birthdate: "2000-01-01",
                });

            expect(response.status).toBe(404);
            expect(
                UserController.prototype.updateUserInfo,
            ).toHaveBeenCalledWith(
                undefined,
                "Updated",
                "User",
                "New Address",
                "2000-01-01",
                "testUser",
            );
        });

        test("Returns 401 if username does not correspond to the user's username", async () => {
            const user = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Address",
                "2000-01-01",
            );
            jest.spyOn(
                UserController.prototype,
                "updateUserInfo",
            ).mockRejectedValue(new UserNotAdminError());

            const response = await request(app)
                .patch(`${baseURL}/testUser2`)
                .set("user", JSON.stringify(user))
                .send({
                    name: "Updated",
                    surname: "User",
                    address: "New Address",
                    birthdate: "2000-01-01",
                });

            expect(response.status).toBe(401);
            expect(
                UserController.prototype.updateUserInfo,
            ).toHaveBeenCalledWith(
                undefined,
                "Updated",
                "User",
                "New Address",
                "2000-01-01",
                "testUser2",
            );
        });

        test("Returns 400 if birthdate is after the current date", async () => {
            const user = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Address",
                "2000-01-01",
            );
            jest.spyOn(
                UserController.prototype,
                "updateUserInfo",
            ).mockRejectedValue(new BirthdateError());

            const response = await request(app)
                .patch(`${baseURL}/testUser`)
                .set("user", JSON.stringify(user))
                .send({
                    name: "Updated",
                    surname: "User",
                    address: "New Address",
                    birthdate: "2022-01-01",
                });

            expect(response.status).toBe(400);
            expect(
                UserController.prototype.updateUserInfo,
            ).toHaveBeenCalledWith(
                undefined,
                "Updated",
                "User",
                "New Address",
                "2022-01-01",
                "testUser",
            );
        });

        test("Returns 401 if username does not correspond to the user's username and the user is an admin", async () => {
            const user = new User(
                "admin",
                "Admin",
                "User",
                Role.ADMIN,
                "Admin Address",
                "1990-01-01",
            );
            jest.spyOn(
                UserController.prototype,
                "updateUserInfo",
            ).mockRejectedValue(new UserNotAdminError());

            const response = await request(app)
                .patch(`${baseURL}/testUser2`)
                .set("user", JSON.stringify(user))
                .send({
                    name: "Updated",
                    surname: "User",
                    address: "New Address",
                    birthdate: "2000-01-01",
                });

            expect(response.status).toBe(401);
            expect(
                UserController.prototype.updateUserInfo,
            ).toHaveBeenCalledWith(
                undefined,
                "Updated",
                "User",
                "New Address",
                "2000-01-01",
                "testUser2",
            );
        });
    });
});
