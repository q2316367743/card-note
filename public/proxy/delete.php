<?php
// 获取POST请求体中的JSON数据
$jsonData = file_get_contents('php://input');

// 解析JSON数据
$data = json_decode($jsonData, true);

$url = $data['url'];
$username = $data['username'];
$password = $data['password'];


$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// 如果需要认证信息，可以在这里设置
curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");

$response = curl_exec($ch);
$http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($http_status == 204) {
    echo "1";
} else {
    echo "0";
}

curl_close($ch);
?>
