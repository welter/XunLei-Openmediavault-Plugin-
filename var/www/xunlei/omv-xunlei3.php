<?php
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
require_once "openmediavault/error.inc";
require_once "openmediavault/notify.inc";
require_once "openmediavault/object.inc";
require_once("openmediavault/system.inc");
require_once("openmediavault/functions.inc");
require_once "openmediavault/rpc.inc";
require_once "openmediavault/util.inc";
require_once "xunlei/IXWareClient.php";
require_once "xunlei/XWareClient.php";
require_once "xunlei/rsa.php";

global $xunleiCookies;
$url="https://login.xunlei.com/check/?u=welterlam&business_type=113&cachetime=1438220280532&";
    	    	$contextopts['http']['header']['User-Agent:'] ="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/43.0.2357.130 Chrome/43.0.2357.130 Safari/537.36
    	\r\n";
    	$contextopts['http']['method'] ="GET";
    	$contextopts['http']['header']['Accept'] = "*\/*\r\n";
    	$contextopts['http']['header']['Accept-Encoding']='gzip, deflate, sdch\r\n';
    	$contextopts['http']['header']['Connection: ']="keep-alive\r\n";
    	$contextopts['http']['header']['Content-type: ']='application/json\r\n';
    	$contextopts['http']['header']['Cookie: ']="_x_t_=0\r\n";
    	$con = stream_context_create( $contextopts );
    	if ( $fp = fopen( $url, 'rb' , false,$con) ) {	
    		$response=fgets($fp);
    		$stream_meta = stream_get_meta_data( $fp );
    	}
		//echo "stream_meta----------";
		//var_dump($stream_meta);
    	$cookies=array(	);
    	//return $stream_meta;
    	foreach($stream_meta['wrapper_data'] as $d)
    	{
			
    		if (substr($d,0,11)==='Set-Cookie:'){
    			$s=substr($d,12);//return $s;
    			$c=explode('=',$s,2);
    			$c[1]=substr($c[1],0,strpos($c[1],';'));
    			$cookies[$c[0]]=$c[1];
    		}
    	}
		//echo "cookies------------";
	
		//$xunleiCookies=$cookies;
		$file = fopen('xunleicookies', 'w+'); // a模式就是一种追加模式，如果是w模式则会删除之前的内容再添加
		foreach ($cookies as $n=>$v)
		{
			//$data.=$n.'='.urlencode($v).";";
			fwrite($file, $n."=".$v."\r\n");
			setcookie(urldecode($n),urldecode($v),0,'/','172.18.1.6');
		}
		fclose($file);
		echo '<html><body>"ok"</body></html>';
		//header("cookies:".$data);
		//var_dump($cookies);
		/*$url="http://172.18.1.6/test.html";
    	$contextopts['http']['header']['User-Agent:'] ="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/43.0.2357.130 Chrome/43.0.2357.130 Safari/537.36
    	";
    	$contextopts['http']['method'] ="GET";
    	$contextopts['http']['header']['Accept'] = "*\/*";
		$contextopts['http']['header']['Cache-Control'] = "max-age=0";
		$contextopts['http']['header']['X-FirePHP-Version'] = "0.0.6";
    	$contextopts['http']['header']['Accept-Encoding']='gzip, deflate';
		$contextopts['http']['header']['Accept-Language']='zh-CN,zh;q=0.8';
    	$contextopts['http']['header']['Connection: ']="keep-alive";
    	$contextopts['http']['header']['Content-type: ']='application/x-www-form-urlencoded';

		/*foreach ($cookies as $n=>$v)
		{
			if($n==="n"){printf("%s\n",$v);};
			$data.=$n.'='.urlencode($v)."&";
		}
		$param=http_build_query($cookies);
		$url=$url.'?'.$param;
		echo $url;
		$contextopts['http']['content']=$data;
    	$contextopts['http']['header']['Content-Length']=strlen($data)+10;

    	$con = stream_context_create( $contextopts );

    	if ( $fp = fopen( $url, 'r' , false,$con) ) {
    		$response=fgets($fp);
    		$stream_meta = stream_get_meta_data( $fp );
    	}
		var_dump($stream_meta);
exit("finish");*/
?>
