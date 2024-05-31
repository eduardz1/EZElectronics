import { rejects } from "assert";
import { User } from "../components/user";
import { ProductReview } from "../components/review";
import { resolve } from "path";
import {
    ExistingReviewError,
    NoReviewProductError,
} from "../errors/reviewError";
import db from "../db/db";
import { error } from "console";

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
            try {
                const sql =
                    "INSERT INTO reviews(model,user, score,comment) VALUES(?, ?, ?, ?)";
                db.run(
                    sql,
                    [model, user, score, comment],
                    (err: Error | null) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve();
                    },
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    checkExistsReview(model: string, user: User): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const sql =
                    "SELECT * FROM reviews WHERE model = ? AND user = ?";
                db.get(sql, [model, user], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(row !== undefined);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    getProductReviews(model: string): Promise<ProductReview[]> {
        return new Promise<ProductReview[]>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM reviews WHERE model=?";
                db.all(sql, [model], (err: Error | null, rows: any[]) => {
                    if (err) {
                        reject(err);
                        return;
                    }

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
            } catch (error) {
                reject(error);
            }
        });
    }

    deleteReview(model: string, user: User): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const sql = "DELETE FROM reviews WHERE model = ? AND user = ?";
                db.run(sql, [model, user], (err: Error | null) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    deleteReviewsOfProduct(model: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const sql = "DELETE FROM reviews WHERE model = ?";
                db.run(sql, [model], (err: Error | null) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    deleteAllReviews(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const sql = "DELETE FROM reviews ";
                db.run(sql, [], (err: Error | null) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default ReviewDAO;
