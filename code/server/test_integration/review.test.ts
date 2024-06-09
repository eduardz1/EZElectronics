import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import request from 'supertest';
import { cleanup } from "../src/db/cleanup";
import { app } from "../index";
import db from "../src/db/db";
import cors from "cors";



const routePath = "/ezelectronics" 

const customer = { 
    username: "customer", 
    name: "customer", 
    surname: "customer", 
    password: "customer", 
    role: "Customer" 
}

const admin = { 
    username: "admin", 
    name: "admin", 
    surname: "admin", 
    password: "admin", 
    role: "Admin" 
}

const manager = { 
    username: "manager", 
    name: "manager", 
    surname: "manager", 
    password: "manager", 
    role: "Manager" 
}

const reviewInfo = { 
    model: "iphone13",
    user: customer, 
    score: 5, 
    comment: "very nice laptop" 
}

const productInfo = { 
    model: "iphone13", 
    category: "Laptop", 
    quantity: 10, 
    details: "A nice laptop", 
    sellingPrice: 1000, 
    arrivalDate: "2023-01-01" 
};

let customerCookie: string
let adminCookie: string
let managerCookie: string;

const addUser = async (userInfo: any) => {
    await request(app).post(`${routePath}/users`).send(userInfo).expect(200);
};  

const login = async (userInfo: any) => {
    return new Promise<string>((resolve, reject) => {
      request(app)
        .post(`${routePath}/sessions/`)
        .send(userInfo)
        .expect(200)
        .end((err, res) => {
            if (err) {
                reject(err);
            }
            resolve(res.header["set-cookie"][0]);
        });
    });
};

const addProduct = async (productInfo: any, cookie: string) => {
    await request(app)
        .post(`${routePath}/products`)
        .set("Cookie", cookie)
        .send(productInfo)
        .expect(200);
};

beforeAll(async () => {
    await addUser(admin);
    await addUser(manager);
    await addUser(customer);
    adminCookie = await login(admin);
    customerCookie = await login(customer);
    managerCookie = await login(manager);
    await addProduct(productInfo, managerCookie);
});
    
afterAll(() => {
    cleanup();
})

