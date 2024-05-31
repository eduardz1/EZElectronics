import {
    describe,
    test,
    expect,
    beforeAll,
    afterAll,
    afterEach,
    jest,
} from "@jest/globals";
import ProductDAO from "../../src/dao/productDAO";
import db from "../../src/db/db";

import { Database } from "sqlite3";
import { Role, User } from "../../src/components/user";
import ReviewDAO from "../../src/dao/reviewDAO";
import reviewDAO from "../../src/dao/reviewDAO";

jest.mock("crypto");
jest.mock("../../src/db/db.ts");

afterEach(() => {
    jest.resetAllMocks();
});

const address = "123 Main St";
const testUser = {
    username: "username",
    name: "name",
    surname: "surname",
    role: Role.CUSTOMER,
    address: address,
    birthdate: "1965-10-10",
};

describe("ReviewDAO", () => {
    describe("addReview", () => {
        test("Add a review", async () => {
            const reviewDAO = new ReviewDAO();
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(null);
                    return {} as Database;
                },
            );

            const result = await reviewDAO.addReview(
                "model",
                testUser,
                3,
                "details",
            );
            expect(result).toBe(undefined);
        });

        test("Fails to add a review", async () => {
            const reviewDAO = new ReviewDAO();
            jest.spyOn(db, "run").mockImplementation(
                (_sql, _params, callback) => {
                    callback(new Error());
                    return {} as Database;
                },
            );
            reviewDAO
                .addReview("model", testUser, 3, "details")
                .catch((error) => {
                    expect(error).toBeInstanceOf(Error);
                });
        });

        describe("getProductReviews", () => {
            test("Check for an existing review for a spefic product and user", async () => {
                const reviewDAO = new ReviewDAO();
                jest.spyOn(db, "run").mockImplementation(
                    (_sql, _params, callback) => {
                        callback(null);
                        return {} as Database;
                    },
                );
                const result = await reviewDAO.checkExistsReview(
                    "model",
                    testUser,
                );
                expect(result).toBe(true);
            });
        });

        describe("getProductReviews", () => {
            test("Gets all the review for a specific model", async () => {
                const testReview = {
                    model: "model",
                    user: testUser,
                    score: 3,
                    comment: "details",
                };
                const reviewDAO = new ReviewDAO();
                jest.spyOn(db, "get").mockImplementation(
                    (_sql, _params, callback) => {
                        callback(null, testReview);
                        return {} as Database;
                    },
                );
                const result = await reviewDAO.getProductReviews("model");
                expect(result).toEqual(testReview);
            });

            test("Returns null when review is not found", async () => {
                const reviewDAO = new ReviewDAO();
                jest.spyOn(db, "get").mockImplementation(
                    (_sql, _params, callback) => {
                        callback(null, undefined);
                        return {} as Database;
                    },
                );
                const result = await reviewDAO.getProductReviews("model");
                expect(result).toBeNull();
            });

            test("Fails to get a review by model", async () => {
                const reviewDAO = new ReviewDAO();
                jest.spyOn(db, "get").mockImplementation(
                    (_sql, _params, callback) => {
                        callback(new Error());
                        return {} as Database;
                    },
                );
                reviewDAO.getProductReviews("model").catch((error) => {
                    expect(error).toBeInstanceOf(Error);
                });
            });
        });

        describe("deleteReview", () => {
            test("Deletes a review from the database", async () => {
                const reviewDAO = new ReviewDAO();
                jest.spyOn(db, "run").mockImplementation(
                    (_sql, _params, callback) => {
                        callback(null);
                        return {} as Database;
                    },
                );
                const result = await reviewDAO.deleteReview("model", testUser);
                expect(result).toBe(true);
            });

            test("Fails to delete a review from the database", async () => {
                const reviewDAO = new ReviewDAO();
                jest.spyOn(db, "run").mockImplementation(
                    (_sql, _params, callback) => {
                        callback(new Error());
                        return {} as Database;
                    },
                );
                reviewDAO.deleteReview("model", testUser).catch((error) => {
                    expect(error).toBeInstanceOf(Error);
                });
            });
        });

        describe("deleteReviewsOfProduct", () => {
            test("Deletes all reviews of a specific product", async () => {
                const reviewDAO = new ReviewDAO();
                jest.spyOn(db, "run").mockImplementation(
                    (_sql, _params, callback) => {
                        callback(null);
                        return {} as Database;
                    },
                );
                const result = await reviewDAO.deleteReviewsOfProduct("model");
                expect(result).toBe(true);
            });
            test("Fails to delete reviews of a specific product", async () => {
                const reviewDAO = new ReviewDAO();
                jest.spyOn(db, "run").mockImplementation(
                    (_sql, _params, callback) => {
                        callback(new Error());
                        return {} as Database;
                    },
                );
                reviewDAO.deleteReviewsOfProduct("model").catch((error) => {
                    expect(error).toBeInstanceOf(Error);
                });
            });
        });

        describe("deleteAllReviews", () => {
            test("Deletes all reviews from the database", async () => {
                const reviewDAO = new ReviewDAO();
                jest.spyOn(db, "run").mockImplementation(
                    (_sql, _params, callback) => {
                        callback(null);
                        return {} as Database;
                    },
                );
                const result = await reviewDAO.deleteAllReviews();
                expect(result).toBe(true);
            });

            test("Fails to delete all reviews from the database", async () => {
                const reviewDAO = new ReviewDAO();
                jest.spyOn(db, "run").mockImplementation(
                    (_sql, _params, callback) => {
                        callback(new Error());
                        return {} as Database;
                    },
                );
                reviewDAO.deleteAllReviews().catch((error) => {
                    expect(error).toBeInstanceOf(Error);
                });
            });
        });
    });
});
