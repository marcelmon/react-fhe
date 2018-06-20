<?php

if(!isset($_GET['data_type'])){
	header("Location: test_react.html");
}
$collectionId = $_GET['collectionId'];
$keyId = $_GET['keyId'];
$bitId = $_GET['keyBitId'];

switch($_GET['data_type']){
	case 'collection_info':

		$collectionArray = array(
			array(
				'id' => 1,
				'colloquialName' => 'col1', 
				'numKeys' => 2,
				'numKeyBits'=> 3
				),
			array(
				'id' => 2,
				'colloquialName' => 'col2', 
				'numKeys' => 4,
				'numKeyBits'=> 5
				),
			);
		echo json_encode($collectionArray);
		break;
	case 'key_bit_ctext':
		$ctextArray = array(
			
			array(
				array(intval($collectionId), intval($keyId), intval($bitId)),
				array(4, 5, 6),
				array(7, 8, 9),
				),
			array(
				array(21, 22, 23),
				array(24, 25, 26),
				array(27, 28, 29),
				),
			array(
				array(31, $bitId, 33),
				array(34, 35, 36),
				array(37, 38, 39),
				),
			);
		echo json_encode($ctextArray);
		break;
	case 'value_ctext':

		$ctextArray = array(
			
			array(
				array(intval($collectionId), intval($keyId), 999),
				array(4, 5, 6),
				array(7, 8, 9),
				),
			array(
				array(21, 22, 23),
				array(24, 25, 26),
				array(27, 28, 29),
				),
			array(
				array(31, 999, 33),
				array(34, 35, 36),
				array(37, 38, 39),
				),
			);
		echo json_encode($ctextArray);
		break;
	default:
		break;

}