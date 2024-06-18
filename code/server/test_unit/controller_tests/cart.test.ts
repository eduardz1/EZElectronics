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
    EmptyCartError,
    ProductNotInCartError,
} from "../../src/errors/cartError";
import {
    ProductNotFoundError,
    EmptyProductStockError,
    LowProductStockError,
    ProductSoldError,
} from "../../src/errors/productError";
import { Category } from "../../src/components/product";
import { Cart } from "../../src/components/cart";

beforeEach(() => {
    jest.mock("../../src/dao/cartDAO");
    jest.mock("../../src/dao/productDAO");
});

afterEach(() => {
    jest.resetAllMocks();
});

describe("CartController", () => {
    describe("addToCart", () => {
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
                ""
            );
            const testCart = new Cart(testUser.username, false, null, 0, [
                {
                    model: testProduct.model,
                    quantity: 1,
                    category: testProduct.category,
                    price: testProduct.sellingPrice,
                },
            ]);

            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel"
            ).mockResolvedValueOnce(testProduct);
            jest.spyOn(CartDAO.prototype, "addToCart").mockResolvedValueOnce(
                true
            );
            jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(
                testCart
            );

            const controller = new CartController();
            const response = await controller.addToCart(
                testUser,
                testProduct.model
            );

            expect(
                ProductDAO.prototype.getProductByModel
            ).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testProduct.model
            );
            expect(CartDAO.prototype.addToCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.addToCart).toHaveBeenCalledWith(
                testUser,
                testProduct.model
            );
            expect(CartDAO.prototype.getCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.getCart).toHaveBeenCalledWith(testUser);
            expect(response).toBe(true);
        });

        test("Returns an empty cart if the user does not have a cart", async () => {
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
                ""
            );
            const emptyCart = new Cart(testUser.username, false, null, 0, []);

            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel"
            ).mockResolvedValueOnce(testProduct);
            jest.spyOn(CartDAO.prototype, "addToCart").mockResolvedValueOnce(
                true
            );
            jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(
                null
            );
            jest.spyOn(CartDAO.prototype, "createCart").mockResolvedValueOnce(
                emptyCart
            );

            const controller = new CartController();
            const response = await controller.addToCart(
                testUser,
                testProduct.model
            );

            expect(
                ProductDAO.prototype.getProductByModel
            ).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testProduct.model
            );
            expect(CartDAO.prototype.addToCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.addToCart).toHaveBeenCalledWith(
                testUser,
                testProduct.model
            );
            expect(CartDAO.prototype.getCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.getCart).toHaveBeenCalledWith(testUser);
            expect(CartDAO.prototype.createCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.createCart).toHaveBeenCalledWith(testUser);
            expect(response).toBe(true);
        });

        test("Fails in adding a product that does not exist to the cart", async () => {
            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                ""
            );
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel"
            ).mockResolvedValueOnce(null);

            const controller = new CartController();
            await expect(
                controller.addToCart(testUser, "nonExistentModel")
            ).rejects.toThrow(ProductNotFoundError);
        });

        test("Fails in adding a product to the cart that is out of stock", async () => {
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
                ""
            );

            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel"
            ).mockResolvedValueOnce(testProduct);

            const controller = new CartController();
            await expect(
                controller.addToCart(testUser, testProduct.model)
            ).rejects.toThrow(EmptyProductStockError);
        });
    });

    describe("getCart", () => {
        test("Get all items in the user's cart", async () => {
            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                ""
            );
            const testCart = new Cart(testUser.username, false, null, 0, [
                {
                    model: "model123",
                    quantity: 1,
                    category: Category.SMARTPHONE,
                    price: 100,
                },
            ]);

            jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(
                testCart
            );

            const controller = new CartController();
            const response = await controller.getCart(testUser);

            expect(CartDAO.prototype.getCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.getCart).toHaveBeenCalledWith(testUser);
            expect(response).toEqual(testCart);
        });

        test("Get cart items for a user with an empty cart", async () => {
            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                ""
            );
            jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(
                null
            );

            const controller = new CartController();
            const response = await controller.getCart(testUser);

            expect(CartDAO.prototype.getCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.getCart).toHaveBeenCalledWith(testUser);
            expect(response).toEqual(
                new Cart(testUser.username, false, null, 0, [])
            );
        });
    });

    describe("checkoutCart", () => {
        test("Checkout the cart", async () => {
            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                ""
            );

            jest.spyOn(CartDAO.prototype, "checkoutCart").mockResolvedValueOnce(
                true
            );
            jest.spyOn(CartDAO.prototype, "checkoutCart").mockResolvedValueOnce(
                true
            );

            const controller = new CartController();
            const response = await controller.checkoutCart(testUser);

            expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledWith(
                testUser
            );

            expect(response).toBe(true);
        });

        test("No information about an unpaid cart exists", async () => {
            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                ""
            );

            jest.spyOn(CartDAO.prototype, "checkoutCart").mockRejectedValue(
                new CartNotFoundError()
            );

            const controller = new CartController();
            await expect(controller.checkoutCart(testUser)).rejects.toThrow(
                CartNotFoundError
            );

            expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledWith(
                testUser
            );
        });

        test("Checkout an empty cart", async () => {
            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                ""
            );

            jest.spyOn(CartDAO.prototype, "checkoutCart").mockRejectedValue(
                new EmptyCartError()
            );

            const controller = new CartController();
            await expect(controller.checkoutCart(testUser)).rejects.toThrow(
                EmptyCartError
            );

            expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledWith(
                testUser
            );
        });

        test("At least one of the products in the cart is not found", async () => {
            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                ""
            );

            jest.spyOn(CartDAO.prototype, "checkoutCart").mockRejectedValue(
                new ProductNotFoundError()
            );

            const controller = new CartController();
            await expect(controller.checkoutCart(testUser)).rejects.toThrow(
                ProductNotFoundError
            );

            expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledWith(
                testUser
            );
        });

        test("At least one of the products in the cart is out of stock", async () => {
            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                ""
            );

            jest.spyOn(CartDAO.prototype, "checkoutCart").mockRejectedValueOnce(
                new ProductSoldError()
            );

            const controller = new CartController();
            await expect(controller.checkoutCart(testUser)).rejects.toThrow(
                ProductSoldError
            );

            expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledWith(
                testUser
            );
        });

        test("At least one of the products in the cart is low on stock", async () => {
            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                ""
            );

            jest.spyOn(CartDAO.prototype, "checkoutCart").mockRejectedValue(
                new LowProductStockError()
            );

            const controller = new CartController();
            await expect(controller.checkoutCart(testUser)).rejects.toThrow(
                LowProductStockError
            );

            expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledWith(
                testUser
            );
        });
    });

    describe("getCustomerCarts", () => {
        test("Get all carts for a customer", async () => {
            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                ""
            );
            const testCart = new Cart(testUser.username, false, null, 0, [
                {
                    model: "model123",
                    quantity: 1,
                    category: Category.SMARTPHONE,
                    price: 100,
                },
            ]);

            jest.spyOn(
                CartDAO.prototype,
                "getCustomerCarts"
            ).mockResolvedValueOnce([testCart]);

            const controller = new CartController();
            const response = await controller.getCustomerCarts(testUser);

            expect(CartDAO.prototype.getCustomerCarts).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.getCustomerCarts).toHaveBeenCalledWith(
                testUser
            );
            expect(response).toEqual([testCart]);
        });

        test("Get carts for a customer with no carts", async () => {
            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                ""
            );

            jest.spyOn(
                CartDAO.prototype,
                "getCustomerCarts"
            ).mockResolvedValueOnce([]);

            const controller = new CartController();
            const response = await controller.getCustomerCarts(testUser);

            expect(CartDAO.prototype.getCustomerCarts).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.getCustomerCarts).toHaveBeenCalledWith(
                testUser
            );
            expect(response).toEqual([]);
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
                ""
            );
            const testProduct = {
                model: "testModel",
                category: Category.SMARTPHONE,
                quantity: 10,
                details: "test details",
                sellingPrice: 100,
                arrivalDate: "2022-01-01",
            };
            const testCart = new Cart(testUser.username, false, null, 0, [
                {
                    model: "testModel",
                    quantity: 1,
                    category: Category.SMARTPHONE,
                    price: 100,
                },
            ]);

            jest.spyOn(
                CartDAO.prototype,
                "removeProductFromCart"
            ).mockResolvedValueOnce(true);
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel"
            ).mockResolvedValueOnce(testProduct);
            jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(
                testCart
            );

            const controller = new CartController();
            const response = await controller.removeProductFromCart(
                testUser,
                "testModel"
            );

            expect(
                CartDAO.prototype.removeProductFromCart
            ).toHaveBeenCalledTimes(1);
            expect(
                CartDAO.prototype.removeProductFromCart
            ).toHaveBeenCalledWith(testUser, "testModel");
            expect(
                ProductDAO.prototype.getProductByModel
            ).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                "testModel"
            );
            expect(CartDAO.prototype.getCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.getCart).toHaveBeenCalledWith(testUser);

            expect(response).toBe(true);
        });

        test("Remove a product from the cart that does not exist", async () => {
            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                ""
            );

            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel"
            ).mockResolvedValueOnce(null);

            const controller = new CartController();
            await expect(
                controller.removeProductFromCart(testUser, "nonExistentModel")
            ).rejects.toThrow(ProductNotFoundError);

            expect(
                ProductDAO.prototype.getProductByModel
            ).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                "nonExistentModel"
            );
        });

        test("Remove a product from the cart that is not in the cart", async () => {
            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                ""
            );
            const testProduct = {
                model: "testModel",
                category: Category.SMARTPHONE,
                quantity: 10,
                details: "test details",
                sellingPrice: 100,
                arrivalDate: "2022-01-01",
            };
            const testCart = new Cart(testUser.username, false, null, 0, [
                {
                    model: "anotherModel",
                    quantity: 1,
                    category: Category.SMARTPHONE,
                    price: 100,
                },
            ]);

            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel"
            ).mockResolvedValueOnce(testProduct);
            jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(
                testCart
            );

            const controller = new CartController();
            await expect(
                controller.removeProductFromCart(testUser, testProduct.model)
            ).rejects.toThrow(ProductNotInCartError);

            expect(
                ProductDAO.prototype.getProductByModel
            ).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testProduct.model
            );
            expect(CartDAO.prototype.getCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.getCart).toHaveBeenCalledWith(testUser);
        });

        test("Tries to remove a product from cart but no unpaid cart exists", async () => {
            const testProduct = {
                model: "testModel",
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
                ""
            );

            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel"
            ).mockResolvedValueOnce(testProduct);
            jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(
                null
            );

            const controller = new CartController();
            await expect(
                controller.removeProductFromCart(testUser, testProduct.model)
            ).rejects.toThrow(CartNotFoundError);

            expect(
                ProductDAO.prototype.getProductByModel
            ).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testProduct.model
            );
            expect(CartDAO.prototype.getCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.getCart).toHaveBeenCalledWith(testUser);
        });

        test("Tries to remove a product from cart but the cart is empty", async () => {
            const testProduct = {
                model: "testModel",
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
                ""
            );
            const testCart = new Cart(testUser.username, false, null, 0, []);

            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel"
            ).mockResolvedValueOnce(testProduct);
            jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(
                testCart
            );

            const controller = new CartController();
            await expect(
                controller.removeProductFromCart(testUser, testProduct.model)
            ).rejects.toThrow(CartNotFoundError);

            expect(
                ProductDAO.prototype.getProductByModel
            ).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testProduct.model
            );
            expect(CartDAO.prototype.getCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.getCart).toHaveBeenCalledWith(testUser);
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
                ""
            );
            jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(
                new Cart(testUser.username, false, null, 0, [])
            );
            jest.spyOn(CartDAO.prototype, "clearCart").mockResolvedValueOnce(
                true
            );

            const controller = new CartController();
            const response = await controller.clearCart(testUser);

            expect(CartDAO.prototype.clearCart).toHaveBeenCalledTimes(1);
            expect(CartDAO.prototype.clearCart).toHaveBeenCalledWith(testUser);
            expect(response).toBe(true);
        });

        test("Clear all items from the user's cart but no unpaid cart exists", async () => {
            const testUser: User = new User(
                "testUser",
                "Test",
                "User",
                Role.CUSTOMER,
                "",
                ""
            );
            jest.spyOn(CartDAO.prototype, "getCart").mockRejectedValue(
                new CartNotFoundError()
            );

            const controller = new CartController();
            await expect(controller.clearCart(testUser)).rejects.toThrow(
                CartNotFoundError
            );

            expect(CartDAO.prototype.clearCart).toHaveBeenCalledTimes(0);
        });
    });

    describe("deleteAllCarts", () => {
        test("Delete all carts from the database", async () => {
            jest.spyOn(
                CartDAO.prototype,
                "deleteAllCarts"
            ).mockResolvedValueOnce(true);

            const controller = new CartController();
            const response = await controller.deleteAllCarts();

            expect(CartDAO.prototype.deleteAllCarts).toHaveBeenCalledTimes(1);
            expect(response).toBe(true);
        });
    });

    describe("getAllCarts", () => {
        test("Get all carts from the database", async () => {
            const testCart = new Cart("testUser", false, null, 0, []);

            jest.spyOn(CartDAO.prototype, "getAllCarts").mockResolvedValueOnce([
                testCart,
            ]);

            const controller = new CartController();
            const response = await controller.getAllCarts();

            expect(CartDAO.prototype.getAllCarts).toHaveBeenCalledTimes(1);
            expect(response).toEqual([testCart]);
        });

        test("Get all carts from the database but none exist", async () => {
            jest.spyOn(CartDAO.prototype, "getAllCarts").mockResolvedValueOnce(
                []
            );

            const controller = new CartController();
            const response = await controller.getAllCarts();

            expect(CartDAO.prototype.getAllCarts).toHaveBeenCalledTimes(1);
            expect(response).toEqual([]);
        });
    });
});
