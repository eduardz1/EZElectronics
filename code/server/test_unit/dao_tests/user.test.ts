import {
    test,
    expect,
    jest,
    beforeEach,
    afterEach,
    describe,
} from "@jest/globals";
import UserDAO from "../../src/dao/userDAO";
import { User, Role } from "../../src/components/user";
import {
    UserAlreadyExistsError,
    UserNotFoundError,
} from "../../src/errors/userError";
import crypto from "crypto";

// Mock the db module
jest.mock("../../src/db/db", () => ({
    get: jest.fn(),
    run: jest.fn(),
    all: jest.fn(),
}));

import db from "../../src/db/db";

describe("UserDAO", () => {
    let userDao: UserDAO;

    beforeEach(() => {
        userDao = new UserDAO();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getIsUserAuthenticated", () => {
        test("should return true for authenticated user", async () => {
            const username = "testUser";
            const plainPassword = "password";
            const salt = crypto.randomBytes(16).toString("hex");
            const hashedPassword = crypto
                .scryptSync(plainPassword, salt, 16)
                .toString("hex");

            (db.get as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                callback(null, {
                    username,
                    password: hashedPassword,
                    salt: salt,
                });
            });

            const result = await userDao.getIsUserAuthenticated(
                username,
                plainPassword,
            );
            expect(result).toBe(true);
        });

        test("should return false for incorrect password", async () => {
            const username = "testUser";
            const plainPassword = "password";
            const salt = crypto.randomBytes(16).toString("hex");
            const hashedPassword = crypto
                .scryptSync("wrongpassword", salt, 16)
                .toString("hex");

            (db.get as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                callback(null, {
                    username,
                    password: hashedPassword,
                    salt: salt,
                });
            });

            const result = await userDao.getIsUserAuthenticated(
                username,
                plainPassword,
            );
            expect(result).toBe(false);
        });

        test("should return false for non-existent user", async () => {
            (db.get as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                callback(null, null);
            });

            const result = await userDao.getIsUserAuthenticated(
                "nonExistentUser",
                "password",
            );
            expect(result).toBe(false);
        });
    });

    describe("createUser", () => {
        test("should create a new user", async () => {
            (db.run as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                callback(null);
            });

            const result = await userDao.createUser(
                "testUser",
                "Test",
                "User",
                "password",
                Role.CUSTOMER,
            );
            expect(result).toBe(true);
            expect(db.run).toHaveBeenCalledTimes(1);
        });

        test("should throw UserAlreadyExistsError for duplicate user", async () => {
            (db.run as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                const error = new Error(
                    "UNIQUE constraint failed: users.username",
                );
                callback(error);
            });

            await expect(
                userDao.createUser(
                    "testUser",
                    "Test",
                    "User",
                    "password",
                    Role.CUSTOMER,
                ),
            ).rejects.toThrow(UserAlreadyExistsError);
            expect(db.run).toHaveBeenCalledTimes(1);
        });
    });

    describe("getUsers", () => {
        test("should return all users", async () => {
            const users = [
                {
                    username: "testUser1",
                    name: "Test1",
                    surname: "User1",
                    role: Role.CUSTOMER,
                    address: "Address1",
                    birthdate: "2000-01-01",
                },
                {
                    username: "testUser2",
                    name: "Test2",
                    surname: "User2",
                    role: Role.MANAGER,
                    address: "Address2",
                    birthdate: "1990-01-01",
                },
            ];

            (db.all as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                callback(null, users);
            });

            const result = await userDao.getUsers();
            expect(result).toHaveLength(2);
            expect(db.all).toHaveBeenCalledTimes(1);
        });

        test("should return empty array for no users", async () => {
            (db.all as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                callback(null, []);
            });

            const result = await userDao.getUsers();
            expect(result).toHaveLength(0);
            expect(db.all).toHaveBeenCalledTimes(1);
        });

        test("should throw error for db error", async () => {
            (db.all as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                const error = new Error("Database error");
                callback(error);
            });

            await expect(userDao.getUsers()).rejects.toThrow(Error);
            expect(db.all).toHaveBeenCalledTimes(1);
        });
    });

    describe("getUsersByRole", () => {
        test("should return users by role", async () => {
            const users = [
                {
                    username: "testUser1",
                    name: "Test1",
                    surname: "User1",
                    role: Role.CUSTOMER,
                    address: "Address1",
                    birthdate: "2000-01-01",
                },
            ];

            (db.all as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                callback(null, users);
            });

            const result = await userDao.getUsersByRole(Role.CUSTOMER);
            expect(result).toHaveLength(1);
            expect(db.all).toHaveBeenCalledTimes(1);
        });

        test("should return empty array for no users", async () => {
            (db.all as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                callback(null, []);
            });

            const result = await userDao.getUsersByRole(Role.CUSTOMER);
            expect(result).toHaveLength(0);
            expect(db.all).toHaveBeenCalledTimes(1);
        });

        test("should throw error for db error", async () => {
            (db.all as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                const error = new Error("Database error");
                callback(error);
            });

            await expect(userDao.getUsersByRole(Role.CUSTOMER)).rejects.toThrow(
                Error,
            );
            expect(db.all).toHaveBeenCalledTimes(1);
        });
    });

    describe("deleteUser", () => {
        test("should delete user", async () => {
            (db.run as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                callback.call({ changes: 1 });
            });

            const result = await userDao.deleteUser("testUser");
            expect(result).toBe(true);
            expect(db.run).toHaveBeenCalledTimes(1);
        });

        test("should throw UserNotFoundError for non-existent user", async () => {
            (db.run as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                callback.call({ changes: 0 });
            });

            await expect(userDao.deleteUser("nonExistentUser")).rejects.toThrow(
                UserNotFoundError,
            );
            expect(db.run).toHaveBeenCalledTimes(1);
        });
    });

    describe("deleteAll", () => {
        test("should delete all non-admin users", async () => {
            (db.run as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                callback(null);
            });

            const result = await userDao.deleteAll();
            expect(result).toBe(true);
            expect(db.run).toHaveBeenCalledTimes(1);
        });

        test("should throw error for db error", async () => {
            (db.run as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                const error = new Error("Database error");
                callback(error);
            });

            await expect(userDao.deleteAll()).rejects.toThrow(Error);
            expect(db.run).toHaveBeenCalledTimes(1);
        });
    });

    describe("getUserByUsername", () => {
        test("should return user by username", async () => {
            const user = {
                username: "testUser",
                name: "Test",
                surname: "User",
                role: Role.CUSTOMER,
                address: "Test Address",
                birthdate: "2000-01-01",
            };

            (db.get as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                callback(null, user);
            });

            const result = await userDao.getUserByUsername("testUser");
            expect(result).toEqual(
                new User(
                    "testUser",
                    "Test",
                    "User",
                    Role.CUSTOMER,
                    "Test Address",
                    "2000-01-01",
                ),
            );
            expect(db.get).toHaveBeenCalledTimes(1);
        });

        test("should throw UserNotFoundError for non-existent user", async () => {
            (db.get as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                callback(null, null);
            });

            await expect(
                userDao.getUserByUsername("nonExistentUser"),
            ).rejects.toThrow(UserNotFoundError);
            expect(db.get).toHaveBeenCalledTimes(1);
        });

        test("should throw error for db error", async () => {
            (db.get as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                const error = new Error("Database error");
                callback(error);
            });

            await expect(userDao.getUserByUsername("testUser")).rejects.toThrow(
                Error,
            );
            expect(db.get).toHaveBeenCalledTimes(1);
        });
    });

    describe("checkIfUserExists", () => {
        test("should return true if user exists", async () => {
            (db.get as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                callback(null, { count: 1 });
            });

            const result = await userDao.checkIfUserExists("testUser");
            expect(result).toBe(true);
            expect(db.get).toHaveBeenCalledTimes(1);
        });

        test("should return false if user does not exist", async () => {
            (db.get as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                callback(null, { count: 0 });
            });

            const result = await userDao.checkIfUserExists("nonExistentUser");
            expect(result).toBe(false);
            expect(db.get).toHaveBeenCalledTimes(1);
        });

        test("should throw error for db error", async () => {
            (db.get as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                const error = new Error("Database error");
                callback(error);
            });

            await expect(userDao.checkIfUserExists("testUser")).rejects.toThrow(
                Error,
            );
            expect(db.get).toHaveBeenCalledTimes(1);
        });
    });

    describe("updateUserInfo", () => {
        test("should update user information", async () => {
            const user = new User(
                "testUser",
                "Updated",
                "User",
                Role.CUSTOMER,
                "New Address",
                "1990-01-01",
            );

            (db.run as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                callback(null);
            });

            jest.spyOn(userDao, "getUserByUsername").mockResolvedValueOnce(
                user,
            );

            const result = await userDao.updateUserInfo(
                user.username,
                user.name,
                user.surname,
                user.address,
                user.birthdate,
            );
            expect(result).toEqual(user);
            expect(db.run).toHaveBeenCalledTimes(1);
            expect(userDao.getUserByUsername).toHaveBeenCalledTimes(1);
        });

        test("should throw UserNotFoundError for non-existent user", async () => {
            (db.run as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                const error = new Error(
                    "UNIQUE constraint failed: users.username",
                );
                callback(error);
            });

            await expect(
                userDao.updateUserInfo(
                    "nonExistentUser",
                    "Updated",
                    "User",
                    "New Address",
                    "1990-01-01",
                ),
            ).rejects.toThrow(UserNotFoundError);
            expect(db.run).toHaveBeenCalledTimes(1);
        });

        test("should throw error for db error", async () => {
            const user = new User(
                "testUser",
                "Updated",
                "User",
                Role.CUSTOMER,
                "New Address",
                "1990-01-01",
            );

            (db.run as jest.Mock).mockImplementation((...args: any[]) => {
                const callback = args[args.length - 1];
                const error = new Error("Database error");
                callback(error);
            });

            await expect(
                userDao.updateUserInfo(
                    user.username,
                    user.name,
                    user.surname,
                    user.address,
                    user.birthdate,
                ),
            ).rejects.toThrow(Error);
            expect(db.run).toHaveBeenCalledTimes(1);
        });
    });
});
