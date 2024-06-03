import {
    test,
    expect,
    jest,
    beforeEach,
    afterEach,
    describe,
} from "@jest/globals";
import request from "supertest";
import express from "express";
import UserRoutes from "../../src/routers/userRoutes";
import AuthRoutes from "../../src/routers/auth"; // Correct import
import Authenticator from "../../src/routers/auth";
import UserController from "../../src/controllers/userController";
import ErrorHandler from "../../src/helper";
import { User, Role } from "../../src/components/user";

// Mock the dependencies
jest.mock("../../src/routers/auth");
jest.mock("../../src/controllers/userController");
jest.mock("../../src/helper");

describe("UserRoutes", () => {
    let app: express.Application;
    let authService: jest.Mocked<Authenticator>;
    let userController: jest.Mocked<UserController>;

    beforeEach(() => {
        app = express(); // Provide the Express app instance
        authService = new Authenticator(app) as jest.Mocked<Authenticator>;
        userController = new UserController() as jest.Mocked<UserController>;

        const userRoutes = new UserRoutes(authService);
        app.use(express.json());
        app.use("/users", userRoutes.getRouter());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /users", () => {
        test("should create a new user", async () => {
            userController.createUser.mockResolvedValue(true);

            const response = await request(app).post("/users").send({
                username: "testUser",
                name: "Test",
                surname: "User",
                password: "password",
                role: Role.CUSTOMER,
            });

            expect(response.status).toBe(200);
            expect(userController.createUser).toHaveBeenCalledWith(
                "testUser",
                "Test",
                "User",
                "password",
                Role.CUSTOMER,
            );
        });
    });

    describe("GET /users", () => {
        test("should retrieve all users", async () => {
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
            userController.getUsers.mockResolvedValue(users);

            const response = await request(app).get("/users");

            expect(response.status).toBe(200);
            expect(response.body).toEqual(users);
            expect(userController.getUsers).toHaveBeenCalled();
        });
    });

    describe("GET /users/roles/:role", () => {
        test("should retrieve users by role", async () => {
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
            userController.getUsersByRole.mockResolvedValue(users);

            const response = await request(app).get(
                `/users/roles/${Role.CUSTOMER}`,
            );

            expect(response.status).toBe(200);
            expect(response.body).toEqual(users);
            expect(userController.getUsersByRole).toHaveBeenCalledWith(
                Role.CUSTOMER,
            );
        });
    });

    describe("GET /users/:username", () => {
        test("should retrieve a user by username", async () => {
            const user = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Address",
                "2000-01-01",
            );
            userController.getUserByUsername.mockResolvedValue(user);

            const response = await request(app)
                .get("/users/testUser")
                .set("user", JSON.stringify(user));

            expect(response.status).toBe(200);
            expect(response.body).toEqual(user);
            expect(userController.getUserByUsername).toHaveBeenCalledWith(
                user,
                "testUser",
            );
        });
    });

    describe("DELETE /users/:username", () => {
        test("should delete a user", async () => {
            userController.deleteUser.mockResolvedValue(true);

            const user = new User(
                "admin",
                "Admin",
                "User",
                Role.ADMIN,
                "Admin Address",
                "1990-01-01",
            );

            const response = await request(app)
                .delete("/users/testUser")
                .set("user", JSON.stringify(user));

            expect(response.status).toBe(200);
            expect(userController.deleteUser).toHaveBeenCalledWith(
                user,
                "testUser",
            );
        });
    });

    describe("DELETE /users", () => {
        test("should delete all users", async () => {
            userController.deleteAll.mockResolvedValue(true);

            const user = new User(
                "admin",
                "Admin",
                "User",
                Role.ADMIN,
                "Admin Address",
                "1990-01-01",
            );

            const response = await request(app)
                .delete("/users")
                .set("user", JSON.stringify(user));

            expect(response.status).toBe(200);
            expect(userController.deleteAll).toHaveBeenCalled();
        });
    });

    describe("PATCH /users/:username", () => {
        test("should update user information", async () => {
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
            userController.updateUserInfo.mockResolvedValue(updatedUser);

            const response = await request(app)
                .patch("/users/testUser")
                .set("user", JSON.stringify(user))
                .send({
                    name: "Updated",
                    surname: "User",
                    address: "New Address",
                    birthdate: "2000-01-01",
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedUser);
            expect(userController.updateUserInfo).toHaveBeenCalledWith(
                user,
                "Updated",
                "User",
                "New Address",
                "2000-01-01",
                "testUser",
            );
        });
    });
});

describe("AuthRoutes", () => {
    let app: express.Application;
    let authService: jest.Mocked<Authenticator>;

    beforeEach(() => {
        app = express(); // Provide the Express app instance
        authService = new Authenticator(app) as jest.Mocked<Authenticator>;

        const authRoutes = new AuthRoutes(authService as any); // Ensure this is the correct name and type assertion
        app.use(express.json());
        app.use("/auth", authRoutes.getRouter());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /auth", () => {
        test("should log in a user", async () => {
            const user = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Address",
                "2000-01-01",
            );
            authService.login.mockResolvedValue(user);

            const response = await request(app).post("/auth").send({
                username: "testUser",
                password: "password",
            });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(user);
            expect(authService.login).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                expect.any(Function),
            );
        });
    });

    describe("DELETE /auth/current", () => {
        test("should log out the current user", async () => {
            authService.logout.mockResolvedValue(true);

            const response = await request(app).delete("/auth/current");

            expect(response.status).toBe(200);
            expect(authService.logout).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                expect.any(Function),
            );
        });
    });

    describe("GET /auth/current", () => {
        test("should return the currently logged-in user", async () => {
            const user = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Address",
                "2000-01-01",
            );

            const response = await request(app)
                .get("/auth/current")
                .set("user", JSON.stringify(user));

            expect(response.status).toBe(200);
            expect(response.body).toEqual(user);
        });
    });
});
