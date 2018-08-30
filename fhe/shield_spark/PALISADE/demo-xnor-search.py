dBKeyBitsAndValues 	= [[[keybits],value],...]
queryKeyBits 		= []



def doBinaryXnor(cTextBitOne, cTextBitTwo):

	# A' = A - 1
	# B' = B - 1
	val1BitMinus1 = cryptoContext.EvalSub(cTextBitOne, encryptedOne)
	val2BitMinus1 = cryptoContext.EvalSub(cTextBitTwo, encryptedOne)

	# C = (A x B)+(A' x B')
	xnorLeftResult = cryptoContext.EvalMult(cTextBitOne, cTextBitTwo)
	xnorrightResult = cryptoContext.EvalMult(val1BitMinus1, val2BitMinus1)
	xnorResultBoth = cryptoContext.EvalAdd(xnorLeftResult, xnorrightResult)

	return xnorResultBoth


def doKeyXnor(dbKeyBits, qKeyBits):
	reduce(mult, map(lambda x: doBinaryXnor(x[0],x[1]), zip(dbKeyBits, qKeyBits)))

# is used to make a copy of queryKeyBits for each dbKeyBitArray
map(lambda keyBitsAndValue: mult(keyBitsAndValue[1],doKeyXnor(keyBitsAndValue[0], queryKeyBits), dBKeyBitsAndValues))


