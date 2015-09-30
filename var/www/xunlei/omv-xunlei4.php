<?php
/** 
* @method 多维数组转字符串 
* @param type $array 
* @return type $srting 
* @author yanhuixian 
*/  
function arrayToString($arr) {  
if (is_array($arr)){
	$r="";
	foreach ($arr as $pk=>$pv)
	{
		if (is_array($pv))
		{
			$r.=$pk."+-+".implode("\n",array_map('arrayToString', $pv))."\n";
		}
		else
		{
			$r.=$pk."+-+".$pv."\n";
		}
		//return implode("\n", array_map('arrayToString', $arr));
	}
	return $r;
}  
 else return $arr;  
}

$file = fopen('params', 'w+'); // a模式就是一种追加模式，如果是w模式则会删除之前的内容再添加
// 获取需要写入的内容
$params=file_get_contents("php://input");
// 写入追加的内容
fwrite($file, $params);
//fwrite($file,$GLOBALS['xunleiCookies']);
// 关闭b.php文件
fclose($file);
// 销毁文件资源句柄变量
unset($file);
$params=json_decode($params,true);
$xunleicookies=file_get_contents('xunleicookies');
$c="";
$cookies=array();
for($i=0;$i<strlen($xunleicookies);$i++)
{
    if ($xunleicookies[$i]=="\r")
    {
        if ($xunleicookies[$i+1]=="\n")
        {
            $pos=strpos($c,"=");
            $cookies[substr($c,0,$pos)]=substr($c,$pos+1);
            $i++;
            $c="";
        }
        else
        {
            $c.=$xunleicookies[$i];
        }
    }
    else
    {
        $c.=$xunleicookies[$i];
    }
}

//$c2=explode("=",$c2);



        $url=$params['url'];
        unset($params['url']);
		$params['business_type']='113';
		unset($cookies['check_result']);
		unset($cookies['blogresult']);
    	$contextopts['http']['header']['User-Agent:'] ="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/43.0.2357.130 Chrome/43.0.2357.130 Safari/537.36
    	";
    	$contextopts['http']['method']  ="POST";
    	$contextopts['http']['header']  = "Accept:*\/*\r\n";
		$contextopts['http']['header'] .=" Origin: http://i.xunlei.com\r\n";
		$contextopts['http']['header'] .="Referer: http://i.xunlei.com/login/2.5/?r_d=1\r\n";
		$contextopts['http']['header'] .= "Cache-Control: max-age=0\r\n";
		$contextopts['http']['header'] .= "X-FirePHP-Version: 0.0.6\r\n";
    	$contextopts['http']['header'] .="Accept-Encoding: gzip, deflate\r\n";
		$contextopts['http']['header'] .="Accept-Language: zh-CN,zh;q=0.8\r\n";
    	$contextopts['http']['header'] .="Connection: keep-alive\r\n";
    	$contextopts['http']['header'] .="Content-type: application/x-www-form-urlencoded\r\n";
		$contextopts['http']['header'] .="Cookie: state=0; shapsw=*; noticeValue=; sessionid=; _x_t_=0";
        $data="";
		foreach ($cookies as $n=>$v)
		{
			if($n==="n"){printf("%s\n",$v);};
			$data.="; ".$n.'='.$v;
		}
		$contextopts['http']['header'].=$data;
		$contextopts['http']['header'].="\r\n";
		$param=http_build_query($params);
		$contextopts['http']['content']=$param;
		//echo $url;
		//$contextopts['http']['content']=$data;
    	$contextopts['http']['header']['Content-Length:']=strlen($param);
		$file = fopen('postContent', 'w+');
		fwrite($file,arrayToString($contextopts));
		fclose($file);
		unset($file);
    	$con = stream_context_create( $contextopts );

    	if ( $fp = fopen( $url, 'r' , false,$con) ) {
    		$response=fgets($fp);
    		$stream_meta = stream_get_meta_data( $fp );
    	}
		foreach($stream_meta['wrapper_data'] as $d)
    	{
			
    		if (substr($d,0,11)==='Set-Cookie:'){
    			$s=substr($d,12);//return $s;
    			$c=explode('=',$s,2);
    			$c[1]=substr($c[1],0,strpos($c[1],';'));
    			$cookies[$c[0]]=$c[1];
    		}
    	}



echo "<html><body>".$xunleicookies."<-     result cookies        ->";
foreach($cookies as $pk=>$pv)
{
echo $pk."=".$pv;
}
echo"<-  cookies   ->";
echo $data;
echo"<-    params         ->";

echo $param;
echo "</body></html>";
?>
