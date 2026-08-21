// Copyright (c) 2026, DeHaat and contributors
// For license information, please see license.txt

frappe.provide("dhf");

/**
 * RTV Bag barcode scanner.
 *
 * Reuses erpnext.utils.BarcodeScanner entirely (lookup via
 * erpnext.stock.utils.scan_barcode, qty increment, new-row creation,
 * EAN capture into the child "ean_code" field). Two customizations:
 *
 * 1. Row matching is done by the scanned EAN first. The stock matcher
 *    compares row.uom against the UOM stored on the Item Barcode record;
 *    this child table has no uom field, so scans of barcodes that carry a
 *    UOM (e.g. "Nos") never matched an existing row and created duplicates.
 * 2. A failed lookup alerts "Invalid Entry" as required by the workflow.
 */
dhf.RTVBagBarcodeScanner = class RTVBagBarcodeScanner extends erpnext.utils.BarcodeScanner {
	get_row_to_modify_on_scan(item_code, batch_no, uom, barcode, default_warehouse) {
		if (!barcode) {
			return super.get_row_to_modify_on_scan(
				item_code,
				batch_no,
				uom,
				barcode,
				default_warehouse
			);
		}

		const items_table = this.frm.doc[this.items_table_name] || [];

		// Same scanned EAN already present -> merge into that exact row.
		const ean_match = items_table.find((row) => row.ean_code === barcode);
		if (ean_match) {
			return ean_match;
		}

		// Different EAN must NOT merge into another row of the same Item.
		// Reuse a blank row if present; otherwise the base class adds a new one.
		return items_table.find((row) => !row.item_code);
	}

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
			items_table_name: "items",
			qty_field: "qty",
			barcode_field: "ean_code",
		});
	},

	onload(frm) {
		// Keep the hidden item_name cache in sync live (manual pick + scans).
		// Value comes from the linked ERPNext Item record - never generated.
		frm.add_fetch("item_code", "item_name", "item_name");
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

/**
 * Display the real ERPNext Item Name in the "Item" column instead of the
 * Item Code, while the underlying Link to the ERPNext Item stays intact.
 * Scoped strictly to RTV Bag Item rows so no other doctype is affected.
 */
frappe.form.link_formatters["Item"] = function (value, doc) {
	if (doc && doc.doctype === "RTV Bag Item" && doc.item_name) {
		return doc.item_name;
	}
	return value;
};
