/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["demo/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
