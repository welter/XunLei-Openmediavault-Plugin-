/**
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

// require("js/omv/util/Format.js")

Ext.ns("OMV.module.admin.service.transmissionbt.xunlei_util");

OMV.module.admin.service.transmissionbt.xunlei_util.Format = function() {
    var f = function() {};
    var o = function() {};
    f.prototype = OMV.util.Format;

    Ext.extend(o, f, function() {
        return {
            bytesToSize: function(bytes) {
                var sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

                if (bytes === 0)
                    return "n/a";

                var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);

                return ((i === 0) ? (bytes / Math.pow(1024, i)) : (bytes / Math.pow(1024, i)).toFixed(1)) + " " + sizes[i];
            },

            timeInterval: function(seconds) {
                var weeks = Math.floor(seconds / 604800),
                    days = Math.floor((seconds % 604800) / 86400),
                    hours = Math.floor((seconds % 86400) / 3600),
                    minutes = Math.floor((seconds % 3600) / 60),
                    secondsLeft = Math.floor(seconds % 60),
                    w = weeks + "w",
                    d = days + "d",
                    h = hours + "h",
                    m = minutes + "m",
                    s = secondsLeft + "s";

                if (weeks)
                    return w + " " + d;
                if (days)
                    return d + " " + h;
                if (hours)
                    return h + " " + m;
                if (minutes)
                    return m + " " + s;

                return s;
            },

            rate: function(Bps) {
                var speed = Math.floor(Bps / 1000);

                if (speed <= 999.95) // 0 KBps to 999 K
                    return [speed.toTruncFixed(0), "KB/s"].join(" ");

                speed /= 1000;

                if (speed <= 99.995) // 1 M to 99.99 M
                    return [speed.toTruncFixed(2), "MB/s"].join(" ");
                if (speed <= 999.95) // 100 M to 999.9 M
                    return [speed.toTruncFixed(1), "MB/s"].join(" ");

                // Insane speeds
                speed /= 1000;
                return [speed.toTruncFixed(2), "GB/s"].join(" ");
            },

            /** Renderers **/
            doneRenderer: function(value, metaData, record) {
            	   var state=parseInt(record.get("state"),10);
                var size = parseInt(record.get("size"), 10);
          		var progress=parseInt(value)/10000;
                var text = OMV.module.admin.service.transmissionbt.xunlei_util.Format.bytesToSize(size) + " (" + progress + "%)";
                var renderer = OMV.util.Format.progressBarRenderer(
                    progress, "");

                var progressBar=renderer.apply(this, arguments);
                var createTime=parseInt(record.get("createTime"), 10);
            		var completeTime=parseInt(record.get("completeTime"), 10);
            		var remainTime=parseInt(record.get("remainTime"), 10);
            		if (state==11)
            		{
            		if (completeTime==0)
            		  completeTime="--:--:--";
            		  else {
            		  	var dt = Ext.Date.parse(completeTime, "U");
            		  	completeTime=Ext.util.Format.date(dt, "Y-m-d");
            		  }
            		  value=_("Complete Time")+completeTime;
            		}
            		else
            		{
            		   var dt = Ext.Date.parse(createTime, "U");
            			createTime=Ext.util.Format.date(dt, "Y-m-d");
            			if (remainTime!=0) remainTime=OMV.module.admin.service.transmissionbt.xunlei_util.Format.timeInterval(remainTime)
            			    else remainTime="--";
            			var downTime=OMV.module.admin.service.transmissionbt.xunlei_util.Format.timeInterval(value);
            		    value=_("Create Time")+createTime+"<br>"+_("Down Time")+downTime+","+_("Remain Time")+remainTime;
            		}
            		return progressBar+"<br>"+value;
            },

            stateRenderer: function(value) {
                switch (value) {
                    case 0:
                        value = _("TASKSTATE_DOWNLOADING");
                        break;
                    case 8:
                        value = _("TASKSTATE_WAITING");
                        break;
                    case 9:
                        value = _("TASKSTATE_STOPPED");
                        break;
                    case 10:
                        value = _("TASKSTATE_PAUSED");
                        break;
                    case 11:
                        value = _("TASKSTATE_FINISHED");
                        break;
                    case 12:
                        value = _("TASKSTATE_FAILED");
                        break;
                    case 13:
                        value = _("TASKSTATE_UPLOADING");
                        break;
                    case 14:
                        value= _("TASKSTATE_SUBMITTING");
                    case 15:
                        value=_("TASKSTATE_DELETED");
                    case 16:
                        value=_("TASKSTATE_RECYCLED");
                    case 37:
                    	 value=_("TASKSTATE_SUSPENDED");
                    case 38:
                    	 value=_("TASKSTATE_ERROR");
                    default:
                        value = _("Missing Status: ") + value;
                        break;
                }

                return value;
            },

            etaRenderer: function(value) {
                switch (value) {
                    case -1:
                        value = _("Not available");
                        break;
                    case -2:
                        value = _("Unknown");
                        break;
                    default:
                        value = OMV.module.admin.service.transmissionbt.util.Format.timeInterval(value);
                        break;
                }

                return value;
            },

            peersRenderer: function(value, metaData, record) {
                var peersConnected = parseInt(record.get("connected_peers"), 10);
                var peersSendingToUs = parseInt(record.get("connected_peers_sending"), 10);

                value = peersSendingToUs + " / " + peersConnected;

                return value;
            },

            rateRenderer: function(value, metaData, record) {
            	   var vipOpened=parseInt(record.get("vip_opened"),10);
            	   var vipAvailable=parseInt(record.get("vip_available"),10);
            	   var lixianState=parseInt(record.get("lixian_state"),10);
            	   var taskId=parseInt(record.get("id"),10);
            		var speed=parseInt(record.get("speed"), 10);
            		var vip_speed=parseInt(record.get("vip_speed"), 10);
            		var lixian_speed=parseInt(record.get("lixian_speed"), 10);
                speed=OMV.module.admin.service.transmissionbt.xunlei_util.Format.rate(speed);
                vip_speed=OMV.module.admin.service.transmissionbt.xunlei_util.Format.rate(vip_speed);
                lixian_speed=OMV.module.admin.service.transmissionbt.xunlei_util.Format.rate(lixian_speed);
                if (vipAvailable==1) 
                {if (vipOpened!=1) 
                   {
                    var cmpId=this.getId();
                    //cmpId=cmpId.replace(/\'/g,'"');
                    var formatStr
                                   ='<a href="javascript:void(window.Ext.getCmp(\''
                                    +cmpId+'\').onOpenVip('+taskId+'))" > 打开</a>';
                    //var formatStr='<a href="#",onclick="test();" > 重试</a>';
                	 vip_speed=formatStr;

                   }}
               else {
                     vip_speed="没有开通";
               }
               switch (lixianState){ 
                case 1:
                    lixian_speed=_("Lixian Submitting");
                    break;
                case 4:
                    var cmpId=this.getId();
                    //cmpId=cmpId.replace(/\'/g,'"');
                    var formatStr
                                   ='<a href="javascript:void(window.Ext.getCmp(\''
                                    +cmpId+'\').onOpenLixian('+taskId+'))" > 重试</a>';
                    //var formatStr='<a href="#",onclick="test();" > 重试</a>';
                	 lixian_speed=_("fail")+formatStr;
                	 break;
            		}
                return _("Speed")+":"+speed+"<br>"+_("Vip Channel")+":"+vip_speed+", "+_("Lixian Channel")+":"+lixian_speed;
            },
            test:function()
            {
            	window.open();
            },
            timestampRenderer: function(value) {
                if (value <= 0)
                    return;

                var dt = Ext.Date.parse(value, "U");

                return Ext.util.Format.date(dt, "Y-m-d");
            },

            ratioRenderer: function(value) {
                switch (value) {
                    case -1:
                        value = _("Not available");
                        break;
                    case -2:
                        value = _("Infinite");
                        break;
                }

                return value;
            },
            downTimeRenderer:function(value, metaData, record) {
            		var createTime=parseInt(record.get("createTime"), 10);
            		var completeTime=parseInt(record.get("completeTime"), 10);
            		var remainTime=parseInt(record.get("remainTime"), 10);
            		if (completeTime==0)
            		  completeTime="--/--/--";
            		  else {
            		  	var dt = Ext.Date.parse(completeTime, "U");
            		  	completeTime=Ext.util.Format.date(dt, "Y-m-d");
            		  }
            		var dt = Ext.Date.parse(createTime, "U");
            		createTime=Ext.util.Format.date(dt, "Y-m-d");
            		remainTime=OMV.module.admin.service.transmissionbt.xunlei_util.Format.timeInterval(remainTime);
            		var downTime=OMV.module.admin.service.transmissionbt.xunlei_util.Format.timeInterval(value);
            		value=_("Create Time")+createTime+","+_("Complete time")+completeTime+"<br>"+_("Down time")+downTime+","+_("Remian time")+remainTime;
            		return value;
            }
            };
    }());

    return new o();
}();

Number.prototype.toTruncFixed = function(place) {
    var ret = Math.floor(this * Math.pow(10, place)) / Math.pow(10, place);
    return ret.toFixed(place);
};

Number.prototype.toStringWithCommas = function() {
    return this.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
};
