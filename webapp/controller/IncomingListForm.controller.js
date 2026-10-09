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
        return genericentryform.extend("project1.controller.IncomingListForm", {

            onInit:  function () {
                debugger
                includeScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", "jsPDF")
                
                 genericentryform.prototype.onInit.apply(this, arguments);
                debugger;
               
            },
            onBeforeShow: async function (oEvent) {
                 debugger;
             // this._getLoggedInUser();
                await  this.FillListView();
            },
            initialize: async function () {
                debugger;
            },
            FillListView: async function () {
                debugger;
                            // 2️⃣ Clear previous User data before fetching new one
                            if (this.getView().getModel("Debit")) {
                                this.getView().getModel("Debit").setData({ value: [] });
                            }

                            // 3️⃣ Fetch fresh data from backend
                            await this.createNewModelUsingAPI(
                                "GET",
                                `/sap/opu/odata4/sap/zorn_sb_inc_pay_layout/srvd_a2x/sap/zorn_sd_inc_pay_layout/0001/ZORN_CDS_INC_PAY_LAYOUT?$top=200000`,
                                
                                "",
                                "Debit" // keep model name same as your table binding
                            );

                            // 4️⃣ Get model reference and refresh the UI
                            const oGMCModel = this.getView().getModel("Debit");
                            oGMCModel.refresh(true);

			},
            onSearchWithName: function (oEvent) {
                    debugger;
			var sQuery = oEvent.getParameter("newValue"); // Get search input
			var filters=[];
			if(sQuery)
			{
				var filter1 = new sap.ui.model.Filter({path:"SupplierInvoice",operator:sap.ui.model.FilterOperator.Contains,value1:sQuery});
				filters=[filter1];
				var finalFilter = new sap.ui.model.Filter({filters:filters, and:false});
		}
		var otable = this.byId("_DebitTbl");
		otable.getBinding("items").filter(finalFilter);
    },

            onEditPress: function (oEvent) {
                debugger;
           
					var oButton = oEvent.getSource();
					var oBindingContext = oButton.getBindingContext("Debit");
					let oRowObject = oBindingContext.getProperty("ID");

					this.setRouteData("2",oRowObject);
					var router = sap.ui.core.UIComponent.getRouterFor(this);
                     router.navTo("RouterNameUserMasterEntryForm");
                     
				
           
		},

        _getLoggedInUser: async function () {
            if (sap.ushell && sap.ushell.Container) {
                try {
                    const oUserInfoService = await sap.ushell.Container.getServiceAsync("UserInfo");
                    const oUser = oUserInfoService.getUser();

                    const oUserData = {
                        userId: oUser.getId(),
                        fullName: oUser.getFullName(),
                        firstName: oUser.getFirstName(),
                        lastName: oUser.getLastName(),
                        email: oUser.getEmail()
                    };

                    // Set model on component level so all views inherit it
                    const oUserModel = new JSONModel(oUserData);
                    this.setModel(oUserModel, "userModel");

                } catch (oError) {
                    console.error("Error retrieving user info from FLP Container", oError);
                }
            }
        },
		Addnew: function (oEvent) {
debugger;
              var ID="10";
            this.setRouteData("3", ID);
			var router = sap.ui.core.UIComponent.getRouterFor(this);
            router.navTo("RouterNameUserMasterEntryForm");

			var router = sap.ui.core.UIComponent.getRouterFor(this);
            router.navTo("RouterNameUserMasterEntryForm");
		},
        navBack: function() {
            debugger;
		//	var BPText = this.getView().byId('sideNavigation');
		//	BPText.setVisible(true);
		history.go(-1);
			
			//var router = sap.ui.core.UIComponent.getRouterFor(this);
           // router.navTo("RouteIndex");
		},
		
           
            onClosecflForStage: function () {
                let x = this.getCflObject();
            },



async OnPrint(oEvent) {
    debugger;
    let oButton=oEvent.getSource();
    let oButtonContext=oButton.getBindingContext("Debit");
    let PaymentNo=oButtonContext.getProperty("PaymentNo");
    let FiscalYear=oButtonContext.getProperty("FiscalYear");
     
      // 3️⃣ Fetch fresh data from backend
                            await this.createNewModelUsingAPI(
                                "GET",
                                `/sap/opu/odata4/sap/zorn_sb_inc_pay_layout/srvd_a2x/sap/zorn_sd_inc_pay_layout/0001/ZORN_CDS_INC_PAY_LAYOUT?$filter=PaymentNo eq '${PaymentNo}' and FiscalYear eq '${FiscalYear}' &$expand=_Lines`,
                                
                                "",
                                "IncomingPayment" // keep model name same as your table binding
                            );

                            // 4️⃣ Get model reference 
                            debugger;
                           const oIncomingPayment = this.getView().getModel("IncomingPayment");
                            const IncomingPayment = oIncomingPayment.getProperty("/value");
                            const aLines = oIncomingPayment.getProperty("/value[0]/_Lines") || [];

                            const d = {
                                InvoiceRows: aLines.map(line => ({
                                    InvoiceNo:       line.InvoiceNo,        // rename right side to match your actual field
                                    PONo:            line.PONo,             // rename right side to match your actual field
                                    InvoiceDate:     line.InvoiceDate,
                                    InvoiceTotal:    line.InvoiceTotal,
                                    PaymentReceived: line.PaymentReceived,
                                    BalanceDue:      line.BalanceDue
                                }))
                            };
   debugger;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });
debugger;
let data=IncomingPayment.getProperty("/_Lines");
    const headerY = this.PaymentReceiptReportHeader(doc, IncomingPayment);
    this.PaymentReceiptPageBorder(doc, 8);
    const invoiceEndY = this.PaymentReceiptInvoiceTable(doc, data, headerY);
    const chequeEndY = this.PaymentReceiptChequeTable(doc, data, invoiceEndY + 4);
    this.PaymentReceiptFooter(doc, data, chequeEndY + 4);

    doc.save("PaymentReceiptAcknowledgement.pdf");
},

