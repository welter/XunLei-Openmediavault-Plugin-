<?php 

class TaskClass{
    const RUNNING = 0;
    const COMPLETED = 1;
    const RECYCLED = 2;
    const FAILED_ON_SUBMISSION = 3;
}

class TaskState{
    const DOWNLOADING = 0;
    const WAITING = 8;
    const STOPPED = 9;
    const PAUSED = 10;
    const FINISHED = 11;
    const FAILED = 12;
    const UPLOADING = 13;
    const SUBMITTING = 14;
    const DELETED = 15;
    const RECYCLED = 16;
    const SUSPENDED = 37;
    const ERROR = 38;
}

class UrlCheckType{
    const Url = 1;  # ed2k/magnet/http ...
    const BitTorrentFile = 2;


# see definitions http://g.xunlei.com/forum.php?mod=viewthread&tid=30
   const GetSysInfo = array ("Return"=>null,  # 0 -> success
                                       "Network"=>null,  # 1 -> ok
                                       "License"=>null,
                                       "Bound"=>null,  # 1 -> bound
                                       "ActivateCode"=>null,  # str if Bound is 0 else ''
                                       "Mount"=>null,  # 1 -> ok
                                       "InternalVersion"=>null,
                                       "Nickname"=>null,
                                       "Unknown"=>null,
                                       "UserId"=>null,
                                       "VipLevel"=>null);


	const Settings = array('autoOpenVip'=>null,
                                   'slEndTime'=>null,
                                   'uploadSpeedLimit'=>null,
                                   'autoOpenLixian'=>null,
                                   'slStartTime'=>null,
                                   'autoDlSubtitle'=>null,
                                   'maxRunTaskNumber'=>null,
                                   'downloadSpeedLimit'=>null);
}


class LixianChannelState{
    const NOTUSED = 0;
    const SUBMITTING = 1;
    const DOWNLOADING = 2;
    const ACTIVATED = 3;
    const FAILED = 4;
}

class VipChannelState{
    const NOTUSED = 0;
    const SUBMITTING = 1;
    const ACTIVATED = 2;
    const FAILED = 3;
}
    ?>