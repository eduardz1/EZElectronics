import { test, expect, jest, afterEach, describe } from "@jest/globals";
import request from "supertest";
import { app } from "../../index";
import Authenticator from "../../src/routers/auth";
import { User, Role } from "../../src/components/user";

const baseURL = "/ezelectronics/sessions";

jest.mock("../../src/routers/auth");
jest.mock("../../src/controllers/userController");

afterEach(() => {
    jest.resetAllMocks();
});

describe("AuthRoutes", () => {
    describe(`POST ${baseURL}`, () => {
        test("Returns 200 if successful", async () => {
            const user = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Address",
                "2000-01-01",
            );
            jest.spyOn(Authenticator.prototype, "login").mockResolvedValue(
                user,
            );

            const response = await request(app).post(`${baseURL}`).send({
                username: "testUser",
                password: "password",
            });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(user);
            expect(Authenticator.prototype.login).toHaveBeenCalled();
        });

        test("Returns 401 if username does not exist", async () => {
            jest.spyOn(Authenticator.prototype, "login").mockRejectedValue(
                new Error("User not found"),
            );

            const response = await request(app).post(`${baseURL}`).send({
                username: "testUser",
                password: "password",
            });

            expect(response.status).toBe(401);
            expect(Authenticator.prototype.login).toHaveBeenCalled();
        });

        test("Returns 401 if password is incorrect", async () => {
            jest.spyOn(Authenticator.prototype, "login").mockRejectedValue(
                new Error("Incorrect password"),
            );

            const response = await request(app).post(`${baseURL}`).send({
                username: "testUser",
                password: "password",
            });

            expect(response.status).toBe(401);
            expect(Authenticator.prototype.login).toHaveBeenCalled();
        });
    });

    describe(`DELETE ${baseURL}/current`, () => {
        test("Returns 200 if successful, logout", async () => {
            jest.spyOn(Authenticator.prototype, "logout").mockResolvedValue(
                null,
            );
            jest.spyOn(
                Authenticator.prototype,
                "isLoggedIn",
            ).mockImplementation((_req, _res, next) => {
                next();
            });

            const response = await request(app).delete(`${baseURL}/current`);

            expect(response.status).toBe(200);
            expect(Authenticator.prototype.logout).toHaveBeenCalled();
        });

        test("Returns 401 if user is not logged in", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isLoggedIn",
            ).mockImplementation((_req, res) => {
                res.status(401).send("Unauthorized");
            });

            const response = await request(app).delete(`${baseURL}/current`);

            expect(response.status).toBe(401);
        });
    });

    describe(`GET ${baseURL}/current`, () => {
        test("Returns 200 if successful", async () => {
            const user = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "Address",
                "2000-01-01",
            );
            jest.spyOn(
                Authenticator.prototype,
                "isLoggedIn",
            ).mockImplementation((_req, _res, next) => {
                _req.user = user;
                next();
            });

            const response = await request(app).get(`${baseURL}/current`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(user);
        });

        test("Returns 401 if user is not logged in", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isLoggedIn",
            ).mockImplementation((_req, res) => {
                res.status(401).send("Unauthorized");
            });

            const response = await request(app).get(`${baseURL}/current`);

            expect(response.status).toBe(401);
        });
    });
});
