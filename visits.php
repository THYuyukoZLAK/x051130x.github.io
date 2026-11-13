<?php
/**
 * 月访问量统计接口
 *
 * 静态站点（GitHub Pages）无法计数访问，本文件提供最小可用的计数 API，
 * 与 state.php 一样部署在支持 PHP 的主机上（如 InfinityFree）。
 *
 * 使用方式：
 *   GET visits.php          记录一次访问（6 小时内同一 IP + UA 只计一次）并返回统计
 *   GET visits.php?peek=1   只读取统计，不计数
 *
 * 返回 JSON：
 *   {"code":200,"month":"2026-11","monthly":123,"total":456,"day":7}
 *
 * 存储：同目录下 data/visits.json，需要该目录可写（首次访问会自动创建）。
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
error_reporting(0);

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 同一来源在 6 小时内只计一次访问。
define('VISIT_WINDOW', 6 * 3600);
// recent 表最多保留 24 小时，避免无限增长。
define('RECENT_TTL', 24 * 3600);
define('MAX_MONTHS', 36);
define('MAX_DAYS', 400);

function visits_fail($status, $message)
{
    http_response_code($status);
    exit(json_encode(['code' => $status, 'error' => $message]));
}

function visits_json($data)
{
    return json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

$dir = __DIR__ . '/data';
$file = $dir . '/visits.json';

if (!is_dir($dir) && !@mkdir($dir, 0755, true) && !is_dir($dir)) {
    visits_fail(503, 'storage directory unavailable');
}

$handle = @fopen($file, 'c+');
if (!$handle) {
    visits_fail(503, 'storage file unavailable');
}

if (!flock($handle, LOCK_EX)) {
    fclose($handle);
    visits_fail(503, 'storage lock failed');
}

$raw = stream_get_contents($handle);
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = [];
}

$months = (isset($data['months']) && is_array($data['months'])) ? $data['months'] : [];
$days = (isset($data['days']) && is_array($data['days'])) ? $data['days'] : [];
$recent = (isset($data['recent']) && is_array($data['recent'])) ? $data['recent'] : [];

$now = time();
$month = date('Y-m');
$day = date('Y-m-d');

$peek = isset($_GET['peek']) && $_GET['peek'] !== '0';

if (!$peek) {
    $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
    $ua = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
    $key = substr(sha1($ip . '|' . $ua), 0, 16);

    $lastSeen = isset($recent[$key]) ? (int)$recent[$key] : 0;
    if ($now - $lastSeen >= VISIT_WINDOW) {
        $months[$month] = (isset($months[$month]) ? (int)$months[$month] : 0) + 1;
        $days[$day] = (isset($days[$day]) ? (int)$days[$day] : 0) + 1;
        $recent[$key] = $now;
    }

    foreach ($recent as $recentKey => $stamp) {
        if ($now - (int)$stamp > RECENT_TTL) {
            unset($recent[$recentKey]);
        }
    }

    ksort($months);
    if (count($months) > MAX_MONTHS) {
        $months = array_slice($months, -MAX_MONTHS, null, true);
    }

    ksort($days);
    if (count($days) > MAX_DAYS) {
        $days = array_slice($days, -MAX_DAYS, null, true);
    }

    $payload = visits_json([
        'months' => $months,
        'days' => $days,
        'recent' => $recent,
        'updated' => $now,
    ]);

    rewind($handle);
    ftruncate($handle, 0);
    fwrite($handle, $payload);
    fflush($handle);
}

flock($handle, LOCK_UN);
fclose($handle);

$monthly = isset($months[$month]) ? (int)$months[$month] : 0;
$daily = isset($days[$day]) ? (int)$days[$day] : 0;

exit(visits_json([
    'code' => 200,
    'month' => $month,
    'monthly' => $monthly,
    'total' => array_sum($months),
    'day' => $daily,
]));
