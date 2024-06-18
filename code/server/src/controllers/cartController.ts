import { Cart } from "../components/cart";
import { User } from "../components/user";
import CartDAO from "../dao/cartDAO";
import ProductDAO from "../dao/productDAO";
import { CartNotFoundError, ProductNotInCartError } from "../errors/cartError";
import {
    EmptyProductStockError,
    ProductNotFoundError,
} from "../errors/productError";

/**
 * Represents a controller for managing shopping carts.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class CartController {
    private dao: CartDAO;
    private productDao: ProductDAO;

    constructor() {
        this.dao = new CartDAO();
        this.productDao = new ProductDAO();
    }

    /**
     * Adds a product to the user's cart. If the product is already in the cart, the quantity should be increased by 1.
     * If the product is not in the cart, it should be added with a quantity of 1.
     * If there is no current unpaid cart in the database, then a new cart should be created.
     * @param user - The user to whom the product should be added.
     * @param product - The model of the product to add.
     * @returns A Promise that resolves to `true` if the product was successfully added.
     * @throws ProductNotFoundError if the product does not exist.
     * @throws EmptyProductStockError if the product is out of stock.
     */
    async addToCart(user: User, product: string): Promise<boolean> {
        const p = await this.productDao.getProductByModel(product);
        if (!p) {
            throw new ProductNotFoundError();
        }
        if (p.quantity === 0) {
            throw new EmptyProductStockError();
        }
        if (!(await this.dao.getCart(user))) {
            await this.dao.createCart(user);
        }

        return this.dao.addToCart(user, product);
    }

    /**
     * Retrieves the current cart for a specific user.
     * @param user - The user for whom to retrieve the cart.
     * @returns A Promise that resolves to the user's cart or an empty one if there is no current cart.
     */
    async getCart(user: User): Promise<Cart> {
        const cart = await this.dao.getCart(user);
        if (!cart) {
            return new Cart(user.username, false, null, 0, []);
        }
        return cart;
    }

    /**
     * Checks out the user's cart. We assume that payment is always successful, there is no need to implement anything related to payment.
     * @param user - The user whose cart should be checked out.
     * @returns A Promise that resolves to `true` if the cart was successfully checked out.
     */
    async checkoutCart(user: User): Promise<boolean> {
        return this.dao.checkoutCart(user);
    }

    /**
     * Retrieves all paid carts for a specific customer.
     * @param user - The customer for whom to retrieve the carts.
     * @returns A Promise that resolves to an array of carts belonging to the customer.
     * Only the carts that have been checked out should be returned, the current cart should not be included in the result.
     */
    async getCustomerCarts(user: User): Promise<Cart[]> {
        return this.dao.getCustomerCarts(user);
    }

    /**
     * Removes one product unit from the current cart. In case there is more than one unit in the cart, only one should be removed.
     * @param user The user who owns the cart.
     * @param product The model of the product to remove.
     * @returns A Promise that resolves to `true` if the product was successfully removed.
     */
    async removeProductFromCart(user: User, product: string): Promise<boolean> {
        if (!(await this.productDao.getProductByModel(product))) {
            throw new ProductNotFoundError();
        }
        const currentCart = await this.dao.getCart(user);
        if (!currentCart || currentCart.products.length === 0) {
            throw new CartNotFoundError();
        }
        if (currentCart.products.findIndex((p) => p.model === product) === -1) {
            throw new ProductNotInCartError();
        }

        return this.dao.removeProductFromCart(user, product);
    }

    /**
     * Removes all products from the current cart.
     * @param user - The user who owns the cart.
     * @returns A Promise that resolves to `true` if the cart was successfully cleared.
     */
    async clearCart(user: User): Promise<boolean> {
        if (!(await this.dao.getCart(user))) {
            throw new CartNotFoundError();
        }

        return this.dao.clearCart(user);
    }

    /**
     * Deletes all carts of all users.
     * @returns A Promise that resolves to `true` if all carts were successfully deleted.
     */
    async deleteAllCarts(): Promise<boolean> {
        return this.dao.deleteAllCarts();
    }

    /**
     * Retrieves all carts in the database.
     * @returns A Promise that resolves to an array of carts.
     */
    async getAllCarts(): Promise<Cart[]> {
        return this.dao.getAllCarts();
    }
}

export default CartController;
