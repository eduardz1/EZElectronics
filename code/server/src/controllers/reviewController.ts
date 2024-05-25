import { ProductReview } from "../components/review";
import { User } from "../components/user";
import ProductDAO from "../dao/productDAO";
import ReviewDAO from "../dao/reviewDAO";
import { NoReviewProductError } from "../errors/reviewError";
import { UserNotCustomerError } from "../errors/userError";

class ReviewController {
    private dao: ReviewDAO
    //private productDao: ProductDAO

    constructor() {
        this.dao = new ReviewDAO
    }

    /**
     * Adds a new review for a product
     * @param model The model of the product to review
     * @param user The username of the user who made the review
     * @param score The score assigned to the product, in the range [1, 5]
     * @param comment The comment made by the user
     * @returns A Promise that resolves to nothing
     */
    async addReview(model: string, user: User, score: number, comment: string):Promise<void>{
        if(user.role !== "Customer") {
            throw new UserNotCustomerError();
        }
        return this.dao.addReview(model, user, score, comment);
     }

    /**
     * Returns all reviews for a product
     * @param model The model of the product to get reviews from
     * @returns A Promise that resolves to an array of ProductReview objects
     */
    async getProductReviews(model: string): Promise<ProductReview[]> {
        return this.dao.getProductReviews(model);
     }

    /**
     * Deletes the review made by a user for a product
     * @param model The model of the product to delete the review from
     * @param user The user who made the review to delete
     * @returns A Promise that resolves to nothing
     */
    async deleteReview(model: string, user: User): Promise<void> {
       /* if(await productDao.getProducts().isnotempty()) {
            return new NoReviewProductError()
        }*/
        if(user.role !== "Customer") {
            throw new UserNotCustomerError();
        }
        return this.dao.deleteReview(model, user)
     }

    /**
     * Deletes all reviews for a product
     * @param model The model of the product to delete the reviews from
     * @returns A Promise that resolves to nothing
     */
    async deleteReviewsOfProduct(model: string): Promise<void> {
        //TODO in api this method is only accessable by admin or manager, but no check on user is possible

        /* if(await productDao.getProducts().isnotempty()) {
            return new NoReviewProductError()
        }*/
        
        return this.dao.deleteReviewsOfProduct(model)
     }

    /**
     * Deletes all reviews of all products
     * @returns A Promise that resolves to nothing
     */
    async deleteAllReviews(): Promise<void> {
        //TODO in api this method is only accessable by admin or manager, but no check on user is possible

        return this.dao.deleteAllReviews()
     }
}

export default ReviewController;
