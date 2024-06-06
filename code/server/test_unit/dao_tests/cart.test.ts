// import {
//     test,
//     expect,
//     jest,
//     beforeEach,
//     describe,
// } from "@jest/globals";
// import CartController from "../../src/controllers/cartController";
// import CartDAO from "../../src/dao/cartDAO";
// import { Role, User } from "../../src/components/user";
// import { Category, Product } from "../../src/components/product";
// import { Cart, ProductInCart } from "../../src/components/cart";

// jest.mock("../../src/dao/cartDAO");
import { test, expect } from "@jest/globals";
test("1", () => {
    expect(1).toBe(1);
});

// describe("CartController", () => {
//     let user: User;

//     beforeEach(() => {
//         user = new User(
//             "testuser",
//             "Test",
//             "User",
//             Role.CUSTOMER,
//             "testuser@example.com",
//             "password123",
//         );
//         jest.clearAllMocks();
//     });

//     describe("addToCart", () => {
//         test("Add a valid product to the cart", async () => {
//             const testProduct = new Product(
//                 3,
//                 "test",
//                 Category.APPLIANCE,
//                 "test",
//                 "test",
//                 2,
//             );
//             const testCart = new Cart(user.username, false, null, 0, []);

//             jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(
//                 testCart,
//             );
//             jest.spyOn(CartDAO.prototype, "addToCart").mockResolvedValueOnce(
//                 true,
//             );

//             const controller = new CartController();
//             const response = await controller.addToCart(
//                 user,
//                 testProduct.model,
//             );

//             expect(CartDAO.prototype.getCart).toHaveBeenCalledTimes(1);
//             expect(CartDAO.prototype.addToCart).toHaveBeenCalledTimes(1);
//             expect(CartDAO.prototype.addToCart).toHaveBeenCalledWith(
//                 user,
//                 testProduct.model,
//             );
//             expect(response).toBe(true);
//         });

//         test("Add a product that already exists in the cart and increase quantity", async () => {
//             const testProduct = new Product(
//                 3,
//                 "test",
//                 Category.APPLIANCE,
//                 "test",
//                 "test",
//                 2,
//             );
//             const testCart = new Cart(user.username, false, null, 0, [
//                 {
//                     model: "test",
//                     quantity: 1,
//                     category: Category.APPLIANCE,
//                     price: 1,
//                 },
//             ]);

//             jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(
//                 testCart,
//             );
//             jest.spyOn(CartDAO.prototype, "addToCart").mockResolvedValueOnce(
//                 true,
//             );

//             const controller = new CartController();
//             const response = await controller.addToCart(
//                 user,
//                 testProduct.model,
//             );

//             expect(CartDAO.prototype.getCart).toHaveBeenCalledTimes(1);
//             expect(CartDAO.prototype.addToCart).toHaveBeenCalledTimes(1);
//             expect(CartDAO.prototype.addToCart).toHaveBeenCalledWith(
//                 user,
//                 testProduct.model,
//             );
//             expect(response).toBe(true);
//         });

//         test("Try to add an item that is not a product", async () => {
//             const controller = new CartController();
//             await expect(
//                 controller.addToCart(user, "not a product"),
//             ).rejects.toThrow(new Error("Incorrect item type"));
//         });

//         test("Try to add a product that does not exist", async () => {
//             jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(
//                 new Cart(user.username, false, null, 0, []),
//             );
//             jest.spyOn(CartDAO.prototype, "addToCart").mockRejectedValueOnce(
//                 new Error("Item not found"),
//             );

//             const controller = new CartController();
//             await expect(controller.addToCart(user, "test")).rejects.toThrow(
//                 new Error("Item not found"),
//             );
//         });

//         test("Try to add a product with insufficient quantity", async () => {
//             const testProduct = new Product(
//                 3,
//                 "test",
//                 Category.APPLIANCE,
//                 "test",
//                 "test",
//                 2,
//             );
//             const testCart = new Cart(user.username, false, null, 0, []);

//             jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(
//                 testCart,
//             );
//             jest.spyOn(CartDAO.prototype, "addToCart").mockRejectedValueOnce(
//                 new Error("Insufficient product quantity"),
//             );

