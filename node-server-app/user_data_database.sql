DELIMITER &&
CREATE PROCEDURE `getAllCryptoContextIds` 
(
	IN userId INT
)
BEGIN
SELECT 	cryptocontext_id as id
from 	user_cryptocontexts
where 	user_id	= userId;
END &&
DELIMITER ;;



DELIMITER $$
CREATE PROCEDURE `getCryptoContext` (IN userId INT, IN ccId INT)
BEGIN	
SELECT 	cryptocontext_data as cryptocontext
from 	user_cryptocontexts
where 	user_id 			= userId
and 	cryptocontext_id 	= ccId;
END$$
DELIMITER ;



DELIMITER $$
CREATE PROCEDURE `putCryptoContext` (IN ccData LONGBLOB, IN userId INT, IN ccId INT)
BEGIN
INSERT INTO user_cryptocontexts
(
	cryptocontext_id,
	user_id,
	cryptocontext_data
)
VALUES
(
	ccId,
	userId,
	ccData
)
on duplicate key 	update
cryptocontext_data 	= ccData;
select IFNULL(ccId, LAST_INSERT_ID()) as id; -- return auto incremented id if null was passed
END$$
DELIMITER ;



DELIMITER $$
CREATE PROCEDURE `deleteCryptoContext` (IN userId INT, IN ccId INT)
BEGIN	
DELETE FROM user_cryptocontexts
where user_id 			= userId
and cryptocontext_id 	= ccId;
END$$
DELIMITER ;




-- keypairs
-- __________________

DELIMITER $$
CREATE PROCEDURE `getAllKeypairIds` (IN userId INT, IN ccId INT)	
BEGIN
SELECT keypair_id as id
from user_cryptocontext_public_private_keypairs
where user_id 			= userId
and cryptocontext_id 	= ccId;
END$$
DELIMITER ;




DELIMITER $$
CREATE PROCEDURE `putKeypair` 
(
	IN pubkeydata LONGBLOB, 
	IN privkeydata LONGBLOB, 
	IN userId INT, 
	IN ccId INT, 
	IN keypairId INT
)
BEGIN
insert into user_cryptocontext_public_private_keypairs
(
	keypair_id,
	user_id,
	cryptocontext_id,
	public_key_data,
	private_key_data
)
VALUES
(
	keypairId,
	userId,
	ccId,
	pubkeydata,
	privkeydata
)
on duplicate key update
public_key_data 	= IFNULL(pubkeydata, public_key_data), 		-- only insert if the values inserting are non-null
private_key_data 	= IFNULL(privkeydata, private_key_data); 	-- might want to insert 1 at a time
select IFNULL(keypairId, LAST_INSERT_ID()) as id;					-- return auto incremented id if null was passed
END$$
DELIMITER ;



DELIMITER $$
CREATE PROCEDURE `getPublicKey` (IN userId INT, IN ccId INT, IN keypairId INT)
BEGIN
SELECT public_key_data as pubkey
from user_cryptocontext_public_private_keypairs
where user_id 			= userId
and cryptocontext_id 	= ccId
and keypair_id 			= keypairId;
END$$
DELIMITER ;



DELIMITER $$
CREATE PROCEDURE `getPrivateKey` (IN userId INT, IN ccId INT, IN keypairId INT)
BEGIN
SELECT private_key_data as privkey
from user_cryptocontext_public_private_keypairs
where user_id 			= userId
and cryptocontext_id 	= ccId
and keypair_id 			= keypairId;
END$$
DELIMITER ;
	


DELIMITER $$
CREATE PROCEDURE `deleteKeypair` (IN userId INT, IN ccId INT, IN keypairId INT)
BEGIN
DELETE FROM user_cryptocontext_public_private_keypairs
where user_id 			= userId
and cryptocontext_id	= ccId
and keypair_id 			= keypairId;
END$$
DELIMITER ;






-- user_collections
-- __________________


DELIMITER $$
CREATE PROCEDURE `getAllCollectionIds` (IN userId INT)
BEGIN
SELECT collection_id as id
from user_collections
where user_id = userId;
END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE `getCollectionName` (IN userId INT, IN collectionId INT)
BEGIN
SELECT collection_name as name
from user_collections
where user_id = userId
and collection_id = collectionId;
END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE `getAllCollectionNames` (IN userId INT)
BEGIN
SELECT collection_id as id, collection_name as name
from user_collections
where user_id = userId;
END$$
DELIMITER ;



