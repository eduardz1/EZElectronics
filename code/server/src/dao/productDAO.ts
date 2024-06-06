import { Product } from "../components/product";
import db from "../db/db";

/**
 * A class that implements the interaction with the database for all product-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ProductDAO {
    /**
     * Registers products in the database.
     *
     * @param model - The model of the product.
     * @param category - The category of the product.
     * @param quantity - The quantity of the product.
     * @param details - The details of the product (optional).
     * @param sellingPrice - The selling price of the product.
     * @param arrivalDate - The arrival date of the product (optional).
     * @returns A promise that resolves to a boolean indicating whether the registration was successful.
     */
    registerProducts(
        model: string,
        category: string,
        quantity: number,
        details: string | null,
        sellingPrice: number,
        arrivalDate: string | null,
    ): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql =
                "INSERT INTO products(model, category, quantity, sellingPrice" +
                (arrivalDate ? " , arrivalDate" : "") +
                (details ? " , details" : "") +
                ") VALUES(?, ?, ?, ?" +
                (arrivalDate ? ", ?" : "") +
                (details ? ", ?" : "") +
                ")";

            const params =
                arrivalDate && details
                    ? [
                          model,
                          category,
                          quantity,
                          sellingPrice,
                          arrivalDate,
                          details,
                      ]
                    : arrivalDate
                      ? [
                            model,
                            category,
                            quantity,
                            details,
                            sellingPrice,
                            arrivalDate,
                        ]
                      : details
                        ? [model, category, quantity, sellingPrice, details]
                        : [model, category, quantity, sellingPrice];

            db.run(sql, params, (err: Error | null) => {
                if (err) {
                    console.log(err);
                    reject(err);
                    return;
                }

                resolve(true);
            });
        });
    }

    /**
     * Gets a product by its model.
     *
     * @param model - The model of the product.
     * @returns A promise that resolves to a product object if the product is found, or null otherwise.
     */
    getProductByModel(model: string): Promise<Product | null> {
        return new Promise<Product | null>((resolve, reject) => {
            const sql = "SELECT * FROM products WHERE model = ?";
            db.get(sql, [model], (err: Error | null, row: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (row) {
                    const product: Product = {
                        model: row.model,
                        category: row.category,
                        quantity: row.quantity,
                        details: row.details,
                        sellingPrice: row.sellingPrice,
                        arrivalDate: row.arrivalDate,
                    };
                    resolve(product);
                } else {
                    resolve(null);
                }
            });
        });
    }

    /**
     * Changes the quantity of a product.
     *
     * @param model - The model of the product.
     * @param newQuantity - The new quantity of the product.
     * @param changeDate - The date of the change (optional).
     * @returns A promise that resolves to the new quantity of the product.
     */

    changeProductQuantity(
        model: string,
        newQuantity: number,
        changeDate: string | null,
    ): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            const sql =
                "UPDATE products SET quantity = ?" +
                (changeDate ? ", arrivalDate = ?" : "") +
                " WHERE model = ?";

            db.run(
                sql,
                changeDate
                    ? [newQuantity, changeDate, model]
                    : [newQuantity, model],
                (err: Error | null) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(newQuantity);
                },
            );
        });
    }

    /**
     * Sells a product.
     *
     * @param model - The model of the product.
     * @param quantity - The quantity of the product to sell.
     * @param sellingDate - The date of the sale (optional).
     * @returns A promise that resolves to the new quantity of the product.
     */
    sellProduct(
        model: string,
        quantity: number,
        sellingDate: string | null,
    ): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            const sql =
                "UPDATE products SET quantity = ?, sellingDate = ? WHERE model = ?";

            db.run(sql, [quantity, sellingDate, model], (err: Error | null) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(quantity);
            });
        });
    }

    /**
     * Gets all products of a given category.
     *
     * @param category - The category of the products.
     * @returns A promise that resolves to an array of products.
     */
    getProductsByCategory(category: string): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            const sql = "SELECT * FROM products WHERE category = ?";
            db.all(sql, [category], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }

                const products: Product[] = rows.map((row) => ({
                    model: row.model,
                    category: row.category,
                    quantity: row.quantity,
                    details: row.details,
                    sellingPrice: row.sellingPrice,
                    arrivalDate: row.arrivalDate,
                }));

                resolve(products);
            });
        });
    }

    /**
     * Gets all products of a given model.
     *
     * @param model - The model of the products.
     * @returns A promise that resolves to an array of products.
     */
    getProductsByModel(model: string): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            const sql = "SELECT * FROM products WHERE model = ?";
            db.all(sql, [model], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }

                const products: Product[] = rows.map((row) => ({
                    model: row.model,
                    category: row.category,
                    quantity: row.quantity,
                    details: row.details,
                    sellingPrice: row.sellingPrice,
                    arrivalDate: row.arrivalDate,
                }));

                resolve(products);
            });
        });
    }

    /**
     * Gets all products.
     *
     * @returns A promise that resolves to an array of all products.
     */
    getAllProducts(): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            const sql = "SELECT * FROM products";
            db.all(sql, [], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }

                const products: Product[] = rows.map((row) => ({
                    model: row.model,
                    category: row.category,
                    quantity: row.quantity,
                    details: row.details,
                    sellingPrice: row.sellingPrice,
                    arrivalDate: row.arrivalDate,
                }));

                resolve(products);
            });
        });
    }

    /**
     * Gets all available products of a given category.
     *
     * @param category - The category of the products.
     * @returns A promise that resolves to an array of products.
     */
    getAvailableProductsByCategory(category: string): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            const sql =
                "SELECT * FROM products WHERE category = ? AND quantity > 0";
            db.all(sql, [category], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }

                const products: Product[] = rows.map((row) => ({
                    model: row.model,
                    category: row.category,
                    quantity: row.quantity,
                    details: row.details,
                    sellingPrice: row.sellingPrice,
                    arrivalDate: row.arrivalDate,
                }));

                resolve(products);
            });
        });
    }

    /**
     * Gets all available products of a given model.
     *
     * @param model - The model of the products.
     * @returns A promise that resolves to an array of products.
     */
    getAvailableProductsByModel(model: string): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            const sql =
                "SELECT * FROM products WHERE model = ? AND quantity > 0";
            db.all(sql, [model], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }

                const products: Product[] = rows.map((row) => ({
                    model: row.model,
                    category: row.category,
                    quantity: row.quantity,
                    details: row.details,
                    sellingPrice: row.sellingPrice,
                    arrivalDate: row.arrivalDate,
                }));

                resolve(products);
            });
        });
    }

    /**
     * Gets all available products.
     *
     * @returns A promise that resolves to an array of all available products.
     */
    getAllAvailableProducts(): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            const sql = "SELECT * FROM products WHERE quantity > 0";
            db.all(sql, [], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                    return;
                }

                const products: Product[] = rows.map((row) => ({
                    model: row.model,
                    category: row.category,
                    quantity: row.quantity,
                    details: row.details,
                    sellingPrice: row.sellingPrice,
                    arrivalDate: row.arrivalDate,
                }));

                resolve(products);
            });
        });
    }

    /**
     * Deletes all products.
     *
     * @returns A promise that resolves to a boolean indicating whether the deletion was successful.
     * @throws An error if the deletion was not successful.
     */
    deleteAllProducts(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "DELETE FROM products";
            db.run(sql, [], (err: Error | null) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(true);
            });
        });
    }

    /**
     * Deletes all products of a given model.
     *
     * @param model - The model of the products.
     * @returns A promise that resolves to a boolean indicating whether the deletion was successful.
     */
    deleteProduct(model: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "DELETE FROM products WHERE model = ?";
            db.run(sql, [model], (err: Error | null) => {
                if (err) {
                    console.log(err);
                    reject(err);
                    return;
                }

                resolve(true);
            });
        });
    }
}

export default ProductDAO;
