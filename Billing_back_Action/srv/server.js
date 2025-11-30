const cds = require('@sap/cds');

// Global CAP error handler
cds.on('error', (err, req) => {

    // Check for invalid entity path errors
    if (err.message && err.message.includes('Invalid resource path')) {
        err.statusCode = 404;
        err.message = `The requested entity set does not exist. Please check your URL — did you mean 'Billings'?`;
        err.hint = "OData entity names are case-sensitive.";
        err.timestamp = new Date().toISOString();
    }

    // Optional: log error for debugging
    console.error("CAP Global Error Handler:", err.message);
});
module.exports = cds.server;