DELIMITER $$
CREATE PROCEDURE `putCollection` (IN collectionName VARCHAR(256), IN userId INT, IN collectionId INT)
BEGIN
INSERT INTO user_collections
(
	collection_id,
	user_id,
	collection_name
)
VALUES
(
	collectionId,
	userId,
	collectionName
)
ON DUPLICATE KEY update
collection_name = IF(user_id = userId, collectionName, collection_name); 	-- just a safety to mke sure the wrong user can't override
SELECT IFNULL(collectionId, LAST_INSERT_ID()) as id;						-- return auto incremented id if null was passed
END$$
DELIMITER ;



DELIMITER $$
CREATE PROCEDURE `deleteCollection` (IN userId INT, IN collectionId INT)
BEGIN
DELETE FROM user_collections
where collection_id	= collectionId
and user_id 		= userId;
END$$
DELIMITER ;






-- user_collections_plaintext_key_values
-- __________________




DELIMITER $$
CREATE PROCEDURE `getAllPlaintextKVPairIds` (IN userId INT, IN collectionId INT)
BEGIN
select kv_pair_id as id
from user_collections_plaintext_key_values
where user_id 		= userId
and collection_id 	= collectionId;
END$$
DELIMITER ;



DELIMITER $$
CREATE PROCEDURE `getPlaintextKeyValueData` (IN userId INT, IN collectionId INT, IN kvPairId INT)
BEGIN
select key_data as `key`,
value_data as `value`
from user_collections_plaintext_key_values
where user_id		= userId
and collection_id 	= collectionId
and kv_pair_id 		= kvPairId;
END$$
DELIMITER ;



DELIMITER $$
CREATE PROCEDURE `getAllPlaintextKeysValuesData` (IN userId INT, IN collectionId INT)
BEGIN
select kv_pair_id as id, 
key_data as `key`, 
value_data as `value`
from user_collections_plaintext_key_values
where user_id 		= userId
and collection_id 	= collectionId;
END$$
DELIMITER ;




	DELIMITER $$
	CREATE PROCEDURE `getPlaintextKeyData` (IN userId INT, IN collectionId INT, IN kvPairId INT)
	BEGIN
	select key_data as `key`
	from user_collections_plaintext_key_values
	where user_id 		= userId
	and collection_id 	= collectionId
	and kv_pair_id 		= kvPairId;
	END$$
	DELIMITER ;


	DELIMITER $$
	CREATE PROCEDURE `getAllPlaintextKeysData` (IN userId INT, IN collectionId INT)
	BEGIN
	select kv_pair_id as `id`, key_data as `key`
	from user_collections_plaintext_key_values
	where user_id 		= userId
	and collection_id 	= collectionId;
	END$$
	DELIMITER ;



	DELIMITER $$
	CREATE PROCEDURE `getPlaintextValueData` (IN userId INT, IN collectionId INT, IN kvPairId INT)
	BEGIN
	select value_data as `value`
	from user_collections_plaintext_key_values
	where user_id 		= userId
	and collection_id 	= collectionId
	and kv_pair_id 		= kvPairId;
	END$$
	DELIMITER ;


	DELIMITER $$
	CREATE PROCEDURE `getAllPlaintextValuesData` (IN userId INT, IN collectionId INT)
	BEGIN
	select kv_pair_id as id, `value_data` as `value`
	from user_collections_plaintext_key_values
	where user_id 		= userId
	and collection_id 	= collectionId;
	END$$
	DELIMITER ;



DELIMITER $$
CREATE PROCEDURE `putPlaintextKVPair` 
(
	IN keyData VARCHAR(256), 
	IN valueData VARCHAR(256), 
	IN userId INT, 
	IN collectionId INT, 
	IN kvPairId INT
)
BEGIN
insert into user_collections_plaintext_key_values
(
	kv_pair_id,
	user_id,
	collection_id,
	key_data,
	value_data
)
VALUES
(
	kvPairId,
	userId,
	collectionId,
	keyData,
	valueData
)
on duplicate key update
key_data 	= keyData,
value_data 	= valueData;
SELECT IFNULL(kvPairId, LAST_INSERT_ID()) as id;			-- return auto incremented id if null was passed
END$$
DELIMITER ;



