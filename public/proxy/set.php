<?php
// 获取POST请求体中的JSON数据
$jsonData = file_get_contents('php://input');

// 解析JSON数据
$data = json_decode($jsonData, true);

$url = $data['url'];
$username = $data['username'];
$password = $data['password'];
$content = $data['content'];


$ch = curl_init();


curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");
curl_setopt($ch, CURLOPT_POSTFIELDS, $content);

$result = curl_exec($ch);

if (curl_errno($ch)) {
    echo 'Curl error: ' . curl_error($ch);
} else {
    echo 'File content updated successfully.';
}

curl_close($ch);
?>