// ===================================================================
// HARD-CODED DATA — edit here; row arrays may contain any number of
// entries and both tables below will grow/shrink to match.
// ===================================================================


// ===================================================================
// OUTER PAGE FRAME — full-height left/right borders, same role as
// DebitNotePageBorder. Call once per page, right after ReportHeader.
// ===================================================================
PaymentReceiptPageBorder: function (doc, topY) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const bottomY = pageHeight - 10;
    doc.line(5, topY, 5, bottomY);                          // left border
    doc.line(pageWidth - 5, topY, pageWidth - 5, bottomY);   // right border
},

// ===================================================================
// COMPANY HEADER + TITLE + PAY TO / INFORMATION BLOCK
// (mirrors DebitNoteReportHeader's role for this document)
// ===================================================================
PaymentReceiptReportHeader: function (doc, d) {
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 8;

    doc.setDrawColor(0);
    doc.line(5, y, pageWidth - 5, y);

    // ---- Company name / address (right-aligned, as on source doc) ----
    doc.setFont("Arial", "bold");
    doc.setFontSize(10);
    doc.text(`${d.CompanyCodeName || ""}`, pageWidth - 6, y + 4, { align: "right" });

    doc.setFont("Arial", "normal");
    doc.setFontSize(7);
    const addrLines = doc.splitTextToSize(`${d.Compnay_StreetName || ""}`, 90);
    //doc.text(d.Compnay_StreetName+d.Compnay_StreetSuffixName, pageWidth - 6, y + 8, { align: "right" });
    let hy = y + 8 + addrLines.length * 3.2;
   // doc.text(`${d.CompanyEmail || ""}`, pageWidth - 6, hy, { align: "right" }); hy += 3.5;
   // doc.text(`${d.CompanyCIN || ""}`, pageWidth - 6, hy, { align: "right" }); hy += 4;

    y = hy + 2;
    doc.line(5, y, pageWidth - 5, y);

    // ---- Title ----
    y += 6;
    doc.setFont("Arial", "bold");
    doc.setFontSize(13);
    doc.text("Payment Receipt Acknowledgement", pageWidth / 2, y, { align: "center" });
    y += 4;
    doc.line(5, y, pageWidth - 5, y);

    // ---- Pay To / Information two-column box ----
    const boxTop = y;
    const boxHeight = 34;
    const usableW = pageWidth - 10;
    const colW = usableW / 2;

    doc.rect(5, boxTop, colW, boxHeight);
    doc.rect(5 + colW, boxTop, colW, boxHeight);

    doc.setFillColor(230, 230, 230);
    doc.rect(5, boxTop, colW, 5, "F");
    doc.rect(5 + colW, boxTop, colW, 5, "F");
    doc.setDrawColor(0);
    doc.rect(5, boxTop, colW, 5);
    doc.rect(5 + colW, boxTop, colW, 5);

    doc.setFont("Arial", "bold");
    doc.setFontSize(9);
    doc.text("Pay To", 7, boxTop + 3.5);
    doc.text("Information", 7 + colW, boxTop + 3.5);

    // Pay To content
    doc.setFont("Arial", "bold");
    doc.setFontSize(9);
    doc.text(`${d.CustomerFullName || ""}`, 7, boxTop + 9);
    doc.setFont("Arial", "normal");
    doc.setFontSize(8);
   // const payToLines = doc.splitTextToSize(`${d.Customer_HouseNumber+d.Customer_StreetName || ""}`, colW - 4);
    //doc.text(payToLines, 7, boxTop + 13);

    // Information content (label / value rows)
    const infoRows = [
        ["Document Numbering", d.PaymentNo],
        ["Posting Date", d.PaymentDate],
        ["Card Code", d.Customer],
        //["Total Amount", d.TotalAmountHeader]
    ];
    let iy = boxTop + 9;
    doc.setFontSize(9);
    infoRows.forEach(([label, val]) => {
        doc.setFont("Arial", "normal");
        doc.text(label, 7 + colW, iy);
        doc.text(`${val ?? ""}`, 7 + colW + 43, iy);
        iy += 5.5;
    });

    y = boxTop + boxHeight;

    // ---- Currency row ----
    const currRowH = 6;
    doc.rect(5, y, usableW, currRowH);
    doc.line(45, y, 45, y + currRowH);
    doc.setFontSize(9);
    doc.text("Currency", 7, y + 4);
    doc.text(`${d.Currency || ""}`, 49, y + 4);
    y += currRowH + 4;

    return y;
},

