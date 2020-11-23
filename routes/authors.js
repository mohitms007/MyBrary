const express = require('express');
const author = require('../models/author');
const Author = require('../models/author');
const router = express.Router()

// All Authors Router
router.get('/', async (req, res) => {
    let searchOptions = {}
    if(req.query.name !== null && req.query.name !== ''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try{
        const authors = await Author.find(searchOptions)
        res.render('authors/index', { authors: authors, searchOptions: req.query })
    }catch(err){
        console.log(err);
        res.redirect('/')
    }
    
})

//  New Author
router.get('/new', (req, res) => {
    res.render('authors/new', {author: new Author()});
})

//  Create Author Route
router.post('/', async(req, res) => {
    const author = new Author({name: req.body.name})
    try {
        const newAuthor = await author.save()
        res.redirect('/authors')
    } catch (err) {
        res.render('author/now', {
            author: author,
            errorMessage: " Error creating author"
        })
    }
})

module.exports = router;