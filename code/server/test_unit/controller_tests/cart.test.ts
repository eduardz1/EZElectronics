import {
    test,
    expect,
    jest,
    beforeEach,
    afterEach,
    describe,
} from "@jest/globals";
import CartController from "../../src/controllers/cartController";
import CartDAO from "../../src/dao/cartDAO";
import ProductDAO from "../../src/dao/productDAO";
import { User, Role } from "../../src/components/user";
import {
    CartNotFoundError,
    ProductNotInCartError,
} from "../../src/errors/cartError";
import {
    ProductNotFoundError,
    EmptyProductStockError,
} from "../../src/errors/productError";
import { Category, Product } from "../../src/components/product";
import { Cart } from "../../src/components/cart";

beforeEach(() => {
    jest.mock("../../src/dao/cartDAO");
    jest.mock("../../src/dao/productDAO");
});

afterEach(() => {
    jest.resetAllMocks();
});

describe("CartController", () => {
    describe("addProductToCart", () => {
        test("Add a valid product to the cart", async () => {
            const testProduct = {
                model: "test",
                category: Category.SMARTPHONE,
                quantity: 10,
                details: "test details",
                sellingPrice: 100,
                arrivalDate: "2022-01-01",
            };
            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                "",
            );

            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(testProduct);
            jest.spyOn(CartDAO.prototype, "addToCart").mockResolvedValueOnce(
                true,
            );

            const controller = new CartController();
            const response = await controller.addProductToCart(
                testUser,
                testProduct.model,
            );

            expect(
                ProductDAO.prototype.getProductByModel,
            ).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testProduct.model,
            );
            expect(CartDAO.prototype.addToCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.addToCart).toHaveBeenCalledWith(
                testUser,
                testProduct.model,
            );
            expect(response).toBe(true);
        });

        test("Add a product that does not exist to the cart", async () => {
            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                "",
            );
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(null);

            const controller = new CartController();
            await expect(
                controller.addProductToCart(testUser, "nonExistentModel"),
            ).rejects.toThrow(ProductNotFoundError);
        });

        test("Add a product to the cart that is out of stock", async () => {
            const testProduct = {
                model: "test",
                category: Category.SMARTPHONE,
                quantity: 0,
                details: "test details",
                sellingPrice: 100,
                arrivalDate: "2022-01-01",
            };
            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                "",
            );

            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(testProduct);

            const controller = new CartController();
            await expect(
                controller.addToCart(testUser, testProduct.model),
            ).rejects.toThrow(ProductNotFoundError);
        });
    });

    describe("removeProductFromCart", () => {
        test("Remove a product from the cart", async () => {
            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                "",
            );
            jest.spyOn(
                CartDAO.prototype,
                "removeProductFromCart",
            ).mockResolvedValueOnce(true);

            const controller = new CartController();
            const response = await controller.removeProductFromCart(
                testUser,
                "testModel",
            );

            expect(
                CartDAO.prototype.removeProductFromCart,
            ).toHaveBeenCalledTimes(1);
            expect(
                CartDAO.prototype.removeProductFromCart,
            ).toHaveBeenCalledWith(testUser, "testModel");
            expect(response).toBe(true);
        });

        test("Remove a product from the cart that does not exist", async () => {
            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                "",
            );
            jest.spyOn(
                CartDAO.prototype,
                "removeProductFromCart",
            ).mockResolvedValueOnce(false);

            const controller = new CartController();
            await expect(
                controller.removeProductFromCart(testUser, "nonExistentModel"),
            ).rejects.toThrow(ProductNotInCartError);
        });
    });

    describe("getCartItems", () => {
        test("Get all items in the user's cart", async () => {
            const testProduct: Product = {
                model: "model123",
                category: Category.Electronics,
                quantity: 10,
                details: "test details",
                sellingPrice: 100,
                arrivalDate: "2022-01-01",
            };

            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                "",
            );

            jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(
                testProduct,
            );

            const controller = new CartController();
            const response = await controller.getCart(testUser);

            expect(CartDAO.prototype.getCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.getCart).toHaveBeenCalledWith(testUser);
            expect(response).toEqual(testCartItems);
        });

        test("Get cart items for a user with an empty cart", async () => {
            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                "",
            );
            jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce([]);

            const controller = new CartController();
            const response = await controller.getCart(testUser);

            expect(CartDAO.prototype.getCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.getCart).toHaveBeenCalledWith(testUser);
            expect(response).toEqual([]);
        });
    });

    describe("clearCart", () => {
        test("Clear all items from the user's cart", async () => {
            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                "",
            );
            jest.spyOn(CartDAO.prototype, "clearCart").mockResolvedValueOnce(
                true,
            );

            const controller = new CartController();
            const response = await controller.clearCart(testUser);

            expect(CartDAO.prototype.clearCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.clearCart).toHaveBeenCalledWith(testUser);
            expect(response).toBe(true);
        });
    });
});
