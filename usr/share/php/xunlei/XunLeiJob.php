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

require_once "xunlei/IJob.php";

class XunLeiJob implements IJob
{
    private $job;

    public function __construct($data)
    {
        $this->job = $data;
//        var_dump($this->job);
    }

    public function getId()
    {
        return $this->job->id;
    }

    public function getName()
    {
        return $this->job->name;
    }

    public function getType()
    {
    	return $this->job->type;
    }
    public function getUrl()
    {
    	return $this->job->url;
    }
    public function getPath()
    {
    	return $this->job->path;
    }
 
    public function getSize()
    {
        return $this->job->size;
    }

    public function getProgress()
    {
    	return $this->job->progress;
    }
    public function getSpeed()
    {
        return $this->job->speed;
    }

    public function getState()
    {
        return $this->job->state;
    }
    
   public function getCreateTime()
    {
        return $this->job->createTime;
    }

    public function getCompleteTime()
    {
        return $this->job->completeTime;
    }

    public function getDownTime()
    {
        return $this->job->downTime;
    }

    public function getRemainTime()
    {
        return $this->job->remainTime;
    }

    public function getFailCode()
    {
        return $this->job->failCode;
    }

    public function getVipChannel()
    {
        return new XunLeiVipChannel($this->job->vipChannel);
    }

    public function getLixianChannel()
    {
        return new XunLeiLiXianChannel($this->job->lixianChannel);
    }
}

class XunLeiVipChannel
{
	private $vip;
	public function __construct($data)
	{
		$this->vip=$data;
		//var_dump($this->vip);
	}
	
	public function getType(){
		return $this->vip->type;
	}
	
	public function getDlBytes()
	{
		return $this->vip->dlBytes;
	}
	
	public function getSpeed()
	{
		return $this->vip->speed;
	}
	
	public function getOpened()
	{
		return $this->vip->opened;
	}
	
	public function getAvailable()
	{
		return $this->vip->available;
	}
	
	public function getFailCode()
	{
		return $this->vip->failCode;
	}
}
class XunLeiLiXianChannel
{
	private $lixian;
	public function __construct($data)
	{
		return $this->lixian=$data;
	}
	
	public function getSpeed()
	{
		return $this->lixian->speed;
	}
	
	public function getState(){
		return $this->lixian->state;
	}
	
	public function getDlBytes()
	{
		return $this->lixian->dlBytes;
	}
	
	public function getServerSpeed()
	{
		return $this->lixian->serverSpeed;
	}
	
	public function getServerProgress()
	{
		return $this->lixian->serverProgress;
	}
	
	public function getFailCode()
	{
		return $this->lixian->failCode;
	}
}