DELIMITER $$
CREATE PROCEDURE `deletePlaintextKVPair` (IN userId INT, IN collectionId INT, IN kvPairId INT)
BEGIN
DELETE FROM user_collections_plaintext_key_values
where user_id 		= userId
and collection_id 	= collectionId
and kv_pair_id		= kvPairId;
END$$
DELIMITER ;



-- user_ciphertext_keys_bitwise
-- __________________



DELIMITER $$
CREATE PROCEDURE `getCiphertextKeyBitIds` 
(
	IN userId INT, 
	IN collectionId INT, 
	IN ccId INT, 
	IN keypairId INT, 
	IN kvPairId INT
)
BEGIN
SELECT bit_id as id
from user_ciphertext_keys_bitwise
where user_id 			= userId
and collection_id 		= collectionId
and cryptocontext_id	= ccId
and keypair_id 			= keypairId
and kv_pair_id 			= kvPairId;
END$$
DELIMITER ;



DELIMITER $$
CREATE PROCEDURE `getCiphertextKeyBitData` 
(
	IN userId INT, 
	IN collectionId INT, 
	IN ccId INT, 
	IN keypairId INT, 
	IN kvPairId INT, 
	IN bitId INT
)
BEGIN
SELECT ctext_key_bit_data as bit_data
from user_ciphertext_keys_bitwise
where user_id 			= userId
and collection_id 		= collectionId
and cryptocontext_id 	= ccId
and keypair_id 			= keypairId
and kv_pair_id 			= kvPairId
and bit_id 				= bitId;
END$$
DELIMITER ;



DELIMITER $$
CREATE PROCEDURE `getCiphertextKeyBitSample` 
(
	IN userId INT, 
	IN collectionId INT, 
	IN ccId INT, 
	IN keypairId INT, 
	IN kvPairId INT, 
	IN bitId INT
)
BEGIN
SELECT json_array_sample as jsonArraySample
from user_ciphertext_keys_bitwise
where user_id 			= userId
and collection_id 		= collectionId
and cryptocontext_id 	= ccId
and keypair_id 			= keypairId
and kv_pair_id 			= kvPairId
and bit_id 				= bitId;
END$$
DELIMITER ;



DELIMITER $$
CREATE PROCEDURE `putCiphertextKeyBitData` 
(
	IN keyBitData 	LONGBLOB, 
	IN userId 		INT, 
	IN collectionId INT, 
	IN ccId 		INT, 
	IN keypairId 	INT, 
	IN kvPairId 	INT, 
	IN bitId 		INT

)
BEGIN
INSERT INTO user_ciphertext_keys_bitwise
(
	user_id,
	collection_id,
	cryptocontext_id,
	keypair_id,
	kv_pair_id,
	bit_id,
	ctext_key_bit_data
)
values
(
	userId,
	collectionId,
	ccId,
	keypairId,
	kvPairId,
	bitId,
	keyBitData
)
on duplicate key update
ctext_key_bit_data = keyBitData;
SELECT bitId as id;
END$$
DELIMITER ;



DELIMITER $$
CREATE PROCEDURE `putCiphertextKeyBitSample` 
(
	IN jsonArraySample TEXT,
	IN userId 		INT, 
	IN collectionId INT, 
	IN ccId 		INT, 
	IN keypairId 	INT, 
	IN kvPairId 	INT, 
	IN bitId 		INT
)
BEGIN
INSERT INTO user_ciphertext_keys_bitwise
(
	user_id,
	collection_id,
	cryptocontext_id,
	keypair_id,
	kv_pair_id,
	bit_id,
	json_array_sample
)
values
(
	userId,
	collectionId,
	ccId,
	keypairId,
	kvPairId,
	bitId,
	jsonArraySample
)
on duplicate key update
json_array_sample = jsonArraySample;
SELECT bitId as id;
END$$
DELIMITER ;




DELIMITER $$
CREATE PROCEDURE `deleteCiphertextKeyBitData`
(
	IN userId 		INT, 
	IN collectionId INT, 
	IN ccId 		INT, 
	IN keypairId 	INT, 
	IN kvPairId 	INT, 
	IN bitId 		INT
)
BEGIN
DELETE FROM user_ciphertext_keys_bitwise
where user_id 			= userId
and collection_id 		= collection_id
and cryptocontext_id 	= ccId
and keypair_id 			= keypairId
and kv_pair_id 			= kvPairId
and bit_id 				= bitId;
END $$
DELIMITER ;






