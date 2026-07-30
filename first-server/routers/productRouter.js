const express = require('express')
const products = require('../products')
const router = express.Router()



router.get('/', (req, res) => {
    try{
        res.status(200).json(products)
    }catch(e){
        res.status(404).json({e: e})
    }
})

router.get('/:id', (req, res) => {
    try{
        const productID = parseInt(req.params.id)
        const product = products.find(p => p.id === productID)
        if(!product) res.status(404).json({error: "NOT FOUND..."})

        res.status(200).json(product)
    }catch(e){
        res.status(404).json({e: e})
    }
})

//post 

router.post('/', (req, res) => {
    try {
        const {title, price} = req.body
        if(!req.body) res.status(400).json({message: "Product details are required"})
        if(!title || !price) res.status(400).json({message: "Details are required"})
        console.log(req.body)

        const newProduct = {
            id: products.length?products[products.length-1].id+1:1,
            title: title,
            price: price
        }
        products.push(newProduct)
        res.status(200).json(req.body)
    } catch (error) {
        
    }
})

// tempapi77_db_user
// tVhIYGAebX297V5A
// mongodb+srv://tempapi77_db_user:tVhIYGAebX297V5A@cluster0.sauapp9.mongodb.net/







module.exports = router