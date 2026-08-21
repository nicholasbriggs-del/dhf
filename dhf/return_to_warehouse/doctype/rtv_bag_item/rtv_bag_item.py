# Copyright (c) 2026, DeHaat and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class RTVBagItem(Document):
	# begin: auto-generated types
	# This code is auto-generated. Do not modify anything in this block.

	from typing import TYPE_CHECKING

	if TYPE_CHECKING:
		from frappe.types import DF

		item_code: DF.Link
		qty: DF.Float
	# end: auto-generated types

	pass