describe("Review routes integration tests", () => {
    describe("POST /reviews/:model", () => {
        test("It should return a 200 success code and add a new review", async () => {
            //simulate that the user has bought the product
            await request(app)
                .post(`${routePath}/carts/`) 
                .set("Cookie", customerCookie)
                .send({ model: reviewInfo.model })
                .expect(200)
            await request(app)
                .patch(`${routePath}/carts/`) 
                .set("Cookie", customerCookie)
                .expect(200)
            //add a new review
            await request(app)
                .post(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .send({ score: reviewInfo.score, comment: reviewInfo.comment })
                .expect(200)
            //get reviews
            const reviews = await request(app)
                .get(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .expect(200)

            expect(reviews.body).toHaveLength(1)
            let addedReview = reviews.body[0]
            expect(addedReview.score).toBe(reviewInfo.score)
            expect(addedReview.comment).toBe(reviewInfo.comment)
        })

        test("It should return a 401 code", async () => {
            //deleting all reviews of all products
            await request(app)
                .delete(`${routePath}/reviews`)
                .set("Cookie", adminCookie)
                .expect(200)
            //simulate that the user has bought the product
            await request(app)
                .post(`${routePath}/carts/`) 
                .set("Cookie", customerCookie)
                .send({ model: reviewInfo.model })
                .expect(200)
            await request(app)
                .patch(`${routePath}/carts/`) 
                .set("Cookie", customerCookie)
                .expect(200)
            //add a new review
            await request(app)
                .post(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .send({ score: reviewInfo.score, comment: reviewInfo.comment })
                .expect(200)
            //get reviews
            const reviews = await request(app)
                .get(`${routePath}/reviews/${reviewInfo.model}`)
                .expect(401)//not authorized
        })
    })

    describe("GET /reviews/:model", () => {
        test("It should return an array of reviews for a product", async () => {
            //deleting all reviews of all products
            await request(app)
                .delete(`${routePath}/reviews`)
                .set("Cookie", adminCookie)
                .expect(200)
            //simulate that the user has bought the product
            await request(app)
                .post(`${routePath}/carts/`) 
                .set("Cookie", customerCookie)
                .send({ model: reviewInfo.model })
                .expect(200)
            await request(app)
                .patch(`${routePath}/carts/`) 
                .set("Cookie", customerCookie)
                .expect(200)
            //add a new review
            await request(app)
                .post(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .send({ score: reviewInfo.score, comment: reviewInfo.comment })
                .expect(200)
            const reviews = await request(app)
                .get(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .expect(200)
            expect(reviews.body).toHaveLength(1)
            let addedReview = reviews.body[0]
            expect(addedReview.score).toBe(reviewInfo.score)
            expect(addedReview.comment).toBe(reviewInfo.comment)
        })
    })

    describe("DELETE /reviews/:model", () => {
        test("It should return a 200 success code and delete the user's review", async () => {
            await request(app)
                .delete(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .expect(200)

            const reviews = await request(app)
                .get(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .expect(200)
            expect(reviews.body).toHaveLength(0)
        })
    })

    describe("DELETE /reviews/:model/all", () => {
        test("It should return a 200 success code and delete all reviews of a product", async () => {
            //deleting all reviews of all products
            await request(app)
                .delete(`${routePath}/reviews`)
                .set("Cookie", adminCookie)
                .expect(200)
            //simulate that the user has bought the product
            await request(app)
                .post(`${routePath}/carts/`) 
                .set("Cookie", customerCookie)
                .send({ model: reviewInfo.model })
                .expect(200)
            await request(app)
                .patch(`${routePath}/carts/`) 
                .set("Cookie", customerCookie)
                .expect(200)
            //adding a review back for testing delete all
            await request(app)
                .post(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .send({ score: reviewInfo.score, comment: reviewInfo.comment })
                .expect(200)

            await request(app)
                .delete(`${routePath}/reviews/${reviewInfo.model}/all`)
                .set("Cookie", adminCookie)
                .expect(200)

            const reviews = await request(app)
                .get(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .expect(200)
            expect(reviews.body).toHaveLength(0)
        })

        test("It should return a 401 not authorized code", async () => {
            //deleting all reviews of all products
            await request(app)
                .delete(`${routePath}/reviews`)
                .set("Cookie", adminCookie)
                .expect(200)
            //simulate that the user has bought the product
            await request(app)
                .post(`${routePath}/carts/`) 
                .set("Cookie", customerCookie)
                .send({ model: reviewInfo.model })
                .expect(200)
            await request(app)
                .patch(`${routePath}/carts/`) 
                .set("Cookie", customerCookie)
                .expect(200)
            //adding a review back for testing delete all
            await request(app)
                .post(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .send({ score: reviewInfo.score, comment: reviewInfo.comment })
                .expect(200)

            await request(app)
                .delete(`${routePath}/reviews/${reviewInfo.model}/all`)
                .expect(401) //not authorized
        })
    })

    describe("DELETE /reviews", () => {
        test("It should return a 200 success code and delete all reviews", async () => {
            //deleting all reviews of all products
            await request(app)
                .delete(`${routePath}/reviews`)
                .set("Cookie", adminCookie)
                .expect(200)
            //simulate that the user has bought the product
            await request(app)
                .post(`${routePath}/carts/`) 
                .set("Cookie", customerCookie)
                .send({ model: reviewInfo.model })
                .expect(200)
            await request(app)
                .patch(`${routePath}/carts/`) 
                .set("Cookie", customerCookie)
                .expect(200)
            //adding reviews back for testing delete all
            await request(app)
                .post(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .send({ score: reviewInfo.score, comment: reviewInfo.comment })
                .expect(200)

            await request(app)
                .delete(`${routePath}/reviews`)
                .set("Cookie", adminCookie)
                .expect(200)

            const reviews = await request(app)
                .get(`${routePath}/reviews/${reviewInfo.model}`)
                .set("Cookie", customerCookie)
                .expect(200)
            expect(reviews.body).toHaveLength(0)
        })
    })
})

