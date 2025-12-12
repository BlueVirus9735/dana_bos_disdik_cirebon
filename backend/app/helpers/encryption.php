<?php
function xor_encrypt($data, $key = "dinas_pendidikan") {
$out = '';
for ($i = 0; $i < strlen($data); $i++) {
$out .= $data[$i] ^ $key[$i % strlen($key)];
}
return base64_encode($out);
}


function xor_decrypt($data, $key = "ijazah_dinas_pendidikan") {
$decoded = base64_decode($data);
$out = '';
for ($i = 0; $i < strlen($decoded); $i++) {
$out .= $decoded[$i] ^ $key[$i % strlen($key)];
}
return $out;
}
?>