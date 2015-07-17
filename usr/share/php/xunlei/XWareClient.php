<?php
/**
 * Copyright (C) 2014-2015 OpenMediaVault Plugin Developers
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

require_once "xunlei/apis/XunLeiRpc.php";
require_once "xunlei/IXWareClient.php";
require_once "xunlei/XunLeiJob.php";

class XWareClient implements IXWareClient
{
    private $rpc;

    public static function getDefaultServerAddress()
    {
        return "http://localhost:9000/";
    }

    public function connect($url, $username, $password)
    {
        $this->rpc = new XunLeiRpc($url, $username, $password, false);
    }

    public function getJobs()
    {
    	//return "oooop";
        $result = (object) $this->rpc->get();
//return $result->tasks;
        $jobs = array();
        echo "--------------------------------\n";
        foreach ($result->tasks as $job) {
//        	var_dump($job);
            $jobs[] = new XunLeiJob($job);
        }
        //var_dump($jobs);
        return $jobs;
    }

    public function getBoxSpace()
    {
    	return  $this->rpc->getBoxSpace();
    }
    public function add($location, $paused = false)
    {
        $result = $this->rpc->add($location, "", array("paused" => $paused));

        if (isset($result["result"])) {
            if ($result["result"] == "success") {
                return true;
            }

            throw new Exception($result["result"]);
        }

        throw new Exception("Something unexpected went wrong when adding the torrent");
    }

    public function delete($torrent, $deleteLocalData)
    {
        $this->rpc->remove($torrent, $deleteLocalData);
    }

    public function pause($torrent)
    {
        $this->rpc->stop($torrent);
    }

    public function resume($torrent)
    {
        $this->rpc->start($torrent);
    }

    public function queueMove($torrent, $action)
    {
        $this->rpc->queueMove($torrent, $action);
    }
    public function openVipChannel($jobId)
    {
    	 $this->rpc->openVipChannel($jobId);
    }
    public function openLixianChannel($jobId)
    {
    	$this->rpc->openLixianChannel($jobId);
    }
}

