import { describe, test, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import { app } from "../index";
import { cleanup } from "../src/db/cleanup";

const routePath = "/ezelectronics"; // Base route path for the API

// Default user information. We use them to create users and evaluate the returned values
const customer = {
    username: "customer",
    name: "customer",
    surname: "customer",
    password: "customer",
    role: "Customer",
};

const admin = {
    username: "admin",
    name: "admin",
    surname: "admin",
    password: "admin",
    role: "Admin",
};

// Cookies for the users. We use them to keep users logged in. Creating them once
// and saving them in variables outside of the tests will make cookies reusable
let customerCookie: string;
let adminCookie: string;

/**
 * Helper function that creates a new user in the database.
 * Deletes the user first if it already exists to avoid conflicts.
 * @param userInfo The user information to be sent in the request body
 */
const postUser = async (userInfo: any) => {
    await request(app).delete(`${routePath}/users/${userInfo.username}`).set("Cookie", adminCookie);
    await request(app).post(`${routePath}/users`).send(userInfo).expect(200);
};

/**
 * Helper function that logs in a user and returns the cookie
 * @param userInfo The user information to be sent in the request body
 * @returns The cookie of the logged-in user
 */
const login = async (userInfo: any): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        request(app)
            .post(`${routePath}/sessions`)
            .send(userInfo)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    reject(err);
                }
                resolve(res.header["set-cookie"][0]);
            });
    });
};

// Before executing tests, we remove everything from our test database, create
// an Admin user and log in as Admin, saving the cookie in the corresponding variable
beforeAll(async () => {
    await cleanup();
    await request(app).post(`${routePath}/users`).send(admin);
    adminCookie = await login(admin);
    await request(app).post(`${routePath}/users`).send(customer);
    customerCookie = await login(customer);
});

// After executing tests, we remove everything from our test database
afterAll(async () => {
    await cleanup();
});

// Clear database before each test to ensure isolation
beforeEach(async () => {
    await cleanup();
    await postUser(admin);
    adminCookie = await login(admin);
    await postUser(customer);
    customerCookie = await login(customer);
});

