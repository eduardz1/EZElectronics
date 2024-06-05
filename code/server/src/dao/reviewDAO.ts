import { User } from "../components/user";
import { ProductReview } from "../components/review";
import db from "../db/db";

/**
 * A class that implements the interaction with the database for all review-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ReviewDAO {
    addReview(
        model: string,
        user: User,
        score: number,
        comment: string,
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql =
                "INSERT INTO reviews(model,user, score,comment) VALUES(?, ?, ?, ?)";
            db.run(sql, [model, user, score, comment], (err: Error | null) =>
                err ? reject(err) : resolve(),
            );
        });
    }

    checkExistsReview(model: string, user: User): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const sql = "SELECT * FROM reviews WHERE model = ? AND user = ?";
            db.get(sql, [model, user], (err: Error | null, row: any) =>
                err ? reject(err) : resolve(!!row),
            );
        });
    }

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

    deleteReview(model: string, user: User): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = "DELETE FROM reviews WHERE model = ? AND user = ?";
            db.run(sql, [model, user], (err: Error | null) =>
                err ? reject(err) : resolve(),
            );
        });
    }

    deleteReviewsOfProduct(model: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = "DELETE FROM reviews WHERE model = ?";
            db.run(sql, [model], (err: Error | null) =>
                err ? reject(err) : resolve(),
            );
        });
    }

    deleteAllReviews(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const sql = "DELETE FROM reviews ";
            db.run(sql, (err: Error | null) => (err ? reject(err) : resolve()));
        });
    }
}

export default ReviewDAO;
