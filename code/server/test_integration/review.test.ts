import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import { cleanup } from "../src/db/cleanup";
import { app } from "../index";
import {
    admin,
    customer,
    login,
    logout,
    manager,
    postProduct,
    postUser,
    routePath,
    testProduct,
} from "./helpers";
import { ProductReview } from "../src/components/review";

const reviewInfo = new ProductReview(
    testProduct.model,
    customer.username,
    5,
    "2023-01-01",
    "very nice smartphone",
);

let customerCookie: string;
let adminCookie: string;
let managerCookie: string;

beforeAll(async () => {
    await cleanup();

    await postUser(admin);
    await postUser(manager);
    await postUser(customer);

    adminCookie = await login(admin);
    customerCookie = await login(customer);
    managerCookie = await login(manager);

    await postProduct(testProduct, managerCookie);

    await logout(managerCookie);
});

afterAll(async () => {
    await cleanup();
});

describe("Review routes integration tests", () => {
    describe("POST /reviews/:model", () => {
        test("It should return a 200 success code and add a new review", async () => {
            //simulate that the user has bought the product
            console.log("customerCookie", customerCookie);
            await request(app)
                .post(`${routePath}/carts/`)
                .set("Cookie", customerCookie)
                .send({ model: reviewInfo.model })
                .expect(200);
            expect(1).toBe(1);

            await request(app)
                .patch(`${routePath}/carts/`)
                .set("Cookie", customerCookie)
                .expect(200);
            // add a new review
            await request(app)
                .post(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .send({ score: reviewInfo.score, comment: reviewInfo.comment })
                .expect(200);
            // get reviews
            const reviews = await request(app)
                .get(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .expect(200);

            expect(reviews.body).toHaveLength(1);
            const addedReview = reviews.body[0];
            expect(addedReview.score).toBe(reviewInfo.score);
            expect(addedReview.comment).toBe(reviewInfo.comment);
        });

        test("It should return a 401 code", async () => {
            //deleting all reviews of all products
            await request(app)
                .delete(`${routePath}/reviews`)
                .set("Cookie", adminCookie)
                .expect(200);
            //simulate that the user has bought the product
            await request(app)
                .post(`${routePath}/carts/`)
                .set("Cookie", customerCookie)
                .send({ model: reviewInfo.model })
                .expect(200);
            await request(app)
                .patch(`${routePath}/carts/`)
                .set("Cookie", customerCookie)
                .expect(200);
            //add a new review
            await request(app)
                .post(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .send({ score: reviewInfo.score, comment: reviewInfo.comment })
                .expect(200);
            //get reviews
            await request(app)
                .get(`${routePath}/reviews/${reviewInfo.model}`)
                .expect(401); //not authorized
        });
    });

    describe("GET /reviews/:model", () => {
        test("It should return an array of reviews for a product", async () => {
            //deleting all reviews of all products
            await request(app)
                .delete(`${routePath}/reviews`)
                .set("Cookie", adminCookie)
                .expect(200);
            //simulate that the user has bought the product
            await request(app)
                .post(`${routePath}/carts/`)
                .set("Cookie", customerCookie)
                .send({ model: reviewInfo.model })
                .expect(200);
            await request(app)
                .patch(`${routePath}/carts/`)
                .set("Cookie", customerCookie)
                .expect(200);
            //add a new review
            await request(app)
                .post(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .send({ score: reviewInfo.score, comment: reviewInfo.comment })
                .expect(200);
            const reviews = await request(app)
                .get(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .expect(200);
            expect(reviews.body).toHaveLength(1);
            const addedReview = reviews.body[0];
            expect(addedReview.score).toBe(reviewInfo.score);
            expect(addedReview.comment).toBe(reviewInfo.comment);
        });
    });

    describe("DELETE /reviews/:model", () => {
        test("It should return a 200 success code and delete the user's review", async () => {
            await request(app)
                .delete(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .expect(200);

            const reviews = await request(app)
                .get(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .expect(200);
            expect(reviews.body).toHaveLength(0);
        });
    });

    describe("DELETE /reviews/:model/all", () => {
        test("It should return a 200 success code and delete all reviews of a product", async () => {
            //deleting all reviews of all products
            await request(app)
                .delete(`${routePath}/reviews`)
                .set("Cookie", adminCookie)
                .expect(200);
            //simulate that the user has bought the product
            await request(app)
                .post(`${routePath}/carts/`)
                .set("Cookie", customerCookie)
                .send({ model: reviewInfo.model })
                .expect(200);
            await request(app)
                .patch(`${routePath}/carts/`)
                .set("Cookie", customerCookie)
                .expect(200);
            //adding a review back for testing delete all
            await request(app)
                .post(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .send({ score: reviewInfo.score, comment: reviewInfo.comment })
                .expect(200);

            await request(app)
                .delete(`${routePath}/reviews/${reviewInfo.model}/all`)
                .set("Cookie", adminCookie)
                .expect(200);

            const reviews = await request(app)
                .get(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .expect(200);
            expect(reviews.body).toHaveLength(0);
        });

        test("It should return a 401 not authorized code", async () => {
            //deleting all reviews of all products
            await request(app)
                .delete(`${routePath}/reviews`)
                .set("Cookie", adminCookie)
                .expect(200);
            //simulate that the user has bought the product
            await request(app)
                .post(`${routePath}/carts/`)
                .set("Cookie", customerCookie)
                .send({ model: reviewInfo.model })
                .expect(200);
            await request(app)
                .patch(`${routePath}/carts/`)
                .set("Cookie", customerCookie)
                .expect(200);
            //adding a review back for testing delete all
            await request(app)
                .post(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .send({ score: reviewInfo.score, comment: reviewInfo.comment })
                .expect(200);

            await request(app)
                .delete(`${routePath}/reviews/${reviewInfo.model}/all`)
                .expect(401); //not authorized
        });
    });

    describe("DELETE /reviews", () => {
        test("It should return a 200 success code and delete all reviews", async () => {
            //deleting all reviews of all products
            await request(app)
                .delete(`${routePath}/reviews`)
                .set("Cookie", adminCookie)
                .expect(200);
            //simulate that the user has bought the product
            await request(app)
                .post(`${routePath}/carts/`)
                .set("Cookie", customerCookie)
                .send({ model: reviewInfo.model })
                .expect(200);
            await request(app)
                .patch(`${routePath}/carts/`)
                .set("Cookie", customerCookie)
                .expect(200);
            //adding reviews back for testing delete all
            await request(app)
                .post(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .send({ score: reviewInfo.score, comment: reviewInfo.comment })
                .expect(200);

            await request(app)
                .delete(`${routePath}/reviews`)
                .set("Cookie", adminCookie)
                .expect(200);

            const reviews = await request(app)
                .get(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .expect(200);
            expect(reviews.body).toHaveLength(0);
        });
    });
});
