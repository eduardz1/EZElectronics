import {
    test,
    expect,
    jest,
    beforeEach,
    afterEach,
    describe,
} from "@jest/globals";
import ReviewController from "../../src/controllers/reviewController";
import ReviewDAO from "../../src/dao/reviewDAO";
import ProductDAO from "../../src/dao/productDAO";
import { Role, User } from "../../src/components/user";
import { ProductReview } from "../../src/components/review";
import { ProductNotFoundError } from "../../src/errors/productError";
import {
    ExistingReviewError,
    NoReviewProductError,
} from "../../src/errors/reviewError";
import { Category } from "../../src/components/product";

beforeEach(() => {
    jest.mock("../../src/dao/reviewDAO");
    jest.mock("../../src/dao/productDAO");
});

afterEach(() => {
    jest.resetAllMocks();
});

describe("ReviewController", () => {
    describe("addReview", () => {
        test("should add a review", async () => {
            const testProduct = {
                model: "model",
                category: Category.SMARTPHONE,
                quantity: 5,
                details: "details",
                sellingPrice: 100,
                arrivalDate: "2021-06-01",
            };
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel"
            ).mockResolvedValueOnce(testProduct);
            jest.spyOn(
                ReviewDAO.prototype,
                "checkExistsReview"
            ).mockResolvedValueOnce(false);
            jest.spyOn(ReviewDAO.prototype, "addReview").mockResolvedValueOnce(
                undefined
            );

            const testUser = {
                username: "user",
                name: "name",
                surname: "surname",
                role: Role.CUSTOMER,
                address: "address",
                birthdate: "1956-05-31",
            };

            const testReview = {
                model: "model",
                user: testUser,
                score: 5,
                date: "2021-06-01",
                comment: "Great product!",
            };

            const controller = new ReviewController();
            const response = await controller.addReview(
                testReview.model,
                testUser,
                5,
                "Great product!"
            );
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testReview.model
            );
            expect(ReviewDAO.prototype.checkExistsReview).toHaveBeenCalledWith(
                testReview.model,
                testUser
            );
            expect(ReviewDAO.prototype.addReview).toHaveBeenCalledWith(
                testReview.model,
                testUser,
                5,
                "Great product!"
            );
            expect(response).toBe(undefined);
        });

        test("should throw ProductNotFoundError when adding a review for a non-existing product", async () => {
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel"
            ).mockResolvedValueOnce(null);

            const testUser = {
                username: "user",
                name: "name",
                surname: "surname",
                role: Role.CUSTOMER,
                address: "address",
                birthdate: "1956-05-31",
            };

            const testReview = {
                model: "model",
                user: testUser,
                score: 5,
                date: "2021-06-01",
                comment: "Great product!",
            };

            const controller = new ReviewController();
            await expect(
                controller.addReview(
                    testReview.model,
                    testUser,
                    5,
                    "Great product!"
                )
            ).rejects.toThrow(ProductNotFoundError);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testReview.model
            );
        });

        test("should throw ExistingReviewError when adding a review that already exists", async () => {
            const testProduct = {
                model: "model",
                category: Category.SMARTPHONE,
                quantity: 5,
                details: "details",
                sellingPrice: 100,
                arrivalDate: "2021-06-01",
            };
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel"
            ).mockResolvedValueOnce(testProduct);
            jest.spyOn(
                ReviewDAO.prototype,
                "checkExistsReview"
            ).mockResolvedValueOnce(true);
            const testUser = {
                username: "user",
                name: "name",
                surname: "surname",
                role: Role.CUSTOMER,
                address: "address",
                birthdate: "1956-05-31",
            };

            const testReview = {
                model: "model",
                user: testUser,
                score: 5,
                date: "2021-06-01",
                comment: "Great product!",
            };

            const controller = new ReviewController();
            await expect(
                controller.addReview(
                    testReview.model,
                    testUser,
                    5,
                    "Great product!"
                )
            ).rejects.toThrow(ExistingReviewError);
            expect(ReviewDAO.prototype.checkExistsReview).toHaveBeenCalledWith(
                testReview.model,
                testUser
            );
        });
    });

    describe("getProductReviews", () => {
        test("should return reviews", async () => {
            const testUsers: User[] = [
                {
                    username: "user1",
                    name: "name1",
                    surname: "surname1",
                    role: Role.CUSTOMER,
                    address: "address1",
                    birthdate: "1956-05-31",
                },
                {
                    username: "user2",
                    name: "name2",
                    surname: "surname2",
                    role: Role.CUSTOMER,
                    address: "address2",
                    birthdate: "1956-05-31",
                },
                {
                    username: "user3",
                    name: "name3",
                    surname: "surname3",
                    role: Role.CUSTOMER,
                    address: "address3",
                    birthdate: "1956-05-31",
                },
            ];

            const testReviews: ProductReview[] = [
                {
                    model: "model1",
                    user: testUsers[0].username,
                    score: 5,
                    date: "2021-06-01",
                    comment: "Great product!",
                },
                {
                    model: "model2",
                    user: testUsers[1].username,
                    score: 4,
                    date: "2021-06-02",
                    comment: "Good product!",
                },
                {
                    model: "model3",
                    user: testUsers[2].username,
                    score: 3,
                    date: "2021-06-03",
                    comment: "Average product!",
                },
            ];

            jest.spyOn(
                ReviewDAO.prototype,
                "getProductReviews"
            ).mockResolvedValueOnce(testReviews);

            const controller = new ReviewController();
            const reviews = await controller.getProductReviews(
                testReviews[0].model
            );
            expect(ReviewDAO.prototype.getProductReviews).toHaveBeenCalledWith(
                testReviews[0].model
            );
            expect(reviews).toEqual(testReviews);
        });

        test("should throw ProductNotFoundError when getting reviews for a non-existing product", async () => {
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel"
            ).mockResolvedValueOnce(null);

            const testUser = {
                username: "user",
                name: "name",
                surname: "surname",
                role: Role.CUSTOMER,
                address: "address",
                birthdate: "1956-05-31",
            };

            const testReview = {
                model: "model",
                user: testUser,
                score: 5,
                date: "2021-06-01",
                comment: "Great product!",
            };

            const controller = new ReviewController();
            await expect(
                controller.getProductReviews(testReview.model)
            ).rejects.toThrow(ProductNotFoundError);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testReview.model
            );
        });
    });

    describe("deleteReview", () => {
        const testProduct = {
            model: "model",
            category: Category.SMARTPHONE,
            quantity: 5,
            details: "details",
            sellingPrice: 100,
            arrivalDate: "2021-06-01",
        };

        test("should delete a review", async () => {
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel"
            ).mockResolvedValueOnce(testProduct);
            jest.spyOn(
                ReviewDAO.prototype,
                "checkExistsReview"
            ).mockResolvedValueOnce(true);
            jest.spyOn(
                ReviewDAO.prototype,
                "deleteReview"
            ).mockResolvedValueOnce(undefined);
            const testUser = {
                username: "user",
                name: "name",
                surname: "surname",
                role: Role.CUSTOMER,
                address: "address",
                birthdate: "1956-05-31",
            };

            const testReview = {
                model: "model",
                user: testUser,
                score: 5,
                date: "2021-06-01",
                comment: "Great product!",
            };
            const controller = new ReviewController();
            await controller.deleteReview(testReview.model, testUser);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testReview.model
            );
            expect(ReviewDAO.prototype.checkExistsReview).toHaveBeenCalledWith(
                testReview.model,
                testUser
            );
            expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledWith(
                testReview.model,
                testUser
            );
        });

        test("should throw ProductNotFoundError when deleting a review for a non-existing product", async () => {
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel"
            ).mockResolvedValueOnce(null);
            const testUser = {
                username: "user",
                name: "name",
                surname: "surname",
                role: Role.CUSTOMER,
                address: "address",
                birthdate: "1956-05-31",
            };

            const testReview = {
                model: "model",
                user: testUser,
                score: 5,
                date: "2021-06-01",
                comment: "Great product!",
            };

            const testProduct = {
                model: "model",
                category: Category.SMARTPHONE,
                quantity: 5,
                details: "details",
                sellingPrice: 100,
                arrivalDate: "2021-06-01",
            };
            const controller = new ReviewController();
            await expect(
                controller.deleteReview(testReview.model, testUser)
            ).rejects.toThrow(ProductNotFoundError);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testProduct.model
            );
        });

        test("should throw NoReviewProductError when deleting a review that does not exist", async () => {
            const testProduct = {
                model: "model",
                category: Category.SMARTPHONE,
                quantity: 5,
                details: "details",
                sellingPrice: 100,
                arrivalDate: "2021-06-01",
            };

            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel"
            ).mockResolvedValueOnce(testProduct);
            jest.spyOn(
                ReviewDAO.prototype,
                "checkExistsReview"
            ).mockResolvedValueOnce(false);
            const testUser = {
                username: "user",
                name: "name",
                surname: "surname",
                role: Role.CUSTOMER,
                address: "address",
                birthdate: "1956-05-31",
            };

            const testReview = {
                model: "model",
                user: testUser,
                score: 5,
                date: "2021-06-01",
                comment: "Great product!",
            };
            const controller = new ReviewController();
            await expect(
                controller.deleteReview(testReview.model, testUser)
            ).rejects.toThrow(NoReviewProductError);
            expect(ReviewDAO.prototype.checkExistsReview).toHaveBeenCalledWith(
                testReview.model,
                testUser
            );
        });
    });

    describe("deleteReviewsOfProduct", () => {
        test("should delete all reviews of a product", async () => {
            const testProduct = {
                model: "model",
                category: Category.SMARTPHONE,
                quantity: 5,
                details: "details",
                sellingPrice: 100,
                arrivalDate: "2021-06-01",
            };
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel"
            ).mockResolvedValueOnce(testProduct);
            jest.spyOn(
                ReviewDAO.prototype,
                "deleteReviewsOfProduct"
            ).mockResolvedValueOnce(undefined);
            const testUser = {
                username: "user",
                name: "name",
                surname: "surname",
                role: Role.CUSTOMER,
                address: "address",
                birthdate: "1956-05-31",
            };

            const testReviews: ProductReview[] = [
                {
                    model: "model1",
                    user: testUser.username,
                    score: 5,
                    date: "2021-06-01",
                    comment: "Great product!",
                },
                {
                    model: "model2",
                    user: testUser.username,
                    score: 4,
                    date: "2021-06-02",
                    comment: "Good product!",
                },
                {
                    model: "model3",
                    user: testUser.username,
                    score: 3,
                    date: "2021-06-03",
                    comment: "Average product!",
                },
            ];
            const controller = new ReviewController();
            await controller.deleteReviewsOfProduct(testReviews[0].model);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testReviews[0].model
            );
            expect(
                ReviewDAO.prototype.deleteReviewsOfProduct
            ).toHaveBeenCalledWith(testReviews[0].model);
        });

        test("should throw ProductNotFoundError when deleting reviews of a non-existing product", async () => {
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel"
            ).mockResolvedValueOnce(null);
            const testUser = {
                username: "user",
                name: "name",
                surname: "surname",
                role: Role.CUSTOMER,
                address: "address",
                birthdate: "1956-05-31",
            };

            const testReview = {
                model: "model",
                user: testUser,
                score: 5,
                date: "2021-06-01",
                comment: "Great product!",
            };
            const controller = new ReviewController();
            await expect(
                controller.deleteReviewsOfProduct(testReview.model)
            ).rejects.toThrow(ProductNotFoundError);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testReview.model
            );
        });
    });

    describe("deleteAllReviews", () => {
        test("should delete all reviews", async () => {
            jest.spyOn(
                ReviewDAO.prototype,
                "deleteAllReviews"
            ).mockResolvedValueOnce(undefined);

            const controller = new ReviewController();
            await controller.deleteAllReviews();
            expect(ReviewDAO.prototype.deleteAllReviews).toHaveBeenCalledTimes(
                1
            );
        });
    });
});
