import dayjs from "dayjs";
import { Cart, ProductInCart } from "../components/cart";
import { User } from "../components/user";
import db from "../db/db";

/**
 * A class that implements the interaction with the database for all cart-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class CartDAO {
    /**
     * Adds a product to the user's cart. Increases the quantity by 1 if the product is already in the cart.
     * If no active cart exists, it creates a new one.
     * @param user The user whose cart will be updated.
     * @param productId The ID of the product to add to the cart.
     * @returns A Promise that resolves to true if the operation was successful.
     */
    async addToCart(user: User, productId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql =
                    "SELECT * FROM products_in_cart WHERE customer = ? AND model = ? AND paymentDate = NULL";
                db.get(
                    sql,
                    [user.username, productId],
                    (err: Error | null, row: any) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        if (row) {
                            const updateSql =
                                "UPDATE products_in_cart SET quantity = ? WHERE customer = ? AND model = ? AND paymentDate = NULL";
                            db.run(
                                updateSql,
                                [row.quantity + 1, user.username, productId],
                                (err: Error | null) => {
                                    if (err) {
                                        reject(err);
                                        return;
                                    }
                                },
                            );
                        } else {
                            const insertSql =
                                "INSERT INTO products_in_cart(model, quantity, category, price, customer, paymentDate) VALUES(?, ?, 1, ?, ?, NULL)";
                            db.run(
                                insertSql,
                                [
                                    productId,
                                    row.category,
                                    row.price,
                                    user.username,
                                ],
                                (err: Error | null) => {
                                    if (err) {
                                        reject(err);
                                        return;
                                    }
                                },
                            );
                        }
                    },
                );

                const updateCart =
                    "UPDATE carts WHERE customer = ? AND paymentDate = NULL SET total = total + (SELECT price FROM products WHERE model = ?)";
                db.run(
                    updateCart,
                    [user.username, productId],
                    (err: Error | null) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve(true);
                    },
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    async getCart(user: User): Promise<Cart | null> {
        return new Promise<Cart | null>((resolve, reject) => {
            try {
                const sql =
                    "SELECT * FROM cart WHERE customer = ? AND paymentDate = NULL";
                db.get(sql, [user], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (!row) {
                        resolve(null);
                        return;
                    }

                    this.getProductsInCart(user, row.paymentDate)
                        .then((products) => {
                            const cart = new Cart(
                                row.user,
                                row.paid,
                                row.paymentDate,
                                row.total,
                                products,
                            );
                            resolve(cart);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    async getProductsInCart(
        customer: User,
        paymentDate: string | null,
    ): Promise<ProductInCart[]> {
        return new Promise<ProductInCart[]>((resolve, reject) => {
            try {
                const sql =
                    "SELECT * FROM products_in_cart WHERE customer = ? AND paymentDate = ?";
                db.all(
                    sql,
                    [customer, paymentDate],
                    (err: Error | null, row: any[]) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        const products: ProductInCart[] = row.map(
                            (row) =>
                                new ProductInCart(
                                    row.model,
                                    row.quantity,
                                    row.category,
                                    row.price,
                                ),
                        );
                        resolve(products);
                    },
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Checks out the user's cart, marking it as 'checked-out' to indicate the purchase was completed.
     * We assume payment is always successful. This function just updates the cart status.
     * @param user The user whose cart is being checked out.
     * @returns A Promise that resolves to true if the cart was successfully checked out, false otherwise.
     */
    async checkoutCart(user: User): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql =
                    "UPDATE carts SET paid = 1, paymentDate = ? WHERE customer = ? AND paid = 0";
                db.run(
                    sql,
                    [dayjs().toISOString().slice(0, 9), user.username],
                    (err: Error | null) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve(true);
                    },
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Retrieves all paid (checked-out) carts for a specific customer.
     * Excludes the current active cart.
     * @param user The user for whom to retrieve the paid carts.
     * @returns A Promise that resolves to an array of carts belonging to the customer.
     */
    async getCustomerCarts(user: User): Promise<Cart[]> {
        return new Promise<Cart[]>((resolve, reject) => {
            try {
                const sql =
                    "SELECT * FROM cart WHERE customer = ? AND paid = 1";
                db.all(
                    sql,
                    [user.username],
                    (err: Error | null, rows: any[]) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        const carts = rows.map(async (row) => {
                            return new Cart(
                                row.user,
                                row.paid,
                                row.paymentDate,
                                row.total,
                                await this.getProductsInCart(
                                    user,
                                    row.paymentDate,
                                ),
                            );
                        });

                        // FIXME: I think this is horrible
                        Promise.all(carts)
                            .then((resolvedCarts) => {
                                resolve(resolvedCarts);
                            })
                            .catch((error) => {
                                reject(error);
                            });
                    },
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Removes one unit of a product from the user's cart. If only one unit is present, the product is removed from the cart.
     * @param user The user who owns the cart.
     * @param productId The ID of the product to remove.
     * @returns A Promise that resolves to true if the product was successfully removed or quantity was decreased, false otherwise.
     */
    async removeProductFromCart(
        user: User,
        productId: string,
    ): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql =
                    "SELECT * FROM products_in_cart WHERE customer = ? AND model = ? AND paid = 0";
                db.get(
                    sql,
                    [user.username, productId],
                    (err: Error | null, row: any) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        if (row) {
                            if (row.quantity > 1) {
                                const updateSql =
                                    "UPDATE products_in_cart SET quantity = ? WHERE customer = ? AND model = ? AND paid = 0";
                                db.run(
                                    updateSql,
                                    [
                                        row.quantity - 1,
                                        user.username,
                                        productId,
                                    ],
                                    (err: Error | null) => {
                                        if (err) {
                                            reject(err);
                                            return;
                                        }

                                        resolve(true);
                                    },
                                );
                            } else {
                                const deleteSql =
                                    "DELETE FROM products_in_cart WHERE customer = ? AND model = ? AND paid = 0";
                                db.run(
                                    deleteSql,
                                    [user.username, productId],
                                    (err: Error | null) => {
                                        if (err) {
                                            reject(err);
                                            return;
                                        }

                                        resolve(true);
                                    },
                                );
                            }
                        } else {
                            resolve(false);
                        }
                    },
                );

                const updateCart =
                    "UPDATE carts SET total = ? WHERE customer = ?, paid = 0";
                db.run(updateCart, [user.username], (err: Error | null) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(true);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Clears all products from the user's active cart.
     * @param user The user who owns the cart.
     * @returns A Promise that resolves to true if the cart was successfully cleared, false otherwise.
     */
    async clearCart(user: User): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql =
                    "DELETE FROM products_in_cart WHERE customer = ? AND paid = 0";
                db.run(sql, [user.username], (err: Error | null) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(true);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Deletes all carts in the database. This operation is irreversible.
     * @returns A Promise that resolves to true if all carts were successfully deleted, false otherwise.
     */
    async deleteAllCarts(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql = "DELETE FROM cart";
                db.run(sql, [], (err: Error | null) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(true);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Retrieves all carts from the database.
     * @returns A Promise that resolves to an array of all carts.
     */
    async getAllCarts(): Promise<Cart[]> {
        return new Promise<Cart[]>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM cart";
                db.all(sql, [], (err: Error | null, rows: any[]) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (!rows) {
                        resolve([]);
                        return;
                    }

                    const carts = rows.map(async (row) => {
                        return new Cart(
                            row.user,
                            row.paid,
                            row.paymentDate,
                            row.total,
                            await this.getProductsInCart(
                                row.user,
                                row.paymentDate,
                            ),
                        );
                    });

                    resolve(Promise.all(carts));
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    async createCart(user: User): Promise<Cart> {
        return new Promise<Cart>((resolve, reject) => {
            try {
                const sql =
                    "INSERT INTO cart(customer, paid, paymentDate, total) VALUES(?, 0, NULL, 0)";
                db.run(sql, [user], (err: Error | null) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(new Cart(user.username, false, null, 0, []));
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default CartDAO;
