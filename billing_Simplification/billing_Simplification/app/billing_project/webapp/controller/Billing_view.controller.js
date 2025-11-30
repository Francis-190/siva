sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/MessageToast'
], function(Controller,MessageToast) {
    "use strict";

    return Controller.extend("billingproject.controller.Billing_view", {
        onInit: function () {
            var oData = {
                Allocation: [
                    { ModelCode: "VFH1B8D", ModelDesc: "BULLET 350 BLACK GOLD", Stock: 16, Available: 9, TotalQty: 1, FundRequired: "206769", Allocation: 1, OrderValue: "206769" },
                    { ModelCode: "VLCO81H", ModelDesc: "BULLET 350 STANDARD BLACK", Stock: 9, Available: 7, TotalQty: 2, FundRequired: "370008", Allocation: 1, OrderValue: "370008" },
                    { ModelCode: "VFB1S8R", ModelDesc: "CLASSIC 350 COMMANDO SAND", Stock: 17, Available: 10, TotalQty: 2, FundRequired: "414020", Allocation: 2, OrderValue: "414020" }
                    // ... Add rest of your rows
                ]
            };
            this.getView().setModel(new sap.ui.model.json.JSONModel(oData));
        },

        onGoPress: function () {
            var oWizard = this.getView().byId("myWizard");
            oWizard.nextStep();  // Move to Step 2
        },


 onDealerCodeSubmit: function(oEvent) {
    var sDealerCode = oEvent.getSource().getValue();
    var oView = this.getView();

    if (!sDealerCode) {
        sap.m.MessageToast.show("Please enter a Dealer Code");
        return;
    }

    // Correct GUID format for OData
    oView.bindElement({
        path: "/Billings(guid'" + sDealerCode + "')",
        events: {
            dataRequested: function() { console.log("Fetching data..."); },
            dataReceived: function(oEvent) { 
                var data = oEvent.getParameter("data");
                if (!data) {
                    sap.m.MessageToast.show("No data found for this Dealer Code");
                } else {
                    console.log("Data fetched successfully:", data);
                }
            }
        }
    });
}


    });
});
