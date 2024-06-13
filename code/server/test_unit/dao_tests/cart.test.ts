import { describe, test, expect, afterEach, jest } from "@jest/globals";
import db from "../../src/db/db";

import { Database } from "sqlite3";
import CartDAO from "../../src/dao/cartDAO";
import { Role, User } from "../../src/components/user";
import { Cart } from "../../src/components/cart";
import { Category } from "../../src/components/product";

jest.mock("../../src/db/db.ts");

afterEach(() => {
    jest.resetAllMocks();
});

describe("CartDAO", () => {
    describe("addToCart", () => {
        test("Adds a product to Cart", async () => {
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

        test("Fails to add a product to Cart", async () => {
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
            expect(result).toBe(false);
        });
    });

    describe("getCart", () => {
        test("Gets a user's cart", async () => {
            const testUsers: User[] = [
                {
                    username: "testUsername1",
                    name: "testName1",
                    surname: "testSurname1",
                    role: Role.CUSTOMER,
                    address: "testAddress1",
                    birthdate: "2021-10-10",
                },
                {
                    username: "testUsername2",
                    name: "testName2",
                    surname: "testSurname2",
                    role: Role.CUSTOMER,
                    address: "testAddress2",
                    birthdate: "2021-10-10",
                },
                {
                    username: "testUsername3",
                    name: "testName3",
                    surname: "testSurname3",
                    role: Role.CUSTOMER,
                    address: "testAddress3",
                    birthdate: "2021-10-10",
                },
            ];

            const testCartItems = [
                {
                    user: testUsers[0].username,
                    productId: "testId1",
                    quantity: 10,
                },
                {
                    user: testUsers[0],
                    productId: "testId2",
                    quantity: 5,
                },
                {
                    user: testUsers[1],
                    productId: "testId3",
                    quantity: 8,
                },
                {
                    user: testUsers[1],
                    productId: "testId4",
                    quantity: 3,
                },
                {
                    user: testUsers[2],
                    productId: "testId5",
                    quantity: 2,
                },
            ];

            const testCarts = [
                {
                    user: testUsers[0],
                    products: [testCartItems[0], testCartItems[1]],
                    paid: false,
                    paymentDate: null,
                    total: 0,
                },
                {
                    user: testUsers[1],
                    products: [testCartItems[2], testCartItems[3]],
                    paid: false,
                    paymentDate: null,
                    total: 0,
                },
                {
                    user: testUsers[2],
                    products: [testCartItems[4]],
                    paid: false,
                    paymentDate: null,
                    total: 0,
                },
            ];

            const cartDAO = new CartDAO();
            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, [testCarts[0]]);
                    return {} as Database;
                },
            );
            const result = await cartDAO.getCart(testCarts[0].user);
            expect(result).toEqual([testCarts[0]]);
        });

        test("Fails to get a user's cart", async () => {
            const testUsers = [
                {
                    username: "testUsername1",
                    name: "testName1",
                    surname: "testSurname1",
                    role: Role.CUSTOMER,
                    address: "testAddress1",
                    birthdate: "2021-10-10",
                },
                {
                    username: "testUsername2",
                    name: "testName2",
                    surname: "testSurname2",
                    role: Role.CUSTOMER,
                    address: "testAddress2",
                    birthdate: "2021-10-10",
                },
                {
                    username: "testUsername3",
                    name: "testName3",
                    surname: "testSurname3",
                    role: Role.CUSTOMER,
                    address: "testAddress3",
                    birthdate: "2021-10-10",
                },
            ];

            const testCartItems = [
                {
                    user: testUsers[0],
                    productId: "testId1",
                    quantity: 10,
                },
                {
                    user: testUsers[0],
                    productId: "testId2",
                    quantity: 5,
                },
                {
                    user: testUsers[1],
                    productId: "testId3",
                    quantity: 8,
                },
                {
                    user: testUsers[1],
                    productId: "testId4",
                    quantity: 3,
                },
                {
                    user: testUsers[2],
                    productId: "testId5",
                    quantity: 2,
                },
            ];

            const testCarts = [
                {
                    user: testUsers[0],
                    products: [testCartItems[0], testCartItems[1]],
                },
                {
                    user: testUsers[1],
                    products: [testCartItems[2], testCartItems[3]],
                },
                {
                    user: testUsers[2],
                    products: [testCartItems[4]],
                },
            ];

            const cartDAO = new CartDAO();
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, []);
                    return {} as Database;
                },
            );
            const result = await cartDAO.getCart(testCarts[0].user);
            expect(result).toEqual([]);
        });
    });

    describe("getProductsInCart", () => {
        test("Gets a user's products in cart", async () => {
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

            const testCart = {
                user: testUser,
                products: [testCartItem],
                paid: false,
                paymentDate: null,
                total: 0,
            };

            const cartDAO = new CartDAO();
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, [testCartItem]);
                    return {} as Database;
                },
            );
            const result = await cartDAO.getProductsInCart(
                testUser,
                testCartItem.productId,
            );
            expect(result).toEqual([testCartItem]);
        });

        test("Fails to get a user's products in cart", async () => {
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
    });

    describe("checkoutCart", () => {
        test("Checks out a user's cart", async () => {
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
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );
            const result = await cartDAO.checkoutCart(testUser);
            expect(result).toBe(true);
        });

        test("Fails to check out a user's cart", async () => {
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
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );
            const result = await cartDAO.checkoutCart(testUser);
            expect(result).toBe(false);
        });
    });

    describe("getCustomerCarts", () => {
        test("Gets all customer carts", async () => {
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
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, [testCartItem]);
                    return {} as Database;
                },
            );
            const result = await cartDAO.getCustomerCarts(testUser);
            expect(result).toEqual([testCartItem]);
        });

        test("Fails to get all customer carts", async () => {
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
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, []);
                    return {} as Database;
                },
            );
            const result = await cartDAO.getCustomerCarts(testUser);
            expect(result).toEqual([]);
        });
    });

    describe("remveProductFromCart", () => {
        test("Removes a product from a user's cart", async () => {
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
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );
            const result = await cartDAO.removeProductFromCart(
                testCartItem.user,
                testCartItem.productId,
            );
            expect(result).toBe(true);
        });

        test("Fails to remove a product from a user's cart", async () => {
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
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );
            const result = await cartDAO.removeProductFromCart(
                testCartItem.user,
                testCartItem.productId,
            );
            expect(result).toBe(false);
        });
    });

    describe("clearCart", () => {
        test("Clears a user's cart", async () => {
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
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );
            const result = await cartDAO.clearCart(testCartItem.user);
            expect(result).toBe(true);
        });

        test("Fails to clear a user's cart", async () => {
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
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );
            const result = await cartDAO.clearCart(testCartItem.user);
            expect(result).toBe(false);
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
            const cartDAO = new CartDAO();

            const testUsers: User[] = [
                {
                    username: "testUsername1",
                    name: "testName1",
                    surname: "testSurname1",
                    role: Role.CUSTOMER,
                    address: "testAddress1",
                    birthdate: "2021-10-10",
                },
                {
                    username: "testUsername2",
                    name: "testName2",
                    surname: "testSurname2",
                    role: Role.CUSTOMER,
                    address: "testAddress2",
                    birthdate: "2021-10-10",
                },
            ];
            const testCarts: Cart[] = [
                {
                    customer: testUsers[0].username,
                    paid: true,
                    paymentDate: "2021-10-10",
                    total: 100,
                    products: [
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
                    ],
                },
                {
                    customer: testUsers[1].username,
                    paid: false,
                    paymentDate: null,
                    total: 0,
                    products: [],
                },
            ];
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, [
                        {
                            customer: testCarts[0].customer,
                            paid: testCarts[0].paid ? 1 : 0,
                            paymentDate: testCarts[0].paymentDate,
                            total: testCarts[0].total,
                            id: 1,
                        },
                        {
                            customer: testCarts[1].customer,
                            paid: testCarts[1].paid ? 1 : 0,
                            paymentDate: testCarts[1].paymentDate,
                            total: testCarts[1].total,
                            id: 2,
                        },
                    ]);
                    return {} as Database;
                },
            );
            jest.spyOn(cartDAO, "getProductsInCart").mockImplementation(
                async (customer, id) => {
                    if (customer === testUsers[0]) {
                        return testCarts[0].products;
                    } else if (customer === testUsers[1]) {
                        return testCarts[1].products;
                    } else {
                        return [];
                    }
                },
            );

            const result = await cartDAO.getAllCarts();

            expect(result).toEqual(testCarts);
        });

        test("Fails to get all carts", async () => {
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
