import { describe, test, expect, afterEach, jest } from "@jest/globals";
import db from "../../src/db/db";

import { Database } from "sqlite3";
import { Role } from "../../src/components/user";
import ReviewDAO from "../../src/dao/reviewDAO";

jest.mock("crypto");
jest.mock("../../src/db/db.ts");

afterEach(() => {
    jest.resetAllMocks();
});

describe("ReviewDAO", () => {
    describe("addReview", () => {
        test("Add a review", async () => {
            const testUser = {
                username: "username",
                name: "name",
                surname: "surname",
                role: Role.CUSTOMER,
                address: "123 Main St",
                birthdate: "1965-10-10",
            };

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
            const testUser = {
                username: "username",
                name: "name",
                surname: "surname",
                role: Role.CUSTOMER,
                address: "123 Main St",
                birthdate: "1965-10-10",
            };

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

        describe("checkExistsReview", () => {
            test("Check for an existing review for a specif product and user", async () => {
                const testUser = {
                    username: "username",
                    name: "name",
                    surname: "surname",
                    role: Role.CUSTOMER,
                    address: "123 Main St",
                    birthdate: "1965-10-10",
                };

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
                const result = await reviewDAO.checkExistsReview(
                    "model",
                    testUser,
                );
                expect(result).toBe(true);
            });

            test("Returns false when review is not found", async () => {
                const reviewDAO = new ReviewDAO();
                jest.spyOn(db, "get").mockImplementation(
                    (_sql, _params, callback) => {
                        callback(null, undefined);
                        return {} as Database;
                    },
                );
                const result = await reviewDAO.checkExistsReview("model", {
                    username: "username",
                    name: "name",
                    surname: "surname",
                    role: Role.CUSTOMER,
                    address: "123 Main St",
                    birthdate: "1965-10-10",
                });
                expect(result).toBe(false);
            });

            test("Fails to check for an existing review for a specific product and user", async () => {
                const testUser = {
                    username: "username",
                    name: "name",
                    surname: "surname",
                    role: Role.CUSTOMER,
                    address: "123 Main St",
                    birthdate: "1965-10-10",
                };

                const reviewDAO = new ReviewDAO();
                jest.spyOn(db, "get").mockImplementation(
                    (_sql, _params, callback) => {
                        callback(new Error());
                        return {} as Database;
                    },
                );
                reviewDAO
                    .checkExistsReview("model", testUser)
                    .catch((error) => {
                        expect(error).toBeInstanceOf(Error);
                    });
            });
        });

        describe("getProductReviews", () => {
            test("Gets all the review for a specific model", async () => {
                const testUser = {
                    username: "username",
                    name: "name",
                    surname: "surname",
                    role: Role.CUSTOMER,
                    address: "123 Main St",
                    birthdate: "1965-10-10",
                };

                const testReview = {
                    model: "model",
                    user: testUser,
                    score: 3,
                    comment: "details",
                };
                const reviewDAO = new ReviewDAO();
                jest.spyOn(db, "all").mockImplementation(
                    (_sql, _params, callback) => {
                        callback(null, [testReview]);
                        return {} as Database;
                    },
                );
                const result = await reviewDAO.getProductReviews("model");
                expect(result).toEqual([testReview]);
            });

            test("Returns empty array when review is not found", async () => {
                const reviewDAO = new ReviewDAO();
                jest.spyOn(db, "all").mockImplementation(
                    (_sql, _params, callback) => {
                        callback(null, []);
                        return {} as Database;
                    },
                );
                const result = await reviewDAO.getProductReviews("model");
                expect(result).toEqual([]);
            });

            test("Fails to get a review by model", async () => {
                const reviewDAO = new ReviewDAO();
                jest.spyOn(db, "all").mockImplementation(
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
                const testUser = {
                    username: "username",
                    name: "name",
                    surname: "surname",
                    role: Role.CUSTOMER,
                    address: "123 Main St",
                    birthdate: "1965-10-10",
                };

                const testReview = {
                    model: "model",
                    user: testUser,
                    score: 3,
                    comment: "details",
                };

                const reviewDAO = new ReviewDAO();
                jest.spyOn(db, "run").mockImplementation(
                    (_sql, _params, callback) => {
                        callback(null, testReview);
                        return {} as Database;
                    },
                );
                const result = await reviewDAO.deleteReview("model", testUser);
                expect(result).toBe(undefined);
            });

            test("Fails to delete a review from the database", async () => {
                const testUser = {
                    username: "username",
                    name: "name",
                    surname: "surname",
                    role: Role.CUSTOMER,
                    address: "123 Main St",
                    birthdate: "1965-10-10",
                };

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
                expect(result).toBe(undefined);
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
                jest.spyOn(db, "run").mockImplementation((_sql, callback) => {
                    callback(null);
                    return {} as Database;
                });
                const result = await reviewDAO.deleteAllReviews();
                expect(result).toBe(undefined);
            });

            test("Fails to delete all reviews from the database", async () => {
                const reviewDAO = new ReviewDAO();
                jest.spyOn(db, "run").mockImplementation((_sql, callback) => {
                    callback(new Error());
                    return {} as Database;
                });
                reviewDAO.deleteAllReviews().catch((error) => {
                    expect(error).toBeInstanceOf(Error);
                });
            });
        });
    });
});
