import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import { app } from "../index";
import { cleanup } from "../src/db/cleanup";
import {
    admin,
    customer,
    login,
    logout,
    manager,
    postProduct,
    postUser,
} from "./helpers";
import { Cart } from "../src/components/cart";
import { Category, Product } from "../src/components/product";
import db from "../src/db/db";

const testProduct = new Product(
    100,
    "model",
    Category.SMARTPHONE,
    null,
    "details",
    20,
);

const testProductLowStock = new Product(
    101,
    "model2",
    Category.SMARTPHONE,
    null,
    "details",
    1,
);

const testProductLowStock2 = new Product(
    101,
    "model3",
    Category.SMARTPHONE,
    null,
    "details",
    2,
);

const testProductLowStock3 = new Product(
    101,
    "model4",
    Category.SMARTPHONE,
    null,
    "details",
    1,
);

const baseURL = "/ezelectronics/carts";

beforeAll(async () => {
    await cleanup();

    await postUser(customer);
    await postUser(manager);
    await postUser(admin);

    const managerCookie = await login(manager);

    await postProduct(testProduct, managerCookie);
    await postProduct(testProductLowStock, managerCookie);
    await postProduct(testProductLowStock2, managerCookie);
    await postProduct(testProductLowStock3, managerCookie);

    await logout(managerCookie);
});

afterAll(async () => {
    await cleanup();
});