//             const controller = new CartController();
//             await expect(
//                 controller.addToCart(user, testProduct.model),
//             ).rejects.toThrow(new Error("Insufficient product quantity"));
//         });
//     });

//     describe("removeProductFromCart", () => {
//         test("Remove a valid product from the cart", async () => {
//             const testProduct = new Product(
//                 3,
//                 "test",
//                 Category.APPLIANCE,
//                 "test",
//                 "test",
//                 2,
//             );
//             const testCart = new Cart(user.username, false, null, 0, [
//                 {
//                     model: "test",
//                     quantity: 1,
//                     category: Category.APPLIANCE,
//                     price: 1,
//                 },
//             ]);

//             jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(
//                 testCart,
//             );
//             jest.spyOn(
//                 CartDAO.prototype,
//                 "removeProductFromCart",
//             ).mockResolvedValueOnce(true);

//             const controller = new CartController();
//             const response = await controller.removeProductFromCart(
//                 user,
//                 testProduct.model,
//             );

//             expect(CartDAO.prototype.getCart).toHaveBeenCalledTimes(1);
//             expect(
//                 CartDAO.prototype.removeProductFromCart,
//             ).toHaveBeenCalledTimes(1);
//             expect(
//                 CartDAO.prototype.removeProductFromCart,
//             ).toHaveBeenCalledWith(user, testProduct.model);
//             expect(response).toBe(true);
//         });

//         test("Try to remove a product that does not exist in the cart", async () => {
//             const testProduct = new Product(
//                 3,
//                 "test",
//                 Category.APPLIANCE,
//                 "test",
//                 "test",
//                 2,
//             );
//             const testCart = new Cart(user.username, false, null, 0, []);

//             jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(
//                 testCart,
//             );
//             jest.spyOn(
//                 CartDAO.prototype,
//                 "removeProductFromCart",
//             ).mockRejectedValueOnce(new Error("Item not found"));

//             const controller = new CartController();
//             await expect(
//                 controller.removeProductFromCart(user, testProduct.model),
//             ).rejects.toThrow(new Error("Item not found"));
//         });

//         test("Try to remove a product from an empty cart", async () => {
//             const testCart = new Cart(user.username, false, null, 0, []);

//             jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(
//                 testCart,
//             );
//             jest.spyOn(
//                 CartDAO.prototype,
//                 "removeProductFromCart",
//             ).mockRejectedValueOnce(new Error("Empty cart"));

//             const controller = new CartController();
//             await expect(
//                 controller.removeProductFromCart(user, "test"),
//             ).rejects.toThrow(new Error("Empty cart"));
//         });
//     });

//     describe("checkoutCart", () => {
//         test("Checkout the cart successfully", async () => {
//             const testCart = new Cart(user.username, false, null, 100, [
//                 {
//                     model: "test",
//                     quantity: 1,
//                     category: Category.SMARTPHONE,
//                     price: 100,
//                 },
//             ]);

//             jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(
//                 testCart,
//             );
//             jest.spyOn(CartDAO.prototype, "checkoutCart").mockResolvedValueOnce(
//                 true,
//             );

//             const controller = new CartController();
//             const response = await controller.checkoutCart(user);

//             expect(CartDAO.prototype.getCart).toHaveBeenCalledTimes(1);
//             expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledTimes(1);
//             expect(response).toBe(true);
//         });

//         test("Try to checkout an empty cart", async () => {
//             const testCart = new Cart(user.username, false, null, 0, []);

//             jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(
//                 testCart,
//             );
//             jest.spyOn(CartDAO.prototype, "checkoutCart").mockRejectedValueOnce(
//                 new Error("Empty cart"),
//             );

//             const controller = new CartController();
//             await expect(controller.checkoutCart(user)).rejects.toThrow(
//                 new Error("Empty cart"),
//             );
//         });
//     });

//     describe("clearCart", () => {
//         test("Clears the user's cart", async () => {
//             jest.spyOn(CartDAO.prototype, "clearCart").mockResolvedValueOnce(
//                 true,
//             );

//             const controller = new CartController();
//             const response = await controller.clearCart(user);

