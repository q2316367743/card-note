<?php
// 获取POST请求体中的JSON数据
$jsonData = file_get_contents('php://input');

// 解析JSON数据
$data = json_decode($jsonData, true);

$url = $data['url'];
$username = $data['username'];
$password = $data['password'];

// 初始化cURL会话并设置相关参数：
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PROPFIND'); // 使用PROPFIND方法获取文件或文件夹信息
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");

// 执行cURL会话并获取返回结果：
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// 解析返回的XML响应，判断文件或文件夹是否存在。
$xml = simplexml_load_string($response);
$exists = isset($xml->response);
if ($exists) {
    echo '1';
} else {
    echo '0';
}
?>