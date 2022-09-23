const productController = require('../../controller/products')
const productModel = require('../../models/product')
const httpMocks = require('node-mocks-http')
const newProduct = require('../data/new-product.json')
const allProduct = require('../data/all_products.json')
const { request } = require('../../server')

// 가상으로 실행시키기위해 jest.fn() 사용
productModel.create = jest.fn()
productModel.find = jest.fn()
productModel.findById = jest.fn()
productModel.findByIdAndUpdate = jest.fn()
productModel.findByIdAndDelete = jest.fn()

const productId = "6328059b4dfddd4619b73518"
const updatedProduct = { name: "업데이트1", description: "업데이트2" }
// 전체 적용을 위해 정의
let req, res, next

// beforeEach는 공통적인 부분에 적용시킬 때
beforeEach(()=> {
    req = httpMocks.createRequest()
    res = httpMocks.createResponse()
    next = jest.fn()
})

describe("Create관련 테스트", ()=> {
    // beforeEach는 공통적인 부분에 적용시킬 때
    beforeEach(()=> {
        req.body = newProduct
    })
    test("생성 기능테스트", ()=> {
        expect(typeof productController.createProduct).toBe("function")
    })
    test("몽고디비 연결확인", async () => {
        await productController.createProduct(req, res, next)
        expect(productModel.create).toBeCalledWith(newProduct)
    })
    test("201 code 확인", async () => {
        await productController.createProduct(req, res, next)
        // 상태코드 확인
        expect(res.statusCode).toBe(201)
        // 결과값이 잘 전송됐는지 확인
        expect(res._isEndCalled).toBeTruthy()
    })
    test("생성시 바디값 확인", async ()=> {
        productModel.create.mockReturnValue(newProduct)
        await productController.createProduct(req, res, next)
        expect(res._getJSONData()).toStrictEqual(newProduct)
    })
    test("에러 메시지처리", async ()=> {
        const errorMessage = { message: "description 프로퍼티 없음" }
        const rejectPromise = Promise.reject(errorMessage)
        productModel.create.mockReturnValue(rejectPromise)
        await productController.createProduct(req, res, next)
        expect(next).toBeCalledWith(errorMessage)
    })
})


describe("조회 테스트", ()=> {
    test("products 함수 확인", ()=> {
        expect(typeof productController.getProducts).toBe("function")
    })
    test("db에서 products 값 모두 조회", async ()=> {
        await productController.getProducts(req,res,next)
        expect(productModel.find).toHaveBeenCalledWith({})
    })
    test("상태코드 200 확인", async ()=> {
        await productController.getProducts(req,res,next)
        expect(res.statusCode).toBe(200)
        expect(res._isEndCalled).toBeTruthy()
    })
    test("body 값 json으로 잘 오는지", async ()=> {
        productModel.find.mockReturnValue(allProduct)
        await productController.getProducts(req,res,next)
        expect(res._getJSONData()).toStrictEqual(allProduct)
    })
    test("에러 메시지", async ()=> {
        const errorMessage = { message: "에러! 데이터없음"}
        const rejectPromise = Promise.reject(errorMessage)
        productModel.find.mockReturnValue(rejectPromise)
        await productController.getProducts(req,res,next)
        expect(next).toHaveBeenCalledWith(errorMessage)
    })
})

describe("ById로 개별 불러오기", ()=> {
    test("getProductById 함수 확인",()=> {
        expect(typeof productController.getProductById).toBe("function")
    })
    test("Id별로 불러오기", async ()=> {
        req.params.productId = productId
        await productController.getProductById(req,res,next)
        expect(productModel.findById).toBeCalledWith(productId)
    })
    test("상태코드랑 json 리턴 확인", async ()=> {
        productModel.findById.mockReturnValue(newProduct)
        await productController.getProductById(req,res,next)
        expect(res.statusCode).toBe(200)
        expect(res._getJSONData()).toStrictEqual(newProduct)
        expect(res._isEndCalled()).toBeTruthy()
    })
    test("Id없을 때 에러 메시지", async ()=> {
        productModel.findById.mockReturnValue(null)
        await productController.getProductById(req,res,next)
        expect(res.statusCode).toBe(404)
        expect(res._isEndCalled()).toBeTruthy()
    })
    test("handle errors", async ()=> {
        const errorMessage = { message: "error" }
        const rejectPromise = Promise.reject(errorMessage)
        productModel.findById.mockReturnValue(rejectPromise)
        await productController.getProductById(req,res,next)
        expect(next).toHaveBeenCalledWith(errorMessage)
    })
})


describe("업데이트 테스트", ()=> {
    test("업데이트 함수 테스트", ()=> {
        expect(typeof productController.updateProduct).toBe("function")
    })
    test("업데이트", async ()=> {
        req.params.productId = productId
        req.body = updatedProduct
        await productController.updateProduct(req,res,next)
        expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
            productId,
            updatedProduct,
            // 기존데이터가 변하지않으면 false판정, 위에 req.params와body 값과 현재 수정부분과 비교해서 판정
            { new: true }

            // req.params.productId,
            // req.body,
            // { new: true }
        )
    })
    
    test("상태코드랑 json바디 확인", async ()=> {
        req.params.productId = productId
        req.body = updatedProduct
        productModel.findByIdAndUpdate.mockReturnValue(updatedProduct)
        await productController.updateProduct(req,res,next)
        expect(res._isEndCalled()).toBeTruthy()
        expect(res.statusCode).toBe(200)
        expect(res._getJSONData()).toStrictEqual(updatedProduct)
    })
    
    test("대상이 없을 때 404 출력", async ()=> {
        productModel.findByIdAndUpdate.mockReturnValue(null)
        await productController.updateProduct(req,res,next)
        expect(res.statusCode).toBe(404)
        expect(res._isEndCalled()).toBeTruthy()
    })

    test("업데이트시 에러났을 때", async ()=> {
        const errorMessage = { message: "업데이트 안돼요" }
        const rejectPromise = Promise.reject(errorMessage)
        productModel.findByIdAndUpdate.mockReturnValue(rejectPromise)
        await productController.updateProduct(req,res,next)
        expect(next).toHaveBeenCalledWith(errorMessage)
    })
})

describe("삭제 테스트", ()=> {
    test("함수 테스트", ()=> {
        expect(typeof productController.deleteProduct).toBe("function")
    })

    test("삭제 테스트", async ()=> {
        req.params.productId = productId
        await productController.deleteProduct(req,res,next)
        expect(productModel.findByIdAndDelete).toBeCalledWith(productId)
    })

    test("상태코드 확인", async ()=> {
        let deletedProduct = {
            name: "삭제 성공1",
            description: "삭제 성공2"
        }
        productModel.findByIdAndDelete.mockReturnValue(deletedProduct)
        await productController.deleteProduct(req,res,next)
        expect(res.statusCode).toBe(200)
        expect(res._getJSONData()).toStrictEqual(deletedProduct)
        expect(res._isEndCalled()).toBeTruthy()
    })

    test("삭제 대상이 없을 때 에러", async ()=> {
        productModel.findByIdAndDelete.mockReturnValue(null)
        await productController.deleteProduct(req,res,next)
        expect(res.statusCode).toBe(404)
        expect(res._isEndCalled()).toBeTruthy()
    })

    test("에러 메시지", async ()=> {
        const errorMessage = { message: "삭제 실패" }
        const rejectPromise = Promise.reject(errorMessage)
        productModel.findByIdAndDelete.mockReturnValue(rejectPromise)
        await productController.deleteProduct(req,res,next)
        expect(next).toHaveBeenCalledWith(errorMessage)
    })
})