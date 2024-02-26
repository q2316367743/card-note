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
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'MKCOL');
curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");

$result = curl_exec($ch);

if (curl_errno($ch)) {
    echo 'Curl error: ' . curl_error($ch);
} else {
    echo 'Folder created successfully.';
}

curl_close($ch);
?>