// Column layout: [label, x-start, width] — mirrors _debitNoteCols pattern.
// Widths sum to usable width (5 .. pageWidth-5) on portrait A4 (200mm usable).
_paymentReceiptInvoiceCols: [
    ["PaymentNo\nNo.", 5, 33.3],
    ["InvoiceDate\nDate", 71.6, 33.3],
    ["Invoice\nTotal", 104.9, 33.3],
    ["Payment\nReceived", 138.2, 33.3],
    ["TDS\nAmount", 171.5, 33.5]
],



// ===================================================================
// INVOICE TABLE — header + variable-length body, same shape as
// DebitNotePageHeader/DebitNoteLineSection but self-contained since
// this table only has one section. Returns Y after the last row.
// ===================================================================
PaymentReceiptInvoiceTable: function (doc, d, startY) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const cols = this._paymentReceiptInvoiceCols;
    const headerH = 8;
    const rowH = 7;
    let Py = startY;

    // header
    doc.setFont("Arial", "bold");
    doc.setFontSize(7.5);
    cols.forEach((col, i) => {
        const x = col[1];
        if (i > 0) doc.line(x, Py, x, Py + headerH);
        const lines = col[0].split("\n");
        lines.forEach((ln, li) => doc.text(ln, x + 1, Py + 3 + li * 3));
    });
    const lastCol = cols[cols.length - 1];
    doc.line(lastCol[1] + lastCol[2], Py, lastCol[1] + lastCol[2], Py + headerH);
    doc.line(5, Py, pageWidth - 5, Py);
    Py += headerH;
    doc.line(5, Py, pageWidth - 5, Py);

    // body rows — variable length, keys matched by column order
    const keys = ["PaymentNo", "InvoiceDate", "InvoiceAmount_CC", "InvoiceAmount_TC", "InvoiceAmount_TC"];
    doc.setFont("Arial", "normal");
    doc.setFontSize(8);
    (d.InvoiceRows || []).forEach(row => {
        cols.forEach((col, i) => {
            const x = col[1];
            if (i > 0) doc.line(x, Py, x, Py + rowH);
            const val = row[keys[i]];
            if (val) doc.text(`${val}`, x + 1, Py + rowH / 2 + 1.5);
        });
        doc.line(lastCol[1] + lastCol[2], Py, lastCol[1] + lastCol[2], Py + rowH);
        doc.line(5, Py, pageWidth - 5, Py + 0); // top of this row already drawn by previous bottom
        Py += rowH;
        doc.line(5, Py, pageWidth - 5, Py);      // bottom border of this row
    });

    return Py;
},

// ===================================================================
// REMARKS / TOTAL / SIGNATURE / FOOTER
// (mirrors DebitNoteFooter's role)
// ===================================================================
PaymentReceiptFooter: function (doc, d, startY) {
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = startY + 8;

    doc.setFont("Arial", "bold");
    doc.setFontSize(9);
    doc.text("Remarks", 5, y);
    doc.text("Total Amount", pageWidth - 65, y);

    doc.setFont("Arial", "normal");
    const remarksLines = doc.splitTextToSize(`${d.Remarks || ""}`, 90);
    doc.text(remarksLines, 25, y);
    doc.text(`${d.TotalAmount || ""}`, pageWidth - 35, y);

    y += Math.max(remarksLines.length * 4, 4) + 30;

    // Signature / Date
    doc.setFont("Arial", "normal");
    doc.setFontSize(9);
    doc.text("Signature", 5, y);
    doc.line(23, y, 80, y);

    doc.text("Date :", pageWidth - 50, y);
    doc.line(pageWidth - 38, y, pageWidth - 5, y);

    y += 8;
    doc.line(5, y, pageWidth - 5, y);
    y += 6;

    // Footer block
    doc.setFont("Arial", "normal");
    doc.setFontSize(9);
    doc.text(`${d.FooterFor || ""}`, pageWidth - 6, y, { align: "right" });
    y += 10;
    doc.text(`${d.FooterSignatory || ""}`, pageWidth - 6, y, { align: "right" });
    doc.setFontSize(7.5);
    doc.text(`${d.FooterPrinted || ""}`, pageWidth - 6, y + 4, { align: "right" });

    doc.line(5, startY - 4, pageWidth - 5, startY - 4);

    return y + 4;
},




        });
    });