-- user_ciphertext_values
-- __________________


DELIMITER $$
CREATE PROCEDURE `getCiphertextValueData`
(
	IN userId INT, 
	IN collectionId INT, 
	IN ccId INT, 
	IN keypairId INT, 
	IN kvPairId INT
)
BEGIN
SELECT ctext_value_data as value_data
from user_ciphertext_values
where user_id 			= userId
and collection_id 		= collectionId
and cryptocontext_id 	= ccId
and keypair_id 			= keypairId
and kv_pair_id 			= kvPairId;
END$$
DELIMITER ;



DELIMITER $$
CREATE PROCEDURE `getCiphertextValueSample`
(
	IN userId INT, 
	IN collectionId INT, 
	IN ccId INT, 
	IN keypairId INT, 
	IN kvPairId INT
)
BEGIN
SELECT json_array_sample as jsonArraySample
from user_ciphertext_values
where user_id 			= userId
and collection_id 		= collectionId
and cryptocontext_id 	= ccId
and keypair_id 			= keypairId
and kv_pair_id 			= kvPairId;
END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE `putCiphertextValueData` 
(
	IN ctextValueData 	LONGBLOB, 
	IN userId 			INT, 
	IN collectionId 	INT, 
	IN ccId 			INT, 
	IN keypairId 		INT, 
	IN kvPairId 		INT
)
BEGIN
INSERT INTO user_ciphertext_values
(
	user_id,
	collection_id,
	cryptocontext_id,
	keypair_id,
	kv_pair_id,
	ctext_value_data
)
values 
(
	userId,
	collectionId,
	ccId,
	keypairId,
	kvPairId,
	ctextValueData
)
on duplicate key update
ctext_value_data = ctextValueData;
SELECT kvPairId as id;
END$$
DELIMITER ;



DELIMITER $$
CREATE PROCEDURE `putCiphertextValueSample` 
(
	IN jsonArraySample 	TEXT,
	IN userId 			INT, 
	IN collectionId 	INT, 
	IN ccId 			INT, 
	IN keypairId 		INT, 
	IN kvPairId 		INT
	
)
BEGIN
INSERT INTO user_ciphertext_values
(
	user_id,
	collection_id,
	cryptocontext_id,
	keypair_id,
	kv_pair_id,
	json_array_sample
)
values 
(
	userId,
	collectionId,
	ccId,
	keypairId,
	kvPairId,
	jsonArraySample
)
on duplicate key update
json_array_sample 	= jsonArraySample;
SELECT kvPairId as id;
END$$
DELIMITER ;



DELIMITER $$
CREATE PROCEDURE `deleteCiphertextValueData`
( 
	IN userId 			INT, 
	IN collectionId 	INT, 
	IN ccId 			INT, 
	IN keypairId 		INT, 
	IN kvPairId 		INT
)
BEGIN
DELETE FROM user_ciphertext_values
where user_id 			= userId
and collection_id 		= collectionId
and cryptocontext_id 	= ccId
and keypair_id 			= keypairId
and kv_pair_id 			= kvPairId;
END$$
DELIMITER ;



create table user_cryptocontexts (
	`cryptocontext_id` INT(11) not null AUTO_INCREMENT,
	`user_id` INT(11) UNSIGNED not null,
	`cryptocontext_data` LONGBLOB not null,
	`created_time` timestamp,
	`last_updated` timestamp,

	PRIMARY KEY(`cryptocontext_id`),
	KEY(`user_id`, `cryptocontext_id`)
);

create table user_cryptocontext_public_private_keypairs (

	`keypair_id` INT UNSIGNED AUTO_INCREMENT not null,
	
	`user_id` INT UNSIGNED not null,
	`cryptocontext_id` INT UNSIGNED not null,
	`private_key_data` LONGBLOB,
	`public_key_data` LONGBLOB,
	`created_time` timestamp,
	`last_updated` timestamp,
	PRIMARY KEY(`keypair_id`),
	KEY(`user_id`, `cryptocontext_id`, `keypair_id`)

);

