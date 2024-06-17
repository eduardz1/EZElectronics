import { User } from "../components/user";
import { ProductReview } from "../components/review";
import db from "../db/db";
import dayjs from "dayjs";

/**
 * A class that implements the interaction with the database for all review-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ReviewDAO {
    /**
     * Adds a review to the database.
     *
     * @param model - The model of the product being reviewed.
     * @param user - The user who submitted the review.
     * @param score - The score given to the product.
     * @param comment - The comment provided by the user.
     * @returns A Promise that resolves when the review is successfully added to the database, or rejects with an error.
     */
    addReview(
        model: string,
        user: User,
        score: number,
        comment: string,
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = `
                INSERT INTO
                    reviews(
                        model,
                        date,
                        user,
                        score,
                        comment
                    )
                VALUES
                    (?, ?, ?, ?, ?)`;

            db.run(
                sql,
                [
                    model,
                    dayjs().toISOString().slice(0, 10),
                    user.username,
                    score,
                    comment,
                ],
                (err: Error | null) => (err ? reject(err) : resolve()),
            );
        });
    }

    /**
     * Checks if a review exists for a given model and user.
     * @param model - The model of the product.
     * @param user - The user who writes the review.
     * @returns A promise that resolves to a boolean indicating whether the review exists or not, or rejects with an error.
     */
    checkExistsReview(model: string, user: User): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "SELECT * FROM reviews WHERE model = ? AND user = ?";
            db.get(
                sql,
                [model, user.username],
                (err: Error | null, row: any) =>
                    err ? reject(err) : resolve(!!row),
            );
        });
    }

    /**
     * Retrieves the reviews for a specific product model.
     * @param model - The model of the product.
     * @returns A promise that resolves to an array of ProductReview objects.
     */
    getProductReviews(model: string): Promise<ProductReview[]> {
        return new Promise<ProductReview[]>((resolve, reject) => {
            const sql = "SELECT * FROM reviews WHERE model=?";
            db.all(sql, [model], (err: Error | null, rows: any[]) => {
                if (err) return reject(err);

                const productReviews: ProductReview[] = rows.map(
                    (row) =>
                        new ProductReview(
                            row.model,
                            row.user,
                            row.score,
                            row.date,
                            row.comment,
                        ),
                );

                resolve(productReviews);
            });
        });
    }

    /**
     * Deletes a review from the database.
     *
     * @param model - The model of the product associated with the review.
     * @param user - The user who posted the review.
     * @returns A Promise that resolves when the review is successfully deleted, or rejects with an error.
     */
    deleteReview(model: string, user: User): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = "DELETE FROM reviews WHERE model = ? AND user = ?";
            db.run(sql, [model, user.username], (err: Error | null) =>
                err ? reject(err) : resolve(),
            );
        });
    }

    /**
     * Deletes all reviews of a product from the database.
     * @param model - The model of the product.
     * @returns A promise that resolves when the reviews are deleted successfully, or rejects with an error.
     */
    deleteReviewsOfProduct(model: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = "DELETE FROM reviews WHERE model = ?";
            db.run(sql, [model], (err: Error | null) =>
                err ? reject(err) : resolve(),
            );
        });
    }

    /**
     * Deletes all reviews from the database.
     * @returns A promise that resolves when the deletion is successful, or rejects with an error.
     */
    deleteAllReviews(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = "DELETE FROM reviews ";
            db.run(sql, (err: Error | null) => (err ? reject(err) : resolve()));
        });
    }
}

export default ReviewDAO;
