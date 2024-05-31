import { jest } from "@jest/globals";
import db from "../../src/db/db";
import crypto from "crypto";
import UserDAO from "../../src/dao/userDAO";
import { User, Role } from "../../src/components/user";
import { UserAlreadyExistsError, UserNotFoundError } from "../../src/errors/userError";

jest.mock("../../src/db/db");

describe("UserDAO Tests", () => {
    const userDao = new UserDAO();
    const testUser = new User(
        "testUsername",
        "testName",
        "testSurname",
        Role.MANAGER,
        "testAddress",
        "2000-01-01"
    );

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("createUser should resolve to true on successful user creation", async () => {
        const dbRunMock = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null);
            return db; // Ensure the mock returns the db object
        });
        const saltMock = jest.spyOn(crypto, "randomBytes").mockReturnValue(Buffer.from("salt"));
        const scryptSyncMock = jest.spyOn(crypto, "scryptSync").mockReturnValue(Buffer.from("hashedPassword"));

        const result = await userDao.createUser(
            testUser.username,
            testUser.name,
            testUser.surname,
            testUser.password,
            testUser.role
        );

        expect(dbRunMock).toHaveBeenCalledTimes(1);
        expect(result).toBe(true);
    });

    test("createUser should reject with UserAlreadyExistsError on duplicate username", async () => {
        const dbRunMock = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            const error = new Error("UNIQUE constraint failed: users.username");
            callback(error);
            return db; // Ensure the mock returns the db object
        });

        await expect(userDao.createUser(
            testUser.username,
            testUser.name,
            testUser.surname,
            testUser.password,
            testUser.role
        )).rejects.toThrow(UserAlreadyExistsError);

        expect(dbRunMock).toHaveBeenCalledTimes(1);
    });

    test("getIsUserAuthenticated should resolve to true for correct credentials", async () => {
        const dbGetMock = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            return callback(null, { username: testUser.username, password: Buffer.from("hashedPassword").toString("hex"), salt: Buffer.from("salt").toString("hex") });
        });
        const scryptSyncMock = jest.spyOn(crypto, "scryptSync").mockReturnValue(Buffer.from("hashedPassword"));
        const timingSafeEqualMock = jest.spyOn(crypto, "timingSafeEqual").mockReturnValue(true);

        const result = await userDao.getIsUserAuthenticated(testUser.username, testUser.password);

        expect(dbGetMock).toHaveBeenCalledTimes(1);
        expect(result).toBe(true);
    });

    test("getIsUserAuthenticated should resolve to false for incorrect credentials", async () => {
        const dbGetMock = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            return callback(null, { username: testUser.username, password: Buffer.from("hashedPassword").toString("hex"), salt: Buffer.from("salt").toString("hex") });
        });
        const scryptSyncMock = jest.spyOn(crypto, "scryptSync").mockReturnValue(Buffer.from("wrongHashedPassword"));
        const timingSafeEqualMock = jest.spyOn(crypto, "timingSafeEqual").mockReturnValue(false);

        const result = await userDao.getIsUserAuthenticated(testUser.username, "wrongPassword");

        expect(dbGetMock).toHaveBeenCalledTimes(1);
        expect(result).toBe(false);
    });

    test("getUsers should resolve to an array of users", async () => {
        const dbAllMock = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null, [{
                username: testUser.username,
                name: testUser.name,
                surname: testUser.surname,
                role: testUser.role,
                address: testUser.address,
                birthdate: testUser.birthdate,
                password: testUser.password
            }]);
            return db; // Ensure the mock returns the db object
        });

        const result = await userDao.getUsers();

        expect(dbAllMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual([testUser]);
    });

    test("getUsersByRole should resolve to an array of users with specified role", async () => {
        const dbAllMock = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null, [{
                username: testUser.username,
                name: testUser.name,
                surname: testUser.surname,
                role: testUser.role,
                address: testUser.address,
                birthdate: testUser.birthdate,
                password: testUser.password
            }]);
            return db; // Ensure the mock returns the db object
        });

        const result = await userDao.getUsersByRole(testUser.role);

        expect(dbAllMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual([testUser]);
    });

    test("deleteUser should resolve to true on successful deletion", async () => {
        const dbRunMock = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null);
            return db; // Ensure the mock returns the db object
        });

        const result = await userDao.deleteUser(testUser.username);

        expect(dbRunMock).toHaveBeenCalledTimes(1);
        expect(result).toBe(true);
    });

    test("deleteAll should resolve to true on successful deletion", async () => {
        const dbRunMock = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null);
            return db; // Ensure the mock returns the db object
        });

        const result = await userDao.deleteAll();

        expect(dbRunMock).toHaveBeenCalledTimes(1);
        expect(result).toBe(true);
    });

    test("getUserByUsername should resolve to a user", async () => {
        const dbGetMock = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            return callback(null, {
                username: testUser.username,
                name: testUser.name,
                surname: testUser.surname,
                role: testUser.role,
                address: testUser.address,
                birthdate: testUser.birthdate,
                password: testUser.password
            });
        });

        const result = await userDao.getUserByUsername(testUser.username);

        expect(dbGetMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(testUser);
    });

    test("getUserByUsername should reject with UserNotFoundError if user does not exist", async () => {
        const dbGetMock = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            return callback(null, null);
        });

        await expect(userDao.getUserByUsername(testUser.username)).rejects.toThrow(UserNotFoundError);

        expect(dbGetMock).toHaveBeenCalledTimes(1);
    });

    test("checkIfUserExists should resolve to true if user exists", async () => {
        const dbGetMock = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            return callback(null, { count: 1 });
        });

        const result = await userDao.checkIfUserExists(testUser.username);

        expect(dbGetMock).toHaveBeenCalledTimes(1);
        expect(result).toBe(true);
    });

    test("checkIfUserExists should resolve to false if user does not exist", async () => {
        const dbGetMock = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            return callback(null, { count: 0 });
        });

        const result = await userDao.checkIfUserExists(testUser.username);

        expect(dbGetMock).toHaveBeenCalledTimes(1);
        expect(result).toBe(false);
    });

    test("updateUserInfo should resolve to the updated user", async () => {
        const dbRunMock = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null);
            return db; // Ensure the mock returns the db object
        });
        const dbGetMock = jest.spyOn(userDao, "getUserByUsername").mockResolvedValue(testUser);

        const result = await userDao.updateUserInfo(
            testUser.username,
            "newName",
            "newSurname",
            "newAddress",
            "1990-01-01"
        );

        expect(dbRunMock).toHaveBeenCalledTimes(1);
        expect(dbGetMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual(testUser);
    });
});
