import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as url from "url";
let app = express();
app.use(express.json());
// create database "connection"
// use absolute path to avoid this issue
// https://github.com/TryGhost/node-sqlite3/issues/441
let __dirname = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile = `${__dirname}database.db`;
let db = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");
//
// SQLITE EXAMPLES
// comment these out or they'll keep inserting every time you run your server
// if you get 'UNIQUE constraint failed' errors it's because
// this will keep inserting a row with the same primary key
// but the primary key should be unique
//
// insert example
//await db.run(
//    "INSERT INTO authors(id, name, bio) VALUES('1', 'Figginsworth III', 'A traveling gentleman.')"
//);
//await db.run(
//    "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES ('1', '1', 'My Fairest Lady', '1866', 'romance')"
//);
// insert example with parameterized queries
// important to use parameterized queries to prevent SQL injection
// when inserting untrusted data
//let statement = await db.prepare(
//    "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (?, ?, ?, ?, ?)"
//);
//await statement.bind(["2", "1", "A Travelogue of Tales", "1867", "adventure"]);
//await statement.run();
// select examples
let authors = await db.all("SELECT * FROM authors");
console.log("Authors", authors);
let books = await db.all("SELECT * FROM books WHERE author_id = '1'");
console.log("Books", books);
let filteredBooks = await db.all("SELECT * FROM books WHERE pub_year = '1867'");
console.log("Some books", filteredBooks);
// res's type limits what responses this request handler can send
// it must send either an object with a message or an error
app.get("/foo", (req, res) => {
    if (!req.query.bar) {
        return res.status(400).json({ error: "bar is required" });
    }
    return res.json({ message: `You sent: ${req.query.bar} in the query` });
});
app.post("/foo", (req, res) => {
    if (!req.body.bar) {
        return res.status(400).json({ error: "bar is required" });
    }
    return res.json({ message: `You sent: ${req.body.bar} in the body` });
});
app.delete("/foo", (req, res) => {
    // etc.
    res.sendStatus(200);
});
//
// ASYNC/AWAIT EXAMPLE
//
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
// need async keyword on request handler to use await inside it
app.get("/bar", async (req, res) => {
    console.log("Waiting...");
    // await is equivalent to calling sleep.then(() => { ... })
    // and putting all the code after this in that func body ^
    await sleep(3000);
    // if we omitted the await, all of this code would execute
    // immediately without waiting for the sleep to finish
    console.log("Done!");
    return res.sendStatus(200);
});
// GET calls
app.get("/authorbyid", async (req, res) => {
    if (!req.query.id) {
        return res.status(400).json({ error: "Author ID is required" });
    }
    else {
        authors.forEach(item => {
            if (item.id == req.query.id) {
                return res.json({ id: item.id, name: item.name, bio: item.bio });
            }
        });
    }
});
app.get("/allauthors", async (req, res) => {
    return res.json(authors);
});
app.get("/bookbyid", async (req, res) => {
    if (!req.query.id) {
        return res.status(400).json({ error: "Book ID is required" });
    }
    else {
        books.forEach(item => {
            if (item.id == req.query.id) {
                return res.json({ id: item.id, author_id: item.author_id, title: item.title, pub_year: item.pub_year, genre: item.genre });
            }
        });
    }
});
app.get("/allbooks", async (req, res) => {
    return res.json(books);
});
// POST calls
app.post("/addauthor", async (req, res) => {
    await db.run("INSERT INTO authors(id, name, bio) VALUES('" + req.body.id + "', '" + req.body.name + "', '" + req.body.bio + "')").catch((error) => {
        res.status(400).json({ error: "Error occurred while adding author" });
    });
    return res.json(200).json({ message: "Author is inserted" });
});
app.post("/addbook", async (req, res) => {
    await db.run("INSERT INTO books(id, author_id, title, pub_year, genre) VALUES('" + req.body.id + "', '" + req.body.author_id + "', '" + req.body.title + "','" + req.body.pub_year + "','" + req.body.genre + "')").catch((error) => {
        res.status(400).json({ error: "Error occurred while adding a book" });
    });
    return res.json(200).json({ message: "Book is inserted" });
});
// DELETE calls
app.delete("/deleteauthor", async (req, res) => {
    await db.run("Delete FROM authors WHERE id = '" + req.body.id + "')").catch((error) => {
        res.status(400).json({ error: "Error occurred while deleting author" });
    });
    return res.json(200).json({ message: "Author is deleted" });
});
app.delete("/deletebook", async (req, res) => {
    await db.run("Delete FROM books WHERE id = '" + req.body.id + "')").catch((error) => {
        res.status(400).json({ error: "Error occurred while deleting a book" });
    });
    return res.json(200).json({ message: "Book is deleted" });
});
// test it out! while server is running:
// curl http://localhost:3000/bar
// run server
let port = 3000;
let host = "localhost";
let protocol = "http";
app.listen(port, host, () => {
    console.log(`${protocol}://${host}:${port}`);
});
