<?php



global $fheAddr;

$fheAddr = "http://localhost:8081/fhe/";






function getCryptoContext(){
	global $fheAddr;

	$ch = curl_init();

	curl_setopt($ch, CURLOPT_URL, $fheAddr.'cryptocontext');
	curl_setopt($ch, CURLOPT_POST, 1);
	// curl_setopt($ch, CURLOPT_POSTFIELDS);

	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	$ret = curl_exec ($ch);
	curl_close ($ch);
	return $ret;
}



function getKeys($cryptocontext){
	global $fheAddr;

	$ch = curl_init();

	curl_setopt($ch, CURLOPT_URL, $fheAddr.'keygen');
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, "cryptocontext=".$cryptocontext);

	// print( "cryptocontext=".$cryptocontext . "\n\n\n\n\n");
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	$ret = curl_exec ($ch);
	curl_close ($ch);
	return $ret;
}

function getCtext($cryptocontext, $pubkey, $plaintext){
	global $fheAddr;

	$ch = curl_init();

	curl_setopt($ch, CURLOPT_URL, $fheAddr.'encrypt');
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, "cryptocontext=".$cryptocontext."&publickey=".$pubkey."&plaintext=".$plaintext);

	// print( "cryptocontext=".$cryptocontext . "\n\n\n\n\n");
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	$ret = curl_exec ($ch);
	curl_close ($ch);
	return $ret;
}

function getDecrypt($cryptocontext, $privkey, $ctext){
	global $fheAddr;

	$ch = curl_init();

	curl_setopt($ch, CURLOPT_URL, $fheAddr.'decrypt');
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, "cryptocontext=".$cryptocontext."&privatekey=".$privkey."&ciphertext=".$ctext);

	// print( "cryptocontext=".$cryptocontext . "\n\n\n\n\n");
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	$ret = curl_exec ($ch);
	curl_close ($ch);
	return $ret;
}


print("Get cc\n");
$cc = getCryptoContext();

print("got cc\n".$cc."\n\n");

print("get keys\n");
$keysjson = getKeys($cc);

$keys = json_decode($keysjson, true);
print("got keys\n");
// print("KEYS PUB ". $keys['publickey']);
// return;
print("get ctext\n");
$ctext = getCtext($keys['cryptocontext'], $keys['publickey'], 'aaa');

print("got ctext\n");
// print("ctext is : ".$ctext."\n");
print("there ctext\n");

$dectext = getDecrypt($keys['cryptocontext'], $keys['privatekey'], $ctext);

print("got dectext \n".$dectext);

?>