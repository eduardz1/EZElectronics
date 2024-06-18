import { test, describe, afterAll, beforeAll } from "@jest/globals";
import request from "supertest";
import { app } from "../index";
import {
    admin,
    customer,
    login,
    logout,
    manager,
    postProduct,
    postUser,
    testProduct,
} from "./helpers.test";
import { cleanup } from "../src/db/cleanup";

const baseURL = "/ezelectronics/products";

beforeAll(async () => {
    await cleanup();

    await postUser(admin);
    await postUser(manager);
    await postUser(customer);

    const managerCookie = await login(manager);

    await logout(managerCookie);
});

afterAll(async () => {
    await cleanup();
});

describe("Product routes", () => {
    describe(`POST ${baseURL}/`, () => {
        test("Returns 200 OK and register a new Product", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .post(baseURL)
                .set("Cookie", managerCookie)
                .send(testProduct)
                .expect(200);
        });

        test("Returns 401 Unauthorized if user is not a Manager or Admin", async () => {
            await request(app).post(baseURL).send(testProduct).expect(401);

            const customerCookie = await login(customer);
            await request(app)
                .post(baseURL)
                .set("Cookie", customerCookie)
                .send(testProduct)
                .expect(401);
        });

        test("Returns 409 if model represents an already existing set of products in the database", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .post(baseURL)
                .set("Cookie", managerCookie)
                .send(testProduct)
                .expect(409);
        });
    });

    describe(`PATCH ${baseURL}/:model`, () => {
        test("Returns 200 OK and updates the product", async () => {
            const updatedProduct = {
                quantity: 10,
                changeDate: "2024-04-01",
            };

            const managerCookie = await login(manager);
            await request(app)
                .patch(`${baseURL}/model`)
                .set("Cookie", managerCookie)
                .send(updatedProduct)
                .expect(200);
        });

        test("Returns 401 Unauthorized if user is not a Manager or Admin", async () => {
            const updatedProduct = {
                quantity: 10,
                changeDate: "2021-01-01",
            };

            await request(app)
                .patch(`${baseURL}/${testProduct.model}`)
                .send(updatedProduct)
                .expect(401);

            const customerCookie = await login(customer);
            await request(app)
                .patch(`${baseURL}/${testProduct.model}`)
                .set("Cookie", customerCookie)
                .send(updatedProduct)
                .expect(401);
        });

        test("Returns 404 Not Found if product does not exist", async () => {
            const updatedProduct = {
                quantity: 10,
                changeDate: "2021-01-01",
            };

            const managerCookie = await login(manager);
            await request(app)
                .patch(`${baseURL}/nonexistent`)
                .set("Cookie", managerCookie)
                .send(updatedProduct)
                .expect(404);
        });

        test("Returns 400 if `changeDate` is after the current date", async () => {
            const updatedProduct = {
                quantity: 10,
                changeDate: "3000-01-01",
            };

            const managerCookie = await login(manager);
            await request(app)
                .patch(`${baseURL}/${testProduct.model}`)
                .set("Cookie", managerCookie)
                .send(updatedProduct)
                .expect(400);
        });

        test("Returns 400 if `changeDate` is before product's `arrivalDate`", async () => {
            const updatedProduct = {
                quantity: 10,
                changeDate: "2020-01-01",
            };

            const managerCookie = await login(manager);
            await request(app)
                .patch(`${baseURL}/${testProduct.model}`)
                .set("Cookie", managerCookie)
                .send(updatedProduct)
                .expect(400);
        });
    });

    describe(`PATCH ${baseURL}/:model/sell`, () => {
        test("Returns 200 OK and sells the product", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .patch(`${baseURL}/${testProduct.model}/sell`)
                .set("Cookie", managerCookie)
                .send({ quantity: 1 })
                .expect(200);
        });

        test("Returns 401 Unauthorized if user is not a Manager or Admin", async () => {
            await request(app)
                .patch(`${baseURL}/${testProduct.model}/sell`)
                .send({ quantity: 1 })
                .expect(401);

            const customerCookie = await login(customer);
            await request(app)
                .patch(`${baseURL}/${testProduct.model}/sell`)
                .set("Cookie", customerCookie)
                .send({ quantity: 1 })
                .expect(401);
        });

        test("Returns 404 Not Found if product does not exist", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .patch(`${baseURL}/nonexistent/sell`)
                .set("Cookie", managerCookie)
                .send({ quantity: 1 })
                .expect(404);
        });

        test("Returns 409 Not Found if product stock is empty", async () => {
            let managerCookie = await login(manager);

            // Post a low quantity product
            const lowQuantityProduct = testProduct;
            lowQuantityProduct.quantity = 1;
            lowQuantityProduct.model = "lowQuantityProduct";

            await postProduct(lowQuantityProduct, managerCookie);

            await logout(managerCookie);
            managerCookie = await login(manager);

            // Sell the product
            await request(app)
                .patch(`${baseURL}/lowQuantityProduct/sell`)
                .set("Cookie", managerCookie)
                .send({ quantity: 1 })
                .expect(200);

            // Try to sell the product again
            await request(app)
                .patch(`${baseURL}/lowQuantityProduct/sell`)
                .set("Cookie", managerCookie)
                .send({ quantity: 1 })
                .expect(409);
        });

        test("Returns 409 Bad Request if quantity is greater than stock", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .patch(`${baseURL}/${testProduct.model}/sell`)
                .set("Cookie", managerCookie)
                .send({ quantity: 2 })
                .expect(409);
        });
    });

    describe(`GET ${baseURL}/`, () => {
        test("Returns 200 OK and all products", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .get(baseURL)
                .set("Cookie", managerCookie)
                .expect(200);
        });

        test("Returns 401 if user is not Admin or Manager", async () => {
            await request(app).get(baseURL).expect(401);
            const customerCookie = await login(customer);
            await request(app)
                .get(baseURL)
                .set("Cookie", customerCookie)
                .expect(401);
        });

        test("Returns 200 OK and all products of a category", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .get(`${baseURL}/?grouping=category&category=Smartphone`)
                .set("Cookie", managerCookie)
                .expect(200);
        });

        test("Returns 422 if category is null", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .get(`${baseURL}/?grouping=category`)
                .set("Cookie", managerCookie)
                .expect(422);
        });

        test("Returns 422 if grouping is category and model is specified", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .get(`${baseURL}/?grouping=category&model=model`)
                .set("Cookie", managerCookie)
                .expect(422);
        });

        test("Returns 200 OK and all products of a model", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .get(`${baseURL}/?grouping=model&model=model`)
                .set("Cookie", managerCookie)
                .expect(200);
        });

        test("Returns 422 if model is null", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .get(`${baseURL}/?grouping=model`)
                .set("Cookie", managerCookie)
                .expect(422);
        });

        test("Returns 422 if grouping is model and category is specified", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .get(`${baseURL}/?grouping=model&category=Smartphone`)
                .set("Cookie", managerCookie)
                .expect(422);
        });

        test("Returns 404 Not Found if model does not exist", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .get(`${baseURL}/model/nonexistent`)
                .set("Cookie", managerCookie)
                .expect(404);
        });
    });

    describe(`GET ${baseURL}/available`, () => {
        test("Returns 200 OK and all available products", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .get(`${baseURL}/available`)
                .set("Cookie", managerCookie)
                .expect(200);
        });

        test("Returns 401 Unauthorized if user is not logged in", async () => {
            await request(app).get(`${baseURL}/available`).expect(401);
        });

        test("Returns 200 OK and all available products of a category", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .get(`${baseURL}/available?grouping=category&category=Laptop`)
                .set("Cookie", managerCookie)
                .expect(200);
        });

        test("Returns 422 if category is null", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .get(`${baseURL}/available?grouping=category`)
                .set("Cookie", managerCookie)
                .expect(422);
        });

        test("Returns 422 if grouping is category and model is specified", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .get(`${baseURL}/available?grouping=category&model=model`)
                .set("Cookie", managerCookie)
                .expect(422);
        });

        test("Returns 200 OK and all products of a model", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .get(`${baseURL}/available?grouping=model&model=model`)
                .set("Cookie", managerCookie)
                .expect(200);
        });

        test("Returns 422 if model is null", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .get(`${baseURL}/available?grouping=model`)
                .set("Cookie", managerCookie)
                .expect(422);
        });

        test("Returns 422 if grouping is model and category is specified", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .get(
                    `${baseURL}/available?grouping=model&category=thisProduct.category`,
                )
                .set("Cookie", managerCookie)
                .expect(422);
        });

        test("Returns 404 Not Found if model does not exist", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .get(`${baseURL}/available?grouping=model&model=nonexistent`)
                .set("Cookie", managerCookie)
                .expect(404);
        });
    });

    describe(`DELETE ${baseURL}/:model`, () => {
        test("Returns 200 OK and deletes the product", async () => {
            const adminCookie = await login(admin);
            await request(app)
                .delete(`${baseURL}/${testProduct.model}`)
                .set("Cookie", adminCookie)
                .expect(200);
        });

        test("Returns 401 Unauthorized if user is not Admin or Manager", async () => {
            await request(app)
                .delete(`${baseURL}/${testProduct.model}`)
                .expect(401);

            const customerCookie = await login(customer);
            await request(app)
                .delete(`${baseURL}/${testProduct.model}`)
                .set("Cookie", customerCookie)
                .expect(401);
        });

        test("Returns 404 Not Found if product does not exist", async () => {
            const adminCookie = await login(admin);
            await request(app)
                .delete(`${baseURL}/nonexistent`)
                .set("Cookie", adminCookie)
                .expect(404);
        });
    });

    describe(`DELETE ${baseURL}/`, () => {
        test("Returns 200 OK and deletes all products", async () => {
            const adminCookie = await login(admin);
            await request(app)
                .delete(baseURL)
                .set("Cookie", adminCookie)
                .expect(200);
        });

        test("Returns 401 Unauthorized if user is not Admin or Manager", async () => {
            await request(app).delete(baseURL).expect(401);

            const customerCookie = await login(customer);
            await request(app)
                .delete(baseURL)
                .set("Cookie", customerCookie)
                .expect(401);
        });
    });
});
