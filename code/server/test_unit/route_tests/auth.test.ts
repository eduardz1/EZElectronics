import {
    test,
    expect,
    jest,
    afterEach,
    describe,
    beforeEach,
} from "@jest/globals";
import express from "express";
import passport, { Strategy } from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import Authenticator from "../../src/routers/auth";
import { Role } from "../../src/components/user";

jest.mock("../../src/dao/userDAO");

describe("Authenticator", () => {
    let app: express.Application;
    let authenticator: Authenticator;

    beforeEach(() => {
        app = express();
        authenticator = new Authenticator(app);
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
    });

    describe("initAuth", () => {
        test("Should initialize session and passport", () => {
            jest.spyOn(app, "use");
            jest.spyOn(passport, "use");
            jest.spyOn(passport, "serializeUser");
            jest.spyOn(passport, "deserializeUser");

            authenticator.initAuth();

            expect(app.use).toHaveBeenCalledWith(expect.any(Function));
            expect(app.use).toHaveBeenCalledWith(expect.any(Function));
            expect(passport.use).toHaveBeenCalledWith(
                expect.any(LocalStrategy),
            );
            expect(passport.serializeUser).toHaveBeenCalledWith(
                expect.any(Function),
            );
            expect(passport.deserializeUser).toHaveBeenCalledWith(
                expect.any(Function),
            );
        });
    });

    describe("login", () => {
        test("Should log in a user and resolve with the logged in user", async () => {
            const req = { login: jest.fn() };
            const res = {};
            const next = jest.fn();

            authenticator.initAuth();

            const user = { username: "testuser" };

            jest.spyOn(req, "login").mockImplementation(
                (_user: any, callback: any) => {
                    callback(null);
                },
            );

            jest.spyOn(passport, "authenticate").mockImplementation(
                (_strategy: string | Strategy | string[], callback: any) => {
                    callback(null, user, null);
                    return jest.fn();
                },
            );

            await authenticator.login(req, res, next);

            expect(passport.authenticate).toHaveBeenCalledWith(
                "local",
                expect.any(Function),
            );
            expect(req.login).toHaveBeenCalledWith(user, expect.any(Function));
        });

        test("Should reject with an error if authentication fails", async () => {
            const req = { login: jest.fn() };
            const res = {};
            const next = jest.fn();

            authenticator.initAuth();

            jest.spyOn(passport, "authenticate").mockImplementation(
                (_strategy: string | Strategy | string[], callback: any) => {
                    callback(null, false, { message: "Authentication failed" });
                    return jest.fn();
                },
            );

            await expect(authenticator.login(req, res, next)).rejects.toEqual({
                message: "Authentication failed",
            });

            expect(passport.authenticate).toHaveBeenCalledWith(
                "local",
                expect.any(Function),
            );
            expect(req.login).not.toHaveBeenCalled();
        });

        test("Should reject with an error if an error occurs during authentication", async () => {
            const req = { login: jest.fn() };
            const res = {};
            const next = jest.fn();

            jest.spyOn(passport, "authenticate").mockImplementation(
                (_strategy: string | Strategy | string[], callback: any) => {
                    callback(new Error("Authentication error"), null, null);
                    return jest.fn();
                },
            );

            await expect(authenticator.login(req, res, next)).rejects.toEqual(
                new Error("Authentication error"),
            );

            expect(passport.authenticate).toHaveBeenCalledWith(
                "local",
                expect.any(Function),
            );
            expect(req.login).not.toHaveBeenCalled();
        });
    });

    describe("logout", () => {
        test("Should log out the user and resolve with null", async () => {
            const req = { logout: jest.fn() };
            const res = {};
            const next = jest.fn();

            jest.spyOn(req, "logout").mockImplementation((callback: any) => {
                callback();
            });

            const result = await authenticator.logout(req, res, next);

            expect(req.logout).toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });

    describe("isLoggedIn", () => {
        test("Should call next middleware if user is authenticated", () => {
            const req = { isAuthenticated: jest.fn().mockReturnValue(true) };
            const res = {};
            const next = jest.fn();

            authenticator.isLoggedIn(req, res, next);

            expect(req.isAuthenticated).toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });

        test("Should return 401 error response if user is not authenticated", () => {
            const req = { isAuthenticated: jest.fn().mockReturnValue(false) };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            authenticator.isLoggedIn(req, res, next);

            expect(req.isAuthenticated).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: "Unauthenticated user",
                status: 401,
            });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("isCustomer", () => {
        test("Should call next middleware if user is authenticated and is a customer", () => {
            const req = {
                isAuthenticated: jest.fn().mockReturnValue(true),
                user: { role: Role.CUSTOMER },
            };
            const res = {};
            const next = jest.fn();

            authenticator.isCustomer(req, res, next);

            expect(req.isAuthenticated).toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });

        test("Should return 401 error response if user is not authenticated", () => {
            const req = {
                isAuthenticated: jest.fn().mockReturnValue(false),
                user: { role: Role.CUSTOMER },
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            authenticator.isCustomer(req, res, next);

            expect(req.isAuthenticated).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: "User is not a customer",
                status: 401,
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("Should return 401 error response if user is not a customer", () => {
            const req = {
                isAuthenticated: jest.fn().mockReturnValue(true),
                user: { role: Role.MANAGER },
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            authenticator.isCustomer(req, res, next);

            expect(req.isAuthenticated).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: "User is not a customer",
                status: 401,
            });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("isManager", () => {
        test("Should call next middleware if user is authenticated and is a manager", () => {
            const req = {
                isAuthenticated: jest.fn().mockReturnValue(true),
                user: { role: Role.MANAGER },
            };
            const res = {};
            const next = jest.fn();

            authenticator.isManager(req, res, next);

            expect(req.isAuthenticated).toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });

        test("Should return 401 error response if user is not authenticated", () => {
            const req = {
                isAuthenticated: jest.fn().mockReturnValue(false),
                user: { role: Role.MANAGER },
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            authenticator.isManager(req, res, next);

            expect(req.isAuthenticated).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: "User is not a manager",
                status: 401,
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("Should return 401 error response if user is not a manager", () => {
            const req = {
                isAuthenticated: jest.fn().mockReturnValue(true),
                user: { role: Role.CUSTOMER },
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            authenticator.isManager(req, res, next);

            expect(req.isAuthenticated).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: "User is not a manager",
                status: 401,
            });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("isAdmin", () => {
        test("Should call next middleware if user is authenticated and is an admin", () => {
            const req = {
                isAuthenticated: jest.fn().mockReturnValue(true),
                user: { role: Role.ADMIN },
            };
            const res = {};
            const next = jest.fn();

            authenticator.isAdmin(req, res, next);

            expect(req.isAuthenticated).toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });

        test("Should return 401 error response if user is not authenticated", () => {
            const req = {
                isAuthenticated: jest.fn().mockReturnValue(false),
                user: { role: Role.ADMIN },
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            authenticator.isAdmin(req, res, next);

            expect(req.isAuthenticated).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: "User is not an admin",
                status: 401,
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("Should return 401 error response if user is not an admin", () => {
            const req = {
                isAuthenticated: jest.fn().mockReturnValue(true),
                user: { role: Role.MANAGER },
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            authenticator.isAdmin(req, res, next);

            expect(req.isAuthenticated).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: "User is not an admin",
                status: 401,
            });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("isAdminOrManager", () => {
        test("Should call next middleware if user is authenticated and is an admin or manager", () => {
            const req = {
                isAuthenticated: jest.fn().mockReturnValue(true),
                user: { role: Role.ADMIN },
            };
            const res = {};
            const next = jest.fn();

            authenticator.isAdminOrManager(req, res, next);

            expect(req.isAuthenticated).toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });

        test("Should return 401 error response if user is not authenticated", () => {
            const req = {
                isAuthenticated: jest.fn().mockReturnValue(false),
                user: { role: Role.ADMIN },
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            authenticator.isAdminOrManager(req, res, next);

            expect(req.isAuthenticated).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: "User is not an admin or manager",
                status: 401,
            });
            expect(next).not.toHaveBeenCalled();
        });

        test("Should return 401 error response if user is not an admin or manager", () => {
            const req = {
                isAuthenticated: jest.fn().mockReturnValue(true),
                user: { role: Role.CUSTOMER },
            };
            const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
            const next = jest.fn();

            authenticator.isAdminOrManager(req, res, next);

            expect(req.isAuthenticated).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                error: "User is not an admin or manager",
                status: 401,
            });
            expect(next).not.toHaveBeenCalled();
        });
    });
});
