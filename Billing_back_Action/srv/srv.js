const cds = require('@sap/cds');
 
module.exports = cds.service.impl(function () {
 
  this.on('READ', 'Billings', async (req) => {
    const results = await cds.run(SELECT.from('billing.Billings'));
    console.log('test',results);
   
    return results;
  });
 
  this.on('calculateDealerCount', async (req) => {
    const result = await cds.run(SELECT.from('billing.Dealer'));
    return `Total dealers: ${result.length}`;
  });
 
});

module.exports = function () {

    // Example: READ handler
    this.on('READ', 'Billing', async (req, next) => {
        try {
            // Execute normal behavior
            return await next();
        } catch (err) {
            console.error("Billing READ error:", err);

            // Return a custom message
            req.reject(404, `Sorry, the Billing data you requested is not available.`);
        }
    });
};

 