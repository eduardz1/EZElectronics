import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import { app } from "../index";
import { cleanup } from "../src/db/cleanup";
import {
    admin,
    customer,
    login,
    logout,
    postUser,
    routePath,
} from "./helpers.test";
import { Role } from "../src/components/user";

// Cookies for the users. We use them to keep users logged in. Creating them once
// and saving them in variables outside of the tests will make cookies reusable
let adminCookie: string;

// Before executing tests, we remove everything from our test database, create
// an Admin user and log in as Admin, saving the cookie in the corresponding variable
beforeAll(async () => {
    await cleanup();
    await postUser(admin);
    adminCookie = await login(admin);
});

// After executing tests, we remove everything from our test database
afterAll(async () => {
    await cleanup();
});

// A 'describe' block is a way to group tests. It can be used to group tests that
// are related to the same functionality
// In this example, tests are for the user routes
// Inner 'describe' blocks define tests for each route
describe("User routes integration tests", () => {
    describe(`POST ${routePath}/users`, () => {
        // A 'test' block is a single test. It should be a single logical unit
        // of testing for a specific functionality and use case (e.g. correct
        // behavior, error handling, authentication checks)
        test("It should return a 200 success code and create a new user", async () => {
            // A 'request' function is used to send a request to the server. It
            // is similar to the 'fetch' function in the browser. It executes an
            // API call to the specified route, similarly to how the client does
            // it. It is an actual call, with no mocking, so it tests the real
            // behavior of the server. Route calls are asynchronous operations,
            // so we need to use 'await' to wait for the response
            await request(app)
                // The route path is specified here. Other operation types can
                // be defined with similar blocks (e.g. 'get', 'patch', 'delete').
                // Route and query parameters can be added to the path
                .post(`${routePath}/users`)
                // In case of a POST request, the data is sent in the body of the
                // request. It is specified with the 'send' block. The data sent
                // should be consistent with the API specifications in terms of
                // names and types
                .send(customer)
                // The 'expect' block is used to check the response status code.
                // We expect a 200 status code for a successful operation
                .expect(200);

            // After the request is sent, we can add additional checks to verify
            // the operation, since we need to be sure that the user is present
            // in the database. A possible way is retrieving all users and
            // looking for the user we just created.
            // It is possible to assign the response to a variable and use it later.
            const users = await request(app)
                .get(`${routePath}/users`)
                // Authentication is specified with the 'set' block. Adding a
                // cookie to the request will allow authentication (if the
                // cookie has been created with the correct login route).
                // Without this cookie, the request will be unauthorized
                .set("Cookie", adminCookie)
                .expect(200);

            // Since we know that the database was empty at the beginning of our
            // tests and we created two users (an Admin before starting and a
            // Customer in this test), the array should contain only two users
            expect(users.body).toHaveLength(2);

            //We look for the user we created in the array of users
            const cust = users.body.find(
                (user: any) => user.username === customer.username,
            );

            // We expect the user we have created to exist in the array. The
            // parameter should also be equal to those we have sent
            expect(cust).toBeDefined();
            expect(cust.name).toBe(customer.name);
            expect(cust.surname).toBe(customer.surname);
            expect(cust.role).toBe(customer.role);
        });

        // Tests for error conditions can be added in separate 'test' blocks.
        // We can group together tests for the same condition, no need to create
        // a test for each body parameter, for example
        test("It should return a 422 error code if at least one request body parameter is empty/missing", async () => {
            await request(app)
                .post(`${routePath}/users`)
                // We send a request with an empty username. The express-validator
                // checks will catch this and return a 422 error code
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
                .send({
                    username: "test",
                    name: "",
                    surname: "test",
                    password: "test",
                    role: "Customer",
                })
                .expect(422); //We can repeat the call for the remaining body parameters
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

            const cust = users.body.find(
                (user: any) => user.username === customer.username,
            );
            expect(cust).toBeDefined();
            expect(cust.name).toBe(customer.name);
            expect(cust.surname).toBe(customer.surname);
            expect(cust.role).toBe(customer.role);

            const adm = users.body.find(
                (user: any) => user.username === admin.username,
            );
            expect(adm).toBeDefined();
            expect(adm.name).toBe(admin.name);
            expect(adm.surname).toBe(admin.surname);
            expect(adm.role).toBe(admin.role);
        });

        // Test unauthorized access
        test("It should return a 401 error code if the user is not an Admin", async () => {
            const customerCookie = await login(customer);
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

            const cust = users.body.find(
                (user: any) => user.username === customer.username,
            );
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
            const oldUser = {
                username: "oldUser",
                name: "OldCustomer",
                surname: "OldCustomer",
                password: "oldpassword",
                role: Role.CUSTOMER,
            };

            const updatedUser = {
                name: "UpdatedCustomer",
                surname: "UpdatedCustomer",
                address: "Updated Address",
                birthdate: "2000-01-01",
            };

            // Create a new user
            await postUser(oldUser);

            await login(admin);
            const response = await request(app)
                .patch(`${routePath}/users/${oldUser.username}`)
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
        test("It should return a 422 error code if birthdate is invalid", async () => {
            await request(app)
                .patch(`${routePath}/users/${customer.username}`)
                .set("Cookie", adminCookie)
                .send({
                    name: "Updated",
                    surname: "User",
                    address: "New Address",
                    birthdate: "06-12-2000",
                })
                .expect(422);
        });
    });
});

describe("User authentication integration tests", () => {
    describe(`POST ${routePath}/sessions`, () => {
        // Test logging in a user
        test("It should return a 200 success code and log in a user", async () => {
            // Re-create customer
            await postUser(customer);

            const response = await request(app)
                .post(`${routePath}/sessions`)
                .send({
                    username: customer.username,
                    password: customer.password,
                })
                .expect(200);

            expect(response.body.username).toBe(customer.username);
            expect(response.body.name).toBe(customer.name);
            expect(response.body.surname).toBe(customer.surname);
            expect(response.body.role).toBe(customer.role);
        });

        // Test logging in with incorrect credentials
        test("It should return a 401 error code if the credentials are incorrect", async () => {
            await request(app)
                .post(`${routePath}/sessions`)
                .send({
                    username: customer.username,
                    password: "wrongpassword",
                })
                .expect(401);
        });

        test("It should return 422 if the request body is missing parameters or they are empty", async () => {
            await request(app)
                .post(`${routePath}/sessions`)
                .send({
                    username: customer.username,
                })
                .expect(422);

            await request(app)
                .post(`${routePath}/sessions`)
                .send({
                    password: customer.password,
                })
                .expect(422);

            await request(app).post(`${routePath}/sessions`).expect(422);

            await request(app)
                .post(`${routePath}/sessions`)
                .send({
                    username: "",
                    password: "",
                })
                .expect(422);

            await request(app)
                .post(`${routePath}/sessions`)
                .send({
                    username: "test",
                    password: "",
                })
                .expect(422);

            await request(app)
                .post(`${routePath}/sessions`)
                .send({
                    username: "",
                    password: "test",
                })
                .expect(422);
        });
    });

    describe(`DELETE ${routePath}/sessions/current`, () => {
        // Test logging out a user
        test("It should return a 200 success code and log out a user", async () => {
            const customerCookie = await login(customer);
            await request(app)
                .delete(`${routePath}/sessions/current`)
                .set("Cookie", customerCookie)
                .expect(200);
        });
    });

    describe(`GET ${routePath}/sessions/current`, () => {
        // Test getting the current user
        test("It should return the current user", async () => {
            const customerCookie = await login(customer);
            const response = await request(app)
                .get(`${routePath}/sessions/current`)
                .set("Cookie", customerCookie)
                .expect(200);

            expect(response.body.username).toBe(customer.username);
            expect(response.body.name).toBe(customer.name);
            expect(response.body.surname).toBe(customer.surname);
            expect(response.body.role).toBe(customer.role);
        });

        // Test unauthorized access
        test("It should return a 401 error code if the user is not logged in", async () => {
            await request(app)
                .get(`${routePath}/sessions/current`)
                .set("Cookie", "invalid")
                .expect(401);
        });
    });
});
