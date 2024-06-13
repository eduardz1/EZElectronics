import { describe, test, expect, afterEach, jest } from "@jest/globals";
import db from "../../src/db/db";

import { Database } from "sqlite3";
import CartDAO from "../../src/dao/cartDAO";
import { Role } from "../../src/components/user";
import { Cart } from "../../src/components/cart";
import { Category } from "../../src/components/product";
import { customer } from "../../test_integration/helpers.test";
import { CartNotFoundError, EmptyCartError } from "../../src/errors/cartError";
import {
    LowProductStockError,
    ProductSoldError,
} from "../../src/errors/productError";

jest.mock("../../src/db/db.ts");

afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
});

describe("CartDAO", () => {
    describe("addToCart", () => {
        test("Adds an already existing product to a Cart", async () => {
            const testUser = {
                username: "testUsername",
                name: "testName",
                surname: "testSurname",
                role: Role.CUSTOMER,
                address: "testAddress",
                birthdate: "2021-10-10",
            };

            const testCartItem = {
                user: testUser,
                productId: "testId1",
                quantity: 10,
            };

            const row = {
                sellingPrice: 10,
                productsInCartId: 1,
                cartsId: 1,
            };

            const cartDAO = new CartDAO();
            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, { row });
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );

            const result = await cartDAO.addToCart(
                testCartItem.user,
                testCartItem.productId,
            );
            expect(result).toBe(true);
        });

        test("Adds a new product to a Cart", async () => {
            const testUser = {
                username: "testUsername",
                name: "testName",
                surname: "testSurname",
                role: Role.CUSTOMER,
                address: "testAddress",
                birthdate: "2021-10-10",
            };

            const testCartItem = {
                user: testUser,
                productId: "testId1",
                quantity: 10,
            };

            const cartDAO = new CartDAO();
            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, null);
                    return {} as Database;
                },
            );
            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, testCartItem);
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );

            const result = await cartDAO.addToCart(
                testCartItem.user,
                testCartItem.productId,
            );
            expect(result).toBe(true);
        });

        test("Fails to get join from carts, products_in_cart and products", async () => {
            const testUser = {
                username: "testUsername",
                name: "testName",
                surname: "testSurname",
                role: Role.CUSTOMER,
                address: "testAddress",
                birthdate: "2021-10-10",
            };

            const testCartItem = {
                user: testUser,
                productId: "testId1",
                quantity: 10,
            };

            const cartDAO = new CartDAO();
            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );

            await cartDAO
                .addToCart(testCartItem.user, testCartItem.productId)
                .catch((error) => {
                    expect(error).toBeInstanceOf(Error);
                });
        });

        test("Fails to update products_in_cart", async () => {
            const testUser = {
                username: "testUsername",
                name: "testName",
                surname: "testSurname",
                role: Role.CUSTOMER,
                address: "testAddress",
                birthdate: "2021-10-10",
            };

            const testCartItem = {
                user: testUser,
                productId: "testId1",
                quantity: 10,
            };

            const row = {
                sellingPrice: 10,
                productsInCartId: 1,
                cartsId: 1,
            };

            const cartDAO = new CartDAO();
            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, { row });
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );

            await cartDAO
                .addToCart(testCartItem.user, testCartItem.productId)
                .catch((error) => {
                    expect(error).toBeInstanceOf(Error);
                });
        });

        test("Fails to update carts", async () => {
            const testUser = {
                username: "testUsername",
                name: "testName",
                surname: "testSurname",
                role: Role.CUSTOMER,
                address: "testAddress",
                birthdate: "2021-10-10",
            };

            const testCartItem = {
                user: testUser,
                productId: "testId1",
                quantity: 10,
            };

            const row = {
                sellingPrice: 10,
                productsInCartId: 1,
                cartsId: 1,
            };

            const cartDAO = new CartDAO();
            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, { row });
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );

            await cartDAO
                .addToCart(testCartItem.user, testCartItem.productId)
                .catch((error) => {
                    expect(error).toBeInstanceOf(Error);
                });
        });

        test("Fails to get unpaid cart", async () => {
            const testUser = {
                username: "testUsername",
                name: "testName",
                surname: "testSurname",
                role: Role.CUSTOMER,
                address: "testAddress",
                birthdate: "2021-10-10",
            };

            const testCartItem = {
                user: testUser,
                productId: "testId1",
                quantity: 10,
            };

            const cartDAO = new CartDAO();
            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, null);
                    return {} as Database;
                },
            );
            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );

            await cartDAO
                .addToCart(testCartItem.user, testCartItem.productId)
                .catch((error) => {
                    expect(error).toBeInstanceOf(Error);
                });

            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, null);
                    return {} as Database;
                },
            );

            await cartDAO
                .addToCart(testCartItem.user, testCartItem.productId)
                .catch((error) => {
                    expect(error).toBeInstanceOf(Error);
                });
        });

        test("Fails to insert into products_in_cart", async () => {
            const testUser = {
                username: "testUsername",
                name: "testName",
                surname: "testSurname",
                role: Role.CUSTOMER,
                address: "testAddress",
                birthdate: "2021-10-10",
            };
            const testCartItem = {
                user: testUser,
                productId: "testId1",
                quantity: 10,
            };

            const cartDAO = new CartDAO();
            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, null);
                    return {} as Database;
                },
            );
            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, testCartItem);
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );

            await cartDAO
                .addToCart(testCartItem.user, testCartItem.productId)
                .catch((error) => {
                    expect(error).toBeInstanceOf(Error);
                });
        });

        test("Fails to update carts for new products", async () => {
            const testUser = {
                username: "testUsername",
                name: "testName",
                surname: "testSurname",
                role: Role.CUSTOMER,
                address: "testAddress",
                birthdate: "2021-10-10",
            };
            const testCartItem = {
                user: testUser,
                productId: "testId1",
                quantity: 10,
            };

            const cartDAO = new CartDAO();
            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, null);
                    return {} as Database;
                },
            );
            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, testCartItem);
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );

            await cartDAO
                .addToCart(testCartItem.user, testCartItem.productId)
                .catch((error) => {
                    expect(error).toBeInstanceOf(Error);
                });
        });
    });

    describe("getCart", () => {
        test("Gets a user's cart", async () => {
            const productsInCart = [
                {
                    model: "testModel1",
                    quantity: 5,
                    category: Category.SMARTPHONE,
                    price: 20,
                },
                {
                    model: "testModel2",
                    quantity: 3,
                    category: Category.APPLIANCE,
                    price: 15,
                },
            ];

            const cartRow = {
                id: 1,
                total: 145,
                paid: 0,
                paymentDate: null,
                customer: customer.username,
            };

            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, cartRow);
                    return {} as Database;
                },
            );
            jest.spyOn(
                CartDAO.prototype,
                "getProductsInCart",
            ).mockImplementation(async (_customer, _id) => {
                return productsInCart;
            });

            const cartDAO = new CartDAO();

            const result = await cartDAO.getCart(customer);

            expect(result).toEqual(
                new Cart(
                    cartRow.customer,
                    false,
                    null,
                    cartRow.total,
                    productsInCart,
                ),
            );
        });

        test("Fails to get a user's cart", async () => {
            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, null);
                    return {} as Database;
                },
            );

            const cartDAO = new CartDAO();

            const result = await cartDAO.getCart(customer);

            expect(result).toBeNull();

            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );

            await expect(cartDAO.getCart(customer)).rejects.toBeInstanceOf(
                Error,
            );
        });

        test("Fails to get products in cart", async () => {
            const cartRow = {
                id: 1,
                total: 145,
                paid: 0,
                paymentDate: null,
                customer: customer.username,
            };

            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, cartRow);
                    return {} as Database;
                },
            );
            const cartDAO = new CartDAO();

            jest.spyOn(
                CartDAO.prototype,
                "getProductsInCart",
            ).mockImplementation(async (_customer, _id) => {
                throw new Error();
            });

            await expect(cartDAO.getCart(customer)).rejects.toBeInstanceOf(
                Error,
            );
        });

        test("Error in `getProductsInCart`", async () => {
            const cartRow = {
                id: 1,
                total: 145,
                paid: 0,
                paymentDate: null,
                customer: customer.username,
            };

            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, cartRow);
                    return {} as Database;
                },
            );
            const cartDAO = new CartDAO();

            jest.spyOn(
                CartDAO.prototype,
                "getProductsInCart",
            ).mockImplementation(async (_customer, _id) => {
                throw new Error();
            });

            await expect(cartDAO.getCart(customer)).rejects.toBeInstanceOf(
                Error,
            );
        });
    });

    describe("getProductsInCart", () => {
        test("Gets a user's products in cart", async () => {
            const testCartItem = {
                model: "testModel1",
                quantity: 5,
                category: Category.SMARTPHONE,
                price: 20,
            };
            const testCartItem2 = {
                model: "testModel2",
                quantity: 3,
                category: Category.APPLIANCE,
                price: 15,
            };

            const cartDAO = new CartDAO();
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, [
                        {
                            model: "testModel1",
                            quantity: 5,
                            category: Category.SMARTPHONE,
                            sellingPrice: 20,
                        },
                        {
                            model: "testModel2",
                            quantity: 3,
                            category: Category.APPLIANCE,
                            sellingPrice: 15,
                        },
                    ]);
                    return {} as Database;
                },
            );
            const result = await cartDAO.getProductsInCart(customer, "1");
            expect(result).toEqual([testCartItem, testCartItem2]);
        });

        test("Gets a user's products in cart (one product)", async () => {
            const testCartItem = {
                model: "testModel1",
                quantity: 5,
                category: Category.SMARTPHONE,
                price: 20,
            };

            const cartDAO = new CartDAO();
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, [
                        {
                            model: "testModel1",
                            quantity: 5,
                            category: Category.SMARTPHONE,
                            sellingPrice: 20,
                        },
                    ]);
                    return {} as Database;
                },
            );
            const result = await cartDAO.getProductsInCart(customer, "1");
            expect(result).toEqual([testCartItem]);
        });

        test("Gets a user's products in cart (empty)", async () => {
            const testUser = {
                username: "testUsername",
                name: "testName",
                surname: "testSurname",
                role: Role.CUSTOMER,
                address: "testAddress",
                birthdate: "2021-10-10",
            };

            const testCartItem = {
                user: testUser,
                productId: "testId1",
            };

            const cartDAO = new CartDAO();
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, []);
                    return {} as Database;
                },
            );
            const result = await cartDAO.getProductsInCart(
                testCartItem.user,
                testCartItem.productId,
            );
            expect(result).toEqual([]);
        });

        test("Fails to get a user's products in cart", async () => {
            const cartDAO = new CartDAO();
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );
            await expect(
                cartDAO.getProductsInCart(customer, "1"),
            ).rejects.toBeInstanceOf(Error);
        });
    });

    describe("checkoutCart", () => {
        test("Checks out a user's cart", async () => {
            const testCartRow = {
                customer: customer.username,
                paid: 0,
                paymentDate: null,
                total: 100,
            };

            const productsInCart = [
                {
                    model: "testModel1",
                    quantity: 5,
                    category: Category.SMARTPHONE,
                    price: 20,
                },
                {
                    model: "testModel2",
                    quantity: 3,
                    category: Category.APPLIANCE,
                    price: 15,
                },
            ];

            const cartDAO = new CartDAO();

            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, testCartRow);
                    return {} as Database;
                },
            );
            jest.spyOn(
                CartDAO.prototype,
                "getProductsInCart",
            ).mockImplementation(async (_customer, _id) => {
                return productsInCart;
            });
            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, { quantity: 7 });
                    return {} as Database;
                },
            );
            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, { quantity: 5 });
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );

            const result = await cartDAO.checkoutCart(customer);

            expect(result).toBe(true);
        });

        test("Error in selecting the unpaid cart", async () => {
            const cartDAO = new CartDAO();

            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );

            await expect(cartDAO.checkoutCart(customer)).rejects.toBeInstanceOf(
                Error,
            );
        });

        test("No unpaid cart found", async () => {
            const cartDAO = new CartDAO();

            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, null);
                    return {} as Database;
                },
            );

            await expect(cartDAO.checkoutCart(customer)).rejects.toBeInstanceOf(
                CartNotFoundError,
            );
        });

        test("No products in cart", async () => {
            const testCartRow = {
                customer: customer.username,
                paid: 0,
                paymentDate: null,
                total: 100,
            };

            const cartDAO = new CartDAO();

            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, testCartRow);
                    return {} as Database;
                },
            );
            jest.spyOn(
                CartDAO.prototype,
                "getProductsInCart",
            ).mockImplementation(async (_customer, _id) => {
                return [];
            });

            await expect(cartDAO.checkoutCart(customer)).rejects.toBeInstanceOf(
                EmptyCartError,
            );
        });

        test("Error in selecting quantity of a product", async () => {
            const testCartRow = {
                customer: customer.username,
                paid: 0,
                paymentDate: null,
                total: 100,
            };

            const productsInCart = [
                {
                    model: "testModel1",
                    quantity: 5,
                    category: Category.SMARTPHONE,
                    price: 20,
                },
                {
                    model: "testModel2",
                    quantity: 3,
                    category: Category.APPLIANCE,
                    price: 15,
                },
            ];

            const cartDAO = new CartDAO();

            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, testCartRow);
                    return {} as Database;
                },
            );
            jest.spyOn(
                CartDAO.prototype,
                "getProductsInCart",
            ).mockImplementation(async (_customer, _id) => {
                return productsInCart;
            });
            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );

            await expect(cartDAO.checkoutCart(customer)).rejects.toBeInstanceOf(
                Error,
            );
        });

        test("One of the products has been already sold", async () => {
            const testCartRow = {
                customer: customer.username,
                paid: 0,
                paymentDate: null,
                total: 100,
            };

            const productsInCart = [
                {
                    model: "testModel1",
                    quantity: 5,
                    category: Category.SMARTPHONE,
                    price: 20,
                },
                {
                    model: "testModel2",
                    quantity: 3,
                    category: Category.APPLIANCE,
                    price: 15,
                },
            ];

            const cartDAO = new CartDAO();

            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, testCartRow);
                    return {} as Database;
                },
            );
            jest.spyOn(
                CartDAO.prototype,
                "getProductsInCart",
            ).mockImplementation(async (_customer, _id) => {
                return productsInCart;
            });
            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, { quantity: 7 });
                    return {} as Database;
                },
            );
            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, { quantity: 0 });
                    return {} as Database;
                },
            );

            await expect(cartDAO.checkoutCart(customer)).rejects.toBeInstanceOf(
                ProductSoldError,
            );
        });

        test("One of the products has less stock than requested", async () => {
            const testCartRow = {
                customer: customer.username,
                paid: 0,
                paymentDate: null,
                total: 100,
            };

            const productsInCart = [
                {
                    model: "testModel1",
                    quantity: 5,
                    category: Category.SMARTPHONE,
                    price: 20,
                },
                {
                    model: "testModel2",
                    quantity: 3,
                    category: Category.APPLIANCE,
                    price: 15,
                },
            ];

            const cartDAO = new CartDAO();

            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, testCartRow);
                    return {} as Database;
                },
            );
            jest.spyOn(
                CartDAO.prototype,
                "getProductsInCart",
            ).mockImplementation(async (_customer, _id) => {
                return productsInCart;
            });
            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, { quantity: 3 });
                    return {} as Database;
                },
            );

            await expect(cartDAO.checkoutCart(customer)).rejects.toBeInstanceOf(
                LowProductStockError,
            );
        });

        test("Error in updating products quantity", async () => {
            const testCartRow = {
                customer: customer.username,
                paid: 0,
                paymentDate: null,
                total: 100,
            };

            const productsInCart = [
                {
                    model: "testModel1",
                    quantity: 5,
                    category: Category.SMARTPHONE,
                    price: 20,
                },
                {
                    model: "testModel2",
                    quantity: 3,
                    category: Category.APPLIANCE,
                    price: 15,
                },
            ];

            const cartDAO = new CartDAO();

            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, testCartRow);
                    return {} as Database;
                },
            );
            jest.spyOn(
                CartDAO.prototype,
                "getProductsInCart",
            ).mockImplementation(async (_customer, _id) => {
                return productsInCart;
            });
            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, { quantity: 7 });
                    return {} as Database;
                },
            );
            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, { quantity: 5 });
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );

            await expect(cartDAO.checkoutCart(customer)).rejects.toBeInstanceOf(
                Error,
            );
        });

        test("Error in updating cart", async () => {
            const testCartRow = {
                customer: customer.username,
                paid: 0,
                paymentDate: null,
                total: 100,
            };

            const productsInCart = [
                {
                    model: "testModel1",
                    quantity: 5,
                    category: Category.SMARTPHONE,
                    price: 20,
                },
                {
                    model: "testModel2",
                    quantity: 3,
                    category: Category.APPLIANCE,
                    price: 15,
                },
            ];

            const cartDAO = new CartDAO();

            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, testCartRow);
                    return {} as Database;
                },
            );
            jest.spyOn(
                CartDAO.prototype,
                "getProductsInCart",
            ).mockImplementation(async (_customer, _id) => {
                return productsInCart;
            });
            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, { quantity: 7 });
                    return {} as Database;
                },
            );
            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, { quantity: 5 });
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );

            await expect(cartDAO.checkoutCart(customer)).rejects.toBeInstanceOf(
                Error,
            );
        });

        test("Error in getProductsInCart", async () => {
            const testCartRow = {
                customer: customer.username,
                paid: 0,
                paymentDate: null,
                total: 100,
            };

            const cartDAO = new CartDAO();

            jest.spyOn(db, "get").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null, testCartRow);
                    return {} as Database;
                },
            );
            jest.spyOn(
                CartDAO.prototype,
                "getProductsInCart",
            ).mockImplementation(async (_customer, _id) => {
                throw new Error();
            });

            await expect(cartDAO.checkoutCart(customer)).rejects.toBeInstanceOf(
                Error,
            );
        });
    });

    describe("getCustomerCarts", () => {
        test("Gets a user's carts", async () => {
            const testCartRows = [
                {
                    customer: customer.username,
                    paid: 0,
                    paymentDate: null,
                    total: 100,
                },
                {
                    customer: customer.username,
                    paid: 1,
                    paymentDate: "2021-10-10",
                    total: 200,
                },
            ];

            const testProductsInCart = [
                {
                    model: "testModel1",
                    quantity: 5,
                    category: Category.SMARTPHONE,
                    price: 20,
                },
                {
                    model: "testModel2",
                    quantity: 3,
                    category: Category.APPLIANCE,
                    price: 15,
                },
            ];

            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, testCartRows);
                    return {} as Database;
                },
            );

            jest.spyOn(
                CartDAO.prototype,
                "getProductsInCart",
            ).mockImplementation(async (_customer, _id) => {
                return testProductsInCart;
            });

            const cartDAO = new CartDAO();

            const result = await cartDAO.getCustomerCarts(customer);

            expect(result).toEqual([
                new Cart(
                    customer.username,
                    false,
                    null,
                    100,
                    testProductsInCart,
                ),
                new Cart(
                    customer.username,
                    true,
                    "2021-10-10",
                    200,
                    testProductsInCart,
                ),
            ]);
        });

        test("Gets a user's carts (empty)", async () => {
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, []);
                    return {} as Database;
                },
            );

            const cartDAO = new CartDAO();

            const result = await cartDAO.getCustomerCarts(customer);

            expect(result).toEqual([]);
        });

        test("Gets a user's carts (only one)", async () => {
            const testCartRows = [
                {
                    customer: customer.username,
                    paid: 0,
                    paymentDate: null,
                    total: 100,
                },
            ];

            const testProductsInCart = [
                {
                    model: "testModel1",
                    quantity: 5,
                    category: Category.SMARTPHONE,
                    price: 20,
                },
                {
                    model: "testModel2",
                    quantity: 3,
                    category: Category.APPLIANCE,
                    price: 15,
                },
            ];

            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, testCartRows);
                    return {} as Database;
                },
            );

            jest.spyOn(
                CartDAO.prototype,
                "getProductsInCart",
            ).mockImplementation(async (_customer, _id) => {
                return testProductsInCart;
            });

            const cartDAO = new CartDAO();

            const result = await cartDAO.getCustomerCarts(customer);

            expect(result).toEqual([
                new Cart(
                    customer.username,
                    false,
                    null,
                    100,
                    testProductsInCart,
                ),
            ]);
        });

        test("Error in selecting carts", async () => {
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );

            const cartDAO = new CartDAO();

            await expect(
                cartDAO.getCustomerCarts(customer),
            ).rejects.toBeInstanceOf(Error);
        });

        test("Error in selecting products in cart", async () => {
            const testCartRows = [
                {
                    customer: customer.username,
                    paid: 0,
                    paymentDate: null,
                    total: 100,
                },
            ];

            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, testCartRows);
                    return {} as Database;
                },
            );

            jest.spyOn(
                CartDAO.prototype,
                "getProductsInCart",
            ).mockImplementation(async (_customer, _id) => {
                throw new Error();
            });

            const cartDAO = new CartDAO();

            await expect(
                cartDAO.getCustomerCarts(customer),
            ).rejects.toBeInstanceOf(Error);
        });
    });

    describe("removeProductFromCart", () => {
        test("Removes a product from a user's cart (quantity > 1)", async () => {
            const cartDAO = new CartDAO();
            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, { quantity: 5, cartsId: 1 });
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );

            const result = await cartDAO.removeProductFromCart(
                customer,
                "model",
            );

            expect(result).toBe(true);
        });

        test("Removes a product from a user's cart (quantity = 1)", async () => {
            const cartDAO = new CartDAO();
            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, { quantity: 1, cartsId: 1 });
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );

            const result = await cartDAO.removeProductFromCart(
                customer,
                "model",
            );

            expect(result).toBe(true);
        });

        test("Error in select quantity and/or cartsId", async () => {
            const cartDAO = new CartDAO();
            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );

            await expect(
                cartDAO.removeProductFromCart(customer, "model"),
            ).rejects.toBeInstanceOf(Error);
        });

        test("Fails to remove product from cart, no product found", async () => {
            const cartDAO = new CartDAO();
            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, null);
                    return {} as Database;
                },
            );

            const result = await cartDAO.removeProductFromCart(
                customer,
                "model",
            );

            expect(result).toBe(false);
        });

        test("Error in updating quantity (quantity > 1)", async () => {
            const cartDAO = new CartDAO();
            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, { quantity: 5, cartsId: 1 });
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );

            await expect(
                cartDAO.removeProductFromCart(customer, "model"),
            ).rejects.toBeInstanceOf(Error);
        });

        test("Error in deleting from products_in_cart (quantity = 1)", async () => {
            const cartDAO = new CartDAO();
            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, { quantity: 1, cartsId: 1 });
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );

            await expect(
                cartDAO.removeProductFromCart(customer, "model"),
            ).rejects.toBeInstanceOf(Error);
        });

        test("Error in updating carts", async () => {
            const cartDAO = new CartDAO();
            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, { quantity: 1, cartsId: 1 });
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );

            await expect(
                cartDAO.removeProductFromCart(customer, "model"),
            ).rejects.toBeInstanceOf(Error);
        });
    });

    describe("clearCart", () => {
        test("Clears a user's cart", async () => {
            const cartDAO = new CartDAO();
            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, { id: 1 });
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );

            const result = await cartDAO.clearCart(customer);

            expect(result).toBe(true);
        });

        test("Cart not found", async () => {
            const cartDAO = new CartDAO();
            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, null);
                    return {} as Database;
                },
            );

            await expect(cartDAO.clearCart(customer)).rejects.toBeInstanceOf(
                CartNotFoundError,
            );
        });

        test("Error in selecting cart", async () => {
            const cartDAO = new CartDAO();
            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );

            await expect(cartDAO.clearCart(customer)).rejects.toBeInstanceOf(
                Error,
            );
        });

        test("Error in deleting from products_in_cart", async () => {
            const cartDAO = new CartDAO();
            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, { id: 1 });
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );

            await expect(cartDAO.clearCart(customer)).rejects.toBeInstanceOf(
                Error,
            );
        });

        test("Error in updating cart", async () => {
            const cartDAO = new CartDAO();
            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, { id: 1 });
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );
            jest.spyOn(db, "run").mockImplementationOnce(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );

            await expect(cartDAO.clearCart(customer)).rejects.toBeInstanceOf(
                Error,
            );
        });
    });

    describe("deleteAllCarts", () => {
        test("Deletes all carts", async () => {
            const cartDAO = new CartDAO();
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );
            const result = await cartDAO.deleteAllCarts();
            expect(result).toBe(true);
        });

        test("Fails to delete all carts", async () => {
            const cartDAO = new CartDAO();
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );
            cartDAO.deleteAllCarts().catch((error) => {
                expect(error).toBeInstanceOf(Error);
            });
        });
    });

    describe("getAllCarts", () => {
        test("Gets all carts", async () => {
            const testCartRows = [
                {
                    customer: customer.username,
                    paid: 0,
                    paymentDate: null,
                    total: 100,
                },
                {
                    customer: customer.username,
                    paid: 1,
                    paymentDate: "2021-10-10",
                    total: 200,
                },
            ];

            const testProductsInCart = [
                {
                    model: "testModel1",
                    quantity: 5,
                    category: Category.SMARTPHONE,
                    price: 20,
                },
                {
                    model: "testModel2",
                    quantity: 3,
                    category: Category.APPLIANCE,
                    price: 15,
                },
            ];

            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, testCartRows);
                    return {} as Database;
                },
            );

            jest.spyOn(
                CartDAO.prototype,
                "getProductsInCart",
            ).mockImplementation(async (_customer, _id) => {
                return testProductsInCart;
            });

            const cartDAO = new CartDAO();

            const result = await cartDAO.getAllCarts();

            expect(result).toEqual([
                new Cart(
                    customer.username,
                    false,
                    null,
                    100,
                    testProductsInCart,
                ),
                new Cart(
                    customer.username,
                    true,
                    "2021-10-10",
                    200,
                    testProductsInCart,
                ),
            ]);
        });

        test("Gets all carts (empty)", async () => {
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, []);
                    return {} as Database;
                },
            );

            const cartDAO = new CartDAO();

            const result = await cartDAO.getAllCarts();

            expect(result).toEqual([]);
        });

        test("Gets all carts (only one)", async () => {
            const testCartRows = [
                {
                    customer: customer.username,
                    paid: 0,
                    paymentDate: null,
                    total: 100,
                },
            ];

            const testProductsInCart = [
                {
                    model: "testModel1",
                    quantity: 5,
                    category: Category.SMARTPHONE,
                    price: 20,
                },
                {
                    model: "testModel2",
                    quantity: 3,
                    category: Category.APPLIANCE,
                    price: 15,
                },
            ];

            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, testCartRows);
                    return {} as Database;
                },
            );

            jest.spyOn(
                CartDAO.prototype,
                "getProductsInCart",
            ).mockImplementation(async (_customer, _id) => {
                return testProductsInCart;
            });

            const cartDAO = new CartDAO();

            const result = await cartDAO.getAllCarts();

            expect(result).toEqual([
                new Cart(
                    customer.username,
                    false,
                    null,
                    100,
                    testProductsInCart,
                ),
            ]);
        });

        test("Error in getProductsInCart", async () => {
            const testCartRows = [
                {
                    customer: customer.username,
                    paid: 0,
                    paymentDate: null,
                    total: 100,
                },
            ];

            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, testCartRows);
                    return {} as Database;
                },
            );

            jest.spyOn(
                CartDAO.prototype,
                "getProductsInCart",
            ).mockImplementation(async (_customer, _id) => {
                throw new Error();
            });

            const cartDAO = new CartDAO();

            await expect(cartDAO.getAllCarts()).rejects.toBeInstanceOf(Error);
        });

        test("Error in selecting all carts", async () => {
            const cartDAO = new CartDAO();
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );
            await expect(cartDAO.getAllCarts()).rejects.toBeInstanceOf(Error);
        });
    });

    describe("createCart", () => {
        test("Creates a cart", async () => {
            const testUser = {
                username: "testUsername",
                name: "testName",
                surname: "testSurname",
                role: Role.CUSTOMER,
                address: "testAddress",
                birthdate: "2021-10-10",
            };

            const cartDAO = new CartDAO();
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );
            const result = await cartDAO.createCart(testUser);
            expect(result).toEqual(
                new Cart(testUser.username, false, null, 0, []),
            );
        });

        test("Fails to create a cart", async () => {
            const testUser = {
                username: "testUsername",
                name: "testName",
                surname: "testSurname",
                role: Role.CUSTOMER,
                address: "testAddress",
                birthdate: "2021-10-10",
            };

            const cartDAO = new CartDAO();
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );
            cartDAO.createCart(testUser).catch((error) => {
                expect(error).toBeInstanceOf(Error);
            });
        });
    });
});
