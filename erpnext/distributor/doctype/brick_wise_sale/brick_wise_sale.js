// Copyright (c) 2021, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('Brick Wise Sale', {
    setup:function(frm){
        //set total value sale
        frm.compute_total_value_sale = function(frm,row){
			// console.log(frm)
            let total = 0;
            frm.doc.selling_product.forEach(d=>{
				// console.log(d)
                total = total + d.value;
            });
			if(total>0){
            console.log(total)
            frm.set_value('total_value',total);
        }}
		//set total stock value
		// frm.compute_total_stock_value = function(frm, row){
		// 	let total = 0;
		// 	frm.doc.selling_product.forEach(d=>{
		// 		total = total + d.total;
		// 	});
		// 	// console.log(total)
		// 	frm.set_value('total_value',total);
		// }
		
    },
    file:function(frm){
		cur_frm.clear_table("selling_product");
		cur_frm.refresh_fields();
		if(frm.doc.file){
			frappe.msgprint({
				title: __('File Upload Successfully.'),
				indicator: 'green',
				message: __('Now, You can click on the proceed button.')
			});			
		}
	},
    process_pdf:function(frm){
		cur_frm.clear_table("selling_product");
		cur_frm.refresh_fields();
		let pdf_file = frm.doc.file;
		frappe.show_progress('Reading pdf file..', 50, 100, 'Please wait');
		if(frm.doc.city){
		
			frappe.call({
				method: "erpnext.distributor.doctype.brick_wise_sale.brick_wise_sale.parse_pdf",
				args: {
					'pdf_file': pdf_file,
					'data_import':pdf_file,
					'parent_detail': {
						city:frm.doc.city,
						fromDate:frm.doc.from,
						toDate:frm.doc.to},
				},
				callback: function (r) {
					if(r.message){
						frappe.hide_progress();
					}
					var info = r.message;
					//get pdf length
                    console.log(info)
					// frappe.show_progress(__('Loading'),50,100,'Please Wait until the data load')
					
					// var time = 2000;
					var len = info.length;
					// cur_dialog.hide()
					// i = 0,j = array.length; i < j; i += chunk
					for (index = 0; index < len; index++) {
						let element = info[index];
						var child = cur_frm.add_child("selling_product");
					if(index == len){
						cur_dialog.hide()
					}
						for (let j = 0; j < element.length; j++) {
							let nested_element = element[j];
							// console.log(element[j])
							// setTimeout((j)=>{
							switch (j) {
								case 0:
									frappe.model.set_value(child.doctype, child.name, "product", nested_element)
									break;
								case 1:
									frappe.model.set_value(child.doctype, child.name, "product_name", nested_element);
									break;
								case 2:
									frappe.model.set_value(child.doctype, child.name, "brick", nested_element);
									break;	
								case 3:
									if (nested_element.includes(',')){
										frappe.model.set_value(child.doctype, child.name, "sale_qty", parseInt(nested_element.replace(/,/g, '')))
									}else{
									frappe.model.set_value(child.doctype, child.name, "sale_qty", parseInt(nested_element))	
									}break;
								case 4:
									frappe.model.set_value(child.doctype, child.name, "brick_parent", nested_element)
									break;
								case 5:
									// console.log(parseInt(nested_element))
									frappe.model.set_value(child.doctype, child.name, "product_price",parseFloat(nested_element))
									if(child.product_price && child.sale_qty){
										frappe.model.set_value(child.doctype, child.name, "value",child.sale_qty*child.product_price)	
									}
									break;	
								default:
									break;
							}
						// }, time)
							cur_frm.refresh_field("selling_product")
						}
						
												
					}
				
				}
			})
			
		}else{
			frappe.msgprint({
				title: __('Required Field'),
				indicator: 'yellow',
				message: __('Kindly mention the city name.')
			});	
		}
	
    }
});


frappe.ui.form.on('Brick Wise Sale Child',{
	
	sale_qty:function(frm,cdt,cdn){
		//grab the row
		let row = locals[cdt][cdn];
		if(row.sale_qty){
			frappe.model.set_value(cdt, cdn, 'value', row.sale_qty*row.product_price);
		}
		if(row.value){
			// console.log(row.value)
			frm.compute_total_value_sale(frm,row);
		}	
	},
	product_price:function(frm,cdt,cdn){
		let row = locals[cdt][cdn];
		console.log('here')
		if(row.sale_qty){
			frappe.model.set_value(cdt, cdn, 'value', row.sale_qty*row.product_price);
		}
		if(row.value){
			// console.log(row.value)
			frm.compute_total_value_sale(frm,row);
		}	
	}
	
});