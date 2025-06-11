# Copyright (c) 2025, Abhishek Prakash and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document


class GateEntry(Document):
    def on_submit(doc):
        if doc.entry_type == 'Outward Entry' and doc.sub_type == 'Sales':
            for i in doc.shipment_table:
                frappe.db.set_value('Sales Invoice',i.invoice_number,'custom_gate_entry',doc.name)
                frappe.db.set_value('Delivery Note',i.delivery_challan,'custom_gate_entry',doc.name)
            frappe.db.set_value('Shipment',doc.shipment_number,'custom_gate_entry',doc.name)
            
        if doc.entry_type == 'Outward Entry' and doc.sub_type == 'Subcontracting':
            frappe.db.set_value('Subcontracting Order',doc.subcontracting_order_number1,'custom_gate_entry',doc.name)


@frappe.whitelist()
def get_sales_invoice_from_delivery_note(delivery_note):
    invoice = frappe.db.get_value(
        "Sales Invoice Item",
        {"delivery_note": delivery_note},
        "parent"
    )

    customer = frappe.db.get_value(
        "Delivery Note",
        delivery_note,
        "customer"
    )

    return {
        "sales_invoice": invoice,
        "customer": customer
    }

@frappe.whitelist()
def get_subcontract(doctype, txt, searchfield, start, page_len, filters):
    return frappe.db.sql("""
        SELECT subcontracting_order 
        FROM `tabStock Entry`
        WHERE stock_entry_type = 'Send to Subcontractor'
        AND subcontracting_order IS NOT NULL
		AND docstatus=1
        GROUP BY subcontracting_order
    """)

@frappe.whitelist()
def get_supplier_name(subcontracting_order_number):
    if not subcontracting_order_number:
        return None

    supplier_name = frappe.db.get_value('Subcontracting Order', subcontracting_order_number, 'supplier_name')
    return supplier_name
