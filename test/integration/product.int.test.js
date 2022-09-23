const request = require('supertest')
const productModel = require('../../models/product')
const app = require('../../server')
const newProduct = require('../data/new-product.json')


// 통합테스트는 db에 있는 데이터를 직접 가져와서 확인하기때문에 Id지정
let firstProduct = "6327b36135c504e113bddf75"
test('POST /api/products', async ()=> {
    const response = await request(app)
        .post("/api/products")
        .send(newProduct)
    expect(response.statusCode).toBe(201)
    expect(response.body.name).toBe(newProduct.name)
    expect(response.body.description).toBe(newProduct.description)
})

test("통합테스트 return 500 on POST /api/products", async ()=> {
    const response = await request(app)
        .post('/api/products')
        .send({name: "phone"})
    expect(response.statusCode).toBe(500)
    expect(response.body).toStrictEqual({message: "Product validation failed: description: Path `description` is required."})
})

test("GET /api/products", async ()=> {
    const response = await request(app).get('/api/products')
    expect(response.statusCode).toBe(200)
    // Array.isArray는 배열인지 아닌지 확인
    expect(Array.isArray(response.body)).toBeTruthy()
    expect(response.body[0].name).toBeDefined()
    expect(response.body[0].description).toBeDefined()
    firstProduct = response.body[0]
})

test("GET /api/products/:productId", async ()=> {
    const response = await request(app).get('/api/products/'+ firstProduct._id)
    expect(response.statusCode).toBe(200)
    expect(response.body.name).toBe(firstProduct.name)
    expect(response.body.description).toBe(firstProduct.description)
})

test("GET /api/products/:productId 가 없을 때", async ()=> {
    const response = await request(app).get('/api/products/6327b36135c504e113bdd123')
    expect(response.statusCode).toBe(404)
})

test("PUT /api/products", async ()=> {
    const res = await request(app)
        .put("api/products/" + firstProduct._id)
        .send({ name: "업데이트함1", description: "업데이트함2" })
    expect(res.statusCode).toBe(200)
    expect(res.body.name).toBe("업데이트함1")
    expect(res.body.description).toBe("업데이트함2")
})

test("업데이트 대상이 없을 때 에러", async ()=> {
    const res = await request(app)
        .put("/api/products/" + "6327b36135c504e113bdd123")
        .send({ name: "업데이트함1", description: "업데이트함2" })
    expect(res.statusCode).toBe(404)
})

test("DELETE /api/products", async ()=> {
    const res = await request(app)
        .delete("/api/products/" + firstProduct._id)
        .send()
    expect(res.statusCode).toBe(200)

})

test("삭제 대상 없을 때", async ()=> {
    const res = await request(app)
        .delete("/api/products/" + firstProduct._id)
        .send()
    expect(res.statusCode).toBe(404)
})