-- currently not used, but is to store evalmult and proxy-reencrypt keys when needed
-- since the keys are generated with a public or private key we use a reference in from_keypair_id
-- can also chain some types of other keys so reference parent in from_other_key_id
-- create table user_cryptocontext_other_keys (

-- 	other_key_id 		INT UNSIGNED AUTO_INCREMENT not null,
	
-- 	user_id				INT UNSIGNED not null,
-- 	cryptocontext_id	INT UNSIGNED not null,
-- 	keytype 			set('evalmult', 'proxy-reencrypt'),
-- 	key_data			LONGBLOB,
-- 	from_keypair_id		INT UNSIGNED not null,
-- 	from_other_key_id 	INT UNSIGNED,
-- 	created_time 		timestamp,
-- 	last_updated 		timestamp,

-- 	PRIMARY KEY(other_key_id),
-- 	KEY(user_id, cryptocontext_id, from_keypair_id, keytype, other_key_id)

-- );




create table user_collections (
	`collection_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
	`user_id`			INT UNSIGNED NOT NULL,
	`collection_name` 	VARCHAR(256) 	DEFAULT NULL,
	`created_time`		timestamp,
	`last_updated`		timestamp,
	PRIMARY KEY(`collection_id`),
	KEY(`user_id`, `collection_id`)
);


  -- BEGIN;
  -- SELECT @id := IFNULL(MAX(id),0) + 1 FROM foo WHERE other = 123 FOR UPDATE;
  -- INSERT INTO foo
  --    (other, id, ...)
  --    VALUES
  --    (123, @id, ...);
  -- COMMIT;



create table user_collections_plaintext_key_values (
	`kv_pair_id` 	INT 			UNSIGNED NOT NULL AUTO_INCREMENT,
	`user_id` 		INT 			UNSIGNED not null,
	`collection_id` INT 			UNSIGNED not null,
	`key_data` 		VARCHAR(256)	not null,
	`value_data` 	VARCHAR(256) 	not null,
	`created_time` 	timestamp,
	`last_updated` 	timestamp,
	PRIMARY KEY(`kv_pair_id`),
	KEY(`user_id`, `collection_id`, `kv_pair_id`, `key_data`)

);


create table user_ciphertext_keys_bitwise (
	`user_id`				int UNSIGNED not null,
	`collection_id` 		int UNSIGNED not null,
	`cryptocontext_id` 		int UNSIGNED not null,
	`keypair_id` 			int UNSIGNED not null, -- refers to the key pair that was used to encrypt this
	`kv_pair_id` 			int UNSIGNED not null, -- maps to the kvpair in user_collections_plaintext_key_values
	`bit_id` 				int UNSIGNED not null,
	`ctext_key_bit_data` 	LONGBLOB not null,
	`created_time` 			timestamp,
	`last_updated` 			timestamp,
	`json_array_sample` 	TEXT DEFAULT NULL,
	PRIMARY KEY(`user_id`, `collection_id`, `cryptocontext_id`, `keypair_id`, `kv_pair_id`, `bit_id`)

);

create table user_ciphertext_values (
	`user_id` 			int UNSIGNED not null,
	`collection_id` 	int UNSIGNED not null,
	`cryptocontext_id` 	int UNSIGNED not null,
	`keypair_id` 		int UNSIGNED not null,	-- refers to the key pair that was used to encrypt this
	`kv_pair_id` 		int UNSIGNED not null, 	-- maps to the kvpair in user_collections_plaintext_key_values
	`ctext_value_data` 	LONGBLOB not null,
	`created_time` 		timestamp,
	`last_updated` 		timestamp,
	`json_array_sample` TEXT DEFAULT NULL,
	PRIMARY KEY(`user_id`, `collection_id`, `cryptocontext_id`, `keypair_id`, `kv_pair_id`)
);






drop table IF exists `newtable`;
create table newtable (
`id` 		INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
`value`	VARCHAR(256) not null,
PRIMARY KEY (`id`)
);




delimiter $$
drop PROCEDURE if exists `testNewTableRet` ;
CREATE PROCEDURE `testNewTableRet` (IN data VARCHAR(256), IN newId INT(11))
BEGIN
INSERT INTO newtable
(
	id,
	value
)
values 
(
	newId,
	data
)
on duplicate key update
value = data;
select ifnull(newId, LAST_INSERT_ID()) as newId;
END$$
DELIMITER ;



delimiter $$
drop PROCEDURE if exists `testNewTableRetGetIds` ;
CREATE PROCEDURE `testNewTableRetGetIds` ()
BEGIN
select id from newtable;
END$$
DELIMITER ;