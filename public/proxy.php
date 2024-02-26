<?php

// 检查是否传递了url参数
if (isset($_GET['url'])) {
    // 获取要转发的URL
    $forward_url = $_GET['url'];

    // 获取请求头
    $headers = getallheaders();

    // 获取请求体
    $requestData = file_get_contents('php://input');

    // 创建一个新 cURL 资源
    $ch = curl_init();

    // 设置 cURL 参数
    curl_setopt($ch, CURLOPT_URL, $forward_url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $requestData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // 执行 cURL 请求
    $response = curl_exec($ch);

    // 获取响应头的大小
    $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);

    // 关闭 cURL 资源
    curl_close($ch);

    // 提取响应头和响应体
    $header = substr($response, 0, $header_size);
    $body = substr($response, $header_size);

    // 设置响应头
    $header_lines = explode("\r\n", $header);
    foreach ($header_lines as $line) {
        header($line);
    }

    // 返回响应体
    echo $body;
} else {
    http_response_code(400); // Bad Request
    echo "Missing 'url' parameter in the request.";
}

?>