describe("Cart routes integration tests", () => {
    describe(`GET ${baseURL}/`, () => {
        test("Returns 200 OK and the current user's cart", async () => {
            const customerCookie = await login(customer);
            const response = await request(app)
                .get(baseURL)
                .set("Cookie", customerCookie)
                .expect(200);
            expect(response.body).toEqual(
                new Cart(customer.username, false, null, 0, []),
            );
        });

        test("Returns 401 Unauthorized if user is not a customer", async () => {
            await request(app).get(baseURL).expect(401);

            const adminCookie = await login(admin);
            await request(app)
                .get(baseURL)
                .set("Cookie", adminCookie)
                .expect(401);

            const managerCookie = await login(manager);
            await request(app)
                .get(baseURL)
                .set("Cookie", managerCookie)
                .expect(401);
        });
    });

    describe(`POST ${baseURL}/`, () => {
        afterAll(async () => {
            const customerCookie = await login(customer);
            await request(app)
                .delete(`${baseURL}/current`)
                .set("Cookie", customerCookie);
            await logout(customerCookie);

            const adminCookie = await login(admin);
            await request(app).delete(`${baseURL}`).set("Cookie", adminCookie);
            await logout(adminCookie);
        });

        test("Returns 200 OK and updates the current cart", async () => {
            const customerCookie = await login(customer);
            await request(app)
                .post(baseURL)
                .set("Cookie", customerCookie)
                .send({ model: "model" })
                .expect(200);
        });

        test("Returns 401 Unauthorized if user is not a customer", async () => {
            await request(app)
                .post(baseURL)
                .send({ model: "model" })
                .expect(401);

            const adminCookie = await login(admin);
            await request(app)
                .post(baseURL)
                .set("Cookie", adminCookie)
                .send({ model: "model" })
                .expect(401);

            const managerCookie = await login(manager);
            await request(app)
                .post(baseURL)
                .set("Cookie", managerCookie)
                .send({ model: "model" })
                .expect(401);
        });

        test("Returns 404 Not Found if the product model does not exist", async () => {
            const customerCookie = await login(customer);
            await request(app)
                .post(baseURL)
                .set("Cookie", customerCookie)
                .send({ model: "nonexistent" })
                .expect(404);
        });

        test("Returns 409 if the product is out of stock", async () => {
            const customerCookie = await login(customer);
            await request(app)
                .post(baseURL)
                .set("Cookie", customerCookie)
                .send({ model: "model2" })
                .expect(200); // First time it should work
            await request(app)
                .patch(baseURL)
                .set("Cookie", customerCookie)
                .expect(200); // Checkout

            await request(app)
                .post(baseURL)
                .set("Cookie", customerCookie)
                .send({ model: "model2" })
                .expect(409);
        });
    });

    describe(`PATCH ${baseURL}/`, () => {
        test("Returns 200 OK and updates the current cart", async () => {
            const customerCookie = await login(customer);
            await request(app)
                .post(baseURL)
                .set("Cookie", customerCookie)
                .send({ model: "model" })
                .expect(200);
            await request(app)
                .patch(baseURL)
                .set("Cookie", customerCookie)
                .expect(200);
        });

        test("Returns 401 Unauthorized if user is not a customer", async () => {
            await request(app).patch(baseURL).expect(401);

            const adminCookie = await login(admin);
            await request(app)
                .patch(baseURL)
                .set("Cookie", adminCookie)
                .expect(401);

            const managerCookie = await login(manager);
            await request(app)
                .patch(baseURL)
                .set("Cookie", managerCookie)
                .expect(401);
        });

        test("Returns 404 if there is no current cart", async () => {
            const customerCookie = await login(customer);
            await request(app)
                .patch(baseURL)
                .set("Cookie", customerCookie)
                .expect(404);
        });

        test("Returns 400 if the cart is empty", async () => {
            const customerCookie = await login(customer);
            await request(app)
                .post(baseURL)
                .set("Cookie", customerCookie)
                .send({ model: "model" })
                .expect(200);
            await request(app)
                .delete(`${baseURL}/current`)
                .set("Cookie", customerCookie)
                .expect(200); // Clear cart
            await request(app)
                .patch(baseURL)
                .set("Cookie", customerCookie)
                .expect(400);
        });

        test("Returns 409 if there is at least one product out of stock", async () => {
            const customerCookie = await login(customer);
            await request(app)
                .post(baseURL)
                .set("Cookie", customerCookie)
                .send({ model: "model4" })
                .expect(200);

            db.get(
                `
                UPDATE products
                SET quantity = 0
                WHERE model = 'model4'`,
                [],
                async (_err) => {
                    await request(app)
                        .patch(baseURL)
                        .set("Cookie", customerCookie)
                        .expect(409);
                },
            );
        });

        test("Returns 409 if there is at least one product whose available quantity is less than the quantity in the cart", async () => {
            const customerCookie = await login(customer);
            await request(app)
                .post(baseURL)
                .set("Cookie", customerCookie)
                .send({ model: "model3" })
                .expect(200);
            await request(app)
                .post(baseURL)
                .set("Cookie", customerCookie)
                .send({ model: "model3" })
                .expect(200);
            await request(app)
                .post(baseURL)
                .set("Cookie", customerCookie)
                .send({ model: "model3" })
                .expect(200);
            await request(app)
                .patch(baseURL)
                .set("Cookie", customerCookie)
                .expect(409);
        });
    });

    describe(`GET ${baseURL}/history`, () => {
        test("Returns 200 OK and the history of the current user's carts", async () => {
            const customerCookie = await login(customer);
            const response = await request(app)
                .get(`${baseURL}/history`)
                .set("Cookie", customerCookie)
                .expect(200);

            expect(response.body.length).toBe(1);
        });

        test("Returns 401 Unauthorized if user is not a customer", async () => {
            await request(app).get(`${baseURL}/history`).expect(401);

            const adminCookie = await login(admin);
            await request(app)
                .get(`${baseURL}/history`)
                .set("Cookie", adminCookie)
                .expect(401);

            const managerCookie = await login(manager);
            await request(app)
                .get(`${baseURL}/history`)
                .set("Cookie", managerCookie)
                .expect(401);
        });
    });

    describe(`DELETE ${baseURL}/current`, () => {
        test("Returns 200 OK and clears the current cart", async () => {
            const customerCookie = await login(customer);
            await request(app)
                .delete(`${baseURL}/current`)
                .set("Cookie", customerCookie)
                .expect(200);
        });

        test("Returns 401 Unauthorized if user is not a customer", async () => {
            await request(app).delete(`${baseURL}/current`).expect(401);

            const adminCookie = await login(admin);
            await request(app)
                .delete(`${baseURL}/current`)
                .set("Cookie", adminCookie)
                .expect(401);

            const managerCookie = await login(manager);
            await request(app)
                .delete(`${baseURL}/current`)
                .set("Cookie", managerCookie)
                .expect(401);
        });
    });

    describe(`DELETE ${baseURL}/`, () => {
        test("Returns 200 OK and deletes all carts", async () => {
            const adminCookie = await login(admin);
            await request(app).delete(`${baseURL}`).set("Cookie", adminCookie);
        });

        test("Returns 401 Unauthorized if user is not an admin or manager", async () => {
            await request(app).delete(`${baseURL}`).expect(401);

            const customerCookie = await login(customer);
            await request(app)
                .delete(`${baseURL}`)
                .set("Cookie", customerCookie)
                .expect(401);
        });
    });

    describe(`GET ${baseURL}/all`, () => {
        test("Returns 200 OK and all carts", async () => {
            const adminCookie = await login(admin);
            await request(app)
                .get(`${baseURL}/all`)
                .set("Cookie", adminCookie)
                .expect(200);
        });

        test("Returns 401 Unauthorized if user is not an admin or manager", async () => {
            await request(app).get(`${baseURL}/all`).expect(401);

            const customerCookie = await login(customer);
            await request(app)
                .get(`${baseURL}/all`)
                .set("Cookie", customerCookie)
                .expect(401);
        });
    });
});
