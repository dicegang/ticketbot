const Ajv = require("ajv")

const config = require('./config.json')
const schema = require('./config.schema.json')

const ajv = new Ajv()
const valid = ajv.validate(schema, config)
if (!valid) {
    console.log(ajv.errors)
    process.exit(1)
}

module.exports = config
