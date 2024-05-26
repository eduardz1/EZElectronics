import { Product } from "../components/product";
import db from "../db/db"
import { ProductNotFoundError, LowProductStockError, EmptyProductStockError } from "../errors/productError";

/**
 * A class that implements the interaction with the database for all product-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ProductDAO {
    addProduct(model: string, category: string, quantity: number, details: string | null, sellingPrice: number, arrivalDate: string | null): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "INSERT INTO products(model, category, quantity, details, sellingPrice, arrivalDate) VALUES(?, ?, ?, ?, ?, ?)";
            db.run(sql, [model, category, quantity, details, sellingPrice, arrivalDate], (err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }
    getProductByModel(model: string): Promise<Product | null> {
        return new Promise<Product | null>((resolve, reject) => {
            const sql = "SELECT * FROM products WHERE model = ?";
            db.get(sql, [model], (err: Error | null, row: any) => {
                if (err) {
                    reject(err);
                } else if (row) {
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

    updateProduct(product: Product): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = "UPDATE products SET category = ?, quantity = ?, details = ?, sellingPrice = ?, arrivalDate = ? WHERE model = ?";
            db.run(sql, [product.category, product.quantity, product.details, product.sellingPrice, product.arrivalDate, product.model], (err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    getProductsByCategory(category: string): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            const sql = "SELECT * FROM products WHERE category = ?";
            db.all(sql, [category], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                } else {
                    const products: Product[] = rows.map(row => ({
                        model: row.model,
                        category: row.category,
                        quantity: row.quantity,
                        details: row.details,
                        sellingPrice: row.sellingPrice,
                        arrivalDate: row.arrivalDate,
                    }));
                    resolve(products);
                }
            });
        });
    }
    getProductsByModel(model: string): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            const sql = "SELECT * FROM products WHERE model = ?";
            db.all(sql, [model], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                } else {
                    const products: Product[] = rows.map(row => ({
                        model: row.model,
                        category: row.category,
                        quantity: row.quantity,
                        details: row.details,
                        sellingPrice: row.sellingPrice,
                        arrivalDate: row.arrivalDate,
                    }));
                    resolve(products);
                }
            });
        });
    }
    getAllProducts(): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            const sql = "SELECT * FROM products";
            db.all(sql, [], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                } else {
                    const products: Product[] = rows.map(row => ({
                        model: row.model,
                        category: row.category,
                        quantity: row.quantity,
                        details: row.details,
                        sellingPrice: row.sellingPrice,
                        arrivalDate: row.arrivalDate,
                    }));
                    resolve(products);
                }
            });
        });
    }
    getAvailableProductsByCategory(category: string): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            const sql = "SELECT * FROM products WHERE category = ? AND quantity > 0";
            db.all(sql, [category], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                } else {
                    const products: Product[] = rows.map(row => ({
                        model: row.model,
                        category: row.category,
                        quantity: row.quantity,
                        details: row.details,
                        sellingPrice: row.sellingPrice,
                        arrivalDate: row.arrivalDate,
                    }));
                    resolve(products);
                }
            });
        });
    }
    getAvailableProductsByModel(model: string): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            const sql = "SELECT * FROM products WHERE model = ? AND quantity > 0";
            db.all(sql, [model], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                } else {
                    const products: Product[] = rows.map(row => ({
                        model: row.model,
                        category: row.category,
                        quantity: row.quantity,
                        details: row.details,
                        sellingPrice: row.sellingPrice,
                        arrivalDate: row.arrivalDate,
                    }));
                    resolve(products);
                }
            });
        });
    }
    getAllAvailableProducts(): Promise<Product[]> {
        return new Promise<Product[]>((resolve, reject) => {
            const sql = "SELECT * FROM products WHERE quantity > 0";
            db.all(sql, [], (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                } else {
                    const products: Product[] = rows.map(row => ({
                        model: row.model,
                        category: row.category,
                        quantity: row.quantity,
                        details: row.details,
                        sellingPrice: row.sellingPrice,
                        arrivalDate: row.arrivalDate,
                    }));
                    resolve(products);
                }
            });
        });
    }
    deleteAllProducts(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "DELETE FROM products";
            db.run(sql, [], (err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }
    deleteProduct(model: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "DELETE FROM products WHERE model = ?";
            db.run(sql, [model], (err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }
}


 




export default ProductDAO