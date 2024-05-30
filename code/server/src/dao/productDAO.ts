import { Product } from "../components/product";
import db from "../db/db";

/**
 * A class that implements the interaction with the database for all product-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ProductDAO {
    registerProducts(
        model: string,
        category: string,
        quantity: number,
        details: string | null,
        sellingPrice: number,
        arrivalDate: string | null,
    ): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql =
                    "INSERT INTO products(model, category, quantity, details, sellingPrice" +
                    (arrivalDate ? " , arrivalDate" : "") +
                    ") VALUES(?, ?, ?, ?, ?" +
                    (arrivalDate ? ", ?" : "") +
                    ")";

                db.run(
                    sql,
                    arrivalDate
                        ? [
                              model,
                              category,
                              quantity,
                              details,
                              sellingPrice,
                              arrivalDate,
                          ]
                        : [model, category, quantity, details, sellingPrice],
                    (err: Error | null) => {
                        if (err) {
                            console.log(err);
                            reject(err);
                            return;
                        }

                        resolve(true);
                    },
                );
            } catch (err) {
                reject(err);
            }
        });
    }

    getProductByModel(model: string): Promise<Product | null> {
        return new Promise<Product | null>((resolve, reject) => {
            try {
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
            } catch (err) {
                reject(err);
            }
        });
    }

    changeProductQuantity(
        model: string,
        newQuantity: number,
        changeDate: string | null,
    ): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            try {
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
            } catch (err) {
                reject(err);
            }
        });
    }

    sellProduct(
        model: string,
        quantity: number,
        sellingDate: string | null,
    ): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            try {
                const sql =
                    "UPDATE products SET quantity = ?, sellingDate = ? WHERE model = ?";

                db.run(
                    sql,
                    [quantity, sellingDate, model],
                    (err: Error | null) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve(quantity);
                    },
                );
            } catch (err) {
                reject(err);
            }
        });
    }

    getProductsByCategory(category: string): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            try {
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
            } catch (err) {
                reject(err);
            }
        });
    }

    getProductsByModel(model: string): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            try {
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
            } catch (err) {
                reject(err);
            }
        });
    }

    getAllProducts(): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            try {
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
            } catch (err) {
                reject(err);
            }
        });
    }

    getAvailableProductsByCategory(category: string): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            try {
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
            } catch (err) {
                reject(err);
            }
        });
    }

    getAvailableProductsByModel(model: string): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            try {
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
            } catch (err) {
                reject(err);
            }
        });
    }

    getAllAvailableProducts(): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            try {
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
            } catch (err) {
                reject(err);
            }
        });
    }

    deleteAllProducts(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql = "DELETE FROM products";
                db.run(sql, [], (err: Error | null) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(true);
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    deleteProduct(model: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql = "DELETE FROM products WHERE model = ?";
                db.run(sql, [model], (err: Error | null) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                        return;
                    }

                    resolve(true);
                });
            } catch (err) {
                reject(err);
            }
        });
    }
}

export default ProductDAO;
