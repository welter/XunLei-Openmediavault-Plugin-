/**
 * This file is part of OpenMediaVault.
 *
 * @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
 * @author    Volker Theile <volker.theile@openmediavault.org>
 * @copyright Copyright (c) 2009-2015 Volker Theile
 *
 * OpenMediaVault is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * OpenMediaVault is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with OpenMediaVault. If not, see <http://www.gnu.org/licenses/>.
 */
// require("js/omv/window/Window.js")
// require("js/omv/form/Panel.js")
//require("js/omv/module/admin/service/transmissionbt/xunlei_util/fileList.js")

/**
 * @ingroup webgui
 * @class OMV.window.Upload
 * @derived OMV.window.Window
 * @param service The name of the RPC service. Required.
 * @param method The name of the RPC method. Required.
 * @param params Additional RPC method parameters. Required.
 * @param title The dialog title.
 * @param waitMsg The displayed waiting message.
 */
Ext.define("OMV.module.admin.service.transmissionbt.xunlei_util.Upload", {
	extend: "OMV.window.Window",
	requires: [
		"OMV.form.Panel",
	],

	url: "upload.php",
	title: _("Upload file"),
	waitMsg: _("Uploading file ..."),
	width: 550,
	height: 330,
	layout: "fit",
	modal: true,
	buttonAlign: "center",
	resizable:false,
    neededSpace:0,
    totalSpace:0,
    path:"",
    downloadFolder:"",
	constructor: function() {
		var me = this;
		me.callParent(arguments);
		/**
		 * @event success
		 * Fires after the installation has been finished successful.
		 * @param this The window object.
		 * @param response The response from the form submit action.
		 */
	},

	initComponent: function() {
		var me = this;
		Ext.apply(me, {
			buttons: [{
				text: _("OK"),
				handler: me.onOkButton,
				scope: me
			},{
				text: _("Cancel"),
				handler: me.onCancelButton,
				scope: me
			}],
			items: [ me.fp = /*Ext.create("OMV.form.Panel", {
				bodyPadding: "5 5 0",
				items: [{
					xtype: "filefield",
					name: "file",
					fieldLabel: _("File"),
					allowBlank: false
				}]
			}) ,*/
			Ext.create("Ext.tab.Panel",{
				bodyPadding: "5 5 0",
			   items:[{
			   	    title:_("new normal file"),
			   	    items:[
			       me.tab1=Ext.create("Ext.form.Panel",{
			       	border:false,
			          items:[{
			          	xtype:"textarea",
			          	name: "fileUrl",
			          	labelAlign:"left",
			          	labelWidth:50,
			          	width: 500,
			             height:100,
			             labelStyle: "vertical-align : middle",
					     fieldLabel: _("File"),
					     listeners:{
					     	change: function (obj, newValue, oldValue, eOpts){
					     		me.loadUrlInformation(newValue);
					     	}
					     }
//					      allowBlank: false
			          },me.fileList1=Ext.create("OMV.module.admin.service.transmissionbt.xunlei_util.fileList"
			          ),{
			          	xtype:"fieldset",
			          	layout: "column",
			          	border: 0,
			          	padding:"20px 0 0 0",
			          	margin: "0 0 0 0",
			          	items:[{			          	
			            xtype: "combo",
			            labelAlign:"left",
			            labelWidth:50,
			            name: "category",
			            width:180,
			            fieldLabel: _("downloadpath"),
			                        emptyText: _("Select a category"),
                        allowNone: true,
			            allowBlank: true,
                        editable: false,
                        triggerAction: "all",
                        displayField: "name",
                        valueField: "uuid",
                        tpl:'<tpl for=".">' +  
                               '<div class="x-boundlist-item" style="height:20px;">' +  
                               '{name}&nbsp' +  
                               '</div>'+  
                               '</tpl>',
                        store: Ext.create("OMV.data.Store", {
               		    autoLoad: true,
                        model: OMV.data.Model.createImplicit({
                              fields: [
                                    { name: "uuid" , type: "string"},
                                    { name: "name", type: "string"},
                                    { name: "description", type: "string"}
                             ]
                        }),
                           proxy: {
                               type: "rpc",
                               rpcData: {
                                   service: "XunLei",
                                   method: "getDownloadCategorys"
                           },
                              appendSortParams: false
                          },
                          sorters: [{
                          direction: "ASC",
                          property: "name"
                          }]
            }),
                        listeners: {
                        	change: function( object, newValue, oldValue, eOpts ){
                        		var a=me.dfstore;
                        		a.clearFilter();
                        		if (newValue!=""){
                        		a.filterBy(function(record){
                        		    return (record.get('categoryref')==newValue);
                        		});
                        		}
                        		me.reloadDownloadPath();
                        	}
                        }
            }, me.dfcombo=Ext.create("Ext.form.field.ComboBox",
                       {xtype: "combo",
			            name: "downloadfolder",
			            width: 190,
			            emptyText: _("Select a downloadfolder"),
                        allowNone: false,
			            allowBlank: false,
                        editable: false,
                        triggerAction: "all",
                        displayField: "name",
                        valueField: "uuid",
                        listeners:{
                        	change: function ( obj, newValue){
                        		var v=me.dfcombo.getStore().findRecord("uuid",newValue).data;
                        		me.totalSpace=v.available;
                        		me.downloadFolder=v.actualfolder;
                        		me.reloadSpaceInformation();
                        		me.reloadDownloadPath();
                        	}
                        },
                        tpl:'<tpl for=".">' +  
                               '<div class="x-boundlist-item" style="height:20px;">' +  
                               '{name}&nbsp' +  
                               '</div>'+  
                               '</tpl>',
                        store: me.dfstore=Ext.create("OMV.data.Store", {
               		    autoLoad: true,
                        model: OMV.data.Model.createImplicit({
                        	idProperty: "uuid",
					        fields: [
						       { name: "uuid", type: "string" },
						       { name: "name",type: "string" },
					       	   { name: "categoryref", type: "string" },
                               { name: "mntentref", type: "string"},
						       { name: "actualfolder", type: "string" },
						       { name: "description",type: "string"},
						       { name: "available",type: "int"},
						       { name: "percentage", type: "int"},
						       { name:"categoryname",type :"string"}
					]
				}),
				    proxy: {
					    type: "rpc",
					    rpcData: {
						    service: "XunLei",
						    method: "getDownloadfolders"
					    },
					    appendSortParams: false
				    },
				    sorters: [{
					    direction: "ASC",
					    property: "categoryname"
			        }]
     		  	})
			            }),{
			            xtype:"textfield",
			            name:"path",
			            width:130,
			            listeners:{
			            	change: function(obj,newValue){
			            		me.path=newValue;
			            		me.reloadDownloadPath();
			            	}
			            }
			            }]
			          	},me.downloadPath=Ext.create("Ext.form.Label",{
			          		xtype:"label",
			          		name:"downloadPath",
			          		text:"",
			          		margin:"0 0 0 0",
			          		padding:"0 0 0 0",
			          		border:0,
			          		style:{
			          			color: "blue",
			          			"font-style":"italic",
			          			"font-size":"x-small",
			          			left:"55px"
			          		},
			          		editable:false
			          	}),{
			          	xtype:"fieldset",
			          	layout:"hbox",
			          	margin:"10px 0 0 0",
			          	padding:"0 0 0 0",
			          	border:0,
			          	items:[me.neededSpaceLabel=Ext.create("Ext.form.Label",{
			            margin:"5px 0 0 0",		            
//			            html:"所需空间:",
			            width:390,
			            })/*,me.spaceLabel=Ext.create("Ext.form.Label",{
			            xtype:"panel",
			            border:0,
			            height:20,
			            width:10
			            })*/,me.totalSpaceLabel=Ext.create("Ext.form.Label",{
			            margin:"5px 0 0 0",
//			            text:"剩余空间"
			            })]
			          	},me.spaceUsage=Ext.create("Ext.ProgressBar")
			          ]
			       }
			   )]},{
			       title:_("open local torrent"),
			       items:[
			       me.tab2=Ext.create("Ext.form.Panel",{
			       	border:false,
			          items:[{
			          	xtype:"textarea",
			          	name: "fileUrl",
			          	labelAlign:"left",
			          	labelWidth:50,
			          	width: 500,
			             height:100,
			             labelStyle: "vertical-align : middle",
					     fieldLabel: _("File"),
					     listeners:{
					     	change: function (obj, newValue, oldValue, eOpts){
					     		me.loadUrlInformation(newValue);
					     	}
					     }
//					      allowBlank: false
			          },me.fileList1=Ext.create("OMV.module.admin.service.transmissionbt.xunlei_util.fileList"
			          ),{
			          	xtype:"fieldset",
			          	layout: "column",
			          	border: 0,
			          	padding:"20px 0 0 0",
			          	margin: "0 0 0 0",
			          	items:[{			          	
			            xtype: "combo",
			            labelAlign:"left",
			            labelWidth:50,
			            name: "category",
			            width:180,
			            fieldLabel: _("downloadpath"),
			                        emptyText: _("Select a category"),
                        allowNone: true,
			            allowBlank: true,
                        editable: false,
                        triggerAction: "all",
                        displayField: "name",
                        valueField: "uuid",
                        tpl:'<tpl for=".">' +  
                               '<div class="x-boundlist-item" style="height:20px;">' +  
                               '{name}&nbsp' +  
                               '</div>'+  
                               '</tpl>',
                        store: Ext.create("OMV.data.Store", {
               		    autoLoad: true,
                        model: OMV.data.Model.createImplicit({
                              fields: [
                                    { name: "uuid" , type: "string"},
                                    { name: "name", type: "string"},
                                    { name: "description", type: "string"}
                             ]
                        }),
                           proxy: {
                               type: "rpc",
                               rpcData: {
                                   service: "XunLei",
                                   method: "getDownloadCategorys"
                           },
                              appendSortParams: false
                          },
                          sorters: [{
                          direction: "ASC",
                          property: "name"
                          }]
            }),
                        listeners: {
                        	change: function( object, newValue, oldValue, eOpts ){
                        		var a=me.dfstore;
                        		a.clearFilter();
                        		if (newValue!=""){
                        		a.filterBy(function(record){
                        		    return (record.get('categoryref')==newValue);
                        		});
                        		}
                        		me.reloadDownloadPath();
                        	}
                        }
            }, me.dfcombo=Ext.create("Ext.form.field.ComboBox",
                       {xtype: "combo",
			            name: "downloadfolder",
			            width: 190,
			            emptyText: _("Select a downloadfolder"),
                        allowNone: false,
			            allowBlank: false,
                        editable: false,
                        triggerAction: "all",
                        displayField: "name",
                        valueField: "uuid",
                        listeners:{
                        	change: function ( obj, newValue){
                        		var v=me.dfcombo.getStore().findRecord("uuid",newValue).data;
                        		me.totalSpace=v.available;
                        		me.downloadFolder=v.actualfolder;
                        		me.reloadSpaceInformation();
                        		me.reloadDownloadPath();
                        	}
                        },
                        tpl:'<tpl for=".">' +  
                               '<div class="x-boundlist-item" style="height:20px;">' +  
                               '{name}&nbsp' +  
                               '</div>'+  
                               '</tpl>',
                        store: me.dfstore=Ext.create("OMV.data.Store", {
               		    autoLoad: true,
                        model: OMV.data.Model.createImplicit({
                        	idProperty: "uuid",
					        fields: [
						       { name: "uuid", type: "string" },
						       { name: "name",type: "string" },
					       	   { name: "categoryref", type: "string" },
                               { name: "mntentref", type: "string"},
						       { name: "actualfolder", type: "string" },
						       { name: "description",type: "string"},
						       { name: "available",type: "int"},
						       { name: "percentage", type: "int"},
						       { name:"categoryname",type :"string"}
					]
				}),
				    proxy: {
					    type: "rpc",
					    rpcData: {
						    service: "XunLei",
						    method: "getDownloadfolders"
					    },
					    appendSortParams: false
				    },
				    sorters: [{
					    direction: "ASC",
					    property: "categoryname"
			        }]
     		  	})
			            }),{
			            xtype:"textfield",
			            name:"path",
			            width:130,
			            listeners:{
			            	change: function(obj,newValue){
			            		me.path=newValue;
			            		me.reloadDownloadPath();
			            	}
			            }
			            }]
			          	},me.downloadPath=Ext.create("Ext.form.Label",{
			          		xtype:"label",
			          		name:"downloadPath",
			          		text:"",
			          		margin:"0 0 0 0",
			          		padding:"0 0 0 0",
			          		border:0,
			          		style:{
			          			color: "blue",
			          			"font-style":"italic",
			          			"font-size":"x-small",
			          			left:"55px"
			          		},
			          		editable:false
			          	}),{
			          	xtype:"fieldset",
			          	layout:"hbox",
			          	margin:"10px 0 0 0",
			          	padding:"0 0 0 0",
			          	border:0,
			          	items:[me.neededSpaceLabel=Ext.create("Ext.form.Label",{
			            margin:"5px 0 0 0",		            
//			            html:"所需空间:",
			            width:390,
			            })/*,me.spaceLabel=Ext.create("Ext.form.Label",{
			            xtype:"panel",
			            border:0,
			            height:20,
			            width:10
			            })*/,me.totalSpaceLabel=Ext.create("Ext.form.Label",{
			            margin:"5px 0 0 0",
//			            text:"剩余空间"
			            })]
			          	},me.spaceUsage=Ext.create("Ext.ProgressBar")
			          ]
			       }
			   )
			       ]
			   }]   
			})]
		});
		me.callParent(arguments);
		me.reloadSpaceInformation();
	},

	/**
	 * Method that is called when the 'OK' button is pressed.
	 */
	onOkButton: function() {
		var me = this;
		var basicForm = me.fp.getForm();
		if(!basicForm.isValid())
			return;
		me.doUpload();
	},

	doUpload: function() {
		var me = this;
		var basicForm = me.fp.getForm();
		basicForm.submit({
			url: me.url,
			method: "POST",
			params: {
				service: me.service,
				method: me.method,
				params: !Ext.isEmpty(me.params) ? Ext.JSON.encode(
				  me.params).htmlspecialchars() : me.params
			},
			waitMsg: me.waitMsg,
			scope: me,
			success: function(form, action) {
				this.onUploadSuccess(form, action);
			},
			failure: function(form, action) {
				this.onUploadFailure(form, action);
			}
		});
	},

	/**
	 * Method that is called when the 'Cancel' button is pressed.
	 */
	onCancelButton: function() {
		this.close();
	},

	/**
	 * Method that is called when the file upload was successful.
	 * @param form The form that requested the action.
	 * @param action The Action object which performed the operation.
	 */
	onUploadSuccess: function(form, action) {
		var me = this;
		// !!! Attention !!! Fire event before window is closed,
		// otherwise the dialog's own listener is removed before the
		// event has been fired and the action has been executed.
		me.fireEvent("success", me, action.result);
		// Now close the dialog.
		me.close();
	},

	/**
	 * Method that is called when the file upload has been failed.
	 * @param form The form that requested the action.
	 * @param action The Action object which performed the operation.
	 */
	onUploadFailure: function(form, action) {
		var msg = action.response.responseText;
		try {
			// Try to decode JSON error messages.
			msg = Ext.JSON.decode(msg);
		} catch(e) {
			// Error message is plain text, e.g. error message from the
			// web server.
		}
		OMV.MessageBox.error(null, msg);
	},
    loadUrlInformation: function(value){
    	    var me=this;
    	    url=value;
    	    if (url.replace(/(^\s*)|(\s*$)/g, "")!='')
    	    {
    		OMV.Rpc.request({
			scope: me,
			callback: function (p1,p2,p3) {
				me.neededSpace=parseInt(p3.size);
                me.fileList1.loadData([{"name":p3.name,"size":p3.size,"type":p3.type}]);
                me.hide();
                me.fileList1.show();
                me.setHeight(330+me.fileList1.getHeight());
                me.show();
                },
			rpcData: {
				service: "XunLei",
				method: "urlCheck",
				params: {
//					uuid: record.get("uuid")
                    url
				}
			}
		})
    	    }
    	    else
    	    {
    	    	me.hide();
    	    	me.fileList1.hide();
    	    	me.setHeight(330);
    	    	me.show();
    	    };
    },
    reloadDownloadPath: function(){
    	var me=this;
    	var  t1=me.downloadFolder;
    	var t2=me.path;
    	if (t1!=null&&t2!=null)
    	           me.downloadPath.setText(me.downloadFolder+"\/"+me.path);
    },
    reloadSpaceInformation : function (){
    	    var me=this;
/*
    	     var text=_("totalSpace")+":"+ OMV.module.admin.service.transmissionbt.xunlei_util.Format.bytesToSize(me.totalSpace)+
    	           _("neededSpace")+":"+ OMV.module.admin.service.transmissionbt.xunlei_util.Format.bytesToSize(me.neededSpace);
    	     var sp=me.htmlSpace(125-text.length);
    	     var t=_("totalSpace")+":"+ OMV.module.admin.service.transmissionbt.xunlei_util.Format.bytesToSize(me.neededSpace)
    	          +sp+ _("neededSpace")+":"+ OMV.module.admin.service.transmissionbt.xunlei_util.Format.bytesToSize(me.totalSpace);
    	     me.neededSpaceLabel.setText( t,false);*/
    	    var t1=_("totalSpace")+":"+ OMV.module.admin.service.transmissionbt.xunlei_util.Format.bytesToSize(me.totalSpace);
    	    var t2=_("neededSpace")+":"+ OMV.module.admin.service.transmissionbt.xunlei_util.Format.bytesToSize(me.neededSpace);
    	    tm = new Ext.util.TextMetrics(),
            n = 520-tm.getWidth(t1 + ":");
            me.neededSpaceLabel.setText(t2);
            me.neededSpaceLabel.setWidth(n);
            me.totalSpaceLabel.setText(t1);
    	     if (me.totalSpace!=0){
    	     me.spaceUsage.setValue(me.neededSpace/me.totalSpace);}
    	     else {
    	     	me.spaceUsage.setValue(0);
    	     }
    },
    htmlSpace:function(len){
    	var r="";
    	for(var i=0;i<len;i++){
    		r=r+"&#160;";
    	};
    	return r;
    }
}
);