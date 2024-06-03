import { test, expect, jest, describe, afterEach } from "@jest/globals";
import cartController from "../../src/controllers/cartController";
import CartDAO from "../../src/dao/cartDAO";
import db from "../../src/db/db";
import { Role, User } from "../../src/components/user";
import { beforeEach } from "node:test";

jest.mock("../../src/db/db");

describe("CartDAO", () => {
    let cartDao: CartDAO;
    let mockUser: User;

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

    test("addToCart should add a new product if not already in the cart", async () => {
        (db.get as jest.Mock).mockImplementation((sql, params, callback) =>
            callback(null, undefined),
        );

        (db.run as jest.Mock).mockImplementation((sql, params, callback) =>
            callback(null),
        );

        const productId = "prod123";
        const result = await cartDao.addToCart(mockUser, productId);

        expect(db.get).toHaveBeenCalledTimes(1);
        expect(db.get).toHaveBeenCalledWith(
            expect.stringContaining("SELECT * FROM products_in_cart"),
            [mockUser.username, productId],
            expect.any(Function),
        );

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

        expect(result).toBe(true);
    });

    test("addToCart should increase quantity if the product is already in the cart", async () => {
        const existingProduct = {
            quantity: 1,
            category: "Electronics",
            price: 299,
        };
        // Mock db.get to simulate existing product in the cart
        (db.get as jest.Mock).mockImplementation((sql, params, callback) =>
            callback(null, existingProduct),
        );

        // Mock db.run for the update operation
        (db.run as jest.Mock).mockImplementation((sql, params, callback) =>
            callback(null),
        );

        const productId = "prod123";
        const result = await cartDao.addToCart(mockUser, productId);

        // Assertions to verify if the quantity was updated
        expect(db.get).toHaveBeenCalledTimes(1);
        expect(db.run).toHaveBeenCalledWith(
            expect.stringContaining("UPDATE products_in_cart SET quantity = ?"),
            [existingProduct.quantity + 1, mockUser.username, productId, null],
            expect.any(Function),
        );

        expect(result).toBe(true);
    });

    // Example test for handling database errors
    test("addToCart should handle database errors when adding a new product", async () => {
        (db.get as jest.Mock).mockImplementation((sql, params, callback) =>
            callback(new Error("Database error"), undefined),
        );

        const productId = "prod123";
        await expect(cartDao.addToCart(mockUser, productId)).rejects.toThrow(
            "Database error",
        );

        expect(db.get).toHaveBeenCalled();
        expect(db.run).not.toHaveBeenCalled();
    });

    // Example test for error handling when the product already exists in the cart
    test("addToCart should handle database errors when increasing quantity", async () => {
        const existingProduct = {
            quantity: 1,
            category: "Electronics",
            price: 299,
        };
        (db.get as jest.Mock).mockImplementation((sql, params, callback) =>
            callback(null, existingProduct),
        );
        (db.run as jest.Mock).mockImplementation((sql, params, callback) =>
            callback(new Error("Database error")),
        );

        const productId = "prod123";
        await expect(cartDao.addToCart(mockUser, productId)).rejects.toThrow(
            "Database error",
        );

        expect(db.get).toHaveBeenCalledTimes(1);
        expect(db.run).toHaveBeenCalled();
    });
});