describe("User routes integration tests", () => {
    describe(`POST ${routePath}/users`, () => {
        // Test creating a new user
        test("It should return a 200 success code and create a new user", async () => {
            const newUser = { ...customer, username: "newCustomer" };
            await request(app)
                .post(`${routePath}/users`)
                .set("Cookie", adminCookie)
                .send(newUser)
                .expect(200);

            const users = await request(app)
                .get(`${routePath}/users`)
                .set("Cookie", adminCookie)
                .expect(200);

            const cust = users.body.find((user: any) => user.username === newUser.username);
            expect(cust).toBeDefined();
            expect(cust.name).toBe(newUser.name);
            expect(cust.surname).toBe(newUser.surname);
            expect(cust.role).toBe(newUser.role);
        });

        // Test creating a user with missing parameters
        test("It should return a 422 error code if at least one request body parameter is empty/missing", async () => {
            await request(app)
                .post(`${routePath}/users`)
                .set("Cookie", adminCookie)
                .send({
                    username: "",
                    name: "test",
                    surname: "test",
                    password: "test",
                    role: "Customer",
                })
                .expect(422);

            await request(app)
                .post(`${routePath}/users`)
                .set("Cookie", adminCookie)
                .send({
                    username: "test",
                    name: "",
                    surname: "test",
                    password: "test",
                    role: "Customer",
                })
                .expect(422);
        });
    });

    describe(`GET ${routePath}/users`, () => {
        // Test retrieving an array of users
        test("It should return an array of users", async () => {
            const users = await request(app)
                .get(`${routePath}/users`)
                .set("Cookie", adminCookie)
                .expect(200);

            expect(users.body).toHaveLength(2); // Since admin and customer exist

            const cust = users.body.find((user: any) => user.username === customer.username);
            expect(cust).toBeDefined();
            expect(cust.name).toBe(customer.name);
            expect(cust.surname).toBe(customer.surname);
            expect(cust.role).toBe(customer.role);

            const adm = users.body.find((user: any) => user.username === admin.username);
            expect(adm).toBeDefined();
            expect(adm.name).toBe(admin.name);
            expect(adm.surname).toBe(admin.surname);
            expect(adm.role).toBe(admin.role);
        });

        // Test unauthorized access
        test("It should return a 401 error code if the user is not an Admin", async () => {
            await request(app)
                .get(`${routePath}/users`)
                .set("Cookie", customerCookie)
                .expect(401);

            await request(app).get(`${routePath}/users`).expect(401);
        });
    });

    describe(`GET ${routePath}/users/roles/:role`, () => {
        // Test retrieving users by role
        test("It should return an array of users with a specific role", async () => {
            const admins = await request(app)
                .get(`${routePath}/users/roles/Admin`)
                .set("Cookie", adminCookie)
                .expect(200);

            expect(admins.body).toHaveLength(1);

            const adm = admins.body[0];
            expect(adm.username).toBe(admin.username);
            expect(adm.name).toBe(admin.name);
            expect(adm.surname).toBe(admin.surname);
        });

        // Test invalid role
        test("It should fail if the role is not valid", async () => {
            await request(app)
                .get(`${routePath}/users/roles/Invalid`)
                .set("Cookie", adminCookie)
                .expect(422);
        });
    });

    describe(`GET ${routePath}/users/:username`, () => {
        // Test retrieving a user by username
        test("It should return a user by username", async () => {
            const user = await request(app)
                .get(`${routePath}/users/${customer.username}`)
                .set("Cookie", adminCookie)
                .expect(200);

            expect(user.body.username).toBe(customer.username);
            expect(user.body.name).toBe(customer.name);
            expect(user.body.surname).toBe(customer.surname);
        });

        // Test retrieving a non-existent user
        test("It should return a 404 error code if the user does not exist", async () => {
            await request(app)
                .get(`${routePath}/users/nonexistentuser`)
                .set("Cookie", adminCookie)
                .expect(404);
        });
    });

    describe(`DELETE ${routePath}/users/:username`, () => {
        // Test deleting a user by username
        test("It should delete a user by username", async () => {
            await request(app)
                .delete(`${routePath}/users/${customer.username}`)
                .set("Cookie", adminCookie)
                .expect(200);

            const users = await request(app)
                .get(`${routePath}/users`)
                .set("Cookie", adminCookie)
                .expect(200);

            expect(users.body).toHaveLength(1);

            const cust = users.body.find((user: any) => user.username === customer.username);
            expect(cust).toBeUndefined();
        });

        // Test deleting a non-existent user
        test("It should return a 404 error code if the user does not exist", async () => {
            await request(app)
                .delete(`${routePath}/users/nonexistentuser`)
                .set("Cookie", adminCookie)
                .expect(404);
        });
    });

    describe(`PATCH ${routePath}/users/:username`, () => {
        // Test updating a user's information
        test("It should update a user's information", async () => {
            const updatedUser = {
                name: "UpdatedCustomer",
                surname: "UpdatedCustomer",
                address: "Updated Address",
                birthdate: "2000-01-01",
            };

            const response = await request(app)
                .patch(`${routePath}/users/${customer.username}`)
                .set("Cookie", adminCookie)
                .send(updatedUser)
                .expect(200);

            expect(response.body.name).toBe(updatedUser.name);
            expect(response.body.surname).toBe(updatedUser.surname);
            expect(response.body.address).toBe(updatedUser.address);
            expect(response.body.birthdate).toBe(updatedUser.birthdate);
        });

        // Test updating a non-existent user
        test("It should return a 404 error code if the user does not exist", async () => {
            await request(app)
                .patch(`${routePath}/users/nonexistentuser`)
                .set("Cookie", adminCookie)
                .send({
                    name: "Updated",
                    surname: "User",
                    address: "New Address",
                    birthdate: "2000-01-01",
                })
                .expect(404);
        });

        // Test invalid birthdate
        test("It should return a 400 error code if birthdate is invalid", async () => {
            await request(app)
                .patch(`${routePath}/users/${customer.username}`)
                .set("Cookie", adminCookie)
                .send({
                    name: "Updated",
                    surname: "User",
                    address: "New Address",
                    birthdate: "2025-01-01",
                })
                .expect(400);
        });
    });
});