const PRODUCT_NOT_FOUND = "Product not found";
const PRODUCT_ALREADY_EXISTS = "The product already exists";
// const PRODUCT_SOLD = "Product already sold";
const EMPTY_PRODUCT_STOCK = "Product stock is empty";
const LOW_PRODUCT_STOCK = "Product stock cannot satisfy the requested quantity";
const INCORRECT_GROUPING =
    "Grouping cannot be `null` when specifying a `category` or `model`";
const INCORRECT_CATEGORY_GROUPING =
    "`category` cannot be `null` when specifying a `category` as a grouping and `model` should be `null`";
const INCORRECT_MODEL_GROUPING =
    "`model` cannot be `null` when specifying a `model` as a grouping and `category` should be `null`";

/**
 * Represents an error that occurs when a product is not found.
 */
class ProductNotFoundError extends Error {
    customMessage: string;
    customCode: number;

    constructor() {
        super();
        this.customMessage = PRODUCT_NOT_FOUND;
        this.customCode = 404;
    }
}

/**
 * Represents an error that occurs when a product id already exists.
 */
class ProductAlreadyExistsError extends Error {
    customMessage: string;
    customCode: number;

    constructor() {
        super();
        this.customMessage = PRODUCT_ALREADY_EXISTS;
        this.customCode = 409;
    }
}

// /**
//  * Represents an error that occurs when a product is already sold.
//  */
// class ProductSoldError extends Error {
//     customMessage: string;
//     customCode: number;

//     constructor() {
//         super();
//         this.customMessage = PRODUCT_SOLD;
//         this.customCode = 409;
//     }
// }

class EmptyProductStockError extends Error {
    customMessage: string;
    customCode: number;

    constructor() {
        super();
        this.customMessage = EMPTY_PRODUCT_STOCK;
        this.customCode = 409;
    }
}

class LowProductStockError extends Error {
    customMessage: string;
    customCode: number;

    constructor() {
        super();
        this.customMessage = LOW_PRODUCT_STOCK;
        this.customCode = 409;
    }
}

class IncorrectGroupingError extends Error {
    customMessage: string;
    customCode: number;

    constructor() {
        super();
        this.customMessage = INCORRECT_GROUPING;
        this.customCode = 422;
    }
}

class IncorrectCategoryGroupingError extends Error {
    customMessage: string;
    customCode: number;

    constructor() {
        super();
        this.customMessage = INCORRECT_CATEGORY_GROUPING;
        this.customCode = 422;
    }
}

class IncorrectModelGroupingError extends Error {
    customMessage: string;
    customCode: number;

    constructor() {
        super();
        this.customMessage = INCORRECT_MODEL_GROUPING;
        this.customCode = 422;
    }
}

export {
    ProductNotFoundError,
    ProductAlreadyExistsError,
    // ProductSoldError,
    EmptyProductStockError,
    LowProductStockError,
    IncorrectGroupingError,
    IncorrectCategoryGroupingError,
    IncorrectModelGroupingError,
};
