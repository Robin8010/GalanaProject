sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("project1.controller.landing", {
        onInit() {
        },
        clickAsset:function()
        {
            var router = sap.ui.core.UIComponent.getRouterFor(this);
                    router.navTo("AssetTransfer");
        }
        
    });
});