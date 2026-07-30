const express = require('express')
const category = require('../category')
const router = express.Router()

router.get('/', (req, res)=>{
    try {
        res.status(200).json({your_response: category})
    } catch (error) {
        res.status(404).json({error: error})
    }
})

router.get('/:id', (req, res)=>{
    try {
        const id = parseInt(req.params.id)
        const response = category.filter(i => i.id === id)
        res.status(200).json({your_response: response})
    } catch (error) {
        res.status(404).json({error: error})
    }
})


router.post('/', (req, res)=>{
    try {
        if(!req.body) res.status(400).json({message: "JAJA neeed a name"})
        const {name} = req.body
        if(!name) res.status(400).json({message: "name can't be empty"})
        category.push({
            id: category.length?category[category.length-1].id+1:1,
            name: name
        })
        res.status(201).json({your_response: `${name} added succcessfully`})
    } catch (error) {
        res.status(404).json({error: error})
    }
})

router.put('/:id', (req, res) =>{
    try {
        const id = parseInt(req.params.id)
        const {name} = req.body

        const cat = category.find(i => i.id === id)
        if(!cat) res.status(404).json({message: "i don't find any"})
        
        cat.name = name

        res.status(200).json({meaasge: `updated with ${name}`})
    } catch (error) {
        res.status(404).json({message: error})
    }

})

router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id)

    const idx = category.findIndex(i => i.id === id)

    if(idx == -1) res.status(404).json({message: "Not Found"})

    const catDeleted = category.splice(idx, 1)

    res.json({
        message: "Deleted!!",
        output: catDeleted[0]
    })
})


module.exports = router