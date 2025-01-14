import dayjs from "dayjs";
import { Cart, ProductInCart } from "../components/cart";
import { User } from "../components/user";
import db from "../db/db";
import { CartNotFoundError, EmptyCartError } from "../errors/cartError";
import { LowProductStockError, ProductSoldError } from "../errors/productError";

/**
 * A class that implements the interaction with the database for all cart-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class CartDAO {
    /**
     * Adds a product to the user's cart. Increases the quantity by 1 if the product is already in the cart.
     * @param user The user whose cart will be updated.
     * @param productId The ID of the product to add to the cart.
     * @returns A Promise that resolves to true if the operation was successful.
     */
    addToCart(user: User, productId: string): Promise<boolean> {
        const sql = `
            SELECT
                sellingPrice,
                products_in_cart.id AS productsInCartId,
                carts.id AS cartsId
            FROM
                carts
                JOIN products_in_cart ON products_in_cart.cartId = carts.id
                JOIN products ON products.model = products_in_cart.model
            WHERE
                customer = ?
                AND products.model = ?
                AND paid = 0;`;

        return new Promise<boolean>((resolve, reject) => {
            db.get(
                sql,
                [user.username, productId],
                (err: Error | null, row: any) => {
                    if (err) return reject(err);

                    if (row) {
                        const updateProductsInCart = `
                            UPDATE
                                products_in_cart
                            SET
                                quantity = quantity + 1
                            WHERE
                                id = ?;`;

                        db.run(
                            updateProductsInCart,
                            [row.productsInCartId],
                            (err: Error | null) => {
                                if (err) return reject(err);
                            },
                        );

                        const updateCart = `
                            UPDATE
                                carts
                            SET
                                total = total + ?
                            WHERE
                                id = ?;`;

                        db.run(
                            updateCart,
                            [row.sellingPrice, row.cartsId],
                            (err: Error | null) =>
                                err ? reject(err) : resolve(true),
                        );
                    } else {
                        const getCartId = `
                            SELECT
                                id
                            FROM
                                carts
                            WHERE
                                customer = ?
                                AND paid = 0;`;

                        db.get(
                            getCartId,
                            [user.username],
                            (err: Error | null, row: any) => {
                                if (err) return reject(err);

                                if (!row)
                                    return reject(new CartNotFoundError());

                                const insertSql = `
                                    INSERT INTO
                                        products_in_cart(
                                            model,
                                            quantity,
                                            cartId
                                        )
                                    VALUES
                                        (
                                            ?,
                                            1,
                                            ?
                                        );`;

                                db.run(
                                    insertSql,
                                    [productId, row.id],
                                    (err: Error | null) => {
                                        if (err) return reject(err);
                                    },
                                );

                                const updateCart = `
                                    UPDATE
                                        carts
                                    SET
                                        total = total + (
                                            SELECT
                                                sellingPrice
                                            FROM
                                                products
                                            WHERE
                                                model = ?
                                        )
                                    WHERE
                                        id = ?;`;

                                db.run(
                                    updateCart,
                                    [productId, row.id],
                                    (err: Error | null) =>
                                        err ? reject(err) : resolve(true),
                                );
                            },
                        );
                    }
                },
            );
        });
    }

    /**
     * Retrieves the user's active cart from the database.
     * @param user The user whose cart will be retrieved.
     * @returns A Promise that resolves to the user's active cart, or null if no active cart exists.
     */
    getCart(user: User): Promise<Cart | null> {
        const sql = `
            SELECT
                *
            FROM
                carts
            WHERE
                customer = ?
                AND paid = 0;`;

        return new Promise<Cart | null>((resolve, reject) => {
            db.get(
                sql,
                [user.username],
                async (err: Error | null, row: any) => {
                    if (err) return reject(err);

                    if (!row) return resolve(null);

                    this.getProductsInCart(user.username, row.id)
                        .then((products) =>
                            resolve(
                                new Cart(
                                    row.customer,
                                    !!row.paid,
                                    row.paymentDate,
                                    row.total,
                                    products,
                                ),
                            ),
                        )
                        .catch((err) => {
                            reject(err);
                        });
                },
            );
        });
    }

    /**
     * Retrieves all products in the user's cart.
     * @param username The user whose cart will be retrieved.
     * @param id The id of the cart to retrieve products from.
     * @returns A Promise that resolves to an array of products in the cart.
     */
    getProductsInCart(username: string, id: string): Promise<ProductInCart[]> {
        const sql = `
            SELECT
                products.model AS model,
                products_in_cart.quantity AS quantity,
                category,
                sellingPrice,
                carts.id AS cartsId,
                carts.customer AS customer
            FROM
                products_in_cart
                JOIN products ON products.model = products_in_cart.model
                JOIN carts ON products_in_cart.cartId = carts.id
            WHERE
                customer = ?
                AND carts.id = ?;`;

        return new Promise<ProductInCart[]>((resolve, reject) => {
            db.all(sql, [username, id], (err: Error | null, rows: any[]) => {
                if (err) return reject(err);

                const products: ProductInCart[] = [];

                for (const row of rows) {
                    products.push(
                        new ProductInCart(
                            row.model,
                            row.quantity,
                            row.category,
                            row.sellingPrice,
                        ),
                    );
                }

                resolve(products);
            });
        });
    }

    /**
     * Checks out the user's cart, marking it as 'checked-out' to indicate the purchase was completed.
     * We assume payment is always successful. This function just updates the cart status.
     * @param user The user whose cart is being checked out.
     * @returns A Promise that resolves to true if the cart was successfully checked out, false otherwise.
     */
    checkoutCart(user: User): Promise<boolean> {
        const sql = `
            SELECT
                *
            FROM
                carts
            WHERE
                customer = ?
                AND paid = 0;`;

        return new Promise<boolean>((resolve, reject) => {
            db.get(
                sql,
                [user.username],
                async (err: Error | null, row: any) => {
                    if (err) return reject(err);

                    if (!row) return reject(new CartNotFoundError());

                    this.getProductsInCart(user.username, row.id)
                        .then((products) => {
                            if (products.length === 0)
                                return reject(new EmptyCartError());

                            for (const product of products) {
                                const productSql = `
                                    SELECT
                                        quantity
                                    FROM
                                        products
                                    WHERE
                                        model = ?;`;

                                db.get(
                                    productSql,
                                    [product.model],
                                    (err: Error | null, row: any) => {
                                        if (err) return reject(err);

                                        if (row.quantity === 0)
                                            return reject(
                                                new ProductSoldError(),
                                            );

                                        if (row.quantity < product.quantity)
                                            return reject(
                                                new LowProductStockError(),
                                            );

                                        const updateProduct = `
                                            UPDATE
                                                products
                                            SET
                                                quantity = quantity - ?
                                            WHERE
                                                model = ?;`;

                                        db.run(
                                            updateProduct,
                                            [product.quantity, product.model],
                                            (err: Error | null) => {
                                                if (err) return reject(err);

                                                const updateCart = `
                                                    UPDATE
                                                        carts
                                                    SET
                                                        paid = 1,
                                                        paymentDate = ?
                                                    WHERE
                                                        customer = ?
                                                        AND paid = 0;`;

                                                db.run(
                                                    updateCart,
                                                    [
                                                        dayjs().format(
                                                            "YYYY-MM-DD",
                                                        ),
                                                        user.username,
                                                    ],
                                                    (err: Error | null) =>
                                                        err
                                                            ? reject(err)
                                                            : resolve(true),
                                                );
                                            },
                                        );
                                    },
                                );
                            }
                        })
                        .catch((err) => {
                            reject(err);
                        });
                },
            );
        });
    }

    /**
     * Retrieves all paid (checked-out) carts for a specific customer.
     * Excludes the current active cart.
     * @param user The user for whom to retrieve the paid carts.
     * @returns A Promise that resolves to an array of carts belonging to the customer.
     */
    getCustomerCarts(user: User): Promise<Cart[]> {
        const sql = `
            SELECT
                *
            FROM
                carts
            WHERE
                customer = ?
                AND paid = 1;`;

        return new Promise<Cart[]>((resolve, reject) => {
            db.all(
                sql,
                [user.username],
                async (err: Error | null, rows: any[]) => {
                    if (err) return reject(err);

                    const carts: Cart[] = [];

                    for (const row of rows) {
                        const products = await this.getProductsInCart(
                            user.username,
                            row.id,
                        )
                            .then((products) => products)
                            .catch((err) => {
                                return err;
                            });

                        if (products instanceof Error) {
                            return reject(products);
                        }

                        carts.push(
                            new Cart(
                                row.customer,
                                !!row.paid,
                                row.paymentDate,
                                row.total,
                                products,
                            ),
                        );
                    }

                    resolve(carts);
                },
            );
        });
    }

    /**
     * Removes one unit of a product from the user's cart. If only one unit is present, the product is removed from the cart.
     * @param user The user who owns the cart.
     * @param productId The ID of the product to remove.
     * @returns A Promise that resolves to true if the product was successfully removed or quantity was decreased, false otherwise.
     */
    removeProductFromCart(user: User, productId: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = `
                SELECT
                    quantity,
                    carts.id AS cartsId
                FROM
                    carts
                    JOIN products_in_cart ON products_in_cart.cartId = carts.id
                WHERE
                    customer = ?
                    AND model = ?
                    AND paid = 0;`;

            db.get(
                sql,
                [user.username, productId],
                (err: Error | null, row: any) => {
                    if (err) return reject(err);

                    if (!row) return resolve(false);

                    if (row.quantity > 1) {
                        const updateSql = `
                            UPDATE
                                products_in_cart
                            SET
                                quantity = ?
                            WHERE
                                cartID = ?
                                AND model = ?`;

                        db.run(
                            updateSql,
                            [row.quantity - 1, row.cartsId, productId],
                            (err: Error | null) => {
                                if (err) return reject(err);
                            },
                        );
                    } else {
                        const deleteSql = `
                            DELETE FROM
                                products_in_cart
                            WHERE
                                cartId = ?
                                AND model = ?`;

                        db.run(
                            deleteSql,
                            [row.cartsId, productId],
                            (err: Error | null) => {
                                if (err) return reject(err);
                            },
                        );
                    }

                    const updateCart = `
                        UPDATE
                            carts
                        SET
                            total = total - (
                                SELECT
                                    sellingPrice
                                FROM
                                    products
                                WHERE
                                    model = ?
                            )
                        WHERE
                            customer = ?
                            AND paid = 0;`;

                    db.run(
                        updateCart,
                        [productId, user.username],
                        (err: Error | null) =>
                            err ? reject(err) : resolve(true),
                    );
                },
            );
        });
    }

    /**
     * Clears all products from the user's active cart.
     * @param user The user who owns the cart.
     * @returns A Promise that resolves to true if the cart was successfully cleared, false otherwise.
     */
    clearCart(user: User): Promise<boolean> {
        const sql = `
            SELECT
                id
            FROM
                carts
            WHERE
                customer = ?
                AND paid = 0;`;

        return new Promise<boolean>((resolve, reject) => {
            db.get(sql, [user.username], (err: Error | null, row: any) => {
                if (err) return reject(err);

                const deleteSql = `
                    DELETE
                    FROM
                        products_in_cart
                    WHERE
                        cartId = ?;`;

                db.run(deleteSql, [row.id], (err: Error | null) => {
                    if (err) return reject(err);
                });

                const updateCart = `
                    UPDATE
                        carts
                    SET
                        total = 0
                    WHERE
                        id = ?;`;

                db.run(updateCart, [row.id], (err: Error | null) => {
                    if (err) return reject(err);
                });
            });

            resolve(true);
        });
    }

    /**
     * Deletes all carts in the database. This operation is irreversible.
     * @returns A Promise that resolves to true if all carts were successfully deleted, false otherwise.
     */
    deleteAllCarts(): Promise<boolean> {
        const sql = "DELETE FROM carts";

        return new Promise<boolean>((resolve, reject) => {
            db.run(sql, [], (err: Error | null) =>
                err ? reject(err) : resolve(true),
            );
        });
    }

    /**
     * Retrieves all carts from the database.
     * @returns A Promise that resolves to an array of all carts.
     */
    getAllCarts(): Promise<Cart[]> {
        const sql = "SELECT * FROM carts";

        return new Promise<Cart[]>((resolve, reject) => {
            db.all(sql, [], async (err: Error | null, rows: any[]) => {
                if (err) return reject(err);

                const carts: Cart[] = [];

                for (const row of rows) {
                    const products = await this.getProductsInCart(
                        row.customer,
                        row.id,
                    )
                        .then((products) => products)
                        .catch((err) => {
                            return err;
                        });

                    if (products instanceof Error) {
                        return reject(products);
                    }

                    carts.push(
                        new Cart(
                            row.customer,
                            !!row.paid,
                            row.paymentDate,
                            row.total,
                            products,
                        ),
                    );
                }

                resolve(carts);
            });
        });
    }

    /**
     * Creates a new cart for the user.
     * @param user The user for whom to create a new cart.
     * @returns A Promise that resolves to the newly created cart.
     */
    createCart(user: User): Promise<Cart> {
        const sql = `
            INSERT INTO
                carts(
                    customer,
                    paid,
                    paymentDate,
                    total
                )
            VALUES
                (?, 0, NULL, 0);`;

        return new Promise<Cart>((resolve, reject) => {
            db.run(sql, [user.username], (err: Error | null) =>
                err
                    ? reject(err)
                    : resolve(new Cart(user.username, false, null, 0, [])),
            );
        });
    }
}

export default CartDAO;
