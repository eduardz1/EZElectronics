import { test, expect, jest, describe, afterAll } from "@jest/globals";
import request from "supertest";
import { Category, Product } from "../src/components/product";
import { app } from "../index";
import {
    admin,
    customer,
    login,
    logout,
    manager,
    postProduct,
    postUser,
} from "./helpers.test";
import { cleanup } from "../src/db/cleanup";
import { response } from "express";

const baseURL = "/ezelectronics/products";

const testProduct: Product = {
    sellingPrice: 1,
    model: "model",
    category: Category.SMARTPHONE,
    arrivalDate: "2022-01-01",
    details: "details",
    quantity: 1,
};

beforeAll(async () => {
    await cleanup();

    await postUser(admin);
    await postUser(manager);
    await postUser(customer);

    const managerCookie = await login(manager);

    await postProduct(testProduct, managerCookie);

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
                .send({ testProduct })
                .expect(200);
        });

        test("Returns 401 Unauthorized if user is not a Manager or Admin", async () => {
            await request(app).post(baseURL).send(testProduct).expect(401);

            const customerCookie = await login(customer);
            await request(app)
                .post(baseURL)
                .set("Cookie", customerCookie)
                .send({ testProduct })
                .expect(401);
        });

        test("Returns 409 if model represents an already existing set of products in the database", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .post(baseURL)
                .set("Cookie", managerCookie)
                .send({ testProduct })
                .expect(409);
        });
    });

    describe(`PATCH ${baseURL}/:model`, () => {
        test("Returns 200 OK and updates the product", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .patch(`${baseURL}/model`)
                .set("Cookie", managerCookie)
                .send({ testProduct, model: "newModel" })
                .expect(200);
        });

        test("Returns 401 Unauthorized if user is not a Manager or Admin", async () => {
            await request(app)
                .patch(`${baseURL}/${testProduct.model}`)
                .send({ testProduct, model: "newModel" })
                .expect(401);

            const customerCookie = await login(customer);
            await request(app)
                .patch(`${baseURL}/${testProduct.model}`)
                .set("Cookie", customerCookie)
                .send({ testProduct, model: "newModel" })
                .expect(401);
        });

        test("Returns 404 Not Found if product does not exist", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .patch(`${baseURL}/model/nonexistent`)
                .set("Cookie", managerCookie)
                .send({ model: "newModel" })
                .expect(404);
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
            const managerCookie = await login(manager);
            await request(app)
                .patch(`${baseURL}/model/sell`)
                .set("Cookie", managerCookie)
                .send({ testProduct, quantity: 1 })
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
                .get(
                    `${baseURL}/?grouping=category&category=testProduct.category`,
                )
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
                .get(`${baseURL}/?grouping=category&model=testProduct.model`)
                .set("Cookie", managerCookie)
                .expect(422);
        });

        test("Returns 200 OK and all products of a model", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .get(`${baseURL}/?grouping=model&model=testProduct.model`)
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
                .get(`${baseURL}/?grouping=model&category=thisProduct.category`)
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

            const customerCookie = await login(customer);
            await request(app)
                .get(`${baseURL}/available`)
                .set("Cookie", customerCookie)
                .expect(401);
        });

        test("Returns 200 OK and all available products of a category", async () => {
            const managerCookie = await login(manager);
            await request(app)
                .get(
                    `${baseURL}/available?grouping=category&category=testProduct.category`,
                )
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
                .get(
                    `${baseURL}/available?grouping=model&model=testProduct.model`,
                )
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
