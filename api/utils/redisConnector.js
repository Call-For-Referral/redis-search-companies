const { createClient, SchemaFieldTypes } = require("redis");
require("dotenv").config();

const client = createClient({
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
});

console.log("Connecting to Redis...", {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
});

async function connectClient() {
    try {
        await client.connect();
        console.log("Redis client connected");
    } catch (e) {
        console.log("Redis client connection error: ", e);
        process.exit(1);
    }
}
connectClient();
const indexCompany = "idx:companies";
exports.createCompanyIndex = async () => {
    try {
        await client.ft.create(
            indexCompany,
            {
                company_name: {
                    type: SchemaFieldTypes.TEXT,
                    sortable: true,
                },
            },
            {
                ON: "HASH",
                PREFIX: "cfr:companies",
            }
        );
    } catch (e) {
        if (e.message === "Index already exists") {
            console.log("Index exists already, skipped creation.");
        } else {
            // Something went wrong, perhaps RediSearch isn't installed...
            console.error(e);
            process.exit(1);
        }
    }
};
exports.addCompany = async (company) => {
    try {
        await client.hSet(`cfr:companies:${company.company_name}`, company);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

exports.searchCompany = async (companyName) => {
    try {
        const result = await client.ft.search(indexCompany, `@company_name:${companyName}`, {
            LIMIT: {
                from: 0,
                size: 20,
            },
        });
        return result;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
