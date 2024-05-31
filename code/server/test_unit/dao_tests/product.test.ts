import { describe, test, expect, afterEach, jest } from "@jest/globals";
import ProductDAO from "../../src/dao/productDAO";
import db from "../../src/db/db";

import { Database } from "sqlite3";
import { Category } from "../../src/components/product";

jest.mock("../../src/db/db.ts");

afterEach(() => {
    jest.resetAllMocks();
});

describe("ProductDAO", () => {
    describe("registerProducts", () => {
        test("Registers a product", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );
            const result = await productDAO.registerProducts(
                "model",
                Category.LAPTOP,
                10,
                "details",
                10,
                "2021-10-10",
            );
            expect(result).toBe(true);
        });

        test("Register a product without arrival date", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );
            const result = await productDAO.registerProducts(
                "model",
                Category.LAPTOP,
                10,
                "details",
                10,
                null,
            );
            expect(result).toBe(true);
        });

        test("Register a product without details", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );
            const result = await productDAO.registerProducts(
                "model",
                Category.LAPTOP,
                10,
                null,
                10,
                "2021-10-10",
            );
            expect(result).toBe(true);
        });

        test("Fails to register a product", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );
            productDAO
                .registerProducts(
                    "model",
                    Category.LAPTOP,
                    10,
                    "details",
                    10,
                    "2021-10-10",
                )
                .catch((error) => {
                    expect(error).toBeInstanceOf(Error);
                });
        });
    });

    describe("getProductByModel", () => {
        test("Gets a product by model", async () => {
            const testProduct = {
                model: "model",
                category: Category.LAPTOP,
                quantity: 10,
                details: "details",
                sellingPrice: 10,
                arrivalDate: "2021-10-10",
            };
            const productDAO = new ProductDAO();
            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, testProduct);
                    return {} as Database;
                },
            );
            const result = await productDAO.getProductByModel("model");
            expect(result).toEqual(testProduct);
        });

        test("Returns null when product is not found", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, undefined);
                    return {} as Database;
                },
            );
            const result = await productDAO.getProductByModel("model");
            expect(result).toBeNull();
        });

        test("Fails to get a product by model", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "get").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );
            productDAO.getProductByModel("model").catch((error) => {
                expect(error).toBeInstanceOf(Error);
            });
        });
    });

    describe("changeProductQuantity", () => {
        test("Changes the quantity of a product", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, {
                        model: "model",
                        category: Category.LAPTOP,
                        quantity: 10,
                        details: "details",
                        sellingPrice: 10,
                        arrivalDate: "2021-10-10",
                    });
                    return {} as Database;
                },
            );
            const result = await productDAO.changeProductQuantity(
                "model",
                5,
                "2021-10-11",
            );
            expect(result).toBe(5);
        });

        test("Changes the quantity of a product without change date", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, {
                        model: "model",
                        category: Category.LAPTOP,
                        quantity: 10,
                        details: "details",
                        sellingPrice: 10,
                        arrivalDate: "2021-10-10",
                    });
                    return {} as Database;
                },
            );
            const result = await productDAO.changeProductQuantity(
                "model",
                5,
                null,
            );
            expect(result).toBe(5);
        });

        test("Fails to change the quantity of a product", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );
            productDAO
                .changeProductQuantity("model", 5, "2021-10-11")
                .catch((error) => {
                    expect(error).toBeInstanceOf(Error);
                });
        });
    });

    describe("sellProduct", () => {
        test("Sells a product", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, {
                        model: "model",
                        category: Category.LAPTOP,
                        quantity: 10,
                        details: "details",
                        sellingPrice: 10,
                        arrivalDate: "2021-10-10",
                    });
                    return {} as Database;
                },
            );
            const result = await productDAO.sellProduct(
                "model",
                5,
                "2021-10-11",
            );
            expect(result).toBe(5);
        });

        test("Sells a product without selling date", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, {
                        model: "model",
                        category: Category.LAPTOP,
                        quantity: 10,
                        details: "details",
                        sellingPrice: 10,
                        arrivalDate: "2021-10-10",
                    });
                    return {} as Database;
                },
            );
            const result = await productDAO.sellProduct("model", 5, null);
            expect(result).toBe(5);
        });

        test("Fails to sell a product", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );
            productDAO.sellProduct("model", 5, "2021-10-11").catch((error) => {
                expect(error).toBeInstanceOf(Error);
            });
        });
    });

    describe("getProductsByCategory", () => {
        test("Gets all products of a certain category", async () => {
            const productDAO = new ProductDAO();
            const testProducts = [
                {
                    model: "model",
                    category: Category.LAPTOP,
                    quantity: 10,
                    details: "details",
                    sellingPrice: 10,
                    arrivalDate: "2021-10-10",
                },
                {
                    model: "model2",
                    category: Category.LAPTOP,
                    quantity: 10,
                    details: "details",
                    sellingPrice: 10,
                    arrivalDate: "2021-10-10",
                },
            ];
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, testProducts);
                    return {} as Database;
                },
            );
            const result = await productDAO.getProductsByCategory(
                Category.LAPTOP,
            );
            expect(result).toEqual(testProducts);
        });

        test("Gets an array of a single product of a certain category", async () => {
            const productDAO = new ProductDAO();
            const testProduct = {
                model: "model",
                category: Category.LAPTOP,
                quantity: 10,
                details: "details",
                sellingPrice: 10,
                arrivalDate: "2021-10-10",
            };
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, [testProduct]);
                    return {} as Database;
                },
            );
            const result = await productDAO.getProductsByCategory(
                Category.LAPTOP,
            );
            expect(result).toEqual([testProduct]);
        });

        test("Returns an empty array when no products are found", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, []);
                    return {} as Database;
                },
            );
            const result = await productDAO.getProductsByCategory(
                Category.LAPTOP,
            );
            expect(result).toEqual([]);
        });

        test("Fails to get products by category", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );
            productDAO.getProductsByCategory(Category.LAPTOP).catch((error) => {
                expect(error).toBeInstanceOf(Error);
            });
        });
    });

    describe("getProductsByModel", () => {
        test("Gets all products of a certain model", async () => {
            const productDAO = new ProductDAO();
            const testProducts = [
                {
                    model: "model",
                    category: Category.LAPTOP,
                    quantity: 10,
                    details: "details",
                    sellingPrice: 10,
                    arrivalDate: "2021-10-10",
                },
                {
                    model: "model",
                    category: Category.LAPTOP,
                    quantity: 10,
                    details: "details",
                    sellingPrice: 10,
                    arrivalDate: "2021-10-10",
                },
            ];
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, testProducts);
                    return {} as Database;
                },
            );
            const result = await productDAO.getProductsByModel("model");
            expect(result).toEqual(testProducts);
        });

        test("Gets an array of a single product of a certain model", async () => {
            const productDAO = new ProductDAO();
            const testProduct = {
                model: "model",
                category: Category.LAPTOP,
                quantity: 10,
                details: "details",
                sellingPrice: 10,
                arrivalDate: "2021-10-10",
            };
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, [testProduct]);
                    return {} as Database;
                },
            );
            const result = await productDAO.getProductsByModel("model");
            expect(result).toEqual([testProduct]);
        });

        test("Returns an empty array when no products are found", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, []);
                    return {} as Database;
                },
            );
            const result = await productDAO.getProductsByModel("model");
            expect(result).toEqual([]);
        });

        test("Fails to get products by model", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );
            productDAO.getProductsByModel("model").catch((error) => {
                expect(error).toBeInstanceOf(Error);
            });
        });
    });

    describe("getAllProducts", () => {
        test("Gets all products", async () => {
            const productDAO = new ProductDAO();
            const testProducts = [
                {
                    model: "model",
                    category: Category.LAPTOP,
                    quantity: 10,
                    details: "details",
                    sellingPrice: 10,
                    arrivalDate: "2021-10-10",
                },
                {
                    model: "model2",
                    category: Category.LAPTOP,
                    quantity: 10,
                    details: "details",
                    sellingPrice: 10,
                    arrivalDate: "2021-10-10",
                },
            ];
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, testProducts);
                    return {} as Database;
                },
            );
            const result = await productDAO.getAllProducts();
            expect(result).toEqual(testProducts);
        });

        test("Gets an array of a single product", async () => {
            const productDAO = new ProductDAO();
            const testProduct = {
                model: "model",
                category: Category.LAPTOP,
                quantity: 10,
                details: "details",
                sellingPrice: 10,
                arrivalDate: "2021-10-10",
            };
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, [testProduct]);
                    return {} as Database;
                },
            );
            const result = await productDAO.getAllProducts();
            expect(result).toEqual([testProduct]);
        });

        test("Returns an empty array when no products are found", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, []);
                    return {} as Database;
                },
            );
            const result = await productDAO.getAllProducts();
            expect(result).toEqual([]);
        });

        test("Fails to get all products", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );
            productDAO.getAllProducts().catch((error) => {
                expect(error).toBeInstanceOf(Error);
            });
        });
    });

    describe("getAvailableProductsByCategory", () => {
        test("Gets all available products of a certain category", async () => {
            const productDAO = new ProductDAO();
            const testProducts = [
                {
                    model: "model",
                    category: Category.LAPTOP,
                    quantity: 10,
                    details: "details",
                    sellingPrice: 10,
                    arrivalDate: "2021-10-10",
                },
                {
                    model: "model2",
                    category: Category.LAPTOP,
                    quantity: 10,
                    details: "details",
                    sellingPrice: 10,
                    arrivalDate: "2021-10-10",
                },
            ];
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, testProducts);
                    return {} as Database;
                },
            );
            const result = await productDAO.getAvailableProductsByCategory(
                Category.LAPTOP,
            );
            expect(result).toEqual(testProducts);
        });

        test("Gets an array of a single available product of a certain category", async () => {
            const productDAO = new ProductDAO();
            const testProduct = {
                model: "model",
                category: Category.LAPTOP,
                quantity: 10,
                details: "details",
                sellingPrice: 10,
                arrivalDate: "2021-10-10",
            };
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, [testProduct]);
                    return {} as Database;
                },
            );
            const result = await productDAO.getAvailableProductsByCategory(
                Category.LAPTOP,
            );
            expect(result).toEqual([testProduct]);
        });

        test("Returns an empty array when no available products are found", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, []);
                    return {} as Database;
                },
            );
            const result = await productDAO.getAvailableProductsByCategory(
                Category.LAPTOP,
            );
            expect(result).toEqual([]);
        });

        test("Fails to get available products by category", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );
            productDAO
                .getAvailableProductsByCategory(Category.LAPTOP)
                .catch((error) => {
                    expect(error).toBeInstanceOf(Error);
                });
        });
    });

    describe("getAvailableProductsByModel", () => {
        test("Gets all available products of a certain model", async () => {
            const productDAO = new ProductDAO();
            const testProducts = [
                {
                    model: "model",
                    category: Category.LAPTOP,
                    quantity: 10,
                    details: "details",
                    sellingPrice: 10,
                    arrivalDate: "2021-10-10",
                },
                {
                    model: "model",
                    category: Category.LAPTOP,
                    quantity: 10,
                    details: "details",
                    sellingPrice: 10,
                    arrivalDate: "2021-10-10",
                },
            ];
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, testProducts);
                    return {} as Database;
                },
            );
            const result =
                await productDAO.getAvailableProductsByModel("model");
            expect(result).toEqual(testProducts);
        });

        test("Gets an array of a single available product of a certain model", async () => {
            const productDAO = new ProductDAO();
            const testProduct = {
                model: "model",
                category: Category.LAPTOP,
                quantity: 10,
                details: "details",
                sellingPrice: 10,
                arrivalDate: "2021-10-10",
            };
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, [testProduct]);
                    return {} as Database;
                },
            );
            const result =
                await productDAO.getAvailableProductsByModel("model");
            expect(result).toEqual([testProduct]);
        });

        test("Returns an empty array when no available products are found", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, []);
                    return {} as Database;
                },
            );
            const result =
                await productDAO.getAvailableProductsByModel("model");
            expect(result).toEqual([]);
        });

        test("Fails to get available products by model", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );
            productDAO.getAvailableProductsByModel("model").catch((error) => {
                expect(error).toBeInstanceOf(Error);
            });
        });
    });

    describe("getAllAvailableProducts", () => {
        test("Gets all available products", async () => {
            const productDAO = new ProductDAO();
            const testProducts = [
                {
                    model: "model",
                    category: Category.LAPTOP,
                    quantity: 10,
                    details: "details",
                    sellingPrice: 10,
                    arrivalDate: "2021-10-10",
                },
                {
                    model: "model2",
                    category: Category.LAPTOP,
                    quantity: 10,
                    details: "details",
                    sellingPrice: 10,
                    arrivalDate: "2021-10-10",
                },
            ];
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, testProducts);
                    return {} as Database;
                },
            );
            const result = await productDAO.getAllAvailableProducts();
            expect(result).toEqual(testProducts);
        });

        test("Gets an array of a single available product", async () => {
            const productDAO = new ProductDAO();
            const testProduct = {
                model: "model",
                category: Category.LAPTOP,
                quantity: 10,
                details: "details",
                sellingPrice: 10,
                arrivalDate: "2021-10-10",
            };
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, [testProduct]);
                    return {} as Database;
                },
            );
            const result = await productDAO.getAllAvailableProducts();
            expect(result).toEqual([testProduct]);
        });

        test("Returns an empty array when no available products are found", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null, []);
                    return {} as Database;
                },
            );
            const result = await productDAO.getAllAvailableProducts();
            expect(result).toEqual([]);
        });

        test("Fails to get all available products", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "all").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );
            productDAO.getAllAvailableProducts().catch((error) => {
                expect(error).toBeInstanceOf(Error);
            });
        });
    });

    describe("deleteAllProducts", () => {
        test("Deletes all products from the database", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );
            const result = await productDAO.deleteAllProducts();
            expect(result).toBe(true);
        });

        test("Fails to delete all products from the database", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );
            productDAO.deleteAllProducts().catch((error) => {
                expect(error).toBeInstanceOf(Error);
            });
        });
    });

    describe("deleteProduct", () => {
        test("Deletes a product from the database", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );
            const result = await productDAO.deleteProduct("model");
            expect(result).toBe(true);
        });

        test("Fails to delete a product from the database", async () => {
            const productDAO = new ProductDAO();
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );
            productDAO.deleteProduct("model").catch((error) => {
                expect(error).toBeInstanceOf(Error);
            });
        });
    });
});
