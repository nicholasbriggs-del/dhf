// Copyright (c) 2026, DeHaat and contributors
// For license information, please see license.txt

frappe.provide("dhf");

/**
 * RTV Bag barcode scanner.
 *
 * Reuses erpnext.utils.BarcodeScanner entirely (lookup via
 * erpnext.stock.utils.scan_barcode, row matching, qty increment,
 * new-row creation). Only the failure alert is customized to
 * show "Invalid Entry" as required by the RTV Bag workflow.
 */
dhf.RTVBagBarcodeScanner = class RTVBagBarcodeScanner extends erpnext.utils.BarcodeScanner {
	show_alert(msg, indicator, duration = 3) {
		if (indicator === "red") {
			// Scan lookup failed: barcode does not match any existing Item.
			msg = __("Invalid Entry");
		}
		super.show_alert(msg, indicator, duration);
	}
};

frappe.ui.form.on("RTV Bag", {
	setup(frm) {
		frm.barcode_scanner = new dhf.RTVBagBarcodeScanner({
			frm: frm,
		});
	},

	refresh(frm) {
		if (frm.doc.docstatus === 0) {
			frm.add_custom_button(__("Scan Barcode"), () => {
				let scan_input = frm.fields_dict.scan_barcode.$input;
				scan_input.focus();
				frappe.show_alert({
					message: __("Ready to scan. Scan an item barcode."),
					indicator: "blue",
				});
			});
		}
	},

	scan_barcode(frm) {
		// Triggered when the scan_barcode field value changes (Enter / scanner gun).
		frm.barcode_scanner.process_scan();
	},
});
