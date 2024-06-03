import { Cart } from "../components/cart";
import { User } from "../components/user";
import CartDAO from "../dao/cartDAO";
import ProductDAO from "../dao/productDAO";
import {
    CartNotFoundError,
    EmptyCartError,
    ProductNotInCartError,
} from "../errors/cartError";
import {
    EmptyProductStockError,
    LowProductStockError,
    ProductNotFoundError,
} from "../errors/productError";
import { Category } from "../components/product";

/**
 * Represents a controller for managing shopping carts.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class CartController {
    addProductToCart(testUser: User, model: string) {
        throw new Error("Method not implemented.");
    }
    private dao: CartDAO;
    private productDao: ProductDAO;

    constructor() {
        this.dao = new CartDAO();
        this.productDao = new ProductDAO();
    }

    async addToCart(user: User, product: string): Promise<boolean> {
        const p = await this.productDao.getProductByModel(product);
        if (!p) {
            throw new ProductNotFoundError();
        }
        if (p.quantity === 0) {
            throw new EmptyProductStockError();
        }
        let cart = await this.dao.getCart(user);
        if (!cart) {
            await this.dao.createCart(user);
            cart = await this.dao.getCart(user);
        }

        return this.dao.addToCart(user, product);
    }

    async getCart(user: User): Promise<Cart> {
        const cart = await this.dao.getCart(user);
        if (!cart) {
            return new Cart(user.username, false, null, 0, []);
        }
        return cart;
    }

    async checkoutCart(user: User): Promise<boolean> {
        const unpaidCart = await this.dao.getCart(user);
        if (!unpaidCart) {
            throw new CartNotFoundError();
        }
        if (unpaidCart.products.length === 0) {
            throw new EmptyCartError();
        }
        await Promise.all(
            unpaidCart.products.map(async (product) => {
                const p = await this.productDao.getProductByModel(
                    product.model,
                );
                if (!p) {
                    throw new ProductNotFoundError();
                }
                if (p.quantity === 0) {
                    throw new EmptyProductStockError();
                }
                if (p.quantity < product.quantity) {
                    throw new LowProductStockError();
                }
            }),
        );

        return this.dao.checkoutCart(user);
    }

    async getCustomerCarts(user: User): Promise<Cart[]> {
        return this.dao.getCustomerCarts(user);
    }

    async removeProductFromCart(user: User, product: string): Promise<boolean> {
        const p = await this.productDao.getProductByModel(product);
        if (!p) {
            throw new ProductNotFoundError();
        }
        const currentCart = await this.dao.getCart(user);
        if (!currentCart) {
            throw new CartNotFoundError();
        }
        if (currentCart.products.length === 0) {
            throw new EmptyCartError();
        }
        const productIndex = currentCart.products.findIndex(
            (p) => p.model === product,
        );
        if (productIndex === -1) {
            throw new ProductNotInCartError();
        }

        return this.dao.removeProductFromCart(user, product);
    }

    async clearCart(user: User): Promise<boolean> {
        const cart = await this.dao.getCart(user);
        if (!cart) {
            throw new CartNotFoundError();
        }

        return this.dao.clearCart(user);
    }

    async deleteAllCarts(): Promise<boolean> {
        return this.dao.deleteAllCarts();
    }

    async getAllCarts(): Promise<Cart[]> {
        return this.dao.getAllCarts();
    }
}

export default CartController;
