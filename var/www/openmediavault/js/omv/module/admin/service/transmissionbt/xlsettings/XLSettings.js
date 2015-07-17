/**
 * Copyright (C) 2009-2012 Volker Theile <volker.theile@openmediavault.org>
 * Copyright (C) 2011-2012 Marcel Beck <marcel.beck@mbeck.org>
 * Copyright (C) 2013-2015 OpenMediaVault Plugin Developers
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// require("js/omv/WorkspaceManager.js")
// require("js/omv/workspace/form/Panel.js")
// require("js/omv/form/plugin/LinkedFields.js")
// require("js/omv/window/FolderBrowser.js")
// require("js/omv/Rpc.js")
// require("js/omv/data/Store.js")
// require("js/omv/data/Model.js")
// require("js/omv/data/proxy/Rpc.js")

Ext.define("OMV.module.admin.service.transmissionbt.xlsettings.XLSettings", {
    extend: "OMV.workspace.form.Panel",
	uses: [
		"OMV.data.Model",
		"OMV.data.Store",
		"OMV.window.FolderBrowser"
	],

    rpcService: "XunLei",
    rpcGetMethod: "getSettings",
    rpcSetMethod: "setSettings",

    initComponent: function() {
        var me=this;
//        me.on("beforesubmit",me.beforesubmit);
        me.store=Ext.create("OMV.data.Store", {
                model: OMV.data.Model.createImplicit({
					idProperty: "uuid",
					fields: [
						{ name: "uuid", type: "string" },
						{ name: "name", type: "string" },
						{ name: "description", type: "string" }
					]
				}),
				proxy: {
					type: "rpc",
					rpcData: {
						service: "ShareMgmt",
						method: "getCandidates"
					},
					appendSortParams: false
				},
				sorters: [{
					direction: "ASC",
					property: "devicefile"
				}]
			});
        me.store.load();
        me.callParent(arguments);
    },
    
    plugins: [{
        ptype: "linkedfields",
        correlations: [{
            name: [
                "blocklistsyncfrequency",
                "blocklisturl"
            ],
            conditions: [{
                name: "blocklistsyncenabled",
                value: true
            }],
            properties: [
                "!readOnly",
                "!allowBlank"
            ]
        }, {
            name: [
                "rpcusername",
                "rpcpassword"
            ],
            conditions: [{
                name: "rpcauthenticationrequired",
                value: true
            }],
            properties: [
                "!readOnly",
                "!allowBlank"
            ]
        }]
    }],

    getFormItems: function() {
        return [{
            xtype: "fieldset",
            title: _("General settings"),
            defaults: {
                labelSeparator: ""
            },
            items: [{
                xtype: "checkbox",
                name: "enable",
                fieldLabel: _("Enable"),
                checked: false
            }, {
            xtype: "fieldset",
            title: _("Auto login"),
            defaults: {
                labelSeparator: ""
            },
            items: [{
                   xtype: "checkbox",
                   name: "autologinenabled",
                   fieldLabel: _("Enable auto login"),
                   checked: false
                },{
                   xtype: "textfield",
                   name: "autologinusername",
                   fieldLabel: _("Username")
                }, {
                xtype: "passwordfield",
                name: "autologinpassword",
                fieldLabel: _("Password"),
                allowBlank: true,
                width: 300,
                value: "111",
                }]
            }]
            }, {
                xtype: "fieldset",
                title: _("Download settings"),
                defaults: {
                labelSeparator: ""
            },
            items: [{
                xtype: "numberfield",
                name: "maxjob",
                fieldLabel: _("Max job"),
                minValue: 1,
                maxValue: 5
            }, {
                xtype: "numberfield",
                name: "maxdownloadspeed",
                fieldLabel: _("Max download speed"),
                minValue: 0,
                maxValue: 10240
            }, {
                xtype: "numberfield",
                name: "maxuploadspeed",
                fieldLabel: _("Max upload speed"),
                minVaule: 0,
                maxValue: 10240
            }, {
                xtype: "fieldset",
                title: _("Download folders"),
                defaults: {
                labelSeparator: ""
            },
            items: [{
            	   xtype: "toolbar",
            	   items:[{
            	   	    xtype: "button",
                        text: "增加",
                        handler : this.onAddButton,
                        scope: this
            	   },{
            	   	    xtype: "button",
            	   	    text: "编辑",
                        handler: this.onEditButton,
                        scope: this
            	   },{
            	   	    xtype: "button",
            	   	    text: "删除",
                        handler: this.onDeleteButton,
                        scope: this
            	   }
           	   ]
            },  this.downloadfoldergrid=Ext.create("Ext.grid.Panel",{
                //title: 'Simpsons',
                //store: Ext.data.StoreManager.lookup('simpsonsStore'),
                columnLines: true,
                store: Ext.create("OMV.data.Store", {
				autoLoad: true,
				model: OMV.data.Model.createImplicit({
					//idProperty: "uuid",
					fields: [
						{ name: "uuid", type: "string" },
						{ name: "name",type: "string"},
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
     		  	}),
                selModel: {
                    injectCheckbox: 0,
                    //type: "rowmodel",
		            allowDeselect: true,
		            mode: "MULTI",
                    checkOnly: true     //只能通过checkbox选择
                },
                selType: "checkboxmodel",
                width: "100%",
                columns: [{
                    text: _("uuid"),
                    sortable: true,
                    hidden: true,
                    dataIndex: "uuid"
                },{
                	text:_("Name"),
                	dataIndex:  "name"
                },{
	          	    text: _("Download category"),
		            sortable: true,
                    dataIndex: "categoryname",
                    width: 150, 
                    renderer: function(value, cellmeta, record, rowIndex, columnIndex, store)
                    {
                        return "<span style='color:red;font-weight:bold;'>"+value+"</span>";
                        //return value;
                    }
            		//dataIndex: "sharedfoldername",
            		//stateId: "sharedfoldername"
    	        },{
                    text: _("mntentref"),
                    sortable: true,
                    dataIndex: "mntentref",
                    width: 250, 
                    renderer: function(value, cellmeta, record, rowIndex, columnIndex, store) {
                        var me=this;
                        //var a=me.ownerCt.ownerCt.ownerCt.store;
                        //var b=a.find("uuid",value);
 //                       if (b>=0) {
                            //code
                            return record.get("description");
//                        } else
//                        {
 //                           return value;
//                        }
                       
                    }
                    
                },{
            		text: _("Actualfolder"),
            		sortable: true,
	            	dataIndex: "actualfolder",
                    width: 250
            		//stateId: "client"
    	        }],
                disableSelection: false,
               })]
             }, {
                xtype: "fieldset",
                title: _("Download categorys"),
                defaults: {
                labelSeparator: ""
            },
            items: [{
            	   xtype: "toolbar",
            	   items:[{
            	   	    xtype: "button",
                        text: "增加",
                        handler : this.onCategoryAddButton,
                        scope: this
            	   },{
            	   	    xtype: "button",
            	   	    text: "编辑",
                        handler: this.onCategoryEditButton,
                        scope: this
            	   },{
            	   	    xtype: "button",
            	   	    text: "删除",
                        handler: this.onCategoryDeleteButton,
                        scope: this
            	   }
           	   ]
            },  this.downloadcategorygrid=Ext.create("Ext.grid.Panel",{
                //title: 'Simpsons',
                //store: Ext.data.StoreManager.lookup('simpsonsStore'),
                columnLines: true,
                store: Ext.create("OMV.data.Store", {
				autoLoad: true,
				model: OMV.data.Model.createImplicit({
					//idProperty: "uuid",
					fields: [
						{ name: "uuid", type: "string" },
						{ name: "name", type: "string" },
                        { name: "description", type: "string"},
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
                selModel: {
                    injectCheckbox: 0,
                    //type: "rowmodel",
		            allowDeselect: true,
		            mode: "MULTI",
                    checkOnly: true     //只能通过checkbox选择
                },
                selType: "checkboxmodel",
                width: "100%",
                columns: [{
                    text: _("uuid"),
                    sortable: true,
                    hidden: true,
                    dataIndex: "uuid"
                },{
	          	    text: _("name"),
		            sortable: true,
                    dataIndex: "name",
                    width: 150
    	        },{
                    text: _("description"),
                    sortable: true,
                    dataIndex: "description",
                    width: 250                    
                }],
                disableSelection: false,
               })]
             }]
        }];
    },
    onAddButton: function() {
		var me = this;
		Ext.create("OMV.module.admin.service.transmissionbt.xlsettings.Downloadfolder", {
			title: _("Add download folder"),
			uuid: OMV.UUID_UNDEFINED,
            currentCategory: -1,
//            categoryref:"3e9d4ef9-0d93-4a8b-8ad3-034dd44319f9",
			listeners: {
				scope: me,
				submit: function() {
//					me.doReload();
                    me.downloadfoldergrid.getStore().reload();
				},
				exception: function(c) {
					// Reload the grid content in case of a failure, too.
					me.doReload();
				}
			}
		}).show();      
    },
    onEditButton: function() {
		var me = this;
		var selModel = me.downloadfoldergrid.getSelectionModel();
		var record = selModel.getSelection()[0];
		var w=Ext.create("OMV.module.admin.service.transmissionbt.xlsettings.Downloadfolder", {
			  title: _("Edit download folder"),
			  uuid: record.get("uuid"),
              currentCategory: record.get("categoryref"),
			  listeners: {
				  scope: me,
				  submit: function() {
					  me.downloadfoldergrid.getStore().reload();
				  }
			  }
		  });
        var b=w.getDockedItems("combo");
        w.show();
	},
    onDeleteButton: function() {
//        var me=this.ownerCt.ownerCt;
        var me=this;
        var selModel = me.downloadfoldergrid.getSelectionModel();
        var records=selModel.getSelection();
        var uuids=new Array();
 //       record.length;
        for (var i=0;i<records.length;i++) {
            //code
            uuids[i] ={"uuid":records[i].get("uuid")};
        }
        var param={"uuids":uuids};
		OMV.Rpc.request({
			scope: me,
			callback: function () {
                me.downloadfoldergrid.getStore().reload();
                },
			rpcData: {
				service: "XunLei",
				method: "deleteDownloadfolders",
				params: {
//					uuid: record.get("uuid")
                    uuids
				}
			}
		});
    },
    onCategoryAddButton:function(){
 		var me = this;
		Ext.create("OMV.module.admin.service.transmissionbt.xlsettings.DownloadCategory", {
			title: _("Add download category"),
			uuid: OMV.UUID_UNDEFINED,
			listeners: {
				scope: me,
				submit: function() {
                    me.downloadcategorygrid.getStore().reload();
				},
				exception: function(c) {
					me.doReload();
				}
			}
		}).show();      
    	},
    onCategoryEditButton:function(){
		var me = this;
		var selModel = me.downloadcategorygrid.getSelectionModel();
		var record = selModel.getSelection()[0];
		var w=Ext.create("OMV.module.admin.service.transmissionbt.xlsettings.DownloadCategory", {
			  title: _("Edit download category"),
			  uuid: record.get("uuid"),
			  listeners: {
				  scope: me,
				  submit: function() {
					  me.downloadcategorygrid.getStore().reload();
				  }
			  }
		  });
        var b=w.getDockedItems("combo");
        w.show();
    },
    onCategoryDeleteButton:function(){
        var me=this;
        var selModel = me.downloadcategorygrid.getSelectionModel();
        var records=selModel.getSelection();
        var uuids=new Array();
 //       record.length;
        for (var i=0;i<records.length;i++) {
            //code
            uuids[i] ={"uuid":records[i].get("uuid")};
        }
        var param={"uuids":uuids};
		OMV.Rpc.request({
			scope: me,
			callback: function () {
                me.downloadcategorygrid.getStore().reload();
                },
			rpcData: {
				service: "XunLei",
				method: "deleteDownloadCategory",
				params: {
//					uuid: record.get("uuid")
                    uuids
				}
			}
		});
    },
    beforesubmit: function(obj,options) {
        var c=options.rpcData.params;
        var g=me.downloadfoldergrid;
        var s=g.getStore();
        var d=new Array();
        for(var i =0;i<s.getCount();i++){
                 var record=s.getAt(i);
    //             var v=JSON.stringify(record);
                 //c.downloadfolder=JSON.stringify(record);
                 d[i] ={"uuid":record.get("uuid"),
                 "mntentref":record.get("mntentref"),
                 "actualfolder":record.get("actualfolder"),
                 "categoryref":record.get("categoryref")
                 };
        }
        //var d2=JSON.stringify(d);
        c.downloadfolder=d;
        return true;
        //var d=s.getData();
    }
});

Ext.apply(Ext.form.VTypes, {

    transmissionbturl: function(v) {
        return (/^[a-z0-9]+$/i).test(v);
    },
    transmissionbturiText: _("Invalid path."),
    transmissionbturiMask: /[a-z0-9\-_]/i

});
Ext.define("OMV.module.admin.service.transmissionbt.xlsettings.Downloadfolder", {
	extend: "OMV.workspace.window.Form",
	requires: [
		"OMV.workspace.window.plugin.ConfigObject"
	],
	uses: [
		"OMV.data.Model",
		"OMV.data.Store",
		"OMV.window.FolderBrowser"
	],

	rpcService: "XunLei",
	rpcGetMethod: "getDownloadfolder",
	rpcSetMethod: "setDownloadfolder",
	plugins: [{
		ptype: "configobject"
	}],
	width: 500,

	/**
	 * The class constructor.
	 * @fn constructor
	 * @param uuid The UUID of the database/configuration object. Required.
	 */

	getFormConfig: function() {
		return {
			layout: {
				type: "vbox",
				align: "stretch"
			}
		};
	},

	getFormItems: function() {
		var me = this;
		return [{
			xtype: "textfield",
			fieldLabel:_("name"),
			emptyText:_("Input download folder name"),
			name: "name",
			allowNone:false,
			allowBlank:false
		},{
			xtype: "combo",
			name: "categoryref",
			fieldLabel: _("Download category"),
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
//            listeners: {
//                show : function() {
                  //this.setValue(this.getValue);
                //}
            //},
            store: Ext.create("OMV.data.Store", {
                autoLoad: true,
                model: OMV.data.Model.createImplicit({
                    idProperty: "uuid",
                    fields: [
                        { name: "uuid" , type: "string"},
                        { name: "name", type: "string"},
                        { name: "description", type: "string"}
                    ]
                }),
          /*      listeners: {
                    load: function(stor,records, successful, eOpts) {
                    for(var i =0;i<stor.getCount();i++){
                        var a=Number(records[i].get("availableDrivers")+66);
                        records[i].set("driverPath",String.fromCharCode(a)+":\\TDDOWNLOAD\\");
                        //records[i].set("simulatedfolder",records[i].get("avaiableDrivers"));
                    }
                    successful=true;
                }
              },*/
                proxy: {
                    type: "rpc",
                    rpcData: {
                        service: "XunLei",
                        method: "getDownloadCategorys",
                    },
                    appendSortParams: false
                },
                sorters: [{
                    direction: "ASC",
                    property: "name"
                }]
            })
//			readOnly: true,
		},{
			xtype: "combo",
			name: "mntentref",
			fieldLabel: _("Volume"),
			emptyText: _("Select a volume ..."),
			allowBlank: false,
			allowNone: false,
			editable: false,
			triggerAction: "all",
			displayField: "description",
			valueField: "uuid",
			store: Ext.create("OMV.data.Store", {
				autoLoad: true,
                model: OMV.data.Model.createImplicit({
					idProperty: "uuid",
					fields: [
						{ name: "uuid", type: "string" },
						{ name: "devicefile", type: "string" },
						{ name: "description", type: "string" },
                        { name: "other", type: "string" }
					]
				}),
				proxy: {
					type: "rpc",
					rpcData: {
						service: "ShareMgmt",
						method: "getCandidates"
					},
					appendSortParams: false
				},
				sorters: [{
					direction: "ASC",
					property: "devicefile"
				}]
			})
		},{
			xtype: "textfield",
			name: "actualfolder",
			fieldLabel: _("Path"),
			allowBlank: false,
			triggers: {
				folder: {
					cls: Ext.baseCSSPrefix + "form-folder-trigger",
					handler: "onTriggerClick"
				}
			},
			plugins: [{
				ptype: "fieldinfo",
				text: _("The path of the folder to share. The specified folder will be created if it does not already exist."),
			}],
			onTriggerClick: function() {
				// Get the UUID of the selected volume.
				var field = me.findField("mntentref");
				var value = field.getValue();
				if (Ext.isUUID(value)) {
					Ext.create("OMV.window.FolderBrowser", {
						uuid: value,
						listeners: {
							scope: this,
							select: function(wnd, node, path) {
								// Set the selected path.
								this.setValue(path);
							}
						}
					}).show();
				} else {
					OMV.MessageBox.info(null, _("Please first select a volume."));
				}
			}
		}];
	},

	doSubmit: function() {
		var me = this;
		if (OMV.UUID_UNDEFINED == me.uuid) {
			// Call the parent method if the shared folder is added.
			me.callParent(arguments);
		} else {
			// If the shared folder already exists then check if the volume
			// or relative path has been changed. In this case the shared
			// folder will be relocated which requires a confirmation from
			// the user.
			var isDirty = false;
			Ext.Array.each([ "categoryref", "mntentref", "actualfolder" ], function(name) {
				var field = me.findField(name);
				if (Ext.isObject(field) && field.isFormField && field.isDirty())
					isDirty = true;
			}, me);
			if (true === isDirty) {
				OMV.MessageBox.show({
					title: _("Confirmation"),
					msg: _("Do you really want to relocate the shared folder? The content of the shared folder will not be moved automatically, you have to do this yourself."),
					icon: Ext.Msg.QUESTION,
					buttons: Ext.Msg.YESNO,
					fn: function(answer) {
						if (answer == "yes") // Continue ...
							me.superclass.doSubmit.apply(this, arguments);
						else // Close the window and exit.
							this.close();
					},
					scope: me,
					icon: Ext.Msg.QUESTION
				});
			} else {
				me.callParent(arguments);
			}
		}
	}
});
Ext.define("OMV.module.admin.service.transmissionbt.xlsettings.DownloadCategory", {
	extend: "OMV.workspace.window.Form",
	requires: [
		"OMV.workspace.window.plugin.ConfigObject"
	],
	uses: [
		"OMV.data.Model",
		"OMV.data.Store",
		"OMV.window.FolderBrowser"
	],

	rpcService: "XunLei",
	rpcGetMethod: "getDownloadCategory",
	rpcSetMethod: "setDownloadCategory",
	plugins: [{
		ptype: "configobject"
	}],
	width: 500,

	/**
	 * The class constructor.
	 * @fn constructor
	 * @param uuid The UUID of the database/configuration object. Required.
	 */

	getFormConfig: function() {
		return {
			layout: {
				type: "vbox",
				align: "stretch"
			}
		};
	},

	getFormItems: function() {
		var me = this;
		return [{
			xtype: "textfield",
			name: "name",
			fieldLabel: _("Name"),
			emptyText: _("Input name"),
			allowBlank: false,
			allowNone: false,
			editable: true
		},{
			xtype: "textarea",
			name: "description",
			fieldLabel: _("Description"),
			allowBlank: true
		}];
	},

	doSubmit: function() {
		var me = this;
		if (OMV.UUID_UNDEFINED == me.uuid) {
			// Call the parent method if the shared folder is added.
			me.callParent(arguments);
		} else {
			// If the shared folder already exists then check if the volume
			// or relative path has been changed. In this case the shared
			// folder will be relocated which requires a confirmation from
			// the user.
			var isDirty = false;
			Ext.Array.each([ "name", "description" ], function(name) {
				var field = me.findField(name);
				if (Ext.isObject(field) && field.isFormField && field.isDirty())
					isDirty = true;
			}, me);
			if (true === isDirty) {
				OMV.MessageBox.show({
					title: _("Confirmation"),
					msg: _("is delete."),
					icon: Ext.Msg.QUESTION,
					buttons: Ext.Msg.YESNO,
					fn: function(answer) {
						if (answer == "yes") // Continue ...
							me.superclass.doSubmit.apply(this, arguments);
						else // Close the window and exit.
							this.close();
					},
					scope: me,
					icon: Ext.Msg.QUESTION
				});
			} else {
				me.callParent(arguments);
			}
		}
	}
});
