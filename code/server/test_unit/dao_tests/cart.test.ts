import { test, expect, jest, beforeEach, describe } from "@jest/globals";
import { User, Role } from "../../src/components/user";
import CartDAO from "../../src/dao/cartDAO";
import db from "../../src/db/db";

jest.mock("../../src/db/db.ts");

const mockDbGet = (error: Error | null = null, result: any = undefined) => {
    return jest.spyOn(db, "get").mockImplementation((...args: any[]) => {
        const callback = args[args.length - 1];
        callback(error, result);
    });
};

const mockDbRun = (error: Error | null = null) => {
    return jest.spyOn(db, "run").mockImplementation((...args: any[]) => {
        const callback = args[args.length - 1];
        callback(error);
    });
};

describe("CartDAO", () => {
    let cartDao: CartDAO;
    let mockUser: User;

    // Set up CartDAO and mockUser before each test
    beforeEach(() => {
        cartDao = new CartDAO();
        mockUser = new User(
            "testuser",
            "User",
            "User",
            Role.CUSTOMER,
            "User",
            "User",
        );
        jest.clearAllMocks();
    });

    describe("addToCart", () => {
        // Test adding a new product to the cart
        test("adds a new product if not already in the cart", async () => {
            mockDbGet(null, undefined); // Mock db.get to return no existing product
            mockDbRun(); // Mock db.run to succeed

            const productId = "prod123";
            const result = await cartDao.addToCart(mockUser, productId);

            // Verify db.get was called correctly
            expect(db.get).toHaveBeenCalledTimes(1);
            expect(db.get).toHaveBeenCalledWith(
                expect.stringContaining("SELECT * FROM products_in_cart"),
                [mockUser.username, productId],
                expect.any(Function),
            );

            // Verify db.run was called correctly
            expect(db.run).toHaveBeenCalledWith(
                expect.stringContaining("INSERT INTO products_in_cart"),
                [
                    productId,
                    1,
                    expect.any(String),
                    expect.any(Number),
                    mockUser.username,
                    null,
                ],
                expect.any(Function),
            );

            // Verify the result
            expect(result).toBe(true);
        });

        // Test increasing quantity of an existing product in the cart
        test("increases quantity if the product is already in the cart", async () => {
            const existingProduct = {
                quantity: 1,
                category: "Electronics",
                price: 299,
            };
            mockDbGet(null, existingProduct); // Mock db.get to return an existing product
            mockDbRun(); // Mock db.run to succeed

            const productId = "prod123";
            const result = await cartDao.addToCart(mockUser, productId);

            // Verify db.get was called correctly
            expect(db.get).toHaveBeenCalledTimes(1);
            // Verify db.run was called correctly
            expect(db.run).toHaveBeenCalledWith(
                expect.stringContaining(
                    "UPDATE products_in_cart SET quantity = ?",
                ),
                [
                    existingProduct.quantity + 1,
                    mockUser.username,
                    productId,
                    null,
                ],
                expect.any(Function),
            );

            // Verify the result
            expect(result).toBe(true);
        });

        // Test handling database errors when adding a new product
        test("handles database errors when adding a new product", async () => {
            mockDbGet(new Error("Database error")); // Mock db.get to return an error

            const productId = "prod123";
            // Expect the addToCart method to throw an error
            await expect(
                cartDao.addToCart(mockUser, productId),
            ).rejects.toThrow("Database error");

            // Verify db.get was called
            expect(db.get).toHaveBeenCalled();
            // Verify db.run was not called
            expect(db.run).not.toHaveBeenCalled();
        });

        // Test handling database errors when increasing quantity of an existing product
        test("handles database errors when increasing quantity", async () => {
            const existingProduct = {
                quantity: 1,
                category: "Electronics",
                price: 299,
            };
            mockDbGet(null, existingProduct); // Mock db.get to return an existing product
            mockDbRun(new Error("Database error")); // Mock db.run to return an error

            const productId = "prod123";
            // Expect the addToCart method to throw an error
            await expect(
                cartDao.addToCart(mockUser, productId),
            ).rejects.toThrow("Database error");

            // Verify db.get was called
            expect(db.get).toHaveBeenCalledTimes(1);
            // Verify db.run was called
            expect(db.run).toHaveBeenCalled();
        });
    });

    describe("removeFromCart", () => {
        // Test removing a product from the cart
        test("removes a product from the cart", async () => {
            mockDbRun(); // Mock db.run to succeed

            const productId = "prod123";
            const result = await cartDao.removeFromCart(mockUser, productId);

            // Verify db.run was called correctly
            expect(db.run).toHaveBeenCalledWith(
                expect.stringContaining("DELETE FROM products_in_cart"),
                [mockUser.username, productId],
                expect.any(Function),
            );

            // Verify the result
            expect(result).toBe(true);
        });

        // Test handling database errors when removing a product
        test("handles database errors when removing a product", async () => {
            mockDbRun(new Error("Database error")); // Mock db.run to return an error

            const productId = "prod123";
            // Expect the removeFromCart method to throw an error
            await expect(
                cartDao.removeFromCart(mockUser, productId),
            ).rejects.toThrow("Database error");

            // Verify db.run was called
            expect(db.run).toHaveBeenCalled();
        });
    });

    describe("getCartItems", () => {
        // Test getting all items in the user's cart
        test("gets all items in the user's cart", async () => {
            const cartItems = [
                { productId: "prod123", quantity: 2 },
                { productId: "prod456", quantity: 1 },
            ];
            mockDbGet(null, cartItems); // Mock db.get to return cart items

            const result = await cartDao.getCartItems(mockUser);

            // Verify db.get was called correctly
            expect(db.get).toHaveBeenCalledWith(
                expect.stringContaining(
                    "SELECT * FROM products_in_cart WHERE username = ?",
                ),
                [mockUser.username],
                expect.any(Function),
            );

            // Verify the result
            expect(result).toEqual(cartItems);
        });

        // Test handling database errors when getting cart items
        test("handles database errors when getting cart items", async () => {
            mockDbGet(new Error("Database error")); // Mock db.get to return an error

            // Expect the getCartItems method to throw an error
            await expect(cartDao.getCartItems(mockUser)).rejects.toThrow(
                "Database error",
            );

            // Verify db.get was called
            expect(db.get).toHaveBeenCalled();
        });
    });

    describe("clearCart", () => {
        // Test clearing all items in the user's cart
        test("clears all items in the user's cart", async () => {
            mockDbRun(); // Mock db.run to succeed

            const result = await cartDao.clearCart(mockUser);

            // Verify db.run was called correctly
            expect(db.run).toHaveBeenCalledWith(
                expect.stringContaining(
                    "DELETE FROM products_in_cart WHERE username = ?",
                ),
                [mockUser.username],
                expect.any(Function),
            );

            // Verify the result
            expect(result).toBe(true);
        });

        // Test handling database errors when clearing the cart
        test("handles database errors when clearing the cart", async () => {
            mockDbRun(new Error("Database error")); // Mock db.run to return an error

            // Expect the clearCart method to throw an error
            await expect(cartDao.clearCart(mockUser)).rejects.toThrow(
                "Database error",
            );

            // Verify db.run was called
            expect(db.run).toHaveBeenCalled();
        });
    });
});
