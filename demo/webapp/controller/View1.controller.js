sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/format/NumberFormat"
],
    function (Controller, NumberFormat) {
        "use strict";

        return Controller.extend("demo.controller.View1", {


            onInit: function () {


                var oViewModel = new sap.ui.model.json.JSONModel({});
                this.getView().setModel(oViewModel, "viewModel");


            },

            onModelDescPress: async function (oEvent) {
                const oView = this.getView();
                const sDealerId = oView.byId("idDealerCombo").getSelectedKey();
                const oVBox = oView.byId("vectorFlowBox");

                if (!sDealerId) {
                    sap.m.MessageToast.show("Please select a Dealer.");
                    return;
                }

                const oLink = oEvent.getSource();
                const oContext = oLink.getBindingContext("viewModel");
                const sModelCode = oContext.getProperty("modelCode");

                console.log("Clicked Model Code:", sModelCode);

                if (this._lastModelCode === sModelCode) {
                    const bVisible = oVBox.getVisible();
                    oVBox.setVisible(!bVisible);
                    console.log("Toggled visibility for same model code:", !bVisible);
                    return;
                }

                try {
                    const oModel = oView.getModel();

                    const oData = await new Promise((resolve, reject) => {
                        oModel.read("/Dealer(dealerId='" + sDealerId + "')", {
                            urlParameters: {
                                "$expand": "billings"
                            },
                            success: resolve,
                            error: reject
                        });
                    });

                    const aAllBillings = oData.billings?.results || [];
                    const aFilteredBilling = aAllBillings.filter(item => item.modelCode === sModelCode);

                    console.log("Filtered Billing:", aFilteredBilling);

                    const oDialogModel = new sap.ui.model.json.JSONModel({
                        Billings: aFilteredBilling
                    });

                    oView.setModel(oDialogModel, "dialogModel");

                    oVBox.setVisible(true);
                    this._lastModelCode = sModelCode;
                } catch (error) {
                    sap.m.MessageToast.show("Failed to load dealer billing data.");
                    console.error("Error loading dealer:", error);
                }
            },


            onCloseDialog: function () {
                console.log(`Close dialog pressed`);

                if (this.oDialog) {
                    this.oDialog.close();
                }
            },

            onGoPress: function () {
                var oView = this.getView();
                var oComboBox = oView.byId("idDealerCombo");
                var sDealerId = oComboBox.getSelectedKey();
                const oVBox = oView.byId("vectorFlowBox");

                if (oVBox) {
                    oVBox.setVisible(false);
                }

                if (!sDealerId) {
                    sap.m.MessageToast.show("Please select a Dealer first.");
                    return;
                }

                var oModel = oView.getModel();

                var that = this;

                oModel.read("/Dealer(dealerId='" + sDealerId + "')", {
                    urlParameters: {
                        "$expand": "billings"
                    },
                    success: function (oData) {
                        var oViewModel = oView.getModel("viewModel");
                        if (!oViewModel) {
                            oViewModel = new sap.ui.model.json.JSONModel();
                            oView.setModel(oViewModel, "viewModel");
                        }

                        var aBillings = oData.billings?.results || [];

                        oViewModel.setData({
                            DealerName: oData.DealerName,
                            Stock_Availability: oData.Stock_Availability,
                            Limit_available: oData.Limit_available,
                            Billings: aBillings,
                            showTable: true
                        });

                        var oIndianFormatter = NumberFormat.getFloatInstance({
                            groupingEnabled: true,
                            groupingSeparator: ",",
                            decimalSeparator: ".",
                            maxFractionDigits: 2
                        }, new sap.ui.core.Locale("en_IN"));


                        var totalStock = 0;
                        var totalAvailable = 0;
                        var totalQuantity = 0;
                        var totalFundRequired = 0;
                        var totalOrderValue = 0;

                        aBillings.forEach(function (item) {
                            totalStock += parseFloat(item.stock) || 0;
                            totalAvailable += parseFloat(item.availability) || 0;
                            totalQuantity += parseFloat(item.totalQuantity) || 0;
                            totalFundRequired += parseFloat(item.fundRequired) || 0;
                            totalOrderValue += parseFloat(item.OrderVAlue) || 0;
                        });

                        var oCurrencyFormatter = NumberFormat.getCurrencyInstance({
                            currencyCode: false
                        }, new sap.ui.core.Locale("en_IN"));

                        oViewModel.setProperty("/TotalStock", oIndianFormatter.format(totalStock));
                        oViewModel.setProperty("/TotalAvailable", oIndianFormatter.format(totalAvailable));
                        oViewModel.setProperty("/TotalQuantity", oIndianFormatter.format(totalQuantity));
                        oViewModel.setProperty("/TotalFundRequired", oCurrencyFormatter.format(totalFundRequired, "INR"));
                        oViewModel.setProperty("/TotalOrderValue", oCurrencyFormatter.format(totalOrderValue, "INR"));

                        // aBillings.push({
                        //     modelCode: "TOTAL",
                        //     modelDescription: "",
                        //     availability: oIndianFormatter.format(totalAvailable),
                        //     stock: oIndianFormatter.format(totalStock),
                        //     totalQuantity: oIndianFormatter.format(totalQuantity),
                        //     fundRequired: oCurrencyFormatter.format(totalFundRequired, "INR"),
                        //     OrderVAlue: oCurrencyFormatter.format(totalOrderValue, "INR"),
                        //     isTotalRow: true
                        // });

                        // oViewModel.setProperty("/Billings", aBillings);

                        var oTableContainer = oView.byId("tableContainer");
                        var oTotalTableContainer = oView.byId("totaltableContainer");
                        if (oTableContainer && oTotalTableContainer) {
                            oTableContainer.removeStyleClass("hiddenTable");
                            oTotalTableContainer.removeStyleClass("hiddenTable");
                            oTableContainer.addStyleClass("visibleTable");
                            oTotalTableContainer.addStyleClass("visibleTable");


                        }
                        else {
                            console.warn("tableContainer not found in view");
                        }

                        var oWizard = that.getView().byId("myWizard");
                        // var oStep1 = that.getView().byId("step1");
                        // var oStep2 = that.getView().byId("step2");

                        // oWizard.validateStep(oStep1);  
                        // oWizard.goToStep(oStep2);     

                        oWizard.nextStep();

                        sap.m.MessageToast.show("Dealer details loaded.");
                    },
                    error: function (oError) {
                        sap.m.MessageToast.show("Failed to fetch dealer details.");
                        console.error("OData Error:", oError);
                    }
                });
            }





        });
    });
