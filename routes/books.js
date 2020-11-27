const express = require('express');
const Author = require('../models/author');
const Book = require('../models/book');
const multer = require('multer')
const path = require('path');
const uploadPath = path.join('public/', Book.coverImageBasePath)
const router = express.Router()
const fs = require('fs')
const imageMimeTypes = ['image/jpeg', 'image/png']

const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    }
});

// All Books Route
router.get('/', async (req, res) => {
    let query = Book.find()
    if((req.query.title) != null && req.query.title != ''){
        query = query.regex('title',new RegExp(req.query.title,'i'))
    }

    if((req.query.publishedBefore != null && req.query.publishedBefore != '')){
        query =  query.lte('publishDate',req.query.publishDate);
    }
    console.log(Book.publishDate);
    if((req.query.publishedAfter != null && req.query.publishedAfter != '')){
        
        query =  query.gte('publishDate',req.query.publishDate);
    }
    
    const books = await query.exec()
    try{
        res.render('books/index',{
            books: books,
            searchOptions: req.query
        })
    }catch(err){
        console.log(err);
        res.redirect('/');
    }
    
})

//  New Book Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book());
})

// Create Book Route
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    console.log(fileName);
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })

    try {
        const newBook = await book.save();
        res.redirect('books')
    } catch(err) {
        console.log(err)
        if(book.coverImageName !== null){
            removeBookCover(book.coverImageName)
        }
        renderNewPage(res, book, true)
    }
})

function removeBookCover(fileName){
    fs.unlink(path.join(uploadPath,fileName),err => {
        if (err){
            console.log(err);
        }
    })
}
async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({})
        const book = new Book()
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = 'Error Creating Book'
        res.render('books/new', params)
    } catch {
        res.redirect('/books')
    }
}

module.exports = router;