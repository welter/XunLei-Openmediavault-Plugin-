Ext.define("OMV.module.admin.service.transmissionbt.xunlei_util.fileList",
	{
            extend: "Ext.grid.Panel",
            selModel: {
            injectCheckbox: 0,
                    //type: "rowmodel",
		    	allowDeselect: true,
				mode: "MULTI",
				checkOnly: true     //只能通过checkbox选择
			},
			hidden:true,
			selType: "checkboxmodel",
			store:Ext.create("OMV.data.Store", {
			autoLoad: false,
			model:Ext.create("Ext.data.Model",{fields: [
				{name: 'name',    type: 'string'},
				{name: 'size',  type: 'string'},
				{name: 'type', type: 'string' }]})
			}),
			columns:[
			          	{text:_("name"),dataIndex:"name"},
			          	{text:_("size"),dataIndex:"size"},
			          	{text:_("type"),dataIndex:"type"}],
			loadData:function(data){
				var me=this;
				me.getStore().removeAll();
				for (var d in data){
					me.getStore().add({"name":d.name,"size":d.size,"type":d.type});
				}
			}
	}
);