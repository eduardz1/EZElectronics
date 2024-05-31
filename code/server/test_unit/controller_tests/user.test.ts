import { test, expect, jest } from "@jest/globals";
import UserController from "../../src/controllers/userController";
import UserDAO from "../../src/dao/userDAO";
import { User, Role } from "../../src/components/user";
import { UserNotAdminError, UserNotFoundError } from "../../src/errors/userError";

jest.mock("../../src/dao/userDAO");

const testUser: User = new User(
    "testUsername",
    "testName",
    "testSurname",
    "testPassword",
    Role.MANAGER,
    "testAddress",
    "2000-01-01"
);

// Example of a unit test for the createUser method of the UserController
test("createUser should return true", async () => {
    jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(true);
    const controller = new UserController();
    const response = await controller.createUser(
        testUser.username,
        testUser.name,
        testUser.surname,
        testUser.password,
        testUser.role
    );

    expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
    expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(
        testUser.username,
        testUser.name,
        testUser.surname,
        testUser.password,
        testUser.role
    );
    expect(response).toBe(true);
});

test("getUsers should return an array of users", async () => {
    jest.spyOn(UserDAO.prototype, "getUsers").mockResolvedValueOnce([testUser]);
    const controller = new UserController();
    const response = await controller.getUsers();

    expect(UserDAO.prototype.getUsers).toHaveBeenCalledTimes(1);
    expect(response).toEqual([testUser]);
});

test("getUsersByRole should return an array of users with the specified role", async () => {
    jest.spyOn(UserDAO.prototype, "getUsersByRole").mockResolvedValueOnce([testUser]);
    const controller = new UserController();
    const response = await controller.getUsersByRole(testUser.role);

    expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
    expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledWith(testUser.role);
    expect(response).toEqual([testUser]);
});

test("getUserByUsername should return a user when called by an admin", async () => {
    jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValueOnce(testUser);
    const controller = new UserController();
    const adminUser: User = new User(
        "adminUsername",
        "adminName",
        "adminSurname",
        "adminPassword",
        Role.ADMIN,
        "adminAddress",
        "1990-01-01"
    );

    const response = await controller.getUserByUsername(adminUser, testUser.username);

    expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
    expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith(testUser.username);
    expect(response).toEqual(testUser);
});

test("getUserByUsername should throw UserNotAdminError when called by a non-admin user", async () => {
    const controller = new UserController();
    const nonAdminUser: User = new User(
        "nonAdminUsername",
        "nonAdminName",
        "nonAdminSurname",
        "nonAdminPassword",
        Role.CUSTOMER,
        "nonAdminAddress",
        "1995-01-01"
    );

    await expect(controller.getUserByUsername(nonAdminUser, testUser.username)).rejects.toThrow(UserNotAdminError);
});

test("deleteUser should return true when called by an admin", async () => {
    jest.spyOn(UserDAO.prototype, "deleteUser").mockResolvedValueOnce(true);
    const controller = new UserController();
    const adminUser: User = new User(
        "adminUsername",
        "adminName",
        "adminSurname",
        "adminPassword",
        Role.ADMIN,
        "adminAddress",
        "1990-01-01"
    );

    const response = await controller.deleteUser(adminUser, testUser.username);

    expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1);
    expect(UserDAO.prototype.deleteUser).toHaveBeenCalledWith(testUser.username);
    expect(response).toBe(true);
});

test("deleteAll should return true", async () => {
    jest.spyOn(UserDAO.prototype, "deleteAll").mockResolvedValueOnce(true);
    const controller = new UserController();

    const response = await controller.deleteAll();

    expect(UserDAO.prototype.deleteAll).toHaveBeenCalledTimes(1);
    expect(response).toBe(true);
});

test("updateUserInfo should return the updated user", async () => {
    jest.spyOn(UserDAO.prototype, "checkIfUserExists").mockResolvedValueOnce(true);
    jest.spyOn(UserDAO.prototype, "updateUserInfo").mockResolvedValueOnce(testUser);
    const controller = new UserController();
    const newUserDetails = {
        name: "newName",
        surname: "newSurname",
        address: "newAddress",
        birthdate: "1990-01-01",
    };

    const response = await controller.updateUserInfo(testUser, newUserDetails.name, newUserDetails.surname, newUserDetails.address, newUserDetails.birthdate, testUser.username);

    expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
    expect(UserDAO.prototype.updateUserInfo).toHaveBeenCalledWith(
        testUser.username,
        newUserDetails.name,
        newUserDetails.surname,
        newUserDetails.address,
        newUserDetails.birthdate
    );
    expect(response).toEqual(testUser);
});

test("updateUserInfo should throw UserNotFoundError when user does not exist", async () => {
    jest.spyOn(UserDAO.prototype, "checkIfUserExists").mockResolvedValueOnce(false);
    const controller = new UserController();

    await expect(
        controller.updateUserInfo(testUser, "newName", "newSurname", "newAddress", "1990-01-01", testUser.username)
    ).rejects.toThrow(UserNotFoundError);
});
