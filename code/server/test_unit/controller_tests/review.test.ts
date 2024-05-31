import { test, expect, jest } from "@jest/globals";
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

beforeEach(() => {
    jest.mock("../../src/dao/reviewDAO");
    jest.mock("../../src/dao/productDAO");
});

afterEach(() => {
    jest.resetAllMocks();
});

const testUser: User = {
    username: "",
    name: "",
    surname: "",
    role: Role.MANAGER,
    address: "",
    birthdate: "",
};
const testReview: ProductReview = {
    model: "",
    user: "",
    score: 0,
    date: "",
    comment: "",
};

describe("ReviewController", () => {
    describe("addReview", () => {
        test("should add a review", async () => {
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(null);
            jest.spyOn(
                ReviewDAO.prototype,
                "checkExistsReview",
            ).mockResolvedValueOnce(false);
            jest.spyOn(ReviewDAO.prototype, "addReview").mockResolvedValueOnce(
                undefined,
            );
            const controller = new ReviewController();
            const response = await controller.addReview(
                testReview.model,
                testUser,
                5,
                "Great product!",
            );
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testReview.model,
            );
            expect(ReviewDAO.prototype.checkExistsReview).toHaveBeenCalledWith(
                testReview.model,
                testUser,
            );
            expect(ReviewDAO.prototype.addReview).toHaveBeenCalledWith(
                testReview.model,
                testUser,
                5,
                "Great product!",
            );
            expect(response).toBe(undefined);
        });

        test("should throw ProductNotFoundError when adding a review for a non-existing product", async () => {
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(null);
            const controller = new ReviewController();
            await expect(
                controller.addReview(
                    testReview.model,
                    testUser,
                    5,
                    "Great product!",
                ),
            ).rejects.toThrow(ProductNotFoundError);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testReview.model,
            );
        });

        test("should throw ExistingReviewError when adding a review that already exists", async () => {
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(null);
            jest.spyOn(
                ReviewDAO.prototype,
                "checkExistsReview",
            ).mockResolvedValueOnce(true);
            const controller = new ReviewController();
            await expect(
                controller.addReview(
                    testReview.model,
                    testUser,
                    5,
                    "Great product!",
                ),
            ).rejects.toThrow(ExistingReviewError);
            expect(ReviewDAO.prototype.checkExistsReview).toHaveBeenCalledWith(
                testReview.model,
                testUser,
            );
        });
    });

    describe("getProductReviews", () => {
        test("should return reviews", async () => {
            jest.spyOn(
                ReviewDAO.prototype,
                "getProductReviews",
            ).mockResolvedValueOnce([testReview]);
            const controller = new ReviewController();
            const reviews = await controller.getProductReviews(
                testReview.model,
            );
            expect(ReviewDAO.prototype.getProductReviews).toHaveBeenCalledWith(
                testReview.model,
            );
            expect(reviews).toEqual([testReview]);
        });
    });

    describe("deleteReview", () => {
        test("should delete a review", async () => {
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(null);
            jest.spyOn(
                ReviewDAO.prototype,
                "checkExistsReview",
            ).mockResolvedValueOnce(true);
            jest.spyOn(
                ReviewDAO.prototype,
                "deleteReview",
            ).mockResolvedValueOnce(undefined);
            const controller = new ReviewController();
            await controller.deleteReview(testReview.model, testUser);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testReview.model,
            );
            expect(ReviewDAO.prototype.checkExistsReview).toHaveBeenCalledWith(
                testReview.model,
                testUser,
            );
            expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledWith(
                testReview.model,
                testUser,
            );
        });

        test("should throw ProductNotFoundError when deleting a review for a non-existing product", async () => {
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(null);
            const controller = new ReviewController();
            await expect(
                controller.deleteReview(testReview.model, testUser),
            ).rejects.toThrow(ProductNotFoundError);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testReview.model,
            );
        });

        test("should throw NoReviewProductError when deleting a review that does not exist", async () => {
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(null);
            jest.spyOn(
                ReviewDAO.prototype,
                "checkExistsReview",
            ).mockResolvedValueOnce(false);
            const controller = new ReviewController();
            await expect(
                controller.deleteReview(testReview.model, testUser),
            ).rejects.toThrow(NoReviewProductError);
            expect(ReviewDAO.prototype.checkExistsReview).toHaveBeenCalledWith(
                testReview.model,
                testUser,
            );
        });
    });

    describe("deleteReviewsOfProduct", () => {
        test("should delete all reviews of a product", async () => {
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(null);
            jest.spyOn(
                ReviewDAO.prototype,
                "deleteReviewsOfProduct",
            ).mockResolvedValueOnce(undefined);
            const controller = new ReviewController();
            await controller.deleteReviewsOfProduct(testReview.model);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testReview.model,
            );
            expect(
                ReviewDAO.prototype.deleteReviewsOfProduct,
            ).toHaveBeenCalledWith(testReview.model);
        });

        test("should throw ProductNotFoundError when deleting reviews of a non-existing product", async () => {
            jest.spyOn(
                ProductDAO.prototype,
                "getProductByModel",
            ).mockResolvedValueOnce(null);
            const controller = new ReviewController();
            await expect(
                controller.deleteReviewsOfProduct(testReview.model),
            ).rejects.toThrow(ProductNotFoundError);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(
                testReview.model,
            );
        });
    });

    describe("deleteAllReviews", () => {
        test("should delete all reviews", async () => {
            jest.spyOn(
                ReviewDAO.prototype,
                "deleteAllReviews",
            ).mockResolvedValueOnce(undefined);
            const controller = new ReviewController();
            await controller.deleteAllReviews();
            expect(ReviewDAO.prototype.deleteAllReviews).toHaveBeenCalledTimes(
                1,
            );
        });
    });
});
