sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "fioriproject/util/Extractor",
    "fioriproject/core/generic/genericlistviewfunctions"
], function (
    Controller,
    JSONModel,
    MessageToast,
    MessageBox,
    Extractor,
    genericlistviewfunctions
) {
    "use strict";

    return genericlistviewfunctions.extend(
        "fioriproject.controller.Main",
        {

            // ============================================================
            // INIT
            // ============================================================

            onInit: function () {

                genericlistviewfunctions.prototype.onInit.apply(
                    this,
                    arguments
                );

                this._resetUiModel();

                // Sales Order API Service Root
                this._salesOrderServiceUrl =
                    "/sap/opu/odata/sap/API_SALES_ORDER_SRV/";

            },


            // ============================================================
            // RESET UI MODEL
            // ============================================================

            _resetUiModel: function () {

                const uiModel = new JSONModel({

                    hasFile: false,
                    busy: false,

                    statusText: "",

                    progressPercent: 0,
                    progressText: "",

                    fileName: "",
                    mimeType: "",

                    rawText: "",

                    // HEADER
                    header: {

                        documentType: "",
                        documentNo: "",
                        documentDate: "",
                        customerCode: "",
                        customerName: "",
                        gstin: "",
                        currency: "",
                        totalAmount: ""

                    },

                    // LINE ITEMS
                    lines: [],

                    // JSON PREVIEW
                    jsonPreview: ""

                });


                this.getView().setModel(
                    uiModel,
                    "ui"
                );


                this._currentFile = null;

            },


            // ============================================================
            // FILE CHANGE
            // ============================================================

            onFileChange: function (oEvent) {

                const uiModel =
                    this.getView().getModel("ui");


                const aFiles =
                    oEvent.getParameter("files");


                const file =
                    aFiles && aFiles.length > 0
                        ? aFiles[0]
                        : null;


                if (!file) {

                    uiModel.setProperty(
                        "/hasFile",
                        false
                    );

                    this._currentFile = null;

                    return;

                }


                this._currentFile = file;


                uiModel.setProperty(
                    "/fileName",
                    file.name
                );


                uiModel.setProperty(
                    "/mimeType",
                    file.type ||
                    this._guessMimeType(file.name)
                );


                uiModel.setProperty(
                    "/hasFile",
                    true
                );


                uiModel.setProperty(
                    "/statusText",
                    "File selected: " + file.name
                );


                // Clear previous extraction

                uiModel.setProperty(
                    "/rawText",
                    ""
                );

                uiModel.setProperty(
                    "/lines",
                    []
                );

                uiModel.setProperty(
                    "/jsonPreview",
                    ""
                );

            },


            // ============================================================
            // GUESS MIME TYPE
            // ============================================================

            _guessMimeType: function (fileName) {

                const ext =
                    fileName
                        .split(".")
                        .pop()
                        .toLowerCase();


                const map = {

                    pdf: "application/pdf",

                    png: "image/png",

                    jpg: "image/jpeg",

                    jpeg: "image/jpeg",

                    bmp: "image/bmp",

                    tif: "image/tiff",

                    tiff: "image/tiff"

                };


                return map[ext] ||
                    "application/octet-stream";

            },


            // ============================================================
            // EXTRACT DOCUMENT
            // ============================================================

            onExtractPress: async function () {

                const uiModel =
                    this.getView().getModel("ui");


                if (!this._currentFile) {

                    MessageToast.show(
                        "Please select a file first."
                    );

                    return;

                }


                const mimeType =
                    uiModel.getProperty(
                        "/mimeType"
                    );


                const onProgress =
                    (text, percent) => {

                        uiModel.setProperty(
                            "/statusText",
                            text
                        );


                        uiModel.setProperty(
                            "/progressPercent",
                            Math.round(percent)
                        );


                        uiModel.setProperty(
                            "/progressText",
                            Math.round(percent) + "%"
                        );

                    };


                uiModel.setProperty(
                    "/busy",
                    true
                );


                uiModel.setProperty(
                    "/statusText",
                    "Extracting document..."
                );


                uiModel.setProperty(
                    "/progressPercent",
                    0
                );


                try {

                    let rawText = "";


                    // ====================================================
                    // PDF
                    // ====================================================

                    if (
                        mimeType ===
                        "application/pdf"
                    ) {

                        const arrayBuffer =
                            await this._currentFile.arrayBuffer();


                        rawText =
                            await Extractor.extractPdfText(
                                arrayBuffer,
                                onProgress
                            );

                    }


                    // ====================================================
                    // IMAGE
                    // ====================================================

                    else if (
                        Extractor.isImageMimeType(
                            mimeType
                        )
                    ) {

                        rawText =
                            await Extractor.extractImageText(
                                this._currentFile,
                                onProgress
                            );

                    }


                    // ====================================================
                    // UNSUPPORTED
                    // ====================================================

                    else {

                        throw new Error(
                            "Unsupported file type."
                        );

                    }


                    // ====================================================
                    // PARSE DOCUMENT
                    // ====================================================

                    const documentData =
                        Extractor.parseDocument(
                            rawText
                        );


                    // ====================================================
                    // SET DATA
                    // ====================================================

                    uiModel.setProperty(
                        "/rawText",
                        rawText
                    );


                    uiModel.setProperty(
                        "/header",
                        documentData.header || {}
                    );


                    uiModel.setProperty(
                        "/lines",
                        documentData.lines || []
                    );


                    this._updateJSONPreview();


                    uiModel.setProperty(
                        "/statusText",
                        "Extraction completed successfully."
                    );


                    MessageToast.show(
                        "Document extracted successfully."
                    );

                }

                catch (err) {

                    console.error(
                        "Extraction Error:",
                        err
                    );


                    MessageBox.error(
                        err.message ||
                        "Document extraction failed."
                    );


                    uiModel.setProperty(
                        "/statusText",
                        ""
                    );

                }

                finally {

                    uiModel.setProperty(
                        "/busy",
                        false
                    );


                    uiModel.setProperty(
                        "/progressPercent",
                        0
                    );


                    uiModel.setProperty(
                        "/progressText",
                        ""
                    );

                }

            },


            // ============================================================
            // ADD LINE
            // ============================================================

            onAddLine: function () {

                const uiModel =
                    this.getView().getModel("ui");


                const lines =
                    uiModel.getProperty("/lines") || [];


                lines.push({

                    itemCode: "",

                    description: "",

                    quantity: "",

                    unitPrice: "",

                    tax: "",

                    lineTotal: ""

                });


                uiModel.setProperty(
                    "/lines",
                    lines
                );


                this._updateJSONPreview();

            },


            // ============================================================
            // DELETE LINE
            // ============================================================

            onDeleteLine: function (oEvent) {

                const uiModel =
                    this.getView().getModel("ui");


                const oItem =
                    oEvent.getSource().getParent();


                const oContext =
                    oItem.getBindingContext("ui");


                if (!oContext) {
                    return;
                }


                const path =
                    oContext.getPath();


                const index =
                    parseInt(
                        path.split("/").pop(),
                        10
                    );


                const lines =
                    uiModel.getProperty("/lines") || [];


                lines.splice(
                    index,
                    1
                );


                uiModel.setProperty(
                    "/lines",
                    lines
                );


                this._updateJSONPreview();

            },


            // ============================================================
            // UPDATE JSON PREVIEW
            // ============================================================

            _updateJSONPreview: function () {

                const uiModel =
                    this.getView().getModel("ui");


                const json = {

                    Header:
                        uiModel.getProperty(
                            "/header"
                        ),

                    Lines:
                        uiModel.getProperty(
                            "/lines"
                        )

                };


                uiModel.setProperty(
                    "/jsonPreview",
                    JSON.stringify(
                        json,
                        null,
                        4
                    )
                );

            },


            // ============================================================
            // SAVE EXTRACTED DOCUMENT
            // ============================================================

            onSavePress: function () {

                const uiModel =
                    this.getView().getModel("ui");


                const oDataModel =
                    this.getView().getModel();


                const documentData = {

                    FileName:
                        uiModel.getProperty(
                            "/fileName"
                        ),

                    MimeType:
                        uiModel.getProperty(
                            "/mimeType"
                        ),

                    RawText:
                        uiModel.getProperty(
                            "/rawText"
                        ),

                    Header:
                        uiModel.getProperty(
                            "/header"
                        ),

                    Lines:
                        uiModel.getProperty(
                            "/lines"
                        )

                };


                console.log(
                    "Final Document JSON:",
                    documentData
                );


                if (!oDataModel) {

                    MessageBox.information(
                        JSON.stringify(
                            documentData,
                            null,
                            4
                        )
                    );

                    return;

                }


                uiModel.setProperty(
                    "/busy",
                    true
                );


                oDataModel.create(
                    "/ExtractedDocuments",
                    documentData,
                    {

                        success: function () {

                            uiModel.setProperty(
                                "/busy",
                                false
                            );


                            MessageToast.show(
                                "Document saved successfully."
                            );

                        },


                        error: function (err) {

                            console.error(
                                "Save Error:",
                                err
                            );


                            uiModel.setProperty(
                                "/busy",
                                false
                            );


                            MessageBox.error(
                                "Failed to save document."
                            );

                        }

                    }
                );

            },


            // ============================================================
            // RESET
            // ============================================================

            onResetPress: function () {

                this._resetUiModel();


                const uploader =
                    this.byId("fileUploader");


                if (uploader) {

                    uploader.clear();

                }

            },


            // ============================================================
            // FETCH CSRF TOKEN
            // ============================================================

 FetchCSRToken: async function (value) {
                var myHeaders = new Headers();
                myHeaders.append("x-csrf-token", "fetch");
                await this.createNewModelUsingAPIFetchMethod(
                    'GET',
                    `/sap/opu/odata/sap/API_SALES_ORDER_SRV/A_SalesOrder?$format=json`,
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

            FetchCSRToken1: async function () {

                const sServiceUrl =
                    this._salesOrderServiceUrl;


                console.log(
                    "Fetching CSRF Token from:",
                    sServiceUrl
                );

debugger;
                const response = await fetch(

                    sServiceUrl,

                    {

                        method: "GET",

                        headers: {

                            "X-CSRF-Token":
                                "Fetch",

                            "Accept":
                                "application/json"

                        },


                        // Browser handles session cookies
                        credentials: "include",

                        cache: "no-store"

                    }

                );


                console.log(
                    "CSRF Response Status:",
                    response.status
                );


                console.log(
                    "CSRF Response URL:",
                    response.url
                );


                // ========================================================
                // CHECK RESPONSE
                // ========================================================

                if (!response.ok) {

                    const errorText =
                        await response.text();


                    console.error(
                        "CSRF Fetch Error:",
                        errorText
                    );


                    throw new Error(

                        "Failed to fetch CSRF token. " +

                        "HTTP Status: " +

                        response.status +

                        ". Response: " +

                        errorText

                    );

                }


                // ========================================================
                // GET TOKEN
                // ========================================================

                const csrfToken =

                    response.headers.get(
                        "x-csrf-token"
                    );


                console.log(
                    "CSRF TOKEN:",
                    csrfToken
                );


                // ========================================================
                // DEBUG HEADERS
                // ========================================================

                response.headers.forEach(
                    function (value, key) {

                        console.log(
                            "Response Header:",
                            key,
                            "=",
                            value
                        );

                    }
                );


                if (!csrfToken) {

                    throw new Error(
                        "SAP did not return an X-CSRF-Token."
                    );

                }


                return csrfToken;

            },


            // ============================================================
            // POST SALES ORDER BUTTON
            // ============================================================

            onSoPost: async function () {
debugger;
                try {

                    this.getView().setBusy(
                        true
                    );


                    // ====================================================
                    // STEP 1 - FETCH CSRF TOKEN
                    // ====================================================
            await this.FetchCSRToken(); // Ensure CSRF Token is fetched before proceeding
                        let viewModel = this.getView().getModel(this.getEntryFormDataSourceModelName());
                    let csrfTokenValue = this.getCSRFTokenFromHeaders();

                   // const csrfTokenValue =
                       // await this.FetchCSRToken();


                    console.log(
                        "Token successfully received"
                    );


                    // ====================================================
                    // STEP 2 - POST SALES ORDER
                    // ====================================================
debugger;
                    const result =
                        await this.PostSo(
                            csrfTokenValue
                        );


                    console.log(
                        "Sales Order Result:",
                        result
                    );

                }

                catch (error) {

                    console.error(
                        "Sales Order Processing Error:",
                        error
                    );


                    MessageBox.error(

                        error.message ||

                        "An error occurred while creating the Sales Order."

                    );

                }

                finally {

                    this.getView().setBusy(
                        false
                    );

                }

            },


            // ============================================================
            // POST SALES ORDER
            // ============================================================

            PostSo: async function (csrfTokenValue) {

                // ========================================================
                // SALES ORDER PAYLOAD
                // ========================================================

                const oSalesOrderData = {

                    "SalesOrderType":
                        "OR",

                    "SoldToParty":
                        "2000001",

                    "AdditionalCustomerGroup1":
                        "",

                    "CustomerPurchaseOrderDate":
                        "2026-08-27T12:00:00",

                    "PurchaseOrderByCustomer":
                        "PO345",

                    "SalesOrganization":
                        "80S0",

                    "DistributionChannel":
                        "10",

                    "RequestedDeliveryDate":
                        null,

                    "OrganizationDivision":
                        "00",

                    "YY1_SalesBranch1_SDH":
                        "1800",

                    "YY1_ShipToCity_SDH":
                        "LA PAZ",

                    "YY1_Mark_SDH":
                        "4",

                    "YY1_SelectProductVerti_SDH":
                        "4",


                    // ====================================================
                    // ITEMS
                    // ====================================================

                    "to_Item": [

                        {
                            "SalesOrderItem":"10",
                            "Material":"HF-X RAY",
                            "RequestedQuantity":"1.00",
                            "NetAmount":"1333333.33",
                            "ProductionPlant":"1200",
                            "OrderQuantityUnit":"EA",
                            "StorageLocation":"",
                            "YY1_City1_SDI":"Malaysia",
                            "YY1_AdditionalWarranty_SDI":false
                        },
                        {
                            "SalesOrderItem":"20",
                            "Material":"HF-X RAY",
                            "RequestedQuantity":"1.00",
                            "NetAmount":"1333333.33",
                            "ProductionPlant":"1200",
                            "OrderQuantityUnit":"EA",
                            "StorageLocation":"",
                            "YY1_City1_SDI":"Malaysia",
                            "YY1_AdditionalWarranty_SDI":false
                        },
                        {
                            "SalesOrderItem":"30",
                            "Material":"HF-X RAY",
                            "RequestedQuantity":"1.00",
                            "NetAmount":"1333333.33",
                            "ProductionPlant":"1200",
                            "OrderQuantityUnit":"EA",
                            "StorageLocation":"",
                            "YY1_City1_SDI":"Malaysia",
                            "YY1_AdditionalWarranty_SDI":false
                        },
                        {
                            "SalesOrderItem":"40",
                            "Material":"HF-X RAY",
                            "RequestedQuantity":"1.00",
                            "NetAmount":"1333333.33",
                            "ProductionPlant":"1200",
                            "OrderQuantityUnit":"EA",
                            "StorageLocation":"",
                            "YY1_City1_SDI":"Malaysia",
                            "YY1_AdditionalWarranty_SDI":false
                        }
                            // ============================================
                            // PRICING
                            // ============================================

                           // "to_PricingElement": [
                                //{
                                   // "ConditionType":"YZWR",
                                    //"ConditionRateValue":"1333333.33",
                                    //"ConditionCurrency":"INR"
                                //}

                            //]

                        

                    ]

                };


                const sPostUrl =

                    this._salesOrderServiceUrl +

                    "A_SalesOrder";


                console.log(
                    "Posting Sales Order to:",
                    sPostUrl
                );


                console.log(
                    "CSRF Token Used:",
                    csrfTokenValue
                );


                console.log(
                    "Payload:",
                    oSalesOrderData
                );


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
                                oSalesOrderData
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

                        "Sales Order creation failed.";


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


                // ========================================================
                // SUCCESS
                // ========================================================

                console.log(
                    "Sales Order Created Successfully:",
                    data
                );


                const salesOrder =

                    data?.d?.SalesOrder ||

                    data?.SalesOrder ||

                    data?.d?.SalesOrderID ||

                    "";


                MessageToast.show(

                    salesOrder

                        ? "Sales Order " +
                          salesOrder +
                          " created successfully."

                        : "Sales Order created successfully."

                );


                return data;

            },
            onImagePress: function () {

    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";

    input.onchange = async (event) => {

        const file = event.target.files[0];

        if (!file) {
            return;
        }

        try {

            // 1. OCR
            const text =
                await Formatter.extractImageText(
                    file,
                    (message, progress) => {

                        console.log(
                            message,
                            progress
                        );

                    }
                );

            console.log("OCR TEXT:");
            console.log(text);


            // 2. Same parser you already have
            const result =
                Formatter.parseDocument(text);


            console.log("HEADER:");
            console.log(result.header);


            console.log("LINE ITEMS:");
            console.log(result.lines);


            // Now bind result to your UI


        } catch (error) {

            console.error(
                "Image processing failed:",
                error
            );

        }

    };

    input.click();

}


        }

    );

});