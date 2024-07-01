import {
    test,
    expect,
    jest,
    beforeEach,
    afterEach,
    describe,
} from "@jest/globals";
import UserController from "../../src/controllers/userController";
import UserDAO from "../../src/dao/userDAO";
import {
    UserIsAdminError,
    UserNotAdminError,
    UserNotFoundError,
} from "../../src/errors/userError";
import { User, Role } from "../../src/components/user";
import { DateError } from "../../src/utilities";

beforeEach(() => {
    jest.mock("../../src/dao/userDAO");
});

afterEach(() => {
    jest.resetAllMocks();
});

describe("UserController", () => {
    describe("createUser", () => {
        test("Create a new user", async () => {
            const testUser = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Test Address",
                "2000-01-01",
            );
            jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(
                true,
            );
            const controller = new UserController();
            const response = await controller.createUser(
                testUser.username,
                testUser.name,
                testUser.surname,
                "password",
                testUser.role,
            );

            expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(
                testUser.username,
                testUser.name,
                testUser.surname,
                "password",
                testUser.role,
            );
            expect(response).toBe(true);
        });

        test("Fails to create a new user", async () => {
            jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(
                false,
            );
            const controller = new UserController();
            const response = await controller.createUser(
                "testUser",
                "Test",
                "User",
                "password",
                Role.CUSTOMER,
            );

            expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
            expect(response).toBe(false);
        });
    });

    describe("getUsers", () => {
        test("Get all users", async () => {
            const testUser = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Test Address",
                "2000-01-01",
            );
            const testAdmin = new User(
                "testAdmin",
                "Test",
                "Admin",
                Role.ADMIN,
                "Test Address",
                "2000-01-01",
            );
            jest.spyOn(UserDAO.prototype, "getUsers").mockResolvedValueOnce([
                testUser,
                testAdmin,
            ]);
            const controller = new UserController();
            const response = await controller.getUsers();

            expect(UserDAO.prototype.getUsers).toHaveBeenCalledTimes(1);
            expect(response).toEqual([testUser, testAdmin]);
        });

        test("No users found", async () => {
            jest.spyOn(UserDAO.prototype, "getUsers").mockResolvedValueOnce([]);
            const controller = new UserController();
            const response = await controller.getUsers();

            expect(UserDAO.prototype.getUsers).toHaveBeenCalledTimes(1);
            expect(response).toEqual([]);
        });
    });

    describe("getUsersByRole", () => {
        test("Get users by role", async () => {
            const testUser = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Test Address",
                "2000-01-01",
            );
            jest.spyOn(
                UserDAO.prototype,
                "getUsersByRole",
            ).mockResolvedValueOnce([testUser]);
            const controller = new UserController();
            const response = await controller.getUsersByRole(Role.CUSTOMER);

            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledWith(
                Role.CUSTOMER,
            );
            expect(response).toEqual([testUser]);
        });

        test("No users found for role", async () => {
            jest.spyOn(
                UserDAO.prototype,
                "getUsersByRole",
            ).mockResolvedValueOnce([]);
            const controller = new UserController();
            const response = await controller.getUsersByRole(Role.CUSTOMER);

            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledWith(
                Role.CUSTOMER,
            );
            expect(response).toEqual([]);
        });
    });

    describe("getUserByUsername", () => {
        test("Admin retrieves any non-admin user", async () => {
            const adminUser = new User(
                "admin",
                "Admin",
                "User",
                Role.ADMIN,
                "Admin Address",
                "1990-01-01",
            );
            const targetUser = new User(
                "targetUser",
                "Target",
                "User",
                Role.CUSTOMER,
                "Target Address",
                "2000-01-01",
            );
            jest.spyOn(
                UserDAO.prototype,
                "getUserByUsername",
            ).mockResolvedValueOnce(targetUser);
            const controller = new UserController();
            const response = await controller.getUserByUsername(
                adminUser,
                "targetUser",
            );

            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(
                1,
            );
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith(
                "targetUser",
            );
            expect(response).toEqual(targetUser);
        });

        test("Non-admin retrieves their own information", async () => {
            const testUser = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Test Address",
                "2000-01-01",
            );
            jest.spyOn(
                UserDAO.prototype,
                "getUserByUsername",
            ).mockResolvedValueOnce(testUser);
            const controller = new UserController();
            const response = await controller.getUserByUsername(
                testUser,
                "testUser",
            );

            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(
                1,
            );
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith(
                "testUser",
            );
            expect(response).toEqual(testUser);
        });

        test("Non-admin tries to retrieve another user's information", async () => {
            const testUser = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Test Address",
                "2000-01-01",
            );
            const controller = new UserController();

            // Mock checkIfUserExists to return true
            jest.spyOn(
                UserDAO.prototype,
                "checkIfUserExists",
            ).mockResolvedValueOnce(true);

            await expect(
                controller.getUserByUsername(testUser, "targetUser"),
            ).rejects.toThrow(UserNotAdminError);
        });

        test("Admin tries to retrieve a non-existent user", async () => {
            const adminUser = new User(
                "admin",
                "Admin",
                "User",
                Role.ADMIN,
                "Admin Address",
                "1990-01-01",
            );
            jest.spyOn(
                UserDAO.prototype,
                "getUserByUsername",
            ).mockRejectedValueOnce(new UserNotFoundError());
            const controller = new UserController();

            await expect(
                controller.getUserByUsername(adminUser, "nonExistentUser"),
            ).rejects.toThrow(UserNotFoundError);
        });

        test("Admin tries to retrieve a different admin's information", async () => {
            const adminUser = new User(
                "admin",
                "Admin",
                "User",
                Role.ADMIN,
                "Admin Address",
                "1990-01-01",
            );
            const targetAdmin = new User(
                "targetAdmin",
                "Target",
                "Admin",
                Role.ADMIN,
                "Target Address",
                "2000-01-01",
            );
            jest.spyOn(
                UserDAO.prototype,
                "getUserByUsername",
            ).mockResolvedValueOnce(targetAdmin);
            const controller = new UserController();

            await expect(
                controller.getUserByUsername(adminUser, "targetAdmin"),
            ).rejects.toThrow(UserIsAdminError);
        });
    });

    describe("deleteUser", () => {
        test("Admin deletes a non-admin user", async () => {
            const adminUser = new User(
                "admin",
                "Admin",
                "User",
                Role.ADMIN,
                "Admin Address",
                "1990-01-01",
            );
            jest.spyOn(UserDAO.prototype, "deleteUser").mockResolvedValueOnce(
                true,
            );
            jest.spyOn(
                UserDAO.prototype,
                "getUserByUsername",
            ).mockResolvedValueOnce(
                new User(
                    "testUser",
                    "Test",
                    "User",
                    Role.CUSTOMER,
                    "Test Address",
                    "2000-01-01",
                ),
            );
            const controller = new UserController();
            const response = await controller.deleteUser(adminUser, "testUser");

            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledWith(
                "testUser",
            );
            expect(response).toBe(true);
        });

        test("Non-admin deletes their own account", async () => {
            const testUser = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Test Address",
                "2000-01-01",
            );
            jest.spyOn(UserDAO.prototype, "deleteUser").mockResolvedValueOnce(
                true,
            );
            jest.spyOn(
                UserDAO.prototype,
                "getUserByUsername",
            ).mockResolvedValueOnce(testUser);

            const controller = new UserController();
            const response = await controller.deleteUser(testUser, "testUser");

            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledWith(
                "testUser",
            );
            expect(response).toBe(true);
        });

        test("Non-admin tries to delete another user's account", async () => {
            const testUser = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Test Address",
                "2000-01-01",
            );
            const controller = new UserController();
            await expect(
                controller.deleteUser(testUser, "targetUser"),
            ).rejects.toThrow(UserNotAdminError);
        });

        test("Someone tries to delete an admin account", async () => {
            const testUser = new User(
                "testUser",
                "Test",
                "User",
                Role.ADMIN,
                "Test Address",
                "2000-01-01",
            );
            jest.spyOn(
                UserDAO.prototype,
                "getUserByUsername",
            ).mockResolvedValueOnce(
                new User(
                    "admin",
                    "Admin",
                    "User",
                    Role.ADMIN,
                    "Admin Address",
                    "1990-01-01",
                ),
            );
            const controller = new UserController();

            await expect(
                controller.deleteUser(testUser, "admin"),
            ).rejects.toThrow(UserIsAdminError);
        });
    });

    describe("deleteAll", () => {
        test("Admin deletes all non-admin users", async () => {
            jest.spyOn(UserDAO.prototype, "deleteAll").mockResolvedValueOnce(
                true,
            );
            const controller = new UserController();
            const response = await controller.deleteAll();

            expect(UserDAO.prototype.deleteAll).toHaveBeenCalledTimes(1);
            expect(response).toBe(true);
        });
    });

    describe("updateUserInfo", () => {
        test("User updates their own information", async () => {
            const testUser = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Test Address",
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
                UserDAO.prototype,
                "checkIfUserExists",
            ).mockResolvedValueOnce(true);
            jest.spyOn(
                UserDAO.prototype,
                "updateUserInfo",
            ).mockResolvedValueOnce(updatedUser);
            const controller = new UserController();
            const response = await controller.updateUserInfo(
                testUser,
                updatedUser.name,
                updatedUser.surname,
                updatedUser.address,
                updatedUser.birthdate,
                testUser.username,
            );

            expect(UserDAO.prototype.checkIfUserExists).toHaveBeenCalledTimes(
                1,
            );
            expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledWith(
                testUser.username,
                updatedUser.name,
                updatedUser.surname,
                updatedUser.address,
                updatedUser.birthdate,
            );
            expect(response).toEqual(updatedUser);
        });

        test("User tries to update another user's information", async () => {
            const testUser = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Test Address",
                "2000-01-01",
            );
            const controller = new UserController();

            jest.spyOn(
                UserDAO.prototype,
                "checkIfUserExists",
            ).mockResolvedValueOnce(true);

            await expect(
                controller.updateUserInfo(
                    testUser,
                    "Updated",
                    "User",
                    "New Address",
                    "2000-01-01",
                    "targetUser",
                ),
            ).rejects.toThrow(UserNotAdminError);
        });

        test("User updates their information with a birthdate in the future", async () => {
            const testUser = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Test Address",
                "2000-01-01",
            );
            const controller = new UserController();

            // Mock checkIfUserExists to return true
            jest.spyOn(
                UserDAO.prototype,
                "checkIfUserExists",
            ).mockResolvedValueOnce(true);

            await expect(
                controller.updateUserInfo(
                    testUser,
                    "Updated",
                    "User",
                    "New Address",
                    "3000-01-01",
                    testUser.username,
                ),
            ).rejects.toThrow(DateError);
        });

        test("Update user information for a user that does not exist", async () => {
            const testUser = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Test Address",
                "2000-01-01",
            );

            jest.spyOn(
                UserDAO.prototype,
                "checkIfUserExists",
            ).mockResolvedValueOnce(false);

            const controller = new UserController();
            await expect(
                controller.updateUserInfo(
                    testUser,
                    "Updated",
                    "User",
                    "New Address",
                    "1990-01-01",
                    testUser.username,
                ),
            ).rejects.toThrow(UserNotFoundError);
        });
    });
});