reduce(mult ((A x B)+(A' x B'))

reduce(mult, (map(mult())))

class BinaryXNORQuery:
	"""
		each query takes as parameters:
			a query key
			database access instructions
			a cryptoContext, expected to have used the same parameters as that which encrypted to db kv pairs
	"""
	def __init__(self, cryptoContext, databaseInfo, pubKey):
		self.cryptoContext = cryptoContext
		self.databaseInfo = databaseInfo
		self.pubKey = pubKey
		self.encryptedOne = encrypt_int(1)

	def encrypt_int(theIntVal):
		encodedInt = cryptoContext.MakeIntegerPlaintext(theIntVal);
		ctext_ret = cryptoContext.Encrypt(pubKey, encodedInt);
		return ctext_ret;


	def doBinaryXnor(cTextBitOne, cTextBitTwo):

		# A' = A - 1
		# B' = B - 1
		val1BitMinus1 = cryptoContext.EvalSub(cTextBitOne, encryptedOne)
		val2BitMinus1 = cryptoContext.EvalSub(cTextBitTwo, encryptedOne)

		# C = (A x B)+(A' x B')
		xnorLeftResult = cryptoContext.EvalMult(cTextBitOne, cTextBitTwo)
		xnorrightResult = cryptoContext.EvalMult(val1BitMinus1, val2BitMinus1)
		xnorResultBoth = cryptoContext.EvalAdd(xnorLeftResult, xnorrightResult)

		return xnorResultBoth


	def encryptIntBitwise(theInt):
		encryptedBits = []
		for i in range(32):
			encryptedBits.append(encrypt_int(theInt%2))
			theInt = theInt/2
		return encryptedBits

	def doQuery(queryKeyPlaintext):

		encryptedBits = encryptIntBitwise(queryKeyPlaintext)
		cryptoContext = self.cryptoContext

		# dbKVTuples = [
		# 	( [bitwise key 1], full string ctext 1 ),
		# 	( [bitwise key 2], full string ctext 2 ),
		# 	( [bitwise key 3], full string ctext 3 )
		# ]
		dbKVTuples = sc.get_data(databaseInfo)

		binaryXnoredKVTuple = dbKVTuples.map( lambda kvTuple : cryptoContext.EvalMult(reduce(cryptoContext.EvalMult, binaryXnor(kvTuple[0],encryptedBits)) , kvTuple[1] ))
		return reduce(cryptoContext.EvalAdd, binaryXnoredKVTuple)






class BinaryXNORQuery:
	"""
		each query takes as parameters:
			a query key
			database access instructions
			a cryptoContext, expected to have used the same parameters as that which encrypted to db kv pairs
	"""
	def __init__(self, key, cryptoContext, databaseInfo):
		super(ClassName, self).__init__()
		self.key = key
		self.databaseInfo = databaseInfo
		

	def encrypt_int(cryptoContext, pubKey, theIntVal):

		encodedInt = cryptoContext.MakeIntegerPlaintext(theIntVal);
		ctext_ret = cryptoContext.Encrypt(pubKey, encodedInt);
		return ctext_ret;



	def doBinaryXnor(cryptoContext, encryptedOne, cTextBitOne, cTextBitTwo):

		# A' = A - 1
		# B' = B - 1
		val1BitMinus1 = cryptoContext.EvalSub(cTextBitOne, encryptedOne)
		val2BitMinus1 = cryptoContext.EvalSub(cTextBitTwo, encryptedOne)

		# C = (A x B)+(A' x B')
		xnorLeftResult = cryptoContext.EvalMult(cTextBitOne, cTextBitTwo)
		xnorrightResult = cryptoContext.EvalMult(val1BitMinus1, val2BitMinus1)
		xnorResultBoth = cryptoContext.EvalAdd(xnorLeftResult, xnorrightResult)

		return xnorResultBoth


	def doBinaryXnorTuple(cTextBitTuple):

		# A' = A - 1
		# B' = B - 1
		val1BitMinus1 = cryptoContext.EvalSub(cTextBitTuple.key, encryptedOne)
		val2BitMinus1 = cryptoContext.EvalSub(cTextBitTuple.value, encryptedOne)

		# C = (A x B)+(A' x B')
		xnorLeftResult = cryptoContext.EvalMult(cTextBitTuple.key, cTextBitTuple.value)
		xnorrightResult = cryptoContext.EvalMult(val1BitMinus1, val2BitMinus1)
		xnorResultBoth = cryptoContext.EvalAdd(xnorLeftResult, xnorrightResult)

		return xnorResultBoth


	def doEncrpytedChainedBinaryXnor(cryptoContext, pubKey, cTextArrayOne, cTextArrayTwo):
		
		"""
			Used for performing a binary xnor on entire strings or ints encrypted as array of bits
			Returns encrypted 1 for match or encrypted 0 for no match
		"""

		if cTextArrayOne.length != cTextArrayTwo.length:
			# throw new error!
			return False;
		
		xnorResult = encrypt_int(cryptoContext, pubKey, 1)

		# used in the doBinaryXnor as basis of substitutions, do not want to spend time re-encrypting
		encryptedOne = encrypt_int(cryptoContext, pubKey, 1)

		for i in cTextBitsArrayOne:

			val1Bit = cTextArrayOne[i]
			val2Bit = cTextArrayTwo[i]

			singleBinaryXnorRes = doBinaryXnor(cryptoContext, encryptedOne, val1Bit, val2Bit)

			xnorResult = cc->EvalMult(xnorResult, singleBinaryXnorRes)

		return xnorResult;


if __name__ == '__main__':



	cryptoContext

	pubKey

	privKey

	spark = SparkSession\
            .builder\
            .appName('xnor_search_app_server')\
            .getOrCreate()



    spark.sparkContext.setLogLevel('ERROR')


    serialized = example.Serialized()



	spark.read(key_in, databaseStuff)



	read database as tuples of dbKVPair(dbBinaryKeys, dbValues) of binary searches


	# dbKVPairs = [
	# 	( [bitwise key 1], full string ctext 1 ),
	# 	( [bitwise key 2], full string ctext 2 ),
	# 	( [bitwise key 3], full string ctext 3 )
	# ]

	dbKVPairsTuples = read_tuples_from('db')



class ClassName(object):
	"""docstring for ClassName"""
	
		
class QueryAll:
	def __init__(self, queryKeyBits, cryptoContext):
		self.queryKeyBits = queryKeyBits
		self.cryptoContext = cryptoContext

	def doQuery(dbKVTuples):
		queryKeyBits = self.queryKeyBits
		cryptoContext = self.cryptoContext
		binaryXnoredKVTuple = dbKVTuples.map( lambda kvTuple : cryptoContext.EvalMult(reduce(EvalMult(binaryXnor(kvTuple[0],queryKeyBits))) , kvTuple[1] ))
		return binaryXnoredKVTuple.reduce(cryptoContext.EvalAdd)

	def doBinaryXNORTuple(bitwiseTupleOne, bitwiseTupleTwo):


	"""
		[xnor key bit 1, xnor key bit 2, ...],   // for the 1st db key
		[xnor key bit 1, xnor key bit 2, ...],   // for the 2nd db key
		[xnor key bit 1, xnor key bit 2, ...],   // for the 3rd db key
		...
	"""
	all_reduced_bitwise_xnor_key_search_xnor = reduce(\
		# reduce the 
		lambda dbKvPair, queryBitsArray : (dbKvPair[1],  map(lambda dbKVPair[0], queryBitsArray : doBinaryXnor, dbKVPair[0], queryBitsArray)))






	reduce(lambda xnor_res, db_value: EvalMult(xnor_res, ))

	def bitwise_array_ctext_xnor(ctext_bit_array_one, ctext_bit_array_two):
		return reduce(map(lambda x, y : doBinaryXnor(x, y), ctext_bit_array_one, ctext_bit_array_two))







	all_extracted_vals =  map(EvalMult, all_db_ctext_values, all_reduced_bitwise_xnor_keys)

	reduce(EvalAdd, all_extracted_vals)



	# [0] is the key in the database
	# [1] is value key in the database
	map(lambda dbKVPair, queryBitsArray : reduce(EvalMult(dbKVPair[1], reduce(EvalMult(dbKVPair[0], map(doBinaryXnor(dbKVPair[0], dbBitsArray),))


	map(lambda x, y : doBinaryXnor, queryBitsArray, dbBitsArray)


	# function to map bit array to xnor bit array
	# returns single array of xnored bits
	def map_bit_array(queryBitsArray, dbBitsArray): 
		return map(lambda x, y : doBinaryXnor, queryBitsArray, dbBitsArray)

	def reduce_xnor_bit_array(xnor_bit_array):
		return reduce(lambda x, y : cryptoContext.EvalMult(x, y), xnor_bit_array)


	reduce(lambda x, y : cryptoContext.EvalMult(x, y), xnor_bit_array)


	# the reduction multiplying the added xnor results  against the db value

		# the reduction adding the xnor results together
		reduce( cryptoContext.EvalMult(\

				# the bitwise maping of the key, xnor against the query
				map(\
					lambda dbKeyBitsAndValuePair, queryBits :\
						(\
							doBinaryXnorTuple(dbKeyBitsAndValuePair[0], queryKeyBits\
							),\
							dbKVPairsTuples,\
							queryKeyBits\
						)

					)
				)
			)
			
		

	bitwise_key_xnor_result = map(doBinaryXnorTuple, )


	all_db_keys 	= (x[0] for x in dbKVPairs)
	all_db_values	= (x[1] for x in dbKVPairs)


	reduce(cryptoContext.EvalAdd, map(cryptoContext.EvalMult, zip(all_single_xnor_results, all_db_values)).append(0))

	#  RETURNS: list 
	# map(doBinaryXnorTuple, zip(bitwise_db_key_ctext, bitwise_query_key_ctext))



	do:

		all_single_xnor_results = []


			# want query_db_key_bits -> : [

			# 	( query_bit[0], db_key_bit[0] ),
			# 	( query_bit[1], db_key_bit[1] ),
			# 	( query_bit[2], db_key_bit[2] ),
			# 	( query_bit[3], db_key_bit[3] ),
			# 	...

			# ]	and map(doBinaryXnor, query_db_key_bits.key, query_db_key_bits.value) 



			xnored_bits = list(map(doBinaryXnorTuple, zip(bitwise_db_key_ctext, bitwise_query_key_ctext)))

			single_xnor_result = reduce(lambda x, y : cryptoContext.EvalMult(x, y));

			all_single_xnor_results.append(single_xnor_result)

		all_extracted_vals = [0].append(map(cryptoContext.EvalMult, zip(all_single_xnor_results, all_db_values)).append(0))

		final_extracted_add = reduce(cryptoContext.EvalAdd, all_extracted_vals)





		list(map(lambda x: cryptoContext. zip(all_single_xnor_results, all_db_values)
		# then map the single_xnor_result




		doBinaryXnor(, zip(bitwise_db_key_ctext, bitwise_query_key_ctext))



	bitwise_query_key = [];
	def bitwise_map(bitwise_db_key):
		bitwise_ret = [];
		for i in xrange(0, bitwise_db_key.length):
			bitwise_ret.append()


	bitwise_xnor_key_result = list(map(lambda))
	int bitsPerKey = 8;

	searchKeyBitwise = [...];

	extractValue = encrypt_int(cryptoContext, pubKey, 0)

	for kvTuple in dbKVPairs:

		

		bitwiseXNORResult = []

		"""
			map kvTuple to
			xnoredKVTuple: ([xnoredBits], dbValue)
		"""
		for i in xrange(0, bitsPerKey}):

			keyBit = kvTuple.key[i]

			bitwiseXNORResult.append(doBinaryXnor(kvTuple.key[i], searchKeyBitwise[i]))


		"""
			reduce the xnoredKVTuple: ([xnoredBits], dbValue)
			to reducedKVTuple: (EvalMult product (1 or 0, dBValue)) -> 
		"""
			
		singleXnorRes = encrypt_int(cryptoContext, pubKey, 1)

		for bitXnorRes in bitwiseXNORResult:

			singleXnorRes = cryptoContext.EvalMult(singleXnorRes, bitwiseXNORResult)




		extractValue = cryptoContext.EvalAdd(singleXnorRes, kvTuple.value)













	map each bit array, value to an array against doBinaryXnor(bits,)
	then 

		

	first need to run doBinaryXnor for each bit in every bit array in dbKVPairs

	then for each row 






	bitwiseXNORResults = list(list(map(lambda ))


	for kvTuple in dbKVPairs:

		filter where for all kvTuple.keybits
		
	






	perform doBinaryXnor on each dbKVPair.key, key_in -> mult result to dbKVPair.value

	add all returnedValues to starting of 0

