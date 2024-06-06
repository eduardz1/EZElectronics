import {
    test,
    expect,
    jest,
    beforeEach,
    afterEach,
    describe,
} from "@jest/globals";
import ProductController from "../../src/controllers/productController";
import ProductDAO from "../../src/dao/productDAO";
import { Category } from "../../src/components/product";
import {
    EmptyProductStockError,
    IncorrectGroupingError,
    LowProductStockError,
    IncorrectCategoryGroupingError,
    IncorrectModelGroupingError,
    ProductAlreadyExistsError,
    ProductNotFoundError,
} from "../../src/errors/productError";
import { DateError } from "../../src/utilities";

beforeEach(() => {
    jest.mock("../../src/dao/productDAO");
});

afterEach(() => {
    jest.resetAllMocks();
});

describe("ProductController", () => {
    describe("registerProducts", () => {
        test("Insert a valid product in the system", async () => {
            const testProduct = {
                model: "test",
                category: Category.SMARTPHONE,
                quantity: 1,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(null);
            jest.spyOn(
                ProductDAO.prototype,
                "registerProducts",
            ).mockResolvedValueOnce(true);
            const controller = new ProductController();
            const response = await controller.registerProducts(
                testProduct.model,
                testProduct.category,
                testProduct.quantity,
                testProduct.details,
                testProduct.sellingPrice,
                testProduct.arrivalDate,
            );

            expect(
                ProductDAO.prototype.getProductByModel,
            ).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testProduct.model,
            );
            expect(ProductDAO.prototype.registerProducts).toHaveBeenCalledTimes(
                1,
            );
            expect(ProductDAO.prototype.registerProducts).toHaveBeenCalledWith(
                testProduct.model,
                testProduct.category,
                testProduct.quantity,
                testProduct.details,
                testProduct.sellingPrice,
                testProduct.arrivalDate,
            );
            expect(response).toBe(true);
        });

        test("Insert a product that already exists in the system", async () => {
            const testProduct = {
                model: "test",
                category: Category.SMARTPHONE,
                quantity: 1,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(null);
            jest.spyOn(
                ProductDAO.prototype,
                "registerProducts",
            ).mockResolvedValueOnce(true);

            const controller = new ProductController();
            await controller.registerProducts(
                testProduct.model,
                testProduct.category,
                testProduct.quantity,
                testProduct.details,
                testProduct.sellingPrice,
                testProduct.arrivalDate,
            );

            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(testProduct);
            jest.spyOn(
                ProductDAO.prototype,
                "registerProducts",
            ).mockResolvedValueOnce(false);

            await expect(
                controller.registerProducts(
                    testProduct.model,
                    testProduct.category,
                    testProduct.quantity,
                    testProduct.details,
                    testProduct.sellingPrice,
                    testProduct.arrivalDate,
                ),
            ).rejects.toThrow(ProductAlreadyExistsError);
        });

        test("Insert a product with an arrival date in the future", async () => {
            const testProduct = {
                model: "test",
                category: Category.SMARTPHONE,
                quantity: 1,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "3000-01-01", // Probably we won't be around to see this test fail
            };
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(null);
            jest.spyOn(
                ProductDAO.prototype,
                "registerProducts",
            ).mockResolvedValueOnce(true);

            const controller = new ProductController();
            await expect(
                controller.registerProducts(
                    testProduct.model,
                    testProduct.category,
                    testProduct.quantity,
                    testProduct.details,
                    testProduct.sellingPrice,
                    testProduct.arrivalDate,
                ),
            ).rejects.toThrow(DateError);
        });
    });

    describe("changeProductQuantity", () => {
        test("Increase the quantity of a product", async () => {
            const testProduct = {
                model: "test",
                category: Category.SMARTPHONE,
                quantity: 1,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(testProduct);
            jest.spyOn(
                ProductDAO.prototype,
                "changeProductQuantity",
            ).mockResolvedValueOnce(2);

            const controller = new ProductController();
            const response = await controller.changeProductQuantity(
                testProduct.model,
                1,
                "2022-01-02",
            );

            expect(
                ProductDAO.prototype.getProductByModel,
            ).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testProduct.model,
            );
            expect(
                ProductDAO.prototype.changeProductQuantity,
            ).toHaveBeenCalledTimes(1);
            expect(
                ProductDAO.prototype.changeProductQuantity,
            ).toHaveBeenCalledWith(testProduct.model, 2, "2022-01-02");
            expect(response).toBe(2);
        });

        test("Increase the quantity of a product that does not exist", async () => {
            const testProduct = {
                model: "test",
                category: Category.SMARTPHONE,
                quantity: 1,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(null);

            const controller = new ProductController();
            await expect(
                controller.changeProductQuantity(
                    testProduct.model,
                    1,
                    "2022-01-02",
                ),
            ).rejects.toThrow(ProductNotFoundError);
        });

        test("Increase the quantity of a product with a change date in the future", async () => {
            const testProduct = {
                model: "test",
                category: Category.SMARTPHONE,
                quantity: 1,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(testProduct);

            const controller = new ProductController();
            await expect(
                controller.changeProductQuantity(
                    testProduct.model,
                    1,
                    "3000-01-01",
                ),
            ).rejects.toThrow(DateError);
        });

        test("Increase the quantity of a product with a change date before the arrival date", async () => {
            const testProduct = {
                model: "test",
                category: Category.SMARTPHONE,
                quantity: 1,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(testProduct);

            const controller = new ProductController();
            await expect(
                controller.changeProductQuantity(
                    testProduct.model,
                    1,
                    "2021-01-01",
                ),
            ).rejects.toThrow(Error);
        });
    });

    describe("sellProduct", () => {
        test("Sell a product (decrease the quantity)", async () => {
            const testProduct = {
                model: "test",
                category: Category.SMARTPHONE,
                quantity: 2,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(testProduct);
            jest.spyOn(
                ProductDAO.prototype,
                "sellProduct",
            ).mockResolvedValueOnce(1);

            const controller = new ProductController();
            const response = await controller.sellProduct(
                testProduct.model,
                1,
                "2022-01-02",
            );

            expect(
                ProductDAO.prototype.getProductByModel,
            ).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testProduct.model,
            );
            expect(ProductDAO.prototype.sellProduct).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.sellProduct).toHaveBeenCalledWith(
                testProduct.model,
                1,
                "2022-01-02",
            );
            expect(response).toBe(1);
        });

        test("Decrease the quantity of a product that does not exist", async () => {
            const testProduct = {
                model: "test",
                category: Category.SMARTPHONE,
                quantity: 1,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(null);

            const controller = new ProductController();
            await expect(
                controller.sellProduct(testProduct.model, 1, "2022-01-02"),
            ).rejects.toThrow(ProductNotFoundError);
        });

        test("Sell a product with a selling date in the future", async () => {
            const testProduct = {
                model: "test",
                category: Category.SMARTPHONE,
                quantity: 2,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(testProduct);

            const controller = new ProductController();
            await expect(
                controller.sellProduct(testProduct.model, 1, "3000-01-01"),
            ).rejects.toThrow(Error);
        });

        test("Sell a product with a selling date before the arrival date", async () => {
            const testProduct = {
                model: "test",
                category: Category.SMARTPHONE,
                quantity: 2,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(testProduct);

            const controller = new ProductController();
            await expect(
                controller.sellProduct(testProduct.model, 1, "2021-01-01"),
            ).rejects.toThrow(Error);
        });

        test("Sell a product that is already sold out", async () => {
            const testProduct = {
                model: "test",
                category: Category.SMARTPHONE,
                quantity: 0,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(testProduct);

            const controller = new ProductController();
            await expect(
                controller.sellProduct(testProduct.model, 1, "2022-01-02"),
            ).rejects.toThrow(EmptyProductStockError);
        });

        test("Sell more units than the available quantity", async () => {
            const testProduct = {
                model: "test",
                category: Category.SMARTPHONE,
                quantity: 2,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(testProduct);

            const controller = new ProductController();
            await expect(
                controller.sellProduct(testProduct.model, 3, "2022-01-02"),
            ).rejects.toThrow(LowProductStockError);
        });
    });

    describe("getProducts", () => {
        test("Get all products with only one product in the database", async () => {
            const testProduct = {
                model: "test",
                category: Category.SMARTPHONE,
                quantity: 2,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductDAO.prototype,
                "getAllProducts",
            ).mockResolvedValueOnce([testProduct]);

            const controller = new ProductController();
            const response = await controller.getProducts(null, null, null);

            expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalledTimes(
                1,
            );
            expect(response).toEqual([testProduct]);
        });

        test("Get all products with multiple products in the database", async () => {
            const testProduct1 = {
                model: "test1",
                category: Category.SMARTPHONE,
                quantity: 2,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            const testProduct2 = {
                model: "test2",
                category: Category.LAPTOP,
                quantity: 3,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductDAO.prototype,
                "getAllProducts",
            ).mockResolvedValueOnce([testProduct1, testProduct2]);

            const controller = new ProductController();
            const response = await controller.getProducts(null, null, null);

            expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalledTimes(
                1,
            );
            expect(response).toEqual([testProduct1, testProduct2]);
        });

        test("Get all products in the database even if some are sold out", async () => {
            const testProduct1 = {
                model: "test1",
                category: Category.SMARTPHONE,
                quantity: 2,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            const testProduct2 = {
                model: "test2",
                category: Category.LAPTOP,
                quantity: 0,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductDAO.prototype,
                "getAllProducts",
            ).mockResolvedValueOnce([testProduct1, testProduct2]);

            const controller = new ProductController();
            const response = await controller.getProducts(null, null, null);

            expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalledTimes(
                1,
            );
            expect(response).toEqual([testProduct1, testProduct2]);
        });

        test("Get all products with no products in the database", async () => {
            jest.spyOn(
                ProductDAO.prototype,
                "getAllProducts",
            ).mockResolvedValueOnce([]);

            const controller = new ProductController();
            const response = await controller.getProducts(null, null, null);

            expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalledTimes(
                1,
            );
            expect(response).toEqual([]);
        });

        test("Get all products with a category filter", async () => {
            const testProduct1 = {
                model: "test1",
                category: Category.SMARTPHONE,
                quantity: 2,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };

            jest.spyOn(
                ProductDAO.prototype,
                "getProductsByCategory",
            ).mockResolvedValueOnce([testProduct1]);

            const controller = new ProductController();
            const response = await controller.getProducts(
                "category",
                Category.SMARTPHONE,
                null,
            );

            expect(
                ProductDAO.prototype.getProductsByCategory,
            ).toHaveBeenCalledTimes(1);
            expect(response).toEqual([testProduct1]);
        });

        test("Get all products with a model filter", async () => {
            const testProduct1 = {
                model: "test1",
                category: Category.SMARTPHONE,
                quantity: 2,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };

            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(testProduct1);
            jest.spyOn(
                ProductDAO.prototype,
                "getProductsByModel",
            ).mockResolvedValueOnce([testProduct1]);

            const controller = new ProductController();
            const response = await controller.getProducts(
                "model",
                null,
                "test1",
            );

            expect(
                ProductDAO.prototype.getProductsByModel,
            ).toHaveBeenCalledTimes(1);
            expect(response).toEqual([testProduct1]);
        });

        test("Try to get all products by category without specifying a category", async () => {
            const controller = new ProductController();
            await expect(
                controller.getProducts("category", null, null),
            ).rejects.toThrow(IncorrectCategoryGroupingError);
        });

        test("Try to get all products by category with a model specified", async () => {
            const controller = new ProductController();
            await expect(
                controller.getProducts("category", Category.SMARTPHONE, "test"),
            ).rejects.toThrow(IncorrectCategoryGroupingError);
        });

        test("Try to get all products by model without specifying a model", async () => {
            const controller = new ProductController();
            await expect(
                controller.getProducts("model", null, null),
            ).rejects.toThrow(IncorrectModelGroupingError);
        });

        test("Try to get all products by model with a category filter", async () => {
            const controller = new ProductController();
            await expect(
                controller.getProducts("model", Category.SMARTPHONE, null),
            ).rejects.toThrow(IncorrectModelGroupingError);
        });

        test("Try to get all products by model with a non-existing model", async () => {
            const controller = new ProductController();
            await expect(
                controller.getProducts("model", null, "test"),
            ).rejects.toThrow(ProductNotFoundError);
        });

        test("Get all products without grouping but with a category filter", async () => {
            const controller = new ProductController();
            await expect(
                controller.getProducts(null, Category.SMARTPHONE, null),
            ).rejects.toThrow(IncorrectGroupingError);
        });

        test("Get all products without grouping but with a model filter", async () => {
            const controller = new ProductController();
            await expect(
                controller.getProducts(null, null, "test"),
            ).rejects.toThrow(IncorrectGroupingError);
        });
    });

    describe("getAvailableProducts", () => {
        test("Get all available products with only one product in the database", async () => {
            const testProduct = {
                model: "test",
                category: Category.SMARTPHONE,
                quantity: 2,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductDAO.prototype,
                "getAllAvailableProducts",
            ).mockResolvedValueOnce([testProduct]);

            const controller = new ProductController();
            const response = await controller.getAvailableProducts(
                null,
                null,
                null,
            );

            expect(
                ProductDAO.prototype.getAllAvailableProducts,
            ).toHaveBeenCalledTimes(1);
            expect(response).toEqual([testProduct]);
        });

        test("Get all available products with multiple products in the database", async () => {
            const testProduct1 = {
                model: "test1",
                category: Category.SMARTPHONE,
                quantity: 2,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            const testProduct2 = {
                model: "test2",
                category: Category.LAPTOP,
                quantity: 3,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };
            jest.spyOn(
                ProductDAO.prototype,
                "getAllAvailableProducts",
            ).mockResolvedValueOnce([testProduct1, testProduct2]);

            const controller = new ProductController();
            const response = await controller.getAvailableProducts(
                null,
                null,
                null,
            );

            expect(
                ProductDAO.prototype.getAllAvailableProducts,
            ).toHaveBeenCalledTimes(1);
            expect(response).toEqual([testProduct1, testProduct2]);
        });

        test("Get all available products with no products in the database", async () => {
            jest.spyOn(
                ProductDAO.prototype,
                "getAllAvailableProducts",
            ).mockResolvedValueOnce([]);

            const controller = new ProductController();
            const response = await controller.getAvailableProducts(
                null,
                null,
                null,
            );

            expect(
                ProductDAO.prototype.getAllAvailableProducts,
            ).toHaveBeenCalledTimes(1);
            expect(response).toEqual([]);
        });

        test("Get all available products with a category filter", async () => {
            const testProduct1 = {
                model: "test1",
                category: Category.SMARTPHONE,
                quantity: 2,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };

            jest.spyOn(
                ProductDAO.prototype,
                "getAvailableProductsByCategory",
            ).mockResolvedValueOnce([testProduct1]);

            const controller = new ProductController();
            const response = await controller.getAvailableProducts(
                "category",
                Category.SMARTPHONE,
                null,
            );

            expect(
                ProductDAO.prototype.getAvailableProductsByCategory,
            ).toHaveBeenCalledTimes(1);
            expect(response).toEqual([testProduct1]);
        });

        test("Get all available products with a model filter", async () => {
            const testProduct1 = {
                model: "test1",
                category: Category.SMARTPHONE,
                quantity: 2,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            };

            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(testProduct1);
            jest.spyOn(
                ProductDAO.prototype,
                "getAvailableProductsByModel",
            ).mockResolvedValueOnce([testProduct1]);

            const controller = new ProductController();
            const response = await controller.getAvailableProducts(
                "model",
                null,
                "test1",
            );

            expect(
                ProductDAO.prototype.getAvailableProductsByModel,
            ).toHaveBeenCalledTimes(1);
            expect(response).toEqual([testProduct1]);
        });

        test("Try to get all available products by category without specifying a category", async () => {
            const controller = new ProductController();
            await expect(
                controller.getAvailableProducts("category", null, null),
            ).rejects.toThrow(IncorrectCategoryGroupingError);
        });

        test("Try to get all available products by model without specifying a model", async () => {
            const controller = new ProductController();
            await expect(
                controller.getAvailableProducts("model", null, null),
            ).rejects.toThrow(IncorrectModelGroupingError);
        });

        test("Try to get all available products by model with a non-existing model", async () => {
            const controller = new ProductController();
            await expect(
                controller.getAvailableProducts("model", null, "test"),
            ).rejects.toThrow(ProductNotFoundError);
        });

        test("Get all available products without grouping but with a category filter", async () => {
            const controller = new ProductController();
            await expect(
                controller.getAvailableProducts(
                    null,
                    Category.SMARTPHONE,
                    null,
                ),
            ).rejects.toThrow(IncorrectGroupingError);
        });

        test("Get all available products without grouping but with a model filter", async () => {
            const controller = new ProductController();
            await expect(
                controller.getAvailableProducts(null, null, "test"),
            ).rejects.toThrow(IncorrectGroupingError);
        });
    });

    describe("deleteAllProducts", () => {
        test("Delete all products in the database", async () => {
            jest.spyOn(
                ProductDAO.prototype,
                "deleteAllProducts",
            ).mockResolvedValueOnce(true);

            const controller = new ProductController();
            const response = await controller.deleteAllProducts();

            expect(
                ProductDAO.prototype.deleteAllProducts,
            ).toHaveBeenCalledTimes(1);
            expect(response).toBe(true);
        });
    });

    describe("deleteProduct", () => {
        test("Delete a product in the database", async () => {
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce({
                model: "test",
                category: Category.SMARTPHONE,
                quantity: 1,
                details: "test",
                sellingPrice: 1,
                arrivalDate: "2022-01-01",
            });
            jest.spyOn(
                ProductDAO.prototype,
                "deleteProduct",
            ).mockResolvedValueOnce(true);

            const controller = new ProductController();
            const response = await controller.deleteProduct("test");

            expect(
                ProductDAO.prototype.getProductByModel,
            ).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                "test",
            );
            expect(ProductDAO.prototype.deleteProduct).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.deleteProduct).toHaveBeenCalledWith(
                "test",
            );
            expect(response).toBe(true);
        });

        test("Try to delete a product that does not exist", async () => {
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(null);

            const controller = new ProductController();
            await expect(controller.deleteProduct("test")).rejects.toThrow(
                ProductNotFoundError,
            );
        });
    });
});
