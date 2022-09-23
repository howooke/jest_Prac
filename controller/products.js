const productModel = require('../models/product')


exports.createProduct = async (req, res, next) => {
    try {
        // 아래 create는 메소드
        const createProduct = await productModel.create(req.body)
        res.status(201).json(createProduct)
    } catch (error) {
        next(error)
    }

    
}

exports.getProducts = async (req, res, next) => {
    try {
        const allProduct = await productModel.find({})
        res.status(200).json(allProduct)
    } catch (error) {
        next(error)
    }

}

exports.getProductById = async (req,res,next)=> {
    try {
        const aProduct = await productModel.findById(req.params.productId)
        if(aProduct){
            res.status(200).json(aProduct)
        } else {
            res.status(404).send()
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}


exports.updateProduct = async (req,res,next)=> {
    try {
        let updatedProduct = await productModel.findByIdAndUpdate(
            req.params.productId,
            req.body,
            { new: true }
        )
            if(updatedProduct){
                res.status(200).json(updatedProduct)
            } else {
                res.status(404).send()
            }
    } catch (error) {
        next(error)
    }
}

exports.deleteProduct = async (req,res,next)=> {
    try {
        let deletedProduct = await productModel.findByIdAndDelete(req.params.productId)
        if(deletedProduct) {
            res.status(200).json(deletedProduct)
        } else {
            res.status(404).send()
        }
    } catch (error) {
        next(error)
    }


}