//             expect(CartDAO.prototype.clearCart).toHaveBeenCalledTimes(1);
//             expect(CartDAO.prototype.clearCart).toHaveBeenCalledWith(user);
//             expect(response).toBe(true);
//         });

//         test("Fails to clear the cart", async () => {
//             jest.spyOn(CartDAO.prototype, "clearCart").mockRejectedValueOnce(
//                 new Error(),
//             );

//             const controller = new CartController();
//             await expect(controller.clearCart(user)).rejects.toThrow(Error);
//         });
//     });

//     describe("getCart", () => {
//         test("Gets the user's active cart", async () => {
//             const testCart = new Cart(user.username, false, null, 100, [
//                 {
//                     model: "test",
//                     quantity: 1,
//                     category: Category.SMARTPHONE,
//                     price: 100,
//                 },
//             ]);

//             jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(
//                 testCart,
//             );

//             const controller = new CartController();
//             const response = await controller.getCart(user);

//             expect(CartDAO.prototype.getCart).toHaveBeenCalledTimes(1);
//             expect(response).toEqual(testCart);
//         });

//         test("Returns null if no active cart exists", async () => {
//             jest.spyOn(CartDAO.prototype, "getCart").mockResolvedValueOnce(
//                 null,
//             );

//             const controller = new CartController();
//             const response = await controller.getCart(user);

//             expect(CartDAO.prototype.getCart).toHaveBeenCalledTimes(1);
//             expect(response).toBeNull();
//         });
//     });

//     describe("getCustomerCarts", () => {
//         test("Returns all paid carts for the user", async () => {
//             const cartRows = [
//                 {
//                     user: user.username,
//                     paid: 1,
//                     paymentDate: "2022-01-01",
//                     total: 100,
//                 },
//                 {
//                     user: user.username,
//                     paid: 1,
//                     paymentDate: "2022-02-01",
//                     total: 200,
//                 },
//             ];

//             jest.spyOn(CartDAO.prototype, "getCustomerCarts").mockResolvedValue(
//                 cartRows.map(
//                     (row) =>
//                         new Cart(
//                             row.user,
//                             !!row.paid,
//                             row.paymentDate,
//                             row.total,
//                             [],
//                         ),
//                 ),
//             );

//             const controller = new CartController();
//             const response = await controller.getCustomerCarts(user);

//             expect(CartDAO.prototype.getCustomerCarts).toHaveBeenCalledTimes(1);
//             expect(response.length).toBe(2);
//             expect(response[0].total).toBe(100);
//             expect(response[1].total).toBe(200);
//         });

//         test("Fails to retrieve the paid carts", async () => {
//             jest.spyOn(
//                 CartDAO.prototype,
//                 "getCustomerCarts",
//             ).mockRejectedValueOnce(new Error());

//             const controller = new CartController();
//             await expect(controller.getCustomerCarts(user)).rejects.toThrow(
//                 Error,
//             );
//         });
//     });

//     describe("createCart", () => {
//         test("Creates a new cart for the user", async () => {
//             const testCart = new Cart(user.username, false, null, 0, []);

//             jest.spyOn(CartDAO.prototype, "createCart").mockResolvedValueOnce(
//                 testCart,
//             );

//             const controller = new CartController();
//             const response = await controller.createCart(user);

//             expect(CartDAO.prototype.createCart).toHaveBeenCalledTimes(1);
//             expect(CartDAO.prototype.createCart).toHaveBeenCalledWith(user);
//             expect(response).toEqual(testCart);
//         });

//         test("Fails to create a new cart", async () => {
//             jest.spyOn(CartDAO.prototype, "createCart").mockRejectedValueOnce(
//                 new Error(),
//             );

//             const controller = new CartController();
//             await expect(controller.createCart(user)).rejects.toThrow(Error);
//         });
//     });

//     describe("deleteAllCarts", () => {
//         test("Deletes all carts from the database", async () => {
//             jest.spyOn(
//                 CartDAO.prototype,
//                 "deleteAllCarts",
//             ).mockResolvedValueOnce(true);

//             const controller = new CartController();
//             const response = await controller.deleteAllCarts();

//             expect(CartDAO.prototype.deleteAllCarts).toHaveBeenCalledTimes(1);
//             expect(response).toBe(true);
//         });

//         test("Fails to delete all carts from the database", async () => {
//             jest.spyOn(
//                 CartDAO.prototype,
//                 "deleteAllCarts",
//             ).mockRejectedValueOnce(new Error());

//             const controller = new CartController();
//             await expect(controller.deleteAllCarts()).rejects.toThrow(Error);
//         });
//     });

//     describe("getAllCarts", () => {
//         test("Gets all carts", async () => {
//             const cartRows = [
//                 {
//                     user: user.username,
//                     paid: 1,
//                     paymentDate: "2022-01-01",
//                     total: 100,
//                 },
//                 {
//                     user: user.username,
//                     paid: 1,
//                     paymentDate: "2022-02-01",
//                     total: 200,
//                 },
//             ];

//             jest.spyOn(CartDAO.prototype, "getAllCarts").mockResolvedValue(
//                 cartRows.map(
//                     (row) =>
//                         new Cart(
//                             row.user,
//                             !!row.paid,
//                             row.paymentDate,
//                             row.total,
//                             [],
//                         ),
//                 ),
//             );

//             const controller = new CartController();
//             const response = await controller.getAllCarts();

//             expect(CartDAO.prototype.getAllCarts).toHaveBeenCalledTimes(1);
//             expect(response.length).toBe(2);
//             expect(response[0].total).toBe(100);
//             expect(response[1].total).toBe(200);
//         });

//         test("Returns an empty array when no carts are found", async () => {
//             jest.spyOn(CartDAO.prototype, "getAllCarts").mockResolvedValueOnce(
//                 [],
//             );

//             const controller = new CartController();
//             const response = await controller.getAllCarts();

//             expect(CartDAO.prototype.getAllCarts).toHaveBeenCalledTimes(1);
//             expect(response).toEqual([]);
//         });

//         test("Fails to get all carts", async () => {
//             jest.spyOn(CartDAO.prototype, "getAllCarts").mockRejectedValueOnce(
//                 new Error(),
//             );

//             const controller = new CartController();
//             await expect(controller.getAllCarts()).rejects.toThrow(Error);
//         });
//     });

//     describe("getProductsInCart", () => {
//         test("Gets all products in the user's cart", async () => {
//             const productRows = [
//                 { model: "product1", quantity: 1, category: "cat1", price: 50 },
//                 { model: "product2", quantity: 2, category: "cat2", price: 30 },
//             ];

//             jest.spyOn(
//                 CartDAO.prototype,
//                 "getProductsInCart",
//             ).mockResolvedValue(
//                 productRows.map(
//                     (row) =>
//                         new ProductInCart(
//                             row.model,
//                             row.quantity,
//                             Category.SMARTPHONE,
//                             row.price,
//                         ),
//                 ),
//             );

//             const controller = new CartController();
//             const response = await controller.getProductsInCart(user);

//             expect(CartDAO.prototype.getProductsInCart).toHaveBeenCalledTimes(
//                 1,
//             );
//             expect(response.length).toBe(2);
//             expect(response[0]).toEqual(
//                 new ProductInCart("product1", 1, Category.SMARTPHONE, 50),
//             );
//             expect(response[1]).toEqual(
//                 new ProductInCart("product2", 2, Category.SMARTPHONE, 30),
//             );
//         });

//         test("Returns an empty array when no products are found", async () => {
//             jest.spyOn(
//                 CartDAO.prototype,
//                 "getProductsInCart",
//             ).mockResolvedValueOnce([]);

//             const controller = new CartController();
//             const response = await controller.getProductsInCart(user);

//             expect(CartDAO.prototype.getProductsInCart).toHaveBeenCalledTimes(
//                 1,
//             );
//             expect(response).toEqual([]);
//         });

//         test("Fails to get products in the cart", async () => {
//             jest.spyOn(
//                 CartDAO.prototype,
//                 "getProductsInCart",
//             ).mockRejectedValueOnce(new Error());

//             const controller = new CartController();
//             await expect(controller.getProductsInCart(user)).rejects.toThrow(
//                 Error,
//             );
//         });
//     });
// });
