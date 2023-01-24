import axios, { AxiosError } from "axios";

let port = 3000;
let host = "localhost";
let protocol = "http";
let baseUrl = `${protocol}://${host}:${port}`;

test("GET /foo?bar returns message", async () => {
    let bar = "xyzzy";
    let { data } = await axios.get(`${baseUrl}/foo?bar=${bar}`);
    expect(data).toEqual({ message: `You sent: ${bar} in the query` });
});

test("GET /foo returns error", async () => {
    try {
        await axios.get(`${baseUrl}/foo`);
    } catch (error) {
        // casting needed b/c typescript gives errors "unknown" type
        let errorObj = error as AxiosError;
        // if server never responds, error.response will be undefined
        // throw the error so typescript can perform type narrowing
        if (errorObj.response === undefined) {
            throw errorObj;
        }
        // now, after the if-statement, typescript knows
        // that errorObj can't be undefined
        let { response } = errorObj;
        // TODO this test will fail, replace 300 with 400
        expect(response.status).toEqual(300);
        expect(response.data).toEqual({ error: "bar is required" });
    }
});

test("POST /bar works good", async () => {
    let bar = "xyzzy";
    let result = await axios.post(`${baseUrl}/foo`, { bar });
    expect(result.data).toEqual({ message: `You sent: ${bar} in the body` });
});

// TEST GET call
test("GET /authorbyid?id returns author", async () => {
    let id = "1";
    let { data } = await axios.get(`${baseUrl}/authorbyid?id=${id}`);
    expect(data.id).toEqual("1");
});

//this test requires an author with id = 1 and the name "Figginsworth III"
test("GET /authorbyid?id returns author", async () => {
    let id = "1";
    let { data } = await axios.get(`${baseUrl}/authorbyid?id=${id}`);
    expect(data.name).toEqual("Figginsworth III");
});

//adding an author in the database with id=3 and checking if it was successful
test("DELETE /deleteauthor deletes author from the database", async () => {
    let id = "3";
    let { data } = await axios.delete(`${baseUrl}/deleteauthor?id=${id}`);
    expect(data.status).toEqual(200);
});

test("POST /addauthor adds author in the database", async () => {
    let id = "3";
    let name = "FirstName3, LastName3";
    let bio = "This is bio";
    let { data } = await axios.post(`${baseUrl}/addauthor`, {id:3, name:'FN LN', Bio:'this is bio'});
    expect(data.status).toEqual(200);
});


