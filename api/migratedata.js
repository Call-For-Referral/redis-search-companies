var fs = require("fs"),
    JSONStream = require("JSONStream"),
    es = require("event-stream");
const { addCompany } = require("./utils/redisConnector");
let count = 0;
var getStream = function () {
    var jsonData = "5laccomp.json",
        stream = fs.createReadStream(jsonData, { encoding: "utf8" }),
        parser = JSONStream.parse("*");
    return stream.pipe(parser);
};

getStream().pipe(
    es.map(async function (company) {
        // console.log(JSON.stringify(data));
        try {
            await addCompany(company);
            console.log("Done", count + 1);
            count++;
        } catch (error) {
            console.log(company);
            console.log(error);
        }
    })
);
console.log("Done");
