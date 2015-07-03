/**
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
// require("js/omv/workspace/tab/Panel.js")
// require("js/omv/module/admin/service/transmissionbt/torrents/TorrentList.js")
// require("js/omv/module/admin/service/transmissionbt/tbsettings/TBSettings.js")
// require("js/omv/module/admin/service/transmissionbt/xlsettings/XLSettings.js")


Ext.define("OMV.module.admin.service.transmissionbt.Settings", {
    extend: "OMV.workspace.tab.Panel",
    requires: [
        "OMV.module.admin.service.transmissionbt.tbsettings.TBSettings",
        "OMV.module.admin.service.transmissionbt.xlsettings.XLSettings"
    ]
,

    initComponent: function() {
        Ext.apply(this, {
            items: [
                Ext.create("OMV.module.admin.service.transmissionbt.tbsettings.TBSettings", {
                    title: _("TBSettings")
                }),
               Ext.create("OMV.module.admin.service.transmissionbt.xlsettings.XLSettings", {
                    title: _("XLSettings")
                })
            ]
        });

        this.callParent(arguments);
    }
});

OMV.WorkspaceManager.registerPanel({
    id: "DownloadSettings",
    path: "/service/transmissionbt",
    text: _("Settings"),
    position: 10,
    className: "OMV.module.admin.service.transmissionbt.Settings"
});
