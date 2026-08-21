# Copyright (c) 2026, DeHaat and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import flt


class RTVBag(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		bag_no: DF.Data
		customer: DF.Link
		items: DF.Table[RTVBagItem]
		scan_barcode: DF.Data | None
	# end: auto-generated types

	def validate(self):
		self.validate_duplicate_bag_no()
		self.validate_item_quantities()

	def validate_duplicate_bag_no(self):
		"""Bag No is manually entered and must be unique across RTV Bags."""
		duplicate = frappe.db.exists(
			"RTV Bag",
			{"bag_no": self.bag_no, "name": ("!=", self.name)},
		)
		if duplicate:
			frappe.throw(
				_("Bag No {0} is already used in RTV Bag {1}. Please enter a different Bag No.").format(
					frappe.bold(self.bag_no), frappe.bold(duplicate)
				),
				title=_("Duplicate Bag No"),
			)

	def validate_item_quantities(self):
		for item in self.items:
			if flt(item.qty) <= 0:
				frappe.throw(
					_("Row #{0}: Quantity must be greater than 0 for Item {1}.").format(
						item.idx, frappe.bold(item.item_code)
					),
					title=_("Invalid Quantity"),
				)
