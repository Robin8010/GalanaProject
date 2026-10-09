sap.ui.define([
	   "project1/core/generic/genericentryform",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
    "sap/ui/dom/includeScript"
], 
 function (genericentryform, MessageToast, MessageBox, Controller,JSONModel,includeScript) {
	"use strict";
let ReportHeader_Y;
let PageHeader_Y;
let Line_Y;
let Footer_Y;
let Total=0;
let Quantity=0;
let Sgst=0;
let cgst=0;
let Igst=0;
let _LineTotal=0;
        return genericentryform.extend("project1.controller.AssetTransfer", {

            onInit:  function () {
                debugger
              
                 includeScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", "jsPDF")

                 genericentryform.prototype.onInit.apply(this, arguments);
                debugger;
               
            },
            onBeforeShow: async function (oEvent) {
                  // Empty model initially
                var oInitialData = {
                    assetDetails: {},
                    capitalizationDetails: {},
                    transferDetails: {},
                    costDepreciation: {}
                };

                var oAssetModel =
                    new JSONModel(oInitialData);

                this.getView().setModel(
                    oAssetModel,
                    "assetModel"
                );
                this.ClearValue();
            
            },
            initialize: async function () {
                debugger;
            },
          
           

       
        navBack: function() {
            debugger;
             this.ClearValue();
		history.go(-1);
			
			//var router = sap.ui.core.UIComponent.getRouterFor(this);
           // router.navTo("RouteIndex");
		},
		
          FillCompanyCFL: async function (oEvent) {
            try {
                debugger;
                await this.createNewModelUsingAPI(
                    'GET',
                     `/sap/opu/odata/sap/YY1_COMPANY_CODE_CDS/YY1_COMPANY_CODE?$format=json`,
                '',
                this.getCflListViewDataSourceModelName()
                );
                this.setCflDisplayColumns(["CompanyCode", "CompanyCodeName"]);
                this.setCflDataColumns(["CompanyCode", "CompanyCodeName"]);
                this.setCflValueAndDisplay("CompanyCode", "CompanyCodeName", "", "");

                MessageToast.show("Data loading please wait...");

                this.showCfl(
                    "CflCompany",
                    this.getCflListViewDataSourceModelName(),
                    "d/results",
                    this.onConfirmCflCompany.bind(this)
                );
            }
            catch (error) {
                MessageBox.show("onConfirmCflCompany -: " + error.message);
            }
        },
         onConfirmCflCompany: async function () {
            debugger;
            let viewModel = this.getView().getModel("EntryFormDataSourceModel");
            let x = this.getCflObject();
            viewModel.setProperty("/CompanyCode", x.CompanyCode);
        }, 
        
         FillAssetCFL: async function (oEvent) {
            try {
                debugger;
                let viewmodel=this.getView().getModel("EntryFormDataSourceModel");
                let companycode=viewmodel.getProperty("/CompanyCode");
                await this.createNewModelUsingAPI(
                    'GET',
                     `/sap/opu/odata4/sap/api_fixedasset/srvd_a2x/sap/fixedasset/0001//FixedAsset?$filter=CompanyCode eq '${companycode}'&$top=10000&$format=json`,
                '',
                this.getCflListViewDataSourceModelName()
                );
                this.setCflDisplayColumns(["MasterFixedAsset", "MasterFixedAsset"]);
                this.setCflDataColumns(["MasterFixedAsset", "MasterFixedAsset"]);
                this.setCflValueAndDisplay("MasterFixedAsset", "MasterFixedAsset", "", "");

                MessageToast.show("Data loading please wait...");

                this.showCfl(
                    "AssetCFL",
                    this.getCflListViewDataSourceModelName(),
                    "value",
                    this.onConfirmCflAsset.bind(this)
                );
            }
            catch (error) {
                MessageBox.show("onConfirmCflAsset -: " + error.message);
            }
        },
         onConfirmCflAsset: async function () {
            debugger;
            let viewModel = this.getView().getModel("EntryFormDataSourceModel");
            let x = this.getCflObject();
            viewModel.setProperty("/AssetCode", x.MasterFixedAsset);
            viewModel.setProperty("/Serial", x.YY1_EmployeeId_FAA);
            viewModel.setProperty("/TagNo",x.Inventory);
             viewModel.setProperty("/SubAsset",x.FixedAsset)
        }, 
// https://my430712-api.s4hana.cloud.sap/sap/opu/odata4/sap/api_fixedasset/srvd_a2x/sap/fixedasset/0001/FixedAsset?$select=YY1_Location2Code_FAA
//?filter= CompanyCode eq '${companycode} and MasterFixedAsset eq '${AssetCode}' '&top=10000
         FillLocationCFL: async function (oEvent) {
            try {
                debugger;
                 let viewmodel=this.getView().getModel("EntryFormDataSourceModel");
                let companycode=viewmodel.getProperty("/CompanyCode");
                let AssetCode=viewmodel.getProperty("/AssetCode");

                await this.createNewModelUsingAPI(
                    'GET',
                     `/sap/opu/odata4/sap/api_fixedasset/srvd_a2x/sap/fixedasset/0001/FixedAsset?$apply=filter(YY1_Location2Code_FAA ne '')/groupby((YY1_Location2Code_FAA,YY1_Location2Desc_FAA))&$top=10000&$format=json`,
                '',
                this.getCflListViewDataSourceModelName()
                );
                 
                this.setCflDisplayColumns(["LocationCode", "LocationDscription"]);
                this.setCflDataColumns(["YY1_Location2Code_FAA", "YY1_Location2Desc_FAA"]);
                this.setCflValueAndDisplay("YY1_Location2Code_FAA", "YY1_Location2Desc_FAA", "", "");

                MessageToast.show("Data loading please wait...");

                this.showCfl(
                    "LocationCFL",
                    this.getCflListViewDataSourceModelName(),
                    "value",
                    this.onConfirmCflLocation.bind(this)
                );
            }
            catch (error) {
                MessageBox.show("onConfirmCflCompany -: " + error.message);
            }
        },
         onConfirmCflLocation: async function () {
            debugger;
            let viewModel = this.getView().getModel("EntryFormDataSourceModel");
            let x = this.getCflObject();
            viewModel.setProperty("/LocationCode", x.YY1_Location2Code_FAA);
             viewModel.setProperty("/LocationDsc", x.YY1_Location2Desc_FAA);
        }, 

          FillCostCenterCFL: async function (oEvent) {
            try {
                debugger;
                await this.createNewModelUsingAPI(
                    'GET',
                     `/sap/opu/odata4/sap/api_cost_center/srvd_a2x/sap/costcenter/0001/A_CostCenterText_2?$top=10000`,
                '',
                this.getCflListViewDataSourceModelName()
                );
                this.setCflDisplayColumns(["CostCenter", "Aviation"]);
                this.setCflDataColumns(["CostCenter", "Aviation"]);
                this.setCflValueAndDisplay("CostCenter", "Aviation", "", "");

                MessageToast.show("Data loading please wait...");

                this.showCfl(
                    "CostCenterCFL",
                    this.getCflListViewDataSourceModelName(),
                    "value",
                    this.onConfirmCflCostCenter.bind(this)
                );
            }
            catch (error) {
                MessageBox.show("onConfirmCflCostCentern -: " + error.message);
            }
        },
         onConfirmCflCostCenter: async function () {
            debugger;
            let viewModel = this.getView().getModel("EntryFormDataSourceModel");
            let x = this.getCflObject();
            viewModel.setProperty("/CostCenter", x.CostCenter);
        }, 
        onCancel:function()
        {
            this.ClearValue();
            history.go(-1);
        },
        onSave:async function()
        {
            debugger;
            //
            await   this.onAssetPost();
           //
        },
          
   onAssetPost: async function () {
debugger;
                try {
                  // await  this.onGenerateForm  ();
                    this.getView().setBusy(  true  );

                    // ====================================================
                    // STEP 1 - FETCH CSRF TOKEN
                    // ====================================================
            await this.FetchCSRToken(); // Ensure CSRF Token is fetched before proceeding
                        let viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                    let csrfTokenValue = this.getCSRFTokenFromHeaders();

                  
                    console.log(
                        "Token successfully received"
                    );


                    // ====================================================
                    // STEP 2 - POST Asset ORDER
                    // ====================================================
debugger;
                    const result =  await this.PostAsset( csrfTokenValue);


                }

                catch (error) {

                    console.error(
                        "Asset master Processing Error:",
                        error
                    );


                    MessageBox.error(

                        error.message ||

                        "An error occurred while updating the Asset."

                    );

                }

                finally {

                    this.getView().setBusy(
                        false
                    );

                }

            },

 Validation:function()
            {  debugger
                let viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                let companyCode=viewModel.getProperty("/CompanyCode");
                let asset=viewModel.getProperty("/AssetCode");
                let locationCode=viewModel.getProperty("/LocationCode");
                let locationDesc=viewModel.getProperty("/LocationDsc");
                let transporterName=viewModel.getProperty("/TransporterNM");
                let TransferDate=viewModel.getProperty("/TransferDate");
                let costCenterTo=viewModel.getProperty("/CostCenter");
                let AssetSerialNumber=viewModel.getProperty("/Serial");
                let Inventory=viewModel.getProperty("/TagNo");
                    if(companyCode!="")
                    {   
                            return true;  
                    }
                    else
                    {
                        MessageBox.show("CompanyCode can name blank..."); 
                        return false; 
                    }
                     if(asset!="")
                    {   
                          return true;  
                    }
                    else
                    {
                        MessageBox.show("asset can name blank..."); 
                        return false; 
                    }
                     if(locationCode!="")
                    {   
                           return true; 
                    }
                    else
                    {
                        MessageBox.show("locationCode can name blank..."); 
                        return false; 
                    }
                     if(transporterName!="")
                    {   
                         return true; 
                    }
                    else
                    {
                        MessageBox.show("transporterName can name blank..."); 
                        return false; 
                    }
                     if(TransferDate!="")
                    {   
                        return true;  
                    }
                    else
                    {
                        MessageBox.show("TransferDate can name blank..."); 
                        return false; 
                    }
                    /*
                     if(costCenterTo!="")
                    {   
                           return true; 
                    }
                    else
                    {
                        MessageBox.show("costCenterTo can name blank..."); 
                        return false; 
                    }
                        */
                     if(AssetSerialNumber!="")
                    {   
                          return true;
                    }
                    else
                    {
                        MessageBox.show("AssetSerialNumber can name blank..."); 
                        return false; 
                    }
                     if(Inventory!="")
                    {   
                            return true;
                    }
                    else
                    {
                        MessageBox.show("AssetSerialNumber can name blank..."); 
                        return false; 
                    }
            },
           
            PostAsset: async function (csrfTokenValue) {
            if (this.Validation())
                {
                    let viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                    let companyCode=viewModel.getProperty("/CompanyCode");
                    let asset=viewModel.getProperty("/AssetCode");
                    let SubAsset=viewModel.getProperty("/SubAsset");
                    let locationCode=viewModel.getProperty("/LocationCode");
                    let locationDesc=viewModel.getProperty("/LocationDsc");
                    let transporterName=viewModel.getProperty("/TransporterNM");
                    let TransferDate=viewModel.getProperty("/TransferDate");
                    let costCenterTo=viewModel.getProperty("/CostCenter");
                    let AssetSerialNumber=viewModel.getProperty("/Serial");
                    let Inventory=viewModel.getProperty("/TagNo");

                    debugger
                    var oDate = TransferDate;
                    oDate = this.byId("datePicker").getDateValue();
                    var sTransferDate = this._formatDateToISO8601(oDate); 
debugger
                    const payload = {
                        YY1_Location2Code_FAA: locationCode,
                        //AssetSerialNumber:AssetSerialNumber,
                      //  Inventory:Inventory,
                        YY1_Location2Desc_FAA: locationDesc,
                        YY1_TransporterName_FAA: transporterName,
                        YY1_EmployeeId_FAA:AssetSerialNumber,
                        _AccountAssignment: [
                            {
                                ValidityStartDate: sTransferDate,
                                FixedAssetObjectActionCode: "01",
                                CostCenter: costCenterTo
                            }
                        ],
                        _Inventory:
                            {
                                "Inventory":Inventory
                            }
                    };


                        let ASSET_BASE_URL=`/sap/opu/odata4/sap/api_fixedasset/srvd_a2x/sap/fixedasset/0001`;
                    const sPostUrl =  `${ASSET_BASE_URL}/FixedAsset/${companyCode}/${asset}/${SubAsset}/SAP__self.Change`;


                    // ========================================================
                    // POST REQUEST
                    // ========================================================

                    const response = await fetch(

                        sPostUrl,

                        {

                            method:
                                "POST",


                            headers: {

                                "X-CSRF-Token":
                                    csrfTokenValue,
                                "If-Match": "*",

                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"

                            },


                            // VERY IMPORTANT:
                            // Use same browser session

                            credentials:
                                "include",


                            body:

                                JSON.stringify(
                                    payload
                                )

                        }

                    );


                    // ========================================================
                    // READ RESPONSE
                    // ========================================================

                    const responseText =
                        await response.text();


                    console.log(
                        "POST Response Status:",
                        response.status
                    );


                    console.log(
                        "POST Response:",
                        responseText
                    );


                    let data = null;


                    try {

                        data =
                            JSON.parse(
                                responseText
                            );

                    }

                    catch (e) {

                        console.warn(
                            "SAP response is not JSON."
                        );

                    }


                    // ========================================================
                    // ERROR
                    // ========================================================

                    if (!response.ok) {

                        const errorMessage =

                            data?.error?.message?.value ||

                            data?.error?.message ||

                            responseText ||

                            "Asset master update failed.";


                        console.error(
                            "SAP Error:",
                            errorMessage
                        );


                        // ====================================================
                        // SPECIAL CSRF ERROR
                        // ====================================================

                        if (

                            response.status === 403 ||

                            errorMessage
                                .toLowerCase()
                                .includes("csrf")

                        ) {

                            throw new Error(

                                "CSRF Token validation failed. " +

                                "Please check that GET and POST requests " +

                                "are using the same SAP session/destination."

                            );

                        }


                        throw new Error(
                            errorMessage
                        );

                    }
                    else
                    {
                                         
                    const salesOrder = data?.d?.SalesOrder ||   data?.SalesOrder ||    data?.d?.SalesOrderID ||  "";
                    MessageToast.show("Asset master update successfully."   );
                    await this.onGenerateForm  ();
                    return data;
                }
                }
        },

            FetchCSRToken: async function (value) {
                var myHeaders = new Headers();
                myHeaders.append("x-csrf-token", "fetch");
                await this.createNewModelUsingAPIFetchMethod(
                    'GET',
                    `/sap/opu/odata4/sap/api_fixedasset/srvd_a2x/sap/fixedasset/0001/FixedAsset?$format=json`,
                    myHeaders,
                    '',
                    'InspectionData',
                    'json'
                );

            },
             getCSRFTokenFromHeaders: function () {
    let csrfTokenValue = "";
    this.getResponseHeaderDataList().forEach(oHeaderDataObj => {
        if (oHeaderDataObj.pHeaderKey === "x-csrf-token") {
            csrfTokenValue = oHeaderDataObj.pHeaderValue;
        }
    });
    return csrfTokenValue;
},




  _formatDateToISO8601: function(oDate) {
                if (!oDate || !(oDate instanceof Date)) {
                    return "";
                }
                
                var iDay = oDate.getDate();
                var iMonth = oDate.getMonth() + 1;
                var iYear = oDate.getFullYear();
                
                return iYear + "-" + 
                       (iMonth < 10 ? "0" : "") + iMonth + "-" + 
                       (iDay < 10 ? "0" : "") + iDay;
            },
              _formatDateV2: function (sDateStr) {
                if (!sDateStr) return "";

                var oDate;

                // Handle /Date(timestamp)/ format (V2 common format)
                if (sDateStr && typeof sDateStr === 'string' && sDateStr.indexOf("/Date(") === 0) {
                    var iTimestamp = parseInt(sDateStr.substring(6, sDateStr.length - 2));
                    oDate = new Date(iTimestamp);
                } else {
                    // Handle ISO format (YYYY-MM-DD)
                    oDate = new Date(sDateStr);
                }

                if (isNaN(oDate.getTime())) {
                    return sDateStr;
                }

                var iDay = oDate.getDate();
                var iMonth = oDate.getMonth() + 1;
                var iYear = oDate.getFullYear();

                return (iDay < 10 ? "0" : "") + iDay + "." +
                    (iMonth < 10 ? "0" : "") + iMonth + "." +
                    iYear;
            },

  _formatCurrency: function (value) {
                if (!value) return "0.00";
                return parseFloat(value).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            },
       onGenerateForm:async function () {
try {
        let viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
        let companyCode=viewModel.getProperty("/CompanyCode");
        let asset=viewModel.getProperty("/AssetCode");
        let SubAsset=viewModel.getProperty("/SubAsset");

         let sTransferDate=viewModel.getProperty("/TransferDate");
          let sTransporterName=viewModel.getProperty("/TransporterNM");
           let sCostCenterTo=viewModel.getProperty("/CostCenter");
            let sNewLocation=viewModel.getProperty("/LocationCode");

         
       await this.createNewModelUsingAPI(
    "GET",
    `/sap/opu/odata/sap/ZUI_ASSET_TRANSFER_WEB/AssetDetails?$filter=CompanyCode eq '${companyCode}'  and MasterFixedAsset eq '${asset}' and FixedAsset eq '${SubAsset}'`,
    "",
    "assetModel"
);
debugger
var oAsset="";
var oPo="";
var oInvoice="";
var oAssetModel = this.getView().getModel("assetModel");
var oAssetData = oAssetModel.getData().d.results || [];
if (oAssetData.length <= 0) {
    // No asset data found
} else {
     oAsset = oAssetData[0];
}
debugger;
var Asset='90000013'//oAsset.OriginalMasterFixedAsset
    await this.createNewModelUsingAPI(
    "GET",
    `/sap/opu/odata/sap/YY1_AUC_CDS/YY1_AUC?$filter=CompanyCode eq '${companyCode}'  and MasterFixedAsset eq '${Asset}' and FixedAsset eq '${SubAsset}'`,
    "",
    "POdata"
);

var PoModel = this.getView().getModel("POdata").getData();
    var PoModelData=PoModel.d.results||[];
    debugger;
if (PoModelData.length <= 0) {
    // No asset data found
} else {
    oPo = [...new Set(
        PoModelData.map(function (item) {
            return item.PurchaseOrder;
        })
    )].join(", ");


oInvoice = PoModelData
        .map(function (item) {
            return item.AccountingDocument;
        })
        .join(", ");
   //  oPo="1900000794, 190000079,1900000794, 190000079";
     oInvoice="1900000794, 190000079,1900000794, 190000079";
}

console.log("SAP Asset Data:", oAssetData);

var oTransformedData = {

    assetDetails: {
        description:
            (oAsset.FixedAssetDescription || "") +
            (oAsset.AssetAdditionalDescription
                ? " " + oAsset.AssetAdditionalDescription
                : ""),

        assetNumber:
            oAsset.MasterFixedAsset || sMasterFixedAsset,

        assetClass:
            oAsset.AssetClass || "",

        subCategory:
            oAsset.YY1_SubCategory_FAA || "",

        tagNumber:
            oAsset.Inventory || "",

        serialNumber:
            oAsset.YY1_EmployeeId_FAA || "",

        currentLocation:
            oAsset.YY1_Location2Desc_FAA || "",

        capitalizationDate:
            this._formatDateV2(
                oAsset.AssetCapitalizationDate
            ),
            PoNumber:oPo,
             AccountingDocument:oInvoice,


        model:
            oAssetData.YY1_ModelName1_FAA || "",

        manufacturer:
            oAsset.AssetManufacturerName || ""
    },

    capitalizationDetails: {
        supplier:
            oAsset.Supplier || "",

        aucNumber:
            oAsset.OriginalMasterFixedAsset || "",

        legacyNumber:
            oAsset.LegacyMasterFixedAsset || "",

        journalEntryNumber:
            oAsset.JournalEntryNumber || "",

        datePlacedInService:
            this._formatDateV2(
                oAsset.AssetCapitalizationDate
            )
    },

    transferDetails: {
        fromLocation:
            oAsset.YY1_Location2Desc_FAA || "",

        toLocation:
            sNewLocation,

        transferDate:
            sTransferDate,

        transporterName:
            sTransporterName,

        costCenterFrom:
            oAssetData.CostCenter || "",

        costCenterTo:
            sCostCenterTo
    },

    costDepreciation: {
        purchaseCost:
            this._formatCurrency(oAsset.PurchaseCost),

        accumulatedDepreciation:
            this._formatCurrency(
                oAsset.AccumulatedDepreciation
            ),

        depreciation:
            this._formatCurrency(
                oAsset.Depreciation
            ),

        netBookValue:
            this._formatCurrency(
                oAsset.NetBookValue
            ),

        usefulLife:
            oAsset.UsefulLife || "",

        remainingUsefulLife:
            oAsset.RemainingUsefulLife || ""
    }
};

// Replace the model data with your transformed structure
oAssetModel.setData(oTransformedData);

var oData = oAssetModel.getData();

console.log("Final transformed data:", oData);

                if (typeof window.jspdf === "undefined" || typeof window.jspdf.jsPDF === "undefined") {
                    MessageBox.error("PDF library not loaded");
                    return;
                }

                var sLogoPath = "./images/galana_logo.png";
                var that = this;

                var generatePdf = function (sLogoDataUrl) {
                    var oDoc = new window.jspdf.jsPDF({
                        orientation: "portrait",
                        unit: "mm",
                        format: "A4"
                    });

                    var iPageWidth = oDoc.internal.pageSize.getWidth();
                    var iPageHeight = oDoc.internal.pageSize.getHeight();
                    var iMargin = 15;
                    var iRight = iPageWidth - iMargin;
                    var iY = iMargin;
                    var iColumnGap = 10;
                    var iColumnWidth = (iPageWidth - iMargin * 2 - iColumnGap) / 2;
                    var iContentWidth = iPageWidth - iMargin * 2;

                    var addLabelValue = function (sLabel, sValue, iX, iWidth) {
                        sValue = sValue || "";
                        oDoc.setFont("helvetica", "bold");
                        oDoc.setFontSize(11);
                        oDoc.text(sLabel, iX, iY);

                        var iLabelTextWidth = oDoc.getTextWidth(sLabel);
                        var iColonX = iX + iLabelTextWidth + 1;
                        oDoc.text(":", iColonX, iY);

                        var iValueX = iColonX + 4;
                        oDoc.setFont("helvetica", "normal");
                        oDoc.setFontSize(11);
                        var aLines = oDoc.splitTextToSize(sValue, iWidth - (iValueX - iX));
                        oDoc.text(aLines, iValueX, iY);

                        iY += aLines.length * 4 + 2;
                    };

                    var addTwoColumns = function (sLabel1, sValue1, sLabel2, sValue2) {
                        var iStartY = iY;
                        var iRightColumnX = iMargin + iColumnWidth + iColumnGap;

                        // Left column
                        oDoc.setFont("helvetica", "bold");
                        oDoc.setFontSize(11);
                        oDoc.text(sLabel1, iMargin + 3, iStartY);
                        var iColonX1 = iMargin + 3 + oDoc.getTextWidth(sLabel1) + 1;
                        oDoc.text(":", iColonX1, iStartY);
                        var iValueX1 = iColonX1 + 4;

                        oDoc.setFont("helvetica", "normal");
                        var aLines1 = oDoc.splitTextToSize(sValue1 || "", (iMargin + iColumnWidth) - iValueX1);
                        oDoc.text(aLines1, iValueX1, iStartY);

                        // Right column
                        var iRowHeight = aLines1.length;
                        if (sLabel2) {
                            oDoc.setFont("helvetica", "bold");
                            oDoc.text(sLabel2, iRightColumnX, iStartY);
                            var iColonX2 = iRightColumnX + oDoc.getTextWidth(sLabel2) + 1;
                            oDoc.text(":", iColonX2, iStartY);
                            var iValueX2 = iColonX2 + 4;

                            oDoc.setFont("helvetica", "normal");
                            var aLines2 = oDoc.splitTextToSize(sValue2 || "", (iRight - 3) - iValueX2);
                            oDoc.text(aLines2, iValueX2, iStartY);
                            iRowHeight = Math.max(iRowHeight, aLines2.length);
                        }

                        iY += iRowHeight * 4 + 2;
                    };

                    var addFooter = function () {
                        // Footer disabled per layout requirements.
                    };

                    var iHeaderTop = iY;
                    var iHeaderPaddingTop = 2;

                    var iLogoSize = 40;
                    var iHeaderHeight = 40;
                    var iLogoY = iY + iHeaderPaddingTop;
                    var iLogoImageY = iHeaderTop + (iHeaderHeight - iLogoSize) / 2;
                    var iLogoImageY = iHeaderTop + 0;
                    if (sLogoDataUrl) {
                        try {
                            oDoc.addImage(sLogoDataUrl, "PNG", iMargin + 5, iLogoY, iLogoSize, iLogoSize);
                        } catch (e) {
                            console.warn("Could not add logo to PDF", e);
                        }
                    }

                    oDoc.setFont("helvetica", "normal");
                    oDoc.setFontSize(11);
                    var iTextRight = iRight - 5;
                    oDoc.text("DELTA OFFICE SUITES, 2ND FLOOR, BLOCK B", iTextRight, iLogoY + 7, { align: "right" });
                    oDoc.text("OFF WAIAKI WAY & MANYANI WEST ROAD, MUTHANGARI", iTextRight, iLogoY + 12, { align: "right" });
                    oDoc.text("P.O. BOX 11672-00100, NAIROBI", iTextRight, iLogoY + 17, { align: "right" });
                    oDoc.text("TEL: +254 709 497 000 | +254-20-493 4000", iTextRight, iLogoY + 22, { align: "right" });
                    oDoc.text("WWW.GALANAENERGIES.COM", iTextRight, iLogoY + 27, { align: "right" });


                    oDoc.setDrawColor(120);
                    oDoc.setLineWidth(0.4);
                    oDoc.rect(iMargin, iHeaderTop, iContentWidth, iHeaderHeight);
                    oDoc.setDrawColor(60);

                    iY = iHeaderTop + iHeaderHeight + 6;
                    oDoc.setFont("helvetica", "bold");
                    oDoc.setFontSize(14);
                    oDoc.text("ASSET FORM", iMargin + iContentWidth / 2, iY, { align: "center" });
                    iY += 4;

                    var startSection = function (sTitle) {
                        if (iY + 18 > iPageHeight - 30) {
                            oDoc.addPage();
                            iY = iMargin;
                        }
                        var iSectionTop = iY;
                        iY += 4;
                        oDoc.setFont("helvetica", "bold");
                        oDoc.setFontSize(11);
                        oDoc.text(sTitle, iMargin + 3, iY + 3);
                        iY += 12;
                        return iSectionTop;
                    };

                    var endSection = function (iSectionTop, bSkipTop, bTightJoin) {
                        var iBottom = iY + 1;
                        oDoc.setDrawColor(120);
                        oDoc.setLineWidth(0.4);
                        if (bSkipTop) {
                            // Joined section: use previous bottom edge and draw only side/bottom lines.
                            oDoc.line(iMargin, iSectionTop, iMargin, iBottom);
                            oDoc.line(iRight, iSectionTop, iRight, iBottom);
                            oDoc.line(iMargin, iBottom, iRight, iBottom);
                        } else {
                            oDoc.rect(iMargin, iSectionTop, iContentWidth, iBottom - iSectionTop);
                        }
                        oDoc.setDrawColor(60);
                        oDoc.setLineWidth(0.4);
                        iY = iBottom;
                    };

                    var iSectionTop = startSection("ASSET DETAILS");
                    addLabelValue("Description", oData.assetDetails.description || "", iMargin + 3, iContentWidth);
                    addTwoColumns("Asset Class", oData.assetDetails.assetClass || "", "Asset Number", oData.assetDetails.assetNumber || "");
                    addTwoColumns("Subcategory", oData.assetDetails.subCategory || "", "Tag Number", oData.assetDetails.tagNumber || "");
                    addTwoColumns("Serial Number", oData.assetDetails.serialNumber || "", "",  "");
                    addTwoColumns( "Model", oData.assetDetails.model || "","","");
                    addTwoColumns("Manufacturer", oData.assetDetails.manufacturer || "", "", "");
                    endSection(iSectionTop);

                    iSectionTop = startSection("CAPITALIZATION DETAILS");
                    addTwoColumns("Supplier", oData.capitalizationDetails.supplier || "", "AUC Number", oData.capitalizationDetails.aucNumber || "");
                    addTwoColumns("Capitalization Date", oData.assetDetails.capitalizationDate || "", "","");
                    addTwoColumns("Legacy Number", oData.capitalizationDetails.legacyNumber || "", "Date Placed in Service", oData.capitalizationDetails.datePlacedInService || "");
                    addTwoColumns("Po Order Number", oData.assetDetails.PoNumber || "","Invoice Number", oData.assetDetails.AccountingDocument||"");
                    //addTwoColumns("Invoice Number", oData.assetDetails.AccountingDocument || "", "",  "");
                   // addLabelValue("Po Order Number", oData.capitalizationDetails.datePlacedInService || "", iMargin + 3, iContentWidth);
                    endSection(iSectionTop, true, true);

                    iSectionTop = startSection("TRANSFER DETAILS");
                    //iY=iY+3;
                    // oDoc.setFontSize(9);
                     //oDoc.text("Unique Reference: Change Document Number:", iMargin + 3, iY-4);
                   // iSectionTop = startSection("Unique Reference: Change Document Number");
                    // addTwoColumns("Unique Reference:", oData.transferDetails.fromLocation || "", "", "");
                    addTwoColumns("From Location", oData.transferDetails.fromLocation || "", "To Location", oData.transferDetails.toLocation || "");
                    addTwoColumns("Transfer Date", oData.transferDetails.transferDate || "", "Transporter Name", oData.transferDetails.transporterName || "");
                    addTwoColumns("Cost Center From", oData.transferDetails.costCenterFrom || "", "Cost Center To", oData.transferDetails.costCenterTo || "");
                    endSection(iSectionTop, true);

                    iSectionTop = startSection("COST & DEPRECIATION");
                    addTwoColumns("Purchase Cost", oData.costDepreciation.purchaseCost || "", "Accumulated Depreciation", oData.costDepreciation.accumulatedDepreciation || "");
                    addTwoColumns("Depreciation", oData.costDepreciation.depreciation || "", "Net Book Value", oData.costDepreciation.netBookValue || "");
                    addTwoColumns("Useful Life", oData.costDepreciation.usefulLife || "", "Remaining Useful Life", oData.costDepreciation.remainingUsefulLife || "");
                    endSection(iSectionTop, true);
debugger;
/*
                    if (iY + 42 > iPageHeight - 20) {
                        oDoc.addPage();
                        iY = iMargin;
                    }
                    iSectionTop = startSection("");
                    iY += 6;
                    oDoc.setFont("helvetica", "normal");
                    oDoc.setFontSize(11);
                    var iApprovalValueX = iMargin + 45;
                    */
                    oDoc.line(iMargin, iSectionTop, iMargin, iSectionTop+75);
                            oDoc.line(iRight, iSectionTop, iRight, iSectionTop+75);
                            oDoc.line(iMargin, iSectionTop+75, iRight, iSectionTop+75);
                            iY=iY+10
                    oDoc.text("Approval By:", iMargin + 3, iY);
                     oDoc.text("Prepared By:", iMargin + 80, iY+3);
                     oDoc.text("Approved By:", iMargin + 130, iY+3);

                      oDoc.text("Released By:", iMargin + 3, iY+8);
                        oDoc.text("Signature:", iMargin + 80, iY+13);

                       oDoc.text("Received By:", iMargin + 3, iY+16);
                       oDoc.text("Signature:", iMargin + 80, iY+24);
                       oDoc.text("Stamp:", iMargin + 130, iY+24);

                       var pageWidth = oDoc.internal.pageSize.getWidth();
/*
                    oDoc.text(
                        "FTA:",
                        pageWidth - 5,   // right side
                        iY + 20,
                        {
                            angle: 90
                        }
                    );
                    */
                         //endSection(iSectionTop, true);
                       /*
                    var sPreparedBy = "                                       ";
                    oDoc.text(sPreparedBy, iApprovalValueX, iY);
                    var iPreparedByWidth = oDoc.getTextWidth(sPreparedBy) + 2;
                    oDoc.line(iApprovalValueX, iY + 2, iApprovalValueX + iPreparedByWidth, iY + 2);
                    iY += 14;

                    oDoc.text("Checked By:", iMargin + 3, iY);
                    var sCheckedBy = "                                       ";
                    oDoc.text(sCheckedBy, iApprovalValueX, iY);
                    var iCheckedByWidth = oDoc.getTextWidth(sCheckedBy) + 2;
                    oDoc.line(iApprovalValueX, iY + 2, iApprovalValueX + iCheckedByWidth, iY + 2);
                    iY += 14;

                    oDoc.text("Approved By:", iMargin + 3, iY);
                    var sApprovedBy = "                                       ";
                    oDoc.text(sApprovedBy, iApprovalValueX, iY);
                    var iApprovedByWidth = oDoc.getTextWidth(sApprovedBy) + 2;
                    oDoc.line(iApprovalValueX, iY + 2, iApprovalValueX + iApprovedByWidth, iY + 2);
                    iY += 14;

                    oDoc.text("Received By:", iMargin + 3, iY);
                    var sReceivedBy = "                                       ";
                    oDoc.text(sReceivedBy, iApprovalValueX, iY);
                    var iReceivedByWidth = oDoc.getTextWidth(sReceivedBy) + 2;
                    oDoc.line(iApprovalValueX, iY + 2, iApprovalValueX + iReceivedByWidth, iY + 2);
                    iY += 6;
                    */
                    addFooter();

                  //  var sCompanyCode = that.byId("CompanyCode").getValue();
                   // var sAssetNumber = that.byId("AssetCode").getValue();
                    var sFileName = "AssetTransfer_" + companyCode + "_" + asset + ".pdf";
                    oDoc.save(sFileName);
                };

                this._loadImageAsDataUrl(sLogoPath).then(generatePdf).catch(function (err) {
                    console.warn("Logo could not be loaded, generating PDF without logo.", err);
                    generatePdf(null);
                });
            }
                catch (error) {
                    MessageBox.show("Error while genrating the layout " + error.message);
                }
        },  
            
             _loadImageAsDataUrl: function (sImagePath) {
                return new Promise(function (resolve, reject) {
                    fetch(sImagePath).then(function (response) {
                        if (!response.ok) {
                            throw new Error("Image load failed: " + response.status);
                        }
                        return response.blob();
                    }).then(function (blob) {
                        var reader = new FileReader();
                        reader.onloadend = function () {
                            resolve(reader.result);
                        };
                        reader.onerror = function (err) {
                            reject(err);
                        };
                        reader.readAsDataURL(blob);
                    }).catch(reject);
                });
            },

            ClearValue:function()
            {
                 let viewmodel=this.getView().getModel("EntryFormDataSourceModel");
                 viewmodel.setProperty("/CompanyCode",'');
                 viewmodel.setProperty("/AssetCode",'');
                 viewmodel.setProperty("/SubAsset",'');
                 viewmodel.setProperty("/TransferDate",'');
                 viewmodel.setProperty("/CostCenter",'');
                 viewmodel.setProperty("/LocationCode",'');
                 viewmodel.setProperty("/LocationDsc",'');
                 viewmodel.setProperty("/TransporterNM",'');
                 viewmodel.setProperty("/TagNo",'');
                 viewmodel.setProperty("/Serial",'');
            }


        });
    });
