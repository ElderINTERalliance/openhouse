const jetpack = require("fs-jetpack"), //NOTE: remove if not used
	express = require("express"),
	app = express(),
	port = process.env.PORT || 3000,
	bp = require("body-parser");

// Load process.env values from .env file
require("dotenv").config();

// Allow loading of files from the public directory:
app.use(express.static("public"));
// Load /public/index.html:
app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));

var people = jetpack.read("people.json", "json").people;
console.log(people.length);
// We need to use body parser to parse the request:
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

// Receive data as json:
app.post("/submit", (req, res) => {
	var fname = req.body.fname,
		lname = req.body.lname,
		mi = req.body.mi,
		email = req.body.email,
		school = req.body.school,
		grade = parseInt(req.body.grade),
		newperson = {
			fname: fname,
			lname: lname,
			mi: mi,
			email: email,
			school: school,
			grade: grade,
		};
	people[people.length] = newperson;

	if (process.env.AIRTABLE == "true") {
		// Set up Airtbale (configure in the .env)
		var Airtable = require("airtable");
		var base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
			process.env.AIRTABLE_BASE_ID
		);
		// Send the data to a new record in an Airtable base (configure in the .env)
		base(process.env.AIRTABLE_TABLE_NAME).create(
			[
				{
					fields: {
						"First Name": fname,
						"Last Name": lname,
						MI: mi,
						Email: email,
						"Current School": school,
						Grade: grade,
					},
				},
			],
			function (err, records) {
				if (err) {
					console.error(err);
					return;
				}
				records.forEach(function (record) {
					console.log(record.getId());
				});
			}
		);
	}

	if (process.env.JSON == "true") {
		console.log(process.env.JSON);
		jetpack.write("people.json", `{"people": ${JSON.stringify(people)} }`);
		/*jetpack.append('people.json', JSON.stringify(people));
		jetpack.append('people.json', ("}"));*/
	}
	res.send(true);
});
// Log on successful launch:
app.listen(port, () => console.log(`App listening on port ${port}!`));
