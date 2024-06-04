import { test, expect, jest, describe, afterEach } from "@jest/globals";
import request from "supertest";
import {
    EmptyProductStockError,
    LowProductStockError,
    ProductNotFoundError,
} from "../../src/errors/productError";
import { Category, Product } from "../../src/components/product";
import { app } from "../../index";
import Authenticator from "../../src/routers/auth";
import CartController from "../../src/controllers/cartController";
import { Cart, ProductInCart } from "../../src/components/cart";
import { Role, User } from "../../src/components/user";
import {
    CartNotFoundError,
    EmptyCartError,
    ProductNotInCartError,
} from "../../src/errors/cartError";

const baseURL = "/ezelectronics/carts";

jest.mock("../../src/routers/auth");
jest.mock("../../src/controllers/cartController");

afterEach(() => {
    jest.resetAllMocks();
});

describe("CartRoutes", () => {
    describe(`GET ${baseURL}/`, () => {
        test("Returns 200 if successful", async () => {
            const testProduct = new Product(
                299,
                "prod123",
                Category.SMARTPHONE,
                "2022-01-01",
                "Details",
                1,
            );
            const testProductInCart = new ProductInCart(
                testProduct.model,
                testProduct.quantity,
                testProduct.category,
                testProduct.sellingPrice,
            );
            const testUser = new User(
                "testuser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                "",
            );
            const testCart = new Cart(testUser.username, false, null, 299, [
                testProductInCart,
            ]);

            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(CartController.prototype, "getCart").mockResolvedValue(
                testCart,
            );

            const response = await request(app).get(baseURL).expect(200);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.getCart).toHaveBeenCalledTimes(1);
            expect(response.body).toEqual(testCart);
        });

        test("Returns 401 if user is not a customer", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, res) => res.sendStatus(401));

            const response = await request(app).get(baseURL).expect(401);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
            expect(response.text).toBe("Unauthorized");
        });
    });

    describe(`POST ${baseURL}/`, () => {
        test("Returns 200 if successful", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(CartController.prototype, "addToCart").mockResolvedValue(
                true,
            );

            await request(app)
                .post(baseURL)
                .send({ model: "prod123" })
                .expect(200);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.addToCart).toHaveBeenCalledTimes(1);
        });

        test("Returns 401 if user is not a customer", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, res) => res.sendStatus(401));

            await request(app).post(baseURL).expect(401);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
        });

        test("Returns 404 if product does not exist", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(CartController.prototype, "addToCart").mockRejectedValue(
                new ProductNotFoundError(),
            );

            await request(app)
                .post(baseURL)
                .send({ model: "prod123" })
                .expect(404);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.addToCart).toHaveBeenCalledTimes(1);
        });

        test("Returns 409 if product is out of stock", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(CartController.prototype, "addToCart").mockRejectedValue(
                new EmptyProductStockError(),
            );

            await request(app)
                .post(baseURL)
                .send({ model: "prod123" })
                .expect(409);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.addToCart).toHaveBeenCalledTimes(1);
        });
    });

    describe(`PATCH ${baseURL}/`, () => {
        test("Returns 200 if successful", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                CartController.prototype,
                "checkoutCart",
            ).mockResolvedValue(true);

            await request(app)
                .patch(baseURL)
                .send({ model: "prod123", quantity: 2 })
                .expect(200);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.checkoutCart).toHaveBeenCalledTimes(
                1,
            );
        });

        test("Returns 401 if user is not a customer", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, res) => res.sendStatus(401));

            await request(app).patch(baseURL).expect(401);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
        });

        test("Returns 404 if there is no information about an unpaid cart", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                CartController.prototype,
                "checkoutCart",
            ).mockRejectedValue(new CartNotFoundError());

            await request(app).patch(baseURL).expect(404);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.checkoutCart).toHaveBeenCalledTimes(
                1,
            );
        });

        test("Returns 400 if there is an unpaid cart but it contains no products", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                CartController.prototype,
                "checkoutCart",
            ).mockRejectedValue(new EmptyCartError());

            await request(app).patch(baseURL).expect(400);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.checkoutCart).toHaveBeenCalledTimes(
                1,
            );
        });

        test("Returns 409 if there is at least one product in the cart that is out of stock", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                CartController.prototype,
                "checkoutCart",
            ).mockRejectedValue(new EmptyProductStockError());

            await request(app).patch(baseURL).expect(409);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.checkoutCart).toHaveBeenCalledTimes(
                1,
            );
        });

        test("Returns 409 if at least one product in the cart has a quantity higher than the available stock", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                CartController.prototype,
                "checkoutCart",
            ).mockRejectedValue(new LowProductStockError());

            await request(app).patch(baseURL).expect(409);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.checkoutCart).toHaveBeenCalledTimes(
                1,
            );
        });
    });

    describe(`GET ${baseURL}/history`, () => {
        test("Returns 200 if successful", async () => {
            const testProduct = new Product(
                299,
                "prod123",
                Category.SMARTPHONE,
                "2022-01-01",
                "Details",
                1,
            );
            const testProductInCart = new ProductInCart(
                testProduct.model,
                testProduct.quantity,
                testProduct.category,
                testProduct.sellingPrice,
            );
            const testUser = new User(
                "testuser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                "",
            );
            const testCart = new Cart(testUser.username, false, null, 299, [
                testProductInCart,
            ]);

            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                CartController.prototype,
                "getCustomerCarts",
            ).mockResolvedValue([testCart]);

            await request(app).get(`${baseURL}/history`).expect(200);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
            expect(
                CartController.prototype.getCustomerCarts,
            ).toHaveBeenCalledTimes(1);
        });

        test("Returns 401 if user is not a customer", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, res) => res.sendStatus(401));

            await request(app).get(`${baseURL}/history`).expect(401);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
        });
    });

    describe(`DELETE ${baseURL}/products/:model`, () => {
        test("Returns 200 if successful", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                CartController.prototype,
                "removeProductFromCart",
            ).mockResolvedValue(true);

            await request(app)
                .delete(`${baseURL}/products/prod123`)
                .expect(200);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
            expect(
                CartController.prototype.removeProductFromCart,
            ).toHaveBeenCalledTimes(1);
        });

        test("Returns 401 if user is not a customer", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, res) => res.sendStatus(401));

            await request(app)
                .delete(`${baseURL}/products/prod123`)
                .expect(401);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
        });

        test("Returns 404 if model is empty", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, _res, next) => next());

            await request(app).delete(`${baseURL}/products/`).expect(404);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(0);
            expect(
                CartController.prototype.removeProductFromCart,
            ).toHaveBeenCalledTimes(0);
        });

        test("Returns 404 if product does not exist", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                CartController.prototype,
                "removeProductFromCart",
            ).mockRejectedValue(new ProductNotFoundError());

            await request(app)
                .delete(`${baseURL}/products/prod123`)
                .expect(404);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
            expect(
                CartController.prototype.removeProductFromCart,
            ).toHaveBeenCalledTimes(1);
        });

        test("Returns 404 if there is no information about an unpaid cart, or if there are no products in the cart", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                CartController.prototype,
                "removeProductFromCart",
            ).mockRejectedValue(new CartNotFoundError());

            await request(app)
                .delete(`${baseURL}/products/prod123`)
                .expect(404);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
            expect(
                CartController.prototype.removeProductFromCart,
            ).toHaveBeenCalledTimes(1);
        });

        test("Returns 404 if the product is not in the cart", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                CartController.prototype,
                "removeProductFromCart",
            ).mockRejectedValue(new ProductNotInCartError());

            await request(app)
                .delete(`${baseURL}/products/prod123`)
                .expect(404);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
            expect(
                CartController.prototype.removeProductFromCart,
            ).toHaveBeenCalledTimes(1);
        });
    });

    describe(`DELETE ${baseURL}/current`, () => {
        test("Returns 200 if successful", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(CartController.prototype, "clearCart").mockResolvedValue(
                true,
            );

            await request(app).delete(`${baseURL}/current`).expect(200);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.clearCart).toHaveBeenCalledTimes(1);
        });

        test("Returns 401 if user is not a customer", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, res) => res.sendStatus(401));

            await request(app).delete(`${baseURL}/current`).expect(401);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
        });

        test("Returns 404 if there is no information about an unpaid cart", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(CartController.prototype, "clearCart").mockRejectedValue(
                new CartNotFoundError(),
            );

            await request(app).delete(`${baseURL}/current`).expect(404);

            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.clearCart).toHaveBeenCalledTimes(1);
        });
    });

    describe(`DELETE ${baseURL}/`, () => {
        test("Returns 200 if successful", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                CartController.prototype,
                "deleteAllCarts",
            ).mockResolvedValue(true);

            await request(app).delete(baseURL).expect(200);

            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
            expect(
                CartController.prototype.deleteAllCarts,
            ).toHaveBeenCalledTimes(1);
        });

        test("Returns 401 if user is not an admin or manager", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, res) => res.sendStatus(401));

            await request(app).delete(baseURL).expect(401);

            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });
    });

    describe(`GET ${baseURL}/all`, () => {
        test("Returns 200 if successful", async () => {
            const testProduct = new Product(
                299,
                "prod123",
                Category.SMARTPHONE,
                "2022-01-01",
                "Details",
                1,
            );
            const testProductInCart = new ProductInCart(
                testProduct.model,
                testProduct.quantity,
                testProduct.category,
                testProduct.sellingPrice,
            );
            const testUser = new User(
                "testuser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                "",
            );
            const testCart = new Cart(testUser.username, false, null, 299, [
                testProductInCart,
            ]);

            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                CartController.prototype,
                "getAllCarts",
            ).mockResolvedValue([testCart]);

            await request(app).get(`${baseURL}/all`).expect(200);

            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.getAllCarts).toHaveBeenCalledTimes(
                1,
            );
        });

        test("Returns 401 if user is not an admin or manager", async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager",
            ).mockImplementation((_req, res) => res.sendStatus(401));

            await request(app).get(`${baseURL}/all`).expect(401);

            expect(
                Authenticator.prototype.isAdminOrManager,
            ).toHaveBeenCalledTimes(1);
        });
    });
});
