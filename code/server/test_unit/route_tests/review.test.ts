import { test, expect, jest, describe, afterEach } from "@jest/globals";
import request from "supertest";
import { Category } from "../../src/components/product";
const baseURL = "/ezelectronics/reviews";
import { app } from "../../index";
import Authenticator from "../../src/routers/auth";
import ProductController from "../../src/controllers/productController";
import { Role, User } from "../../src/components/user";
import ReviewController from "../../src/controllers/reviewController";
import { ExistingReviewError } from "../../src/errors/reviewError";
import { ProductNotFoundError } from "../../src/errors/productError";
import { ProductReview } from "../../src/components/review";
import { clear } from "console";

jest.mock("../../src/routers/auth");
jest.mock("../../src/controllers/productController");

afterEach(() => {
    jest.resetAllMocks();
});

describe("Review routes", () => {
    describe(`POST ${baseURL}/:model`, () => {
        test(`Returns 200 if successful`, async () => {
            const testUser = {
                username: "username",
                name: "name",
                surname: "surname",
                role: Role.CUSTOMER,
                birthdate: "1996-01-01",
            };

            const testReview = {
                model: "model",
                user: testUser,
                score: 5,
                comment: "comment",
            };
            jest.spyOn(
                ReviewController.prototype,
                "addReview"
            ).mockResolvedValueOnce(undefined);
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer"
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .post(`${baseURL}/`)
                .send(testReview);

            expect(response.status).toBe(200);
            expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(
                1
            );
            expect(ReviewController.prototype.addReview).toHaveBeenCalledWith(
                testReview.model,
                testReview.user,
                testReview.score,
                testReview.comment
            );
            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
        });

        test(`Returns 422 if model is not a string`, async () => {
            const testUser = {
                username: "username",
                name: "name",
                surname: "surname",
                role: Role.CUSTOMER,
                birthdate: "1996-01-01",
            };
            const testReview = {
                model: 5,
                user: testUser,
                score: 5,
                comment: "comment",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer"
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .post(`${baseURL}/`)
                .send(testReview);

            expect(response.status).toBe(422);
            expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(
                0
            );
            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(0);
        });

        test(`Returns 401 if user is not a customer`, async () => {
            const testUser = {
                username: "username",
                name: "name",
                surname: "surname",
                role: Role.ADMIN,
                birthdate: "1996-01-01",
            };
            const testReview = {
                model: "model",
                user: testUser,
                score: 5,
                comment: "comment",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer"
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app)
                .post(`${baseURL}/`)
                .send(testReview);

            expect(response.status).toBe(401);
            expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(
                0
            );
            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
        });

        test(`Returns 409 if a review already exists for the product by the customer`, async () => {
            const testUser = {
                username: "username",
                email: "email",
                role: Role.CUSTOMER,
                birthdate: "1996-01-01",
            };
            const testReview = {
                model: "model",
                user: testUser,
                score: 5,
                comment: "comment",
            };
            jest.spyOn(
                Authenticator.prototype,
                "isCustomer"
            ).mockImplementation((_req, _res, next) => next());
            jest.spyOn(
                ReviewController.prototype,
                "addReview"
            ).mockRejectedValueOnce(new ExistingReviewError());

            const response = await request(app)
                .post(`${baseURL}/`)
                .send(testReview);

            expect(response.status).toBe(409);
            expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(
                1
            );
            expect(ReviewController.prototype.addReview).toHaveBeenCalledWith(
                testReview.model,
                testReview.user,
                testReview.score,
                testReview.comment
            );
            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
        });

        test(`Returns 404 if model does not represent an existing product`, async () => {
            const testUser = {
                username: "username",
                name: "name",
                surname: "surname",
                role: Role.CUSTOMER,
                birthdate: "1996-01-01",
            };
            const testReview = {
                model: "nonExistingModel",
                user: testUser,
                score: 5,
                comment: "comment",
            };
            jest.spyOn(
                ReviewController.prototype,
                "getProductReviews"
            ).mockRejectedValueOnce(new ProductNotFoundError());

            const response = await request(app)
                .post(`${baseURL}/`)
                .send(testReview);

            expect(response.status).toBe(404);
            expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(
                0
            );
            expect(Authenticator.prototype.isCustomer).toHaveBeenCalledTimes(1);
        });
    });

    describe(`GET ${baseURL}/:model`, () => {
        test(`Returns 200 if successful`, async () => {
            const testUsers: User[] = [
                new User(
                    "username1",
                    "name",
                    "surname",
                    Role.CUSTOMER,
                    "address",
                    "1998-04-09"
                ),
                new User(
                    "username2",
                    "name",
                    "surname",
                    Role.CUSTOMER,
                    "address",
                    "1998-04-09"
                ),
                new User(
                    "username3",
                    "name",
                    "surname",
                    Role.CUSTOMER,
                    "address",
                    "1998-04-09"
                ),
            ];

            const testReviews: ProductReview[] = [
                {
                    model: "model1",
                    user: testUsers[0].username,
                    score: 5,
                    date: "",
                    comment: "Great product!",
                },
                {
                    model: "model1",
                    user: testUsers[1].username,
                    score: 4,
                    date: "",
                    comment: "Good product!",
                },
                {
                    model: "model1",
                    user: testUsers[2].username,
                    score: 3,
                    date: "",
                    comment: "Average product!",
                },
            ];
            jest.spyOn(
                ReviewController.prototype,
                "getProductReviews"
            ).mockResolvedValueOnce(testReviews);
            jest.spyOn(
                Authenticator.prototype,
                "isLoggedIn"
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app).get(`${baseURL}/`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(testReviews);
            expect(
                ReviewController.prototype.getProductReviews
            ).toHaveBeenCalledTimes(1);
            expect(
                Authenticator.prototype.isAdminOrManager
            ).toHaveBeenCalledTimes(1);
        });
    });

    describe(`DELETE ${baseURL}/:model`, () => {
        test(`Returns 200 if successful`, async () => {
            const testUsers: User[] = [
                new User(
                    "username1",
                    "name",
                    "surname",
                    Role.CUSTOMER,
                    "address",
                    "1998-04-09"
                ),
                new User(
                    "username2",
                    "name",
                    "surname",
                    Role.CUSTOMER,
                    "address",
                    "1998-04-09"
                ),
                new User(
                    "username3",
                    "name",
                    "surname",
                    Role.CUSTOMER,
                    "address",
                    "1998-04-09"
                ),
            ];

            const testReviews: ProductReview[] = [
                {
                    model: "model1",
                    user: testUsers[0].username,
                    score: 5,
                    date: "",
                    comment: "Great product!",
                },
                {
                    model: "model1",
                    user: testUsers[1].username,
                    score: 4,
                    date: "",
                    comment: "Good product!",
                },
                {
                    model: "model1",
                    user: testUsers[2].username,
                    score: 3,
                    date: "",
                    comment: "Average product!",
                },
            ];

            jest.spyOn(
                ReviewController.prototype,
                "deleteReview"
            ).mockResolvedValueOnce(undefined);
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager"
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app).delete(`${baseURL}/`);

            expect(response.status).toBe(200);
            expect(
                ReviewController.prototype.deleteReview
            ).toHaveBeenCalledTimes(1);
            expect(
                ReviewController.prototype.deleteReview
            ).toHaveBeenCalledWith(testReviews[0].model);
            expect(
                Authenticator.prototype.isAdminOrManager
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 401 if user is not Admin or Manager`, async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager"
            ).mockImplementation((_req, res, _next) =>
                res.status(401).json({
                    error: "User is not Admin or Manager",
                    status: 401,
                })
            );

            const response = await request(app).delete(`${baseURL}/`);

            expect(response.status).toBe(401);
            expect(
                ReviewController.prototype.deleteReview
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 404 if model does not represent an existing product`, async () => {
            jest.spyOn(
                ReviewController.prototype,
                "deleteReview"
            ).mockRejectedValueOnce(new ProductNotFoundError());
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager"
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app).delete(`${baseURL}/`);

            expect(response.status).toBe(404);
            expect(
                ReviewController.prototype.deleteReview
            ).toHaveBeenCalledTimes(1);
            expect(
                ReviewController.prototype.deleteReview
            ).toHaveBeenCalledWith("model");
            expect(
                Authenticator.prototype.isAdminOrManager
            ).toHaveBeenCalledTimes(1);
        });
    });

    describe(`DELETE ${baseURL}/:model/all`, () => {
        test(`Returns 200 if successful`, async () => {
            jest.spyOn(
                ReviewController.prototype,
                "deleteAllReviews"
            ).mockResolvedValueOnce(undefined);
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager"
            ).mockImplementation((_req, _res, next) => next());

            const response = await request(app).delete(`${baseURL}/`);

            expect(response.status).toBe(200);
            expect(
                ReviewController.prototype.deleteAllReviews
            ).toHaveBeenCalledTimes(1);
            expect(
                Authenticator.prototype.isAdminOrManager
            ).toHaveBeenCalledTimes(1);
        });

        test(`Returns 401 if user is not an admin or manager`, async () => {
            jest.spyOn(
                Authenticator.prototype,
                "isAdminOrManager"
            ).mockImplementation((_req, res, _next) =>
                res.status(401).json({
                    error: "User is not an admin or manager",
                    status: 401,
                })
            );

            const response = await request(app).delete(`${baseURL}/model/all`);

            expect(response.status).toBe(401);
            expect(
                ReviewController.prototype.deleteAllReviews
            ).toHaveBeenCalledTimes(0);
            expect(
                Authenticator.prototype.isAdminOrManager
            ).toHaveBeenCalledTimes(1);
        });
    });
});
