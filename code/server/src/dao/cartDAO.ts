
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
        try {
            // Retrieve the active cart for the user or create a new one if it doesn't exist
            let cart = await Database.findOne(Cart, {
                where: { user: user, status: 'active' }
            });

            if (!cart) {
                cart = new Cart();
                cart.user = user;
                cart.status = 'active';
                cart.items = [];
                await Database.save(Cart, cart);
            }

            // Check if the product is already in the cart
            let cartItem = cart.items.find(item => item.product.id === productId);

            if (cartItem) {
                // If product is already in the cart, increase the quantity
                cartItem.quantity += 1;
            } else {
                // If not, add the new product to the cart with quantity 1 
                const product = await Database.findOne(Product, { where: { id: productId } });
                if (!product) {
                    throw new Error('Product not found');
                }

                cartItem = new CartItem();
                cartItem.product = product;
                cartItem.quantity = 1;
                cart.items.push(cartItem);
            }

            // Save changes to the database
            await Database.save(Cart, cart);
            return true;
        } catch (error) {
            console.error('Failed to add to cart:', error);
            return false;
        }
    }


    async getCart(user: User): Promise<Cart | null> {
        try {
            // Retrieve the active cart for the user
            const cart = await Database.findOne(Cart, {
                where: { user: user, status: 'active' }
            });
            return cart || null; // Return the cart or null if not found
        } catch (error) {
            console.error('Failed to retrieve cart:', error);
            return null; // Return null in case of an error
        }
    }

    /**
     * Checks out the user's cart, marking it as 'checked-out' to indicate the purchase was completed.
     * We assume payment is always successful. This function just updates the cart status.
     * @param user The user whose cart is being checked out.
     * @returns A Promise that resolves to true if the cart was successfully checked out, false otherwise.
     */
    async checkoutCart(user: User): Promise<boolean> {
        try {
            // Retrieve the active cart for the user
            const cart = await Database.findOne(Cart, {
                where: { user: user, status: 'active' }
            });

            if (!cart) {
                console.error('No active cart to check out.');
                return false; // Return false if no active cart exists
            }

            // Update the cart status to 'checked-out'
            cart.status = 'checked-out';
            cart.checkedOutAt = new Date(); // Assuming there's a checkedOutAt field for timestamping
            await Database.save(Cart, cart);

            return true; // Return true when the cart status is updated successfully
        } catch (error) {
            console.error('Failed to check out cart:', error);
            return false; // Return false in case of an error during checkout
        }
    }

    

    /**
     * Retrieves all paid (checked-out) carts for a specific customer. 
     * Excludes the current active cart.
     * @param user The user for whom to retrieve the paid carts.
     * @returns A Promise that resolves to an array of carts belonging to the customer.
     */
    async getCustomerCarts(user: User): Promise<Cart[]> {
        try {
            // Retrieve all carts for the user that are marked as 'checked-out'
            const carts = await Database.find(Cart, {
                where: { user: user, status: 'checked-out' }
            });
            return carts;
        } catch (error) {
            console.error('Failed to retrieve customer carts:', error);
            throw error; // Rethrow the error or handle it as per your application's error handling policy
        }
    }

    

    /**
     * Removes one unit of a product from the user's cart. If only one unit is present, the product is removed from the cart.
     * @param user The user who owns the cart.
     * @param productId The ID of the product to remove.
     * @returns A Promise that resolves to true if the product was successfully removed or quantity was decreased, false otherwise.
     */
    async removeProductFromCart(user: User, productId: string): Promise<boolean> {
        try {
            // Retrieve the active cart for the user
            const cart = await Database.findOne(Cart, {
                where: { user: user, status: 'active' }
            });

            if (!cart) {
                console.error('No active cart available for the user.');
                return false; // Return false if no active cart is found
            }

            // Find the cart item matching the product ID
            const cartItem = cart.items.find(item => item.product.id === productId);

            if (cartItem) {
                if (cartItem.quantity > 1) {
                    // If more than one unit exists, decrease the quantity
                    cartItem.quantity -= 1;
                } else {
                    // If only one unit exists, remove the item from the cart
                    const itemIndex = cart.items.indexOf(cartItem);
                    cart.items.splice(itemIndex, 1);
                }

                // Save changes to the database
                await Database.save(Cart, cart);
                return true;
            } else {
                console.error('Product not found in the cart.');
                return false; // Return false if the product is not found in the cart
            }
        } catch (error) {
            console.error('Failed to remove product from cart:', error);
            return false; // Return false in case of an error during the removal process
        }
    }




 /**
     * Clears all products from the user's active cart.
     * @param user The user who owns the cart.
     * @returns A Promise that resolves to true if the cart was successfully cleared, false otherwise.
     */
 async clearCart(user: User): Promise<boolean> {
    try {
        // Retrieve the active cart for the user
        const cart = await Database.findOne(Cart, {
            where: { user: user, status: 'active' }
        });

        if (!cart) {
            console.error('No active cart available for the user.');
            return false; // Return false if no active cart is found
        }

        // Clear all items from the cart
        cart.items = []; // Assuming that cart items are stored in an array

        // Save the cleared cart to the database
        await Database.save(Cart, cart);
        return true;
    } catch (error) {
        console.error('Failed to clear cart:', error);
        return false; // Return false in case of an error during the clearing process
    }
}



/**
     * Deletes all carts in the database. This operation is irreversible.
     * @returns A Promise that resolves to true if all carts were successfully deleted, false otherwise.
     */
async deleteAllCarts(): Promise<boolean> {
    try {
        // Delete all carts from the database
        await Database.deleteAll(Cart);
        return true;
    } catch (error) {
        console.error('Failed to delete all carts:', error);
        return false; // Return false in case of an error during the deletion process
    }
}



/**
     * Retrieves all carts from the database.
     * @returns A Promise that resolves to an array of all carts.
     */
async getAllCarts(): Promise<Cart[]> {
    try {
        // Retrieve all carts from the database
        const carts = await Database.findAll(Cart);
        return carts;
    } catch (error) {
        console.error('Failed to retrieve all carts:', error);
        throw error; // You might want to handle this error more gracefully depending on your application needs
    }
}

}

export default CartDAO