<?php

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

require_once "openmediavault/error.inc";
require_once "openmediavault/notify.inc";
require_once "openmediavault/object.inc";
require_once("openmediavault/system.inc");
require_once("openmediavault/functions.inc");
require_once "openmediavault/rpc.inc";
require_once "openmediavault/util.inc";
require_once "xunlei/IXWareClient.php";
require_once "xunlei/XWareClient.php";

class OMVRpcServiceXunLei extends OMVRpcServiceAbstract
{
    static $XunLeiDownloadDir="/XunLeiDownload";
    /* Helpers */
    private function getEventMessagePath()
    {
        return "org.openmediavault.services.xunlei";
    }

    private function getXPath()
    {
        return "//services/xunlei";
    }

    public function getDownloadfoldersXPath()
    {
        return sprintf("%s/downloadfolders", $this->getXPath());
    }
    public function getCategorysXPath()
    {
        return sprintf("%s/ categorys", $this->getXPath());
    }   
    public function getAvailableDriversXPath()
    {
        return sprintf("%s/availableDrivers", $this->getXPath());
    }

    public function getQueuingXPath()
    {
        return sprintf("%s/availableDrivers", $this->getXPath());
    }

    public function getPeerXPath()
    {
        return sprintf("%s/modules/peer", $this->getXPath());
    }

    public function getSchedulingXPath()
    {
        return sprintf("%s/modules/scheduling", $this->getXPath());
    }

    /**
     * Get the RPC service name
     */
    public function getName()
    {
        return "XunLei";
    }

    /**
     * Initialize the RPC service
     */
    public function initialize()
    {
        $this->registerMethod("getSettings");
        $this->registerMethod("setSettings");
        $this->registerMethod("getDownloadfolders");
        $this->registerMethod("setDownloadfolder");
        $this->registerMethod("getDownloadfolder");
        $this->registerMethod("deleteDownloadfolders");
        $this->registerMethod("getAvailableDrivers");
        $this->registerMethod("testRpc");
        $this->registerMethod("openVipChannel");
        $this->registerMethod("openLixianChannel");
        $this->registerMethod("getScheduling");
        $this->registerMethod("setScheduling");

        // Torrent management functions
        $this->registerMethod("serverIsRunning");
        $this->registerMethod("getJobList");
        $this->registerMethod("addTorrent");
        $this->registerMethod("getBoxSpace");
        $this->registerMethod("getDownloadCategorys");
         $this->registerMethod("getDownloadCategory");
         $this->registerMethod("setDownloadCategory");
         $this->registerMethod("deleteDownloadCategory");
        $this->registerMethod("uploadTorrent");
        $this->registerMethod("deleteTorrent");
        $this->registerMethod("pauseTorrent");
        $this->registerMethod("resumeTorrent");
        $this->registerMethod("queueMoveTorrent");
    }

    /**
     * Get general settings.
     *
     * @throws E_CONFIG_GET_OBJECT_FAILED
     *
     * @return array
     */
    public function getSettings($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Get configuration object
        $object = $xmlConfig->get($this->getXPath());
        if (is_null($object)) {
            throw new OMVException(
                OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
                $this->getXPath()
            );
        }

        // Modify result object
        $object["enable"] = boolval($object["enable"]);
        $object["autologinenabled"] = boolval($object["autologinenabled"]);
        $object["autologinusername"] = trim($object["autologinusername"],"");
        $object["autologinpassword"] = trim($object["autologinpassword"],"");
        $object["maxjob"] = intval($object["maxjob"]);
        $object["maxdownloadspeed"] = intval($object["maxdownloadspeed"]);
        $object["maxuploadspeed"] = intval($object["maxuploadspeed"]);
        unset($object["downloadfolder"]);
        unset($object["availableDrivers"]);
        unset($object['categorys']);
        return $object;
    }

    /**
     * Set general settings.
     *
     * @throws E_CONFIG_GET_OBJECT_FAILED
     * @throws E_CONFIG_SET_OBJECT_FAILED
     * @throws E_CONFIG_SAVE_FAILED
     *
     * @return array
     */
    public function setSettings($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));
/*        $gg='{
                "type": "object",
                "properties": {
                    "enable": {
                        "type": "boolean"
                    },
                    "autologinenabled": {
                        "type": "boolean"
                    },
                    "autologinusername": {
                        "type": "string"
                    },
                    "autologinpassword": {
                        "type": "string"
                    },
                    "maxjob": {
                        "type": "integer",
                        "minimum": 1,
                        "maximum": 5
                    },
                    "maxdownloadspeed": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 10240
                    },
                    "maxuploadspeed": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 10240
                    },
                    "downloadfolder": {
                        "type": "array",
                        "items": {
                        "type": "object",
                        "properties": {
                            "uuid": {"type": "string"},
                            "actualfolder": {"type": "string"},
                            "simulatedfolder": {"type": "string"}
                            }
                        }
                    }
                }
            }';*/
//       throw new Exception($gg,5);
        // Validate the parameters of the RPC service method.
        $this->validateMethodParams(
            $params,
            '{
                "type": "object",
                "properties": {
                    "enable": {
                        "type": "boolean"
                    },
                    "autologinenabled": {
                        "type": "boolean"
                    },
                    "autologinusername": {
                        "type": "string"
                    },
                    "autologinpassword": {
                        "type": "string"
                    },
                    "maxjob": {
                        "type": "integer",
                        "minimum": 1,
                        "maximum": 5
                    },
                    "maxdownloadspeed": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 10240
                    },
                    "maxuploadspeed": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 10240
                    }
                }
            }'
        );
/*
 *,
                    "downloadfolders": {
                        "type": "array",
                        "items": {
                        "type": "object",
                        "properties": {
                            "uuid": {"type": "string"},
                            "mntentref": {"type": "string"},
                            "actualfolder": {"type": "string"},
                            "simulatedfolder": {"type": "string"}
                            }
                        }
                    }
*/        
        // Get existing configuration object
        $oldObject = $xmlConfig->get($this->getXPath());

        if (is_null($oldObject)) {
            throw new OMVException(OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED, $this->getXPath());
        }

        // Prepare configuration data
        $object = array(
            "enable" => boolval($params["enable"]),
            "autologinenabled" => boolval($params["autologinenabled"]),
            "autologinusername" => $params["autologinusername"],
            "autologinpassword" => $params["autologinpassword"],
            "maxjob" => $params["maxjob"],
            "maxdownloadspeed" => $params["maxdownloadspeed"],
            "maxuploadspeed" => $params["maxuploadspeed"],
            "availableDrivers" => isset($oldObject["availableDrivers"]) ? $oldObject["availableDrivers"] : "1;2;3;4;5;6;7;8;9;10;11;12;13;14;15;16;17;18;19;20",
//            "downloadfolder" => isset($params["downloadfolder"]) ? $params["downloadfolder"] : $oldObject["downloadfolder"],
            "downloadfolders" => isset($oldObject["downloadfolders"]) ? $oldObject["downloadfolders"] : array(),
        	"categorys"=> isset($oldObject["categorys"]) ? $oldObject["categorys"] : array(),
        );

        // Set configuration object
        if ($xmlConfig->replace($this->getXPath(), $object) === false) {
            throw new OMVException(OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
        }

        // Notify configuration changes
        $dispatcher = &OMVNotifyDispatcher::getInstance();
        $dispatcher->notify(OMV_NOTIFY_MODIFY, $this->getEventMessagePath(), $object);

        return $object;
    }

    /**
     * Get locations and files settings.
     *
     * @throws E_CONFIG_GET_OBJECT_FAILED
     *
     * @return array
     */
    public function getDownloadfolders($params, $context)
    {
        global $xmlConfig;
        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Get configuration object
        $object = $xmlConfig->getList($this->getDownloadfoldersXPath().'/downloadfolder');
        // Modify result data
        $result=array();
        foreach($object as $objectv)
        {
            $o=array("uuid"=>$objectv['uuid'],
            		"name"=>$objectv['name'],
                     "mntentref"=>$objectv['mntentref'],
                     "actualfolder"=>$objectv['actualfolder'],
                     "categoryref"=>$objectv['categoryref']);
            $xpath = sprintf("//system/fstab/mntent[uuid='%s']",
            		$objectv['mntentref']);
            // $xpath = "//system/fstab/mntent[not(contains(opts,'bind'))]";
            $objects = $xmlConfig->get($xpath);
            if (is_null($objects)) {
            	throw new OMVException(OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
            			$xpath);
            }
            // Get the filesystem details for each mount point.
            $fs = OMVFilesystemFactory::get($objects['fsname']);
            if (is_null($fs) || !$fs->exists()) {
            	//				throw new OMVException(OMVErrorMsg::E_MISC_FAILURE,
            	//				  sprintf(gettext("Filesystem '%s' not found"),
            	//				  $objectv['fsname']));
            	continue;
            }
            	// Skip the filesystems that are not mounted at the moment.
            	if (FALSE === $fs->isMounted())
            		continue;
            		// Get some filesystem details.
            		$devicefile = $fs->getDeviceFile();
            		$label = $fs->getLabel();
            		// Prepare result object.
           		    $o["description"] = !empty($label) ? $label : $devicefile;
           		    $o['available']=-1;
           		    $o['percentage']=-1;
            				// Get some more filesystem details if possible.
        	        if (FALSE !== ($fsStats = $fs->getStatistics())) {
                    	$o['description'] = sprintf(
                    	gettext("%s (%s available)"), $o['description'],
                    	binary_format($fsStats['available']));
                    	$o['available']=$fsStats['available'];
                    	$o['percentage']=$fsStats['percentage'];
                    	}
                     $xpath = sprintf($this->getCategorysXPath()."/category"."[uuid='%s']",
    			            $objectv ['categoryref']);
    	             $objects = $xmlConfig->get($xpath);
                     $o['categoryname']=$objects['name'];
                     $result[]=$o;
        }
        if (is_null($result)) {
            throw new OMVException(
                OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
                $this->getDownloadfoldersXPath()
            );
        }        

        return $result;
    }

    /**
     * Set download folder settings.
     *
     * @throws E_CONFIG_SET_OBJECT_FAILED
     *
     * @return array
     */
    public function setDownloadfolder($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Validate the parameters of the RPC service method.
        $this->validateMethodParams(
            $params,
            '{
                "type": "object",
                    "properties": {
                        "uuid": {'.$GLOBALS['OMV_JSONSCHEMA_UUID_UNDEFINED'].'},
        		        "name":{"type":"string"},
                        "mntentref": {'.$GLOBALS['OMV_JSONSCHEMA_UUID'].'},
                        "actualfolder": {"type": "string"},
                        "categoryref": {'.$GLOBALS['OMV_JSONSCHEMA_UUID'].'}
                    }
            }'
        );

        // Prepare configuration data
		$object = array(
			"uuid" => ($params['uuid'] == $GLOBALS['OMV_UUID_UNDEFINED']) ?
			  OMVUtil::uuid() : $params['uuid'],
			"name"=> $params['name'],
			"mntentref" => $params['mntentref'],
			"actualfolder" => $params['actualfolder'],
			"categoryref" => $params['categoryref'],
		);
        // Set configuration object
		$success = FALSE;
		if($params['uuid'] == $GLOBALS['OMV_UUID_UNDEFINED']) {
			// Get the mount point configuration object.
			$xpath = sprintf("//system/fstab/mntent[uuid='%s']",
			  $params['mntentref']);
			$meObject = $xmlConfig->get($xpath);
			if(is_null($meObject)) {
				throw new OMVException(OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
				  $xpath);
			}
            // Check if the simulatedfolder is available and to remove it.
//            if (!$this->findAndRemoveAvailableDriver($object['simulatedfolder']))
//           {
//                throw new OMVException(OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
//            }
			// Check if the required mount point already exists or if it is
			// necessary to create it.
			//$dir = sprintf("%s/%s", $GLOBALS['OMV_NFSD_EXPORT_DIR'],
			//  $params['actualfolder']);
			// Try to get the mount point configuration object.
			$xpath = sprintf("//system/fstab/mntent[dir='%s']", $params['actualfolder']);
			$meObject2 = $xmlConfig->get($xpath);
			if(is_null($meObject2)) {
				// Prepare fstab mount point entry configuration object to
				// bind the shared folder directory into the NFS export
				// directory.
				$meObject2 = array(
					"uuid" => $GLOBALS['OMV_UUID_UNDEFINED'],
					"fsname" => sprintf("%s/%s", "/XunLeiDownload",
                    substr($params['actualfolder'],0,1)==='/' ? substr($params['actualfolder'],1) : $params['actualfolder']),
					"dir" => $params['actualfolder'],
					"type" => "none",
					"opts" => "bind",
					"freq" => 0,
					"passno" => 0
				);
				// Append associated fstab mount point entry configuration
				// object.
				$meObject2 = OMVRpc::exec("FsTab", "set", $meObject2,
				  $context);
			}
			// Modify the download configuration object.
			$object['fdmntentref'] = $meObject2['uuid'];
			// Append the download configuration object.
			$success = $xmlConfig->set("//services/xunlei/downloadfolders",
			  array("downloadfolder" => $object));
		}
        else {
			// Update the existing configuration object.
        $success = $xmlConfig->replace("//services/xunlei/downloadfolders/downloadfolder[" .
			  "uuid='{$params['uuid']}']", $object);
            
            /* remove simulatefolder portery
            $xpath = sprintf("//services/xunlei/downloadfolders/downloadfolder[categoryref='%s']", $meObject['categoryref']);
            $meobject=$xmlConfig->get($xpath);
            $oldCategoryref=$meObject['categoryref'];
            $xpath = sprintf("//services/xunlei/downloadfolders/downloadfolder[categoryref='%s']", $params['categoryref']);
            $meObject2 = $xmlConfig->get($xpath);
            if (is_null($meObject2)){
                $this->addAvailableDriver(intval($oldCategoryref));
                $this->findAndRemoveAvailableDriver(intval($params['categoryref']));
			    $success = $xmlConfig->replace("//services/xunlei/downloadfolders/downloadfolder[" .
			  "uuid='{$params['uuid']}']", $object);}
            else {
                throw new OMVException(OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
            }*/
		}
		if(FALSE === $success) {
			throw new OMVException(OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
		}

        // Notify configuration changes
        $dispatcher = &OMVNotifyDispatcher::getInstance();
        $dispatcher->notify(OMV_NOTIFY_MODIFY, $this->getEventMessagePath(), $object);

        return $object;
    }

    /**
     * Get bandwidth settings.
     *
     * @throws E_CONFIG_GET_OBJECT_FAILED
     *
     * @return array
     */
    public function getDownloadfolder($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));
        // Validate the parameters of the RPC service method.
		$this->validateMethodParams($params, '{
			  "type":"object",
			  "properties":{
				  "uuid":{'.$GLOBALS['OMV_JSONSCHEMA_UUID'].'}
			  }
		  }');
        // Get the configuration object.
		$xpath = sprintf($this->getDownloadfoldersXPath()."/downloadfolder"."[uuid='%s']",
		  $params['uuid']);
		$object = $xmlConfig->get($xpath);
//        $object['categoryref']=intval($object['categoryref']);
		if(is_null($object)) {
			throw new OMVException(OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
			  $xpath);
		}
		return $object;
    }

    /**
     * Set bandwidth settings.
     *
     * @throws E_CONFIG_SET_OBJECT_FAILED
     *
     * @return array
     */
    public function deleteDownloadfolders($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));
        // Validate the parameters of the RPC service method.
        
		$this->validateMethodParams($params, '{
              "type": "object",
              "properties": {
                "uuids": {
			       "type": "array",
                   "items": {
                   "type":"object",
			       "properties":{
				      "uuid":{'.$GLOBALS['OMV_JSONSCHEMA_UUID'].'}
			       }
                }
              }
            }
		  }');
        // Delete the configuration object.
//        return $params['uuids'][0]['uuid'];
        $uuids=$params['uuids'];
        $objects=array();
        foreach($uuids as $uuid) {
		  $xpath = sprintf($this->getDownloadfoldersXPath()."/downloadfolder"."[uuid='%s']",
		  $uuid['uuid']);
//          return $xpath;
          $object = $this->deleteConfigObjectByPath($xpath,
		  "org.openmediavault.services.xunlei");
          
//          if (!$this->addAvailableDriver(intval($object['simulatedfolder'])))
//            {
//                $xmlConfig->set($xpath,$object);
//                throw new OMVException(OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
 //           }
//        return $xpath;
        // Check if the download folder is still shared by another downloadfolder.
		// In this case do not delete or unmount the mount point configuration
		// object.
		  $xpath = sprintf($this->getDownloadfoldersXPath()."/downloadfolder"."[fdmntentref='%s']",
		    $object['fdmntentref']);
		  if(0 <= $xmlConfig->count($xpath)){
        // Delete the associated fstab mount point entry.
		  OMVRpc::exec("FsTab", "delete", array("uuid" => $object['fdmntentref']),
		    $context);
            
          }
          $objects[]=$object;
        }
		// Return the deleted configuration object.
		return $objects;
    }

    /**
     * Get queuing settings.
     *
     * @throws E_CONFIG_GET_OBJECT_FAILED
     *
     * @return array
     */
    public function getAvailableDrivers($params, $context)
    {
        global $xmlConfig;
        //return $params;
        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));
        $this->validateMethodParams($params, '{
              "type": "integer",
              "minimum": -1,
              "maximum": 20
		  }');
        // Get configuration object
        $object = $xmlConfig->get($this->getAvailableDriversXPath());
        //return $this->getAvailableDriversXPath();
        if (is_null($object)) {
            throw new OMVException(OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED, $this->getQueuingXPath());
        }

        // Modify result data
        // General
        $objectv=array();
        $object = explode(";",$object);
        $result=array();
        foreach($object as $objectv){
          $o=array("availableDriver"=>$objectv,
                   "driverPath"=>chr(intval($objectv)+66).':\\');
          $result[]=$o;
        }
        if (intval($params)>0 && !in_array($params,$object,false)) {
            $result[]=array("availableDriver"=>intval($params),
                   "driverPath"=>chr(intval($params)+66).':\\');
        }  
        return $result;
    }
    public function testRpc($params, $context)
    {
        return $this->findAndRemoveAvailableDriver(20);
    }
    /**
     * Set queueing settings.
     *
     * @throws E_CONFIG_SET_OBJECT_FAILED
     *
     * @return array
     */
    public function setQueuing($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Validate the parameters of the RPC service method.
        $this->validateMethodParams(
            $params,
            '{
                "type": "object",
                "properties": {
                    "queue-stalled-enabled": {
                        "type": "boolean"
                    },
                    "queue-stalled-minutes": {
                        "type": "integer",
                        "minimum": 0
                    },
                    "download-queue-enabled": {
                        "type": "boolean"
                    },
                    "download-queue-size": {
                        "type": "integer",
                        "minimum": 0
                    },
                    "seed-queue-enabled": {
                        "type": "boolean"
                    },
                    "seed-queue-size": {
                        "type": "integer",
                        "minimum": 0
                    }
                }
            }'
        );

        // Prepare configuration data
        $object = array(
            // General
            "queue-stalled-enabled" => boolval($params["queue-stalled-enabled"]),
            "queue-stalled-minutes" => $params["queue-stalled-minutes"],

            // Download
            "download-queue-enabled" => boolval($params["download-queue-enabled"]),
            "download-queue-size" => $params["download-queue-size"],

            // Seed
            "seed-queue-enabled" => boolval($params["seed-queue-enabled"]),
            "seed-queue-size" => $params["seed-queue-size"],
        );

        // Set configuration object
        if ($xmlConfig->replace($this->getQueuingXPath(), $object) === false) {
            throw new OMVException(OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
        }

        // Notify configuration changes
        $dispatcher = &OMVNotifyDispatcher::getInstance();
        $dispatcher->notify(OMV_NOTIFY_MODIFY, $this->getEventMessagePath(), $object);

        return $object;
    }

    /**
     * Get peer settings.
     *
     * @throws E_CONFIG_GET_OBJECT_FAILED
     *
     * @return array
     */
    public function openVipChannel($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));
        $this->validateMethodParams($params, 
            '{
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "minimum": 0
                    }
                }
            }'
        );
            $client = $this->xwareClientFactory();
        $client->openVipChannel($params["id"]);
    }

    /**
     * Set peer settings.
     *
     * @throws E_CONFIG_SET_OBJECT_FAILED
     *
     * @return array
     */
    public function openLixianChannel($params, $context)
    {
            global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));
        $this->validateMethodParams($params, 
            '{
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "minimum": 0
                    }
                }
            }'
        );
         $client = $this->xwareClientFactory();
         $client->openLixianChannel($params["id"]);
    }

    /**
     * Get scheduling settings.
     *
     * @throws E_CONFIG_GET_OBJECT_FAILED
     *
     * @return array
     */
    public function getScheduling($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Get configuration object
        $object = $xmlConfig->get($this->getSchedulingXPath());

        if (is_null($object)) {
            throw new OMVException(
                OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
                $this->getSchedulingXPath()
            );
        }

        // Scheduling.
        $object["alt-speed-time-enabled"] = boolval($object["alt-speed-time-enabled"]);
        $object["alt-speed-time-begin"] = intval($object["alt-speed-time-begin"]);
        $object["begin-hour"] = intval($object["alt-speed-time-begin"] / 60);
        $object["begin-minute"] = ($object["alt-speed-time-begin"] % 60);
        $object["alt-speed-time-end"] = intval($object["alt-speed-time-end"]);
        $object["end-hour"] = intval($object["alt-speed-time-end"] / 60);
        $object["end-minute"] = ($object["alt-speed-time-end"] % 60);

        // Days.
        $object["days-sunday"] = false;

        if (($object["alt-speed-time-day"] & 1) === 1) {
            $object["days-sunday"] = true;
        }

        $object["days-monday"] = false;

        if (($object["alt-speed-time-day"] & 2) === 2) {
            $object["days-monday"] = true;
        }

        $object["days-tuesday"] = false;

        if (($object["alt-speed-time-day"] & 4) === 4) {
            $object["days-tuesday"] = true;
        }

        $object["days-wednesday"] = false;

        if (($object["alt-speed-time-day"] & 8) === 8) {
            $object["days-wednesday"] = true;
        }

        $object["days-thursday"] = false;

        if (($object["alt-speed-time-day"] & 16) === 16) {
            $object["days-thursday"] = true;
        }

        $object["days-friday"] = false;

        if (($object["alt-speed-time-day"] & 32) === 32) {
            $object["days-friday"] = true;
        }

        $object["days-saturday"] = false;

        if (($object["alt-speed-time-day"] & 64) === 64) {
            $object["days-saturday"] = true;
        }

        // Idle.
        $object["idle-seeding-limit"] = intval($object["idle-seeding-limit"]);
        $object["idle-seeding-limit-enabled"] = boolval($object["idle-seeding-limit-enabled"]);

        // Ratio.
        $object["ratio-limit"] = floatval($object["ratio-limit"]);
        $object["ratio-limit-enabled"] = boolval($object["ratio-limit-enabled"]);

        return $object;
    }

    /**
     * Set scheduling settings.
     *
     * @throws E_CONFIG_SET_OBJECT_FAILED
     *
     * @return array
     */
    public function setScheduling($params, $context)
    {
        global $xmlConfig;

        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Validate the parameters of the RPC service method.
        $this->validateMethodParams(
            $params,
            '{
                "type": "object",
                "properties": {
                    "alt-speed-time-enabled": {
                        "type": "boolean"
                    },
                    "begin-hour": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 23
                    },
                    "begin-minute": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 59
                    },
                    "end-hour": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 23
                    },
                    "end-minute": {
                        "type": "integer",
                        "minimum": 0,
                        "maximum": 59
                    },
                    "days-sunday": {
                        "type": "boolean"
                    },
                    "days-monday": {
                        "type": "boolean"
                    },
                    "days-tuesday": {
                        "type": "boolean"
                    },
                    "days-wednesday": {
                        "type": "boolean"
                    },
                    "days-thursday": {
                        "type": "boolean"
                    },
                    "days-friday": {
                        "type": "boolean"
                    },
                    "days-saturday": {
                        "type": "boolean"
                    },
                    "idle-seeding-limit": {
                        "type": "integer",
                        "minimum": 0
                    },
                    "idle-seeding-limit-enabled": {
                        "type": "boolean"
                    },
                    "ratio-limit": {
                        "type": "number",
                        "minimum": 0
                    },
                    "ratio-limit-enabled": {
                        "type": "boolean"
                    }
                }
            }'
        );

        $params["alt-speed-time-day"] = 0;

        if (boolval($params["days-sunday"]) === true) {
            $params["alt-speed-time-day"] += 1;
        }

        if (boolval($params["days-monday"]) === true) {
            $params["alt-speed-time-day"] += 2;
        }

        if (boolval($params["days-tuesday"]) === true) {
            $params["alt-speed-time-day"] += 4;
        }

        if (boolval($params["days-wednesday"]) === true) {
            $params["alt-speed-time-day"] += 8;
        }

        if (boolval($params["days-thursday"]) === true) {
            $params["alt-speed-time-day"] += 16;
        }

        if (boolval($params["days-friday"]) === true) {
            $params["alt-speed-time-day"] += 32;
        }

        if (boolval($params["days-saturday"]) === true) {
            $params["alt-speed-time-day"] += 64;
        }

        // Prepare configuration data
        $object = array(
            "alt-speed-time-enabled" => boolval($params["alt-speed-time-enabled"]),
            "alt-speed-time-begin" => intval(($params["begin-hour"] * 60) + $params["begin-minute"]),
            "alt-speed-time-end" => intval(($params["end-hour"] * 60) + $params["end-minute"]),
            "alt-speed-time-day" => $params["alt-speed-time-day"],

            // Idle
            "idle-seeding-limit" => $params["idle-seeding-limit"],
            "idle-seeding-limit-enabled" => boolval($params["idle-seeding-limit-enabled"]),

            // Ratio
            "ratio-limit" => $params["ratio-limit"],
            "ratio-limit-enabled" => boolval($params["ratio-limit-enabled"]),
        );

        // Set configuration object
        if ($xmlConfig->replace($this->getSchedulingXPath(), $object) === false) {
            throw new OMVException(OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
        }

        // Notify configuration changes
        $dispatcher = &OMVNotifyDispatcher::getInstance();
        $dispatcher->notify(OMV_NOTIFY_MODIFY, $this->getEventMessagePath(), $object);

        return $object;
    }

    /* Torrent management section */

    public function serverIsRunning($params, $context)
    {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        $module = new OMVModuleTransmissionBt();
        $status = $module->getStatus();

        return $status["running"];
    }

    public function getJobList($params, $context)
    {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Validate the parameters of the RPC service method.
/*        $this->validateMethodParams(
            $params,
            '{
                "type": "object",
                "properties": {
                    "start": {
                        "type": "integer"
                    },
                    "limit": {
                        ' . $GLOBALS["OMV_JSONSCHEMA_COUNTFIELD"] . '
                    },
                    "sortfield": {
                        ' . $GLOBALS["OMV_JSONSCHEMA_SORTFIELD"] . '
                    },
                    "sortdir": {
                        ' . $GLOBALS["OMV_JSONSCHEMA_SORTDIR"] . '
                    }
                }
            }'
        );*/
        $client = $this->xwareClientFactory();
//        return "kkkkkkk";
        
        $jobs= array();

        foreach ($client->getJobs() as $job) {
        	  $liXianChannel=$job->getLiXianChannel();
        	  $VipChannel=$job->getVipChannel();
        	  //var_dump($liXianChannel);
            $jobs[] = array(
                "id" => $job->getId(),
                "name" => urldecode($job->getName()),
                "type" => $job->getType(),
                "url" => urldecode($job->getUrl()),
                "path" => urldecode($job->getPath()),
                "size" => $job->getSize(),
                "progress" => $job->getProgress(),
                "speed" => $job->getSpeed(),
                "state" => $job->getState(),
                "createTime" => $job->getCreateTime(),
                "completeTime" => $job->getCompleteTime(),
                "downTime" => $job->getDownTime(),
                "remainTime" => $job->getRemainTime(),
                "failcode" => $job->getFailCode(),
            		"lixian_speed" =>$liXianChannel->getSpeed(),
            		"lixian_state" =>$liXianChannel->getState(),
            		"lixian_dlBytes" =>$liXianChannel->getDlBytes(),
            		"lixian_serverSpeed"=>$liXianChannel->getServerSpeed(),
            		"lixian_serverProgress" => $liXianChannel->getServerProgress(),
            		"lixian_failCode" => $liXianChannel->getFailCode(),
            		"vip_type"=> $VipChannel->getType(),
            		"vip_dlBytes" => $VipChannel->getDlBytes(),
            		"vip_speed" =>$VipChannel->getSpeed(),
            		"vip_opened" =>$VipChannel->getOpened(),
            		"vip_available" =>$VipChannel->getAvailable(),
            		"vip_failcode" =>$VipChannel->getFailCode()
            );
        }
			return $jobs;
        /*return $this->applyFilter(
            $torrents,
            $params["start"],
            $params["limit"],
            $params["sortfield"],
            $params["sortdir"]
        );*/
    }

    public function addTorrent($params, $context)
    {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Validate the parameters of the RPC service method.
        $this->validateMethodParams(
            $params,
            '{
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string"
                    },
                    "start_download": {
                        "type": "boolean"
                    }
                }
            }'
        );

        $client = $this->xwareClientFactory();

        $url = $params["url"];
        $paused = !boolval($params["start_download"]);

        return $client->add($url, $paused);
    }
    public function getBoxSpace($params,$context)
{
	// Validate the RPC caller context.
	$this->validateMethodContext($context, array(
			"role" => OMV_ROLE_ADMINISTRATOR
	));
	
	// Validate the parameters of the RPC service method.
	$client = $this->xwareClientFactory();
	return $client->getBoxSpace();	
}
    public function getDownloadCategorys($params,$context)
{
	global $xmlConfig;
	// Validate the RPC caller context.
	$this->validateMethodContext($context, array(
			"role" => OMV_ROLE_ADMINISTRATOR
	));
	
	// Get configuration object
	$object = $xmlConfig->getList($this->getCategorysXPath().'/category');
	// Modify result data
	$result=array();
	foreach($object as $objectv)
	{
		$o=array("uuid"=>$objectv['uuid'],
				"name"=>$objectv['name'],
				"description"=>$objectv['description']
		);
		$result[]=$o;
		}
		$result[]=array("uuid"=>"",
				"name"=>"",
				"description"=>""
		);
		return $result;
}
    public function setDownloadCategory($params,$context)
    {
    	global $xmlConfig;
    	
    	// Validate the RPC caller context.
    	$this->validateMethodContext($context, array(
    			"role" => OMV_ROLE_ADMINISTRATOR
    	));
    	
    	// Validate the parameters of the RPC service method.
    	$this->validateMethodParams(
    			$params,
    			'{
                "type": "object",
                    "properties": {
                        "uuid": {'.$GLOBALS['OMV_JSONSCHEMA_UUID_UNDEFINED'].'},
                        "name": {"type": "string"},
                        "description": {"type": "string"}
                    }
            }'
    	);
    	
    	// Prepare configuration data
    	$object = array(
    			"uuid" => ($params['uuid'] == $GLOBALS['OMV_UUID_UNDEFINED']) ?
    			OMVUtil::uuid() : $params['uuid'],
    			"name" => $params['name'],
    			"actualfolder" => $params['actualfolder'],
    			"description" => $params['description'],
    	);
    	
    	// Set configuration object
    	$success = FALSE;
    	if($params['uuid'] == $GLOBALS['OMV_UUID_UNDEFINED']) {
  					// Append the download category object.
    					$success = $xmlConfig->set($this->getCategorysXPath(),
    							array("category" => $object));
    	}
    	else {
    	// Update the existing configuration object.
    		$xpath = sprintf($this->getCategorysXPath()."/category[uuid='%s']", $params['uuid']);
    		$meObject = $xmlConfig->get($xpath);
    		if (is_null($meObject)){
    		throw new OMVException(OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
    		}
    		}
    		if(FALSE === $success) {
    		throw new OMVException(OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
    		}
    	
    		// Notify configuration changes
    		$dispatcher = &OMVNotifyDispatcher::getInstance();
    		$dispatcher->notify(OMV_NOTIFY_MODIFY, $this->getEventMessagePath(), $object);
    	
    		return $object;
    }
    public function getDownloadCategory($params,$context)
    {
    	global $xmlConfig;
    	
    	// Validate the RPC caller context.
    	$this->validateMethodContext($context, array(
    			"role" => OMV_ROLE_ADMINISTRATOR
    	));
    	// Validate the parameters of the RPC service method.
    	$this->validateMethodParams($params, '{
			  "type":"object",
			  "properties":{
				  "uuid":{'.$GLOBALS['OMV_JSONSCHEMA_UUID'].'}
			  }
		  }');
    	// Get the configuration object.
    	$xpath = sprintf($this->getCategorysXPath()."/category"."[uuid='%s']",
    			$params['uuid']);
    	$object = $xmlConfig->get($xpath);
    	//        $object['categoryref']=intval($object['categoryref']);
    	if(is_null($object)) {
    		throw new OMVException(OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
    				$xpath);
    	}
    	return $object;
    }
    public function deleteDownloadCategory($params,$context)
    {
    	global $xmlConfig;
    	
    	// Validate the RPC caller context.
    	$this->validateMethodContext($context, array(
    			"role" => OMV_ROLE_ADMINISTRATOR
    	));
    	// Validate the parameters of the RPC service method.
    	
    	$this->validateMethodParams($params, '{
              "type": "object",
              "properties": {
                "uuids": {
			       "type": "array",
                   "items": {
                   "type":"object",
			       "properties":{
				      "uuid":{'.$GLOBALS['OMV_JSONSCHEMA_UUID'].'}
			       }
                }
              }
            }
		  }');
    	// Delete the configuration object.
    	//        return $params['uuids'][0]['uuid'];
    	$uuids=$params['uuids'];
    	$objects=array();
    	foreach($uuids as $uuid) {
    		$xpath = sprintf($this->getCategorysXPath()."/category"."[uuid='%s']",
    				$uuid['uuid']);
    		$object = $this->deleteConfigObjectByPath($xpath,
    				"org.openmediavault.services.xunlei");
			$objects[]=$object;
    			}
    			// Return the deleted configuration object.
    			return $objects;    	
    }
    
    public function uploadTorrent($params, $context)
    {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Validate the parameters of the RPC service method.
        $this->validateMethodParams(
            $params,
            '{
                "type": "object",
                "properties": {
                    "filename": {
                        "type": "string"
                    },
                    "filepath": {
                        "type": "string"
                    }
                }
            }'
        );

        $client = $this->xwareClientFactory();

        return $client->add($params["filepath"]);
    }

    public function deleteTorrent($params, $context)
    {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Validate the parameters of the RPC service method.
        $this->validateMethodParams(
            $params,
            '{
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "minimum" : 0
                    },
                    "delete_local_data": {
                        "type": "boolean"
                    }
                }
            }'
        );

        $client = $this->xwareClientFactory();

        $torrent = $params["id"];
        $deleteLocalData = boolval($params["delete_local_data"]);

        $client->delete($torrent, $deleteLocalData);
    }

    public function pauseTorrent($params, $context)
    {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Validate the parameters of the RPC service method.
        $this->validateMethodParams(
            $params,
            '{
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "minimum": 0
                    }
                }
            }'
        );

        $client = $this->xwareClientFactory();
        $client->pause($params["id"]);
    }

    public function resumeTorrent($params, $context)
    {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Validate the parameters of the RPC service method.
        $this->validateMethodParams(
            $params,
            '{
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "minimum": 0
                    }
                }
            }'
        );

        $client = $this->xwareClientFactory();
        $client->resume($params["id"]);
    }

    public function queueMoveTorrent($params, $context)
    {
        // Validate the RPC caller context.
        $this->validateMethodContext($context, array(
            "role" => OMV_ROLE_ADMINISTRATOR
        ));

        // Validate the parameters of the RPC service method.
        $this->validateMethodParams(
            $params,
            '{
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "minimum": 0
                    },
                    "action": {
                        "type": "string",
                        "enum": [
                            "top",
                            "up",
                            "down",
                            "bottom"
                        ]
                    }
                }
            }'
        );

        $client = $this->xwareClientFactory();

        switch ($params["action"]) {
            case "top":
            case "up":
            case "down":
            case "bottom":
                $client->queueMove($params["id"], $params["action"]);
                break;
            default:
                throw new OMVException("Unknown Action: " . $params["action"]);
                break;
        }
    }

    /**
     * Returns a ITorrentServer class instance
     *
     * @return ITorrentServer
     */
    private function xwareClientFactory()
    {
        global $xmlConfig;

        $object = $xmlConfig->get($this->getXPath());
        if (is_null($object)) {
            throw new OMVException(
                OMVErrorMsg::E_CONFIG_GET_OBJECT_FAILED,
                $this->getXPath()
            );
        }

//        $url = "http://localhost:" . $object["rpcport"] . $object["rpcurl"] . "rpc";
        $username = null;
        $password = null;

        if (boolval($object["rpcauthenticationrequired"]) === true) {
            $username = $object["rpcusername"];
            $password = $object["rpcpassword"];
        }
        $client = new XWareClient();
//        return;
        $client->connect("http://localhost:9000");

        return $client;
    }
    private function findAndRemoveAvailableDriver($driver)
    {
        global $xmlConfig;
        $object = $xmlConfig->get($this->getAvailableDriversXPath());
        $drivers = explode(";",$object);
        $driver=(string)$driver;
        if (in_array($driver,$drivers,true)){
            array_splice($drivers,array_search($driver,$drivers),1);
            sort($drivers);
            $object = implode(";",$drivers);
            if ($xmlConfig->replace($this->getAvailableDriversXPath(), $object) === false) {
            throw new OMVException(OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
        }
            return true;
        } else {
            return false;
        }
}
    private function addAvailableDriver($driver)
      {
        global $xmlConfig;
        $object = $xmlConfig->get($this->getAvailableDriversXPath());
        //return $object;
        $driver= floor($driver);
        $drivers = explode(";",$object);
        $driver2= (string)$driver;
        //return (boolean) (0<$driver) && (21>$driver);
        if (!in_array($driver2,$drivers,true) && (0<$driver) && (21>$driver)) {
            //return $driver2;
            $drivers[]=$driver2;
            sort($drivers);
            $object = implode(";",$drivers);
            if ($xmlConfig->replace($this->getAvailableDriversXPath(), $object) === false) {
            throw new OMVException(OMVErrorMsg::E_CONFIG_SET_OBJECT_FAILED);
        } else
            return true;
        } else {
        return false;
        }
      }
}

// Register the RPC service.
$rpcServiceMgr = &OMVRpcServiceMgr::getInstance();
$rpcServiceMgr->registerService(new OMVRpcServiceXunLei());
