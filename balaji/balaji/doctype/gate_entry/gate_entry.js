frappe.ui.form.on('Gate Entry', {
    shipment_number: function (frm) {
        if (frm.doc.shipment_number) {
            frappe.call({
                method: 'frappe.client.get',
                args: {
                    doctype: 'Shipment',
                    name: frm.doc.shipment_number
                },
                callback: function (r) {
                    if (r.message) {
                        const shipment = r.message;
                        frm.clear_table('shipment_table');

                        const delivery_notes = shipment.shipment_delivery_note || [];
                        let promises = [];

                        delivery_notes.forEach(row => {
                            const delivery_note = row.delivery_note;

                            const p = new Promise((resolve) => {
                                frappe.call({
                                    method: 'balaji.balaji.doctype.gate_entry.gate_entry.get_sales_invoice_from_delivery_note',
                                    args: { delivery_note },
                                    callback: function (res) {
                                        const new_row = frm.add_child('shipment_table');
                                        new_row.delivery_challan = delivery_note;
                                        new_row.invoice_number = res.message?.sales_invoice || null;
                                        new_row.customer_name = res.message?.customer || null;
                                        resolve();
                                    }
                                });
                            });

                            promises.push(p);
                        });

                        Promise.all(promises).then(() => {
                            frm.refresh_field('shipment_table');
                        });
                    }
                }
            });
        }
    },
    supplier_delivery_challan: function(frm) {
        if (frm.doc.supplier_name && frm.doc.supplier_delivery_challan) {
            frm.set_value('data_qdlw', frm.doc.supplier_name + frm.doc.supplier_delivery_challan);
        }
    },
    supplier_name: function(frm) {
        if (frm.doc.supplier_name && frm.doc.supplier_delivery_challan) {
            frm.set_value('data_qdlw', frm.doc.supplier_name + frm.doc.supplier_delivery_challan);
        }
    },
    subcontractor_delivery_challan_copy: function(frm) {
        if (frm.doc.subcontractor_name && frm.doc.subcontractor_delivery_challan_copy) {
            frm.set_value('data_licz', frm.doc.subcontractor_name + frm.doc.subcontractor_delivery_challan_copy);
        }
    },
    subcontractor_name: function(frm) {
        if (frm.doc.subcontractor_name && frm.doc.subcontractor_delivery_challan_copy) {
            frm.set_value('data_licz', frm.doc.subcontractor_name + frm.doc.subcontractor_delivery_challan_copy);
        }
    },
    refresh: function (frm) {
        frm.set_query('subcontracting_order_number1', () => {
            return {
                query: 'balaji.balaji.doctype.gate_entry.gate_entry.get_subcontract',
                filters: {
                    stock_entry_type: 'Send to Subcontractor'
                }
            }
        }),
        frm.set_query('subcontracting_order_number', () => {
            return {
                query: 'balaji.balaji.doctype.gate_entry.gate_entry.get_subcontract',
                filters: {
                    stock_entry_type: 'Send to Subcontractor'
                }
            }
        },
        frm.set_query('transporter_name', function() {
            return {
                filters: {
                    is_transporter: 1,
                }
            };
        }),
    )
    },
    subcontracting_order_number1: function(frm) {
        if (frm.doc.subcontracting_order_number1) {
            frappe.call({
                method: 'balaji.balaji.doctype.gate_entry.gate_entry.get_supplier_name',
                args: {
                    subcontracting_order_number: frm.doc.subcontracting_order_number1
                },
                callback: function(r) {
                    if (r.message) {
                        frm.set_value('subcontractor_name1', r.message);
                    }
                }
            });
        }
    },
    subcontracting_order_number: function(frm) {
        if (frm.doc.subcontracting_order_number) {
            frappe.call({
                method: 'balaji.balaji.doctype.gate_entry.gate_entry.get_supplier_name',
                args: {
                    subcontracting_order_number: frm.doc.subcontracting_order_number
                },
                callback: function(r) {
                    if (r.message) {
                        frm.set_value('subcontractor_name', r.message);
                    }
                }
            });
        }
    },
    entry_type: function(frm) {
        update_data_licz(frm);
    },
    sub_type: function(frm) {
        update_data_licz(frm);
    }
    
});

function update_data_licz(frm) {
    if (frm.doc.entry_type == 'Inward Entry' && frm.doc.sub_type == 'Purchase') {
        frm.set_value('shipment_number','');
        frm.clear_table('shipment_table');
        frm.set_value('subcontracting_order_number1', '');
        frm.set_value('subcontractor_name1','');
        frm.set_value('subcontracting_order_number','');
        frm.set_value('subcontractor_name','');
        frm.set_value('subcontractor_delivery_challan_copy','');
        frm.set_value('data_licz','');
        frm.refresh_fields();
    }
    if (frm.doc.entry_type == 'Outward Entry' && frm.doc.sub_type == 'Sales') {
        frm.set_value('supplier_name','');
        frm.set_value('supplier_delivery_challan','');
        frm.set_value('supplier_invoice','');
        frm.set_value('data_qdlw','');
        frm.set_value('subcontracting_order_number1', '');
        frm.set_value('subcontractor_name1','');
        frm.set_value('subcontracting_order_number','');
        frm.set_value('subcontractor_name','');
        frm.set_value('subcontractor_delivery_challan_copy','');
        frm.set_value('data_licz','');
        frm.refresh_fields();
    }
    if (frm.doc.entry_type == 'Outward Entry' && frm.doc.sub_type == 'Subcontracting') {
        frm.set_value('supplier_name','');
        frm.set_value('supplier_delivery_challan','');
        frm.set_value('supplier_invoice','');
        frm.set_value('data_qdlw','');
        frm.set_value('shipment_number','');
        frm.clear_table('shipment_table');
        frm.set_value('shipment_number','');
        frm.clear_table('shipment_table');
        frm.set_value('subcontracting_order_number','');
        frm.set_value('subcontractor_name','');
        frm.set_value('subcontractor_delivery_challan_copy','');
        frm.set_value('data_licz','');
        frm.refresh_fields();
    }
    if (frm.doc.entry_type == 'Intward Entry' && frm.doc.sub_type == 'Subcontracting') {
        frm.set_value('supplier_name','');
        frm.set_value('supplier_delivery_challan','');
        frm.set_value('supplier_invoice','');
        frm.set_value('data_qdlw','');
        frm.set_value('subcontracting_order_number1', '');
        frm.set_value('subcontractor_name1','');
        frm.set_value('shipment_number','');
        frm.clear_table('shipment_table');
        frm.set_value('shipment_number','');
        frm.clear_table('shipment_table');
        frm.refresh_fields();
    }
    
}