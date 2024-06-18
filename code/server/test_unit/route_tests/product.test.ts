import { test, expect, jest, describe, afterEach } from "@jest/globals";
import request from "supertest";
import {
    EmptyProductStockError,
    IncorrectCategoryGroupingError,
    IncorrectGroupingError,
    IncorrectModelGroupingError,
    LowProductStockError,
    ProductAlreadyExistsError,
    ProductNotFoundError,
} from "../../src/errors/productError";
import { Category, Product } from "../../src/components/product";
import { app } from "../../index";
import Authenticator from "../../src/routers/auth";
import ProductController from "../../src/controllers/productController";
import { DateError } from "../../src/utilities";

const baseURL = "/ezelectronics/products";

jest.mock("../../src/routers/auth");
jest.mock("../../src/controllers/productController");

afterEach(() => {
    jest.resetAllMocks();
});

describe("Product routes", () => {
    describe(`POST ${baseURL}/`, () => {
        test("Returns 200 if successful", async () => {
            const testProduct = new Product(
                1,
                "model",
                Category.SMARTPHONE,
                "2022-01-01",
                "details",
                1,
            );
            jest.spyOn(
                ProductController.prototype,
                "registerProducts",
            ).mockResolvedValueOnce(true);
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .post(`${baseURL}/`)
                .send(testProduct);

            expect(response.status).toBe(200);
            expect(
                ProductController.prototype.registerProducts,
            ).toHaveBeenCalledTimes(1);
            expect(
                ProductController.prototype.registerProducts,
            ).toHaveBeenCalledWith(
                testProduct.model,
                testProduct.category,
                testProduct.quantity,
                testProduct.details,
                testProduct.sellingPrice,
                testProduct.arrivalDate,
            );
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 422 if model is not a string`, async () => {
            const testProduct = {
                model: 1,
                category: Category.SMARTPHONE,
                quantity: 1,
                details: "details",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .post(`${baseURL}/`)
                .send(testProduct);

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.registerProducts,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test(`Returns 422 if model is empty`, async () => {
            const testProduct = {
                model: "",
                category: Category.SMARTPHONE,
                quantity: 1,
                details: "details",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .post(`${baseURL}/`)
                .send(testProduct);

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.registerProducts,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test(`Returns 422 if category is not a string`, async () => {
            const testProduct = {
                model: "model",
                category: 1,
                quantity: 1,
                details: "details",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .post(`${baseURL}/`)
                .send(testProduct);

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.registerProducts,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test(`Returns 422 if category is empty`, async () => {
            const testProduct = {
                model: "model",
                category: "",
                quantity: 1,
                details: "details",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .post(`${baseURL}/`)
                .send(testProduct);

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.registerProducts,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test(`Returns 422 if category is not one of the allowed types`, async () => {
            const testProduct = {
                model: "model",
                category: "invalid",
                quantity: 1,
                details: "details",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .post(`${baseURL}/`)
                .send(testProduct);

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.registerProducts,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test(`Returns 422 if quantity is not a number`, async () => {
            const testProduct = {
                model: "model",
                category: Category.APPLIANCE,
                quantity: "aa",
                details: "details",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .post(`${baseURL}/`)
                .send(testProduct);

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.registerProducts,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test(`Returns 422 if quantity is empty`, async () => {
            const testProduct = {
                model: "model",
                category: Category.SMARTPHONE,
                quantity: "",
                details: "details",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .post(`${baseURL}/`)
                .send(testProduct);

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.registerProducts,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test(`Returns 422 if details is not a string`, async () => {
            const testProduct = {
                model: "model",
                category: Category.LAPTOP,
                quantity: 1,
                details: 1,
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .post(`${baseURL}/`)
                .send(testProduct);

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.registerProducts,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test(`Returns 422 if sellingPrice is not a number`, async () => {
            const testProduct = {
                model: "model",
                category: Category.SMARTPHONE,
                quantity: 1,
                details: "details",
                sellingPrice: "aa",
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .post(`${baseURL}/`)
                .send(testProduct);

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.registerProducts,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test(`Returns 422 if sellingPrice is empty`, async () => {
            const testProduct = {
                model: "model",
                category: Category.SMARTPHONE,
                quantity: 1,
                details: "details",
                sellingPrice: "",
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .post(`${baseURL}/`)
                .send(testProduct);

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.registerProducts,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test(`Returns 422 if arrivalDate is not a string`, async () => {
            const testProduct = {
                model: "model",
                category: Category.SMARTPHONE,
                quantity: 1,
                details: "details",
                sellingPrice: 1,
                arrivalDate: 2,
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .post(`${baseURL}/`)
                .send(testProduct);

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.registerProducts,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test(`Returns 401 if user is not an admin or manager`, async () => {
            const testProduct = {
                model: "model",
                category: Category.SMARTPHONE,
                quantity: 1,
                details: "details",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, res, _next) =>
                res.status(401).json({
                    error: "User is not an admin or manager",
                    status: 401,
                }),
            );

            const response = await request(app)
                .post(`${baseURL}/`)
                .send(testProduct);

            expect(response.status).toBe(401);
            expect(
                ProductController.prototype.registerProducts,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 409 if model represents an already existing set of products in the database`, async () => {
            const testProduct = {
                model: "model",
                category: Category.SMARTPHONE,
                quantity: 1,
                details: "details",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                ProductController.prototype,
                "registerProducts",
            ).mockRejectedValueOnce(new ProductAlreadyExistsError());

            const response = await request(app)
                .post(`${baseURL}/`)
                .send(testProduct);

            expect(response.status).toBe(409);
            expect(
                ProductController.prototype.registerProducts,
            ).toHaveBeenCalledTimes(1);
            expect(
                ProductController.prototype.registerProducts,
            ).toHaveBeenCalledWith(
                testProduct.model,
                testProduct.category,
                testProduct.quantity,
                testProduct.details,
                testProduct.sellingPrice,
                testProduct.arrivalDate,
            );
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 400 if arrivalDate is in the future`, async () => {
            const testProduct = {
                model: "model",
                category: Category.SMARTPHONE,
                quantity: 1,
                details: "details",
                sellingPrice: 1,
                arrivalDate: "3000-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                ProductController.prototype,
                "registerProducts",
            ).mockRejectedValueOnce(new DateError());

            const response = await request(app)
                .post(`${baseURL}/`)
                .send(testProduct);

            expect(response.status).toBe(400);
            expect(
                ProductController.prototype.registerProducts,
            ).toHaveBeenCalledTimes(1);
            expect(
                ProductController.prototype.registerProducts,
            ).toHaveBeenCalledWith(
                testProduct.model,
                testProduct.category,
                testProduct.quantity,
                testProduct.details,
                testProduct.sellingPrice,
                testProduct.arrivalDate,
            );
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });
    });

    describe(`PATCH ${baseURL}/:model`, () => {
        test(`Returns 200 if successful`, async () => {
            const testProduct = {
                quantity: 1,
                changeDate: "2022-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                ProductController.prototype,
                "changeProductQuantity",
            ).mockResolvedValueOnce(1);

            const response = await request(app)
                .patch(`${baseURL}/model`)
                .send(testProduct);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ quantity: 1 });
            expect(
                ProductController.prototype.changeProductQuantity,
            ).toHaveBeenCalledTimes(1);
            expect(
                ProductController.prototype.changeProductQuantity,
            ).toHaveBeenCalledWith(
                "model",
                testProduct.quantity,
                testProduct.changeDate,
            );
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 401 if user is not an admin or manager`, async () => {
            const testProduct = {
                quantity: 1,
                changeDate: "2022-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, res, _next) =>
                res.status(401).json({
                    error: "User is not an admin or manager",
                    status: 401,
                }),
            );

            const response = await request(app)
                .patch(`${baseURL}/model`)
                .send(testProduct);

            expect(response.status).toBe(401);
            expect(
                ProductController.prototype.changeProductQuantity,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 404 (cannot patch) if model is empty`, async () => {
            const testProduct = {
                quantity: 1,
                changeDate: "2022-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .patch(`${baseURL}/`)
                .send(testProduct);

            expect(response.status).toBe(404);
            expect(
                ProductController.prototype.changeProductQuantity,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test(`Returns 422 if quantity is not a number`, async () => {
            const testProduct = {
                quantity: "aa",
                changeDate: "2022-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .patch(`${baseURL}/model`)
                .send(testProduct);

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.changeProductQuantity,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test(`Returns 422 if quantity is empty`, async () => {
            const testProduct = {
                quantity: "",
                changeDate: "2022-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .patch(`${baseURL}/model`)
                .send(testProduct);

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.changeProductQuantity,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test(`Returns 422 if changeDate is not a string`, async () => {
            const testProduct = {
                quantity: 1,
                changeDate: 1,
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .patch(`${baseURL}/model`)
                .send(testProduct);

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.changeProductQuantity,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test(`Returns 404 if model does not represent an existing product`, async () => {
            const testProduct = {
                quantity: 1,
                changeDate: "2022-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                ProductController.prototype,
                "changeProductQuantity",
            ).mockRejectedValueOnce(new ProductNotFoundError());

            const response = await request(app)
                .patch(`${baseURL}/model`)
                .send(testProduct);

            expect(response.status).toBe(404);
            expect(
                ProductController.prototype.changeProductQuantity,
            ).toHaveBeenCalledTimes(1);
            expect(
                ProductController.prototype.changeProductQuantity,
            ).toHaveBeenCalledWith(
                "model",
                testProduct.quantity,
                testProduct.changeDate,
            );
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 400 if changeDate is in the future`, async () => {
            const testProduct = {
                quantity: 1,
                changeDate: "3000-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                ProductController.prototype,
                "changeProductQuantity",
            ).mockRejectedValueOnce(new DateError());

            const response = await request(app)
                .patch(`${baseURL}/model`)
                .send(testProduct);

            expect(response.status).toBe(400);
            expect(
                ProductController.prototype.changeProductQuantity,
            ).toHaveBeenCalledTimes(1);
            expect(
                ProductController.prototype.changeProductQuantity,
            ).toHaveBeenCalledWith(
                "model",
                testProduct.quantity,
                testProduct.changeDate,
            );
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 400 if changeDate is before arrivalDate`, async () => {
            const testProduct = {
                quantity: 1,
                changeDate: "2021-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                ProductController.prototype,
                "changeProductQuantity",
            ).mockRejectedValueOnce(new DateError());

            const response = await request(app)
                .patch(`${baseURL}/model`)
                .send(testProduct);

            expect(response.status).toBe(400);
            expect(
                ProductController.prototype.changeProductQuantity,
            ).toHaveBeenCalledTimes(1);
            expect(
                ProductController.prototype.changeProductQuantity,
            ).toHaveBeenCalledWith(
                "model",
                testProduct.quantity,
                testProduct.changeDate,
            );
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });
    });

    describe(`PATCH ${baseURL}/:model/sell`, () => {
        test(`Returns 200 if successful`, async () => {
            const testProduct = {
                quantity: 1,
                sellingDate: "2022-01-01",
            };
            jest.spyOn(
                ProductController.prototype,
                "sellProduct",
            ).mockResolvedValueOnce(1);
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .patch(`${baseURL}/model/sell`)
                .send(testProduct);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ quantity: 1 });
            expect(
                ProductController.prototype.sellProduct,
            ).toHaveBeenCalledTimes(1);
            expect(
                ProductController.prototype.sellProduct,
            ).toHaveBeenCalledWith(
                "model",
                testProduct.quantity,
                testProduct.sellingDate,
            );
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 401 if user is not an admin or manager`, async () => {
            const testProduct = {
                quantity: 1,
                sellingDate: "2022-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, res, _next) =>
                res.status(401).json({
                    error: "User is not an admin or manager",
                    status: 401,
                }),
            );

            const response = await request(app)
                .patch(`${baseURL}/model/sell`)
                .send(testProduct);

            expect(response.status).toBe(401);
            expect(
                ProductController.prototype.sellProduct,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test("Returns 422 if quantity is not a number", async () => {
            const testProduct = {
                quantity: "aa",
                sellingDate: "2022-01-01",
            };

            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .patch(`${baseURL}/model/sell`)
                .send(testProduct);

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.sellProduct,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test("Returns 422 if quantity is empty", async () => {
            const testProduct = {
                quantity: "",
                sellingDate: "2022-01-01",
            };

            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .patch(`${baseURL}/model/sell`)
                .send(testProduct);

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.sellProduct,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test("Returns 422 if sellingDate is not a string", async () => {
            const testProduct = {
                quantity: 1,
                sellingDate: 1,
            };

            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .patch(`${baseURL}/model/sell`)
                .send(testProduct);

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.sellProduct,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test(`Returns 404 if model does not represent an existing product`, async () => {
            const testProduct = {
                quantity: 1,
                sellingDate: "2022-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                ProductController.prototype,
                "sellProduct",
            ).mockRejectedValueOnce(new ProductNotFoundError());

            const response = await request(app)
                .patch(`${baseURL}/model/sell`)
                .send(testProduct);

            expect(response.status).toBe(404);
            expect(
                ProductController.prototype.sellProduct,
            ).toHaveBeenCalledTimes(1);
            expect(
                ProductController.prototype.sellProduct,
            ).toHaveBeenCalledWith(
                "model",
                testProduct.quantity,
                testProduct.sellingDate,
            );
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 400 if sellingDate is in the future`, async () => {
            const testProduct = {
                quantity: 1,
                sellingDate: "3000-01-01",
            };
            jest.spyOn(
                ProductController.prototype,
                "sellProduct",
            ).mockRejectedValueOnce(new DateError());
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .patch(`${baseURL}/model/sell`)
                .send(testProduct);

            expect(response.status).toBe(400);
            expect(
                ProductController.prototype.sellProduct,
            ).toHaveBeenCalledTimes(1);
            expect(
                ProductController.prototype.sellProduct,
            ).toHaveBeenCalledWith(
                "model",
                testProduct.quantity,
                testProduct.sellingDate,
            );
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 400 if sellingDate is before arrivalDate`, async () => {
            const testProduct = {
                quantity: 1,
                sellingDate: "2021-01-01",
            };
            jest.spyOn(
                ProductController.prototype,
                "sellProduct",
            ).mockRejectedValueOnce(new DateError());
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .patch(`${baseURL}/model/sell`)
                .send(testProduct);

            expect(response.status).toBe(400);
            expect(
                ProductController.prototype.sellProduct,
            ).toHaveBeenCalledTimes(1);
            expect(
                ProductController.prototype.sellProduct,
            ).toHaveBeenCalledWith(
                "model",
                testProduct.quantity,
                testProduct.sellingDate,
            );
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 409 if the available quantity is 0`, async () => {
            const testProduct = {
                quantity: 1,
                sellingDate: "2022-01-01",
            };
            jest.spyOn(
                ProductController.prototype,
                "sellProduct",
            ).mockRejectedValueOnce(new EmptyProductStockError());
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .patch(`${baseURL}/model/sell`)
                .send(testProduct);

            expect(response.status).toBe(409);
            expect(
                ProductController.prototype.sellProduct,
            ).toHaveBeenCalledTimes(1);
            expect(
                ProductController.prototype.sellProduct,
            ).toHaveBeenCalledWith(
                "model",
                testProduct.quantity,
                testProduct.sellingDate,
            );
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 409 if the requested quantity is greater than the available quantity`, async () => {
            const testProduct = {
                quantity: 2,
                sellingDate: "2022-01-01",
            };
            jest.spyOn(
                ProductController.prototype,
                "sellProduct",
            ).mockRejectedValueOnce(new LowProductStockError());
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .patch(`${baseURL}/model/sell`)
                .send(testProduct);

            expect(response.status).toBe(409);
            expect(
                ProductController.prototype.sellProduct,
            ).toHaveBeenCalledTimes(1);
            expect(
                ProductController.prototype.sellProduct,
            ).toHaveBeenCalledWith(
                "model",
                testProduct.quantity,
                testProduct.sellingDate,
            );
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });
    });

    describe(`GET ${baseURL}/`, () => {
        test(`Returns 200 if successful`, async () => {
            const testProduct = {
                model: "model",
                category: Category.APPLIANCE,
                quantity: 1,
                details: "details",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductController.prototype,
                "getProducts",
            ).mockResolvedValueOnce([testProduct]);
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app).get(`${baseURL}/`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual([testProduct]);
            expect(
                ProductController.prototype.getProducts,
            ).toHaveBeenCalledTimes(1);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 401 if user is not an admin or manager`, async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, res, _next) =>
                res.status(401).json({
                    error: "User is not an admin or manager",
                    status: 401,
                }),
            );

            const response = await request(app).get(`${baseURL}/`);

            expect(response.status).toBe(401);
            expect(
                ProductController.prototype.getProducts,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 200 if grouping is "category" and category is specified`, async () => {
            const testProduct = {
                model: "model",
                category: Category.APPLIANCE,
                quantity: 1,
                details: "details",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductController.prototype,
                "getProducts",
            ).mockResolvedValueOnce([testProduct]);
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app).get(
                `${baseURL}/?grouping=category&category=Appliance`,
            );

            expect(response.status).toBe(200);
            expect(response.body).toEqual([testProduct]);
            expect(
                ProductController.prototype.getProducts,
            ).toHaveBeenCalledTimes(1);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 200 if grouping is "model" and model is specified`, async () => {
            const testProduct = {
                model: "model",
                category: Category.APPLIANCE,
                quantity: 1,
                details: "details",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductController.prototype,
                "getProducts",
            ).mockResolvedValueOnce([testProduct]);
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app).get(
                `${baseURL}/?grouping=model&model=model`,
            );

            expect(response.status).toBe(200);
            expect(response.body).toEqual([testProduct]);
            expect(
                ProductController.prototype.getProducts,
            ).toHaveBeenCalledTimes(1);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 422 if grouping is null and any of category or model are specified`, async () => {
            jest.spyOn(
                ProductController.prototype,
                "getProducts",
            ).mockRejectedValueOnce(new IncorrectGroupingError());
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app).get(`${baseURL}/`);

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.getProducts,
            ).toHaveBeenCalledTimes(1);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 422 if grouping is "category" and category is null`, async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                ProductController.prototype,
                "getProducts",
            ).mockRejectedValueOnce(new IncorrectCategoryGroupingError());

            const response = await request(app).get(
                `${baseURL}/?grouping=category`,
            );

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.getProducts,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test(`Returns 422 if grouping is "category" and model is specified`, async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                ProductController.prototype,
                "getProducts",
            ).mockRejectedValueOnce(new IncorrectModelGroupingError());

            const response = await request(app).get(
                `${baseURL}/?grouping=category&model=model`,
            );

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.getProducts,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test(`Returns 422 if grouping is "model" and model is null`, async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                ProductController.prototype,
                "getProducts",
            ).mockRejectedValueOnce(new IncorrectModelGroupingError());

            const response = await request(app).get(
                `${baseURL}/?grouping=model`,
            );

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.getProducts,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test(`Returns 422 if grouping is "model" and category is specified`, async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                ProductController.prototype,
                "getProducts",
            ).mockRejectedValueOnce(new IncorrectCategoryGroupingError());

            const response = await request(app).get(
                `${baseURL}/?grouping=model&category=Appliance`,
            );

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.getProducts,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(0);
        });

        test(`Returns 404 if grouping is "model" and model does not represent an existing product`, async () => {
            jest.spyOn(
                ProductController.prototype,
                "getProducts",
            ).mockRejectedValueOnce(new ProductNotFoundError());
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app).get(
                `${baseURL}/?grouping=model&model=model`,
            );

            expect(response.status).toBe(404);
            expect(
                ProductController.prototype.getProducts,
            ).toHaveBeenCalledTimes(1);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });
    });

    describe(`GET ${baseURL}/available`, () => {
        test(`Returns 200 if successful`, async () => {
            const testProduct = {
                model: "model",
                category: Category.APPLIANCE,
                quantity: 1,
                details: "details",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isLoggedIn",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                ProductController.prototype,
                "getAvailableProducts",
            ).mockResolvedValueOnce([testProduct]);

            const response = await request(app).get(`${baseURL}/available`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual([testProduct]);
            expect(
                ProductController.prototype.getAvailableProducts,
            ).toHaveBeenCalledTimes(1);
            expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        });

        test(`Returns 401 if user is not logged in`, async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isLoggedIn",
            ).mockImplementation((_req, res, _next) =>
                res.status(401).json({
                    error: "User is not logged in",
                    status: 401,
                }),
            );

            const response = await request(app).get(`${baseURL}/available`);

            expect(response.status).toBe(401);
            expect(
                ProductController.prototype.getAvailableProducts,
            ).toHaveBeenCalledTimes(0);
            expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        });

        test(`Returns 200 if grouping is "category" and category is specified`, async () => {
            const testProduct = {
                model: "model",
                category: Category.APPLIANCE,
                quantity: 1,
                details: "details",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductController.prototype,
                "getAvailableProducts",
            ).mockResolvedValueOnce([testProduct]);
            jest.spyOn(
                Authenticator.prototype,
                "isLoggedIn",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app).get(
                `${baseURL}/available?grouping=category&category=Appliance`,
            );

            expect(response.status).toBe(200);
            expect(response.body).toEqual([testProduct]);
            expect(
                ProductController.prototype.getAvailableProducts,
            ).toHaveBeenCalledTimes(1);
            expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        });

        test(`Returns 200 if grouping is "model" and model is specified`, async () => {
            const testProduct = {
                model: "model",
                category: Category.APPLIANCE,
                quantity: 1,
                details: "details",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductController.prototype,
                "getAvailableProducts",
            ).mockResolvedValueOnce([testProduct]);
            jest.spyOn(
                Authenticator.prototype,
                "isLoggedIn",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app).get(
                `${baseURL}/available?grouping=model&model=model`,
            );

            expect(response.status).toBe(200);
            expect(response.body).toEqual([testProduct]);
            expect(
                ProductController.prototype.getAvailableProducts,
            ).toHaveBeenCalledTimes(1);
            expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        });

        test(`Returns 422 if grouping is null and any of category or model are specified`, async () => {
            jest.spyOn(
                ProductController.prototype,
                "getAvailableProducts",
            ).mockRejectedValueOnce(new IncorrectGroupingError());
            jest.spyOn(
                Authenticator.prototype,
                "isLoggedIn",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app).get(`${baseURL}/available`);

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.getAvailableProducts,
            ).toHaveBeenCalledTimes(1);
            expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        });

        test(`Returns 422 if grouping is "category" and category is null`, async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isLoggedIn",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app).get(
                `${baseURL}/available?grouping=category`,
            );

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.getAvailableProducts,
            ).toHaveBeenCalledTimes(0);
            expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(0);
        });

        test(`Returns 422 if grouping is "category" and model is specified`, async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isLoggedIn",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app).get(
                `${baseURL}/available?grouping=category&model=model`,
            );

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.getAvailableProducts,
            ).toHaveBeenCalledTimes(0);
            expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(0);
        });

        test(`Returns 422 if grouping is "model" and model is null`, async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isLoggedIn",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app).get(
                `${baseURL}/available?grouping=model`,
            );

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.getAvailableProducts,
            ).toHaveBeenCalledTimes(0);
            expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(0);
        });

        test(`Returns 422 if grouping is "model" and category is specified`, async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isLoggedIn",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app).get(
                `${baseURL}/available?grouping=model&category=Appliance`,
            );

            expect(response.status).toBe(422);
            expect(
                ProductController.prototype.getAvailableProducts,
            ).toHaveBeenCalledTimes(0);
            expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(0);
        });

        test(`Returns 404 if grouping is "model" and model does not represent an existing product`, async () => {
            jest.spyOn(
                ProductController.prototype,
                "getAvailableProducts",
            ).mockRejectedValueOnce(new ProductNotFoundError());
            jest.spyOn(
                Authenticator.prototype,
                "isLoggedIn",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app).get(
                `${baseURL}/available?grouping=model&model=model`,
            );

            expect(response.status).toBe(404);
            expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
        });
    });

    describe(`DELETE ${baseURL}/:model`, () => {
        test(`Returns 200 if successful`, async () => {
            jest.spyOn(
                ProductController.prototype,
                "deleteProduct",
            ).mockResolvedValueOnce(true);
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app).delete(`${baseURL}/model`);

            expect(response.status).toBe(200);
            expect(
                ProductController.prototype.deleteProduct,
            ).toHaveBeenCalledTimes(1);
            expect(
                ProductController.prototype.deleteProduct,
            ).toHaveBeenCalledWith("model");
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 401 if user is not an admin or manager`, async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, res, _next) =>
                res.status(401).json({
                    error: "User is not an admin or manager",
                    status: 401,
                }),
            );

            const response = await request(app).delete(`${baseURL}/model`);

            expect(response.status).toBe(401);
            expect(
                ProductController.prototype.deleteProduct,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 404 if model does not represent an existing product`, async () => {
            jest.spyOn(
                ProductController.prototype,
                "deleteProduct",
            ).mockRejectedValueOnce(new ProductNotFoundError());
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app).delete(`${baseURL}/model`);

            expect(response.status).toBe(404);
            expect(
                ProductController.prototype.deleteProduct,
            ).toHaveBeenCalledTimes(1);
            expect(
                ProductController.prototype.deleteProduct,
            ).toHaveBeenCalledWith("model");
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });
    });

    describe(`DELETE ${baseURL}/`, () => {
        test(`Returns 200 if successful`, async () => {
            jest.spyOn(
                ProductController.prototype,
                "deleteAllProducts",
            ).mockResolvedValueOnce(true);
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app).delete(`${baseURL}/`);

            expect(response.status).toBe(200);
            expect(
                ProductController.prototype.deleteAllProducts,
            ).toHaveBeenCalledTimes(1);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test("Returns 503 if an error occurs", async () => {
            jest.spyOn(
                ProductController.prototype,
                "deleteAllProducts",
            ).mockRejectedValueOnce(new Error());
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app).delete(`${baseURL}/`);

            expect(response.status).toBe(503);
            expect(
                ProductController.prototype.deleteAllProducts,
            ).toHaveBeenCalledTimes(1);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 401 if user is not an admin or manager`, async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, res, _next) =>
                res.status(401).json({
                    error: "User is not an admin or manager",
                    status: 401,
                }),
            );

            const response = await request(app).delete(`${baseURL}/`);

            expect(response.status).toBe(401);
            expect(
                ProductController.prototype.deleteAllProducts,
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });
    });
});
