const express = require("express");
const cors = require("cors");
const { searchCompany, createCompanyIndex, addCompany } = require("./utils/redisConnector");
require("dotenv").config();
require("./utils/redisConnector");
const app = express();

app.use(express.json());
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.get("/", async (req, res) => {
    res.send("Hello From Redis Search");
});
app.get("/search", async (req, res) => {
    const { search } = req.query;
    if (!search) {
        return res.send({
            message: "No search provided",
        });
    }
    try {
        const comp = await searchCompany(search.toLowerCase());
        res.send(comp);
    } catch (error) {
        console.log(error);
        res.send({
            error: "Something went wrong",
        });
    }
});
app.get("/index-company", async (req, res) => {
    await createCompanyIndex();
    res.send({
        message: "Index created",
    });
});
app.post("/add-company", async (req, res) => {
    const { company_name } = req.body;
    if (!company_name) {
        return res.status(400).send({
            message: "No company name provided",
        });
    }

    await addCompany({ ...req.body,company_name: company_name.toLowerCase() });
    res.send({
        message: "Company added",
    });
});
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log("server is running on port " + PORT);
});
