/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["billingsystem/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
