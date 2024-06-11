import { test, expect } from "@jest/globals";
import request from "supertest";
import { app } from "../index";
import { Role } from "../src/components/user";
import { Category, Product } from "../src/components/product";

const routePath = "/ezelectronics"; //Base route path for the API

const customer = {
    username: "customer",
    name: "customer",
    surname: "customer",
    password: "customer",
    role: Role.CUSTOMER,
};

const admin = {
    username: "admin",
    name: "admin",
    surname: "admin",
    password: "admin",
    role: Role.ADMIN,
};

const manager = {
    username: "manager",
    name: "manager",
    surname: "manager",
    password: "manager",
    role: Role.MANAGER,
};

const testProduct = {
    sellingPrice: 100,
    model: "model",
    category: Category.SMARTPHONE,
    arrivalDate: null,
    details: "details",
    quantity: 20,
};

/**
 * Helper function that creates a new user in the database.
 * Can be used to create a user before the tests or in the tests
 * Is an implicit test because it checks if the return code is successful
 * @param userInfo The user information to be sent in the request body
 */
const postUser = async (userInfo: any) => {
    request(app)
        .post(`${routePath}/users`)
        .send(userInfo)
        .expect(200)
        .catch((err) => {
            console.log(err);
        });
};

/**
 * Helper function that creates a new product in the database.
 * @param productInfo the product information to be sent in the request body
 * @param cookie the cookie of the logged-in manager
 */
const postProduct = async (productInfo: Product, cookie: string) => {
    request(app)
        .post(`${routePath}/products`)
        .set("Cookie", cookie)
        .send(productInfo)
        .expect(200)
        .catch((err) => {
            console.log(err);
        });
};

/**
 * Helper function that logs in a user and returns the cookie
 * Can be used to log in a user before the tests or in the tests
 * @param userInfo The user information to be sent in the request body
 * @returns The cookie of the logged-in user
 */
const login = async (userInfo: any): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        request(app)
            .post(`${routePath}/sessions`)
            .send(userInfo)
            .expect(200)
            .end((err, res) =>
                err ? reject(err) : resolve(res.header["set-cookie"][0]),
            );
    });
};

/**
 * Helper function that logs out a user
 * @param cookie the cookie of the logged-in user
 */
const logout = async (cookie: string) => {
    await request(app)
        .delete(`${routePath}/sessions/current`)
        .set("Cookie", cookie)
        .expect(200)
        .catch((err) => {
            console.log(err);
        });
};

test("1", () => expect(1).toBe(1));

export {
    postUser,
    login,
    logout,
    postProduct,
    customer,
    admin,
    manager,
    routePath,
    testProduct,
};
