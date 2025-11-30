/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["billingv4front/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
