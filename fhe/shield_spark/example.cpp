#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include "palisade.h"
#include "cryptocontexthelper.h"
#include "cryptocontextgen.h"
#include "utils/serializablehelper.h"

namespace py = pybind11;

using namespace std;
using namespace lbcrypto;


// // template<typename Element>
// // using CryptoContext = CryptoContextImpl<Element>;


// int add(int i, int j) {
// 	return i + j;
// }

struct KeyStruct{
	KeyStruct(CryptoContext<Poly> cc, LPKeyPair<Poly> keypair): cc(cc), keypair(keypair){}
	CryptoContext<Poly> cc;
	LPKeyPair<Poly> keypair;
	CryptoContext<Poly> getCC(){ return cc; }
	LPKeyPair<Poly> getKeypair(){ return keypair; }
};

int printFullCtext(const Ciphertext<Poly> ciphertext){
	std::vector<Poly> allElements = ciphertext->GetElements();
	for (uint32_t i = 0; i < allElements.size(); ++i)
	{
		for (uint32_t j = 0; j < allElements.at(i).GetRingDimension(); ++j) {

			cout << allElements.at(i).at(j) << " || ";
		}
		cout << "\n\n\n";
	}
	cout << "end\n";
	return 1;
}
// /*
// 	Matrix of polynomials is vert x horiz
// 	Params define how many elements to return and how many coefficients to return
// 	Later want to include the display dimensions
// */
std::vector<std::vector<uint32_t>> getCtextMatrixSample(const Ciphertext<Poly> ciphertext, uint32_t numElements, uint32_t coefDepth){
	
	std::vector<std::vector<uint32_t>> returnPolySamples;

	std::vector<Poly> allElements = ciphertext->GetElements();

	if(allElements.size() < numElements){
		numElements = allElements.size();
	}
	if(numElements <= 0){
		return std::vector<std::vector<uint32_t>>();
	}
	if(allElements.at(0).GetRingDimension() <= coefDepth){
		coefDepth = allElements.at(0).GetRingDimension();
	}
	if(coefDepth <= 0){
		return std::vector<std::vector<uint32_t>>();
	}
	for (uint32_t i = 0; i < numElements; ++i) {
		std::vector<uint32_t> singlePolySample;
		Poly thisPoly = allElements.at(i);
		for (uint32_t j = 0; j < coefDepth; ++j) {
			singlePolySample.push_back(thisPoly.at(j).ConvertToInt());
		}
		returnPolySamples.push_back(singlePolySample);
	}
	return returnPolySamples;
}

// py::bytes nothing(const std::string alice, const std::string bob) {
// 	int len = alice.length();
// 	char *carol = new char[len];
// 	for (int i = 0; i < len; i++) {
// 		carol[i] = alice[i] ^ bob[i];
// 	}
// 	// http://pybind11.readthedocs.io/en/stable/advanced/functions.html#return-value-policies
// 	return py::bytes(carol, len);
// }

// // // TODO wish could get rid of this
// // std::vector<uint32_t> decodeInts(IntPlaintextEncoding plaintext) {
// // 	return plaintext;
// // }

// // // TODO wish could get rid of this
// // std::string decodeBytes(BytePlaintextEncoding plaintext) {
// // 	std::vector<uint8_t> v = (std::vector<uint8_t>) plaintext;
// // 	std::string s;
// // 	s.assign(v.begin(), v.end());
// // 	return s;
// // }

// // TODO wish could get rid of this
// std::shared_ptr<Ciphertext<Poly>> makeShared(const Ciphertext<Poly> ciphertext) {
// 	std::shared_ptr<Ciphertext<Poly>> shared = std::make_shared<Ciphertext<Poly>>(ciphertext);
// 	return shared;
// }

// // TODO remove
// // void printCryptoContext(shared_ptr<CryptoContext<Poly>> cryptoContext) {
// // 	std::cout << "p = " << cryptoContext->GetCryptoParameters()->GetPlaintextModulus() << std::endl;
// // }

// // used to return a diplayable portion (or all) of a ciphertext
// std::vector<int> getPolys(const Ciphertext<Poly> ciphertext, int x = -1, int y = -1, int numCoefficients = -1){
	
// }

// std::shared_ptr<CryptoContext<Poly>> genCCBV(string stDev){
// 	cout << stDev << " the std dev"<<endl;
// 	// { "BV1", {
// 	// 			{ "parameters", "BV" },
// 	// 			{ "plaintextModulus", "2" },
// 	// 			{ "ring", "2048" },
// 	// 			{ "modulus", "268441601" },
// 	// 			{ "rootOfUnity", "16947867" },
// 	// 			{ "relinWindow", "1" },
// 	// 			{ "stDev", "4" },
// 	// 	} },

// 	shared_ptr<typename Poly::Params> parms;

// 	// ring, modulus, root of unity
// 	parms.reset( new typename Poly::Params(stoul("32"),
// 							typename Poly::Integer("268441601"),
// 							typename Poly::Integer("16947867")));

// 	// ptm, relin window, stDev
// 	shared_ptr<CryptoContext<Poly>> cc = CryptoContextFactory<Poly>::genCryptoContextBV(parms,
// 				stoul("256"), stoul("1"), stof(stDev));

// 	cc->Enable(ENCRYPTION);
// 	cc->Enable(PRE);
// 	cc->Enable(SHE);

// 	return cc;
// }


CryptoContext<Poly> generateCC(){
	int plaintextModulus = 256;
	int depth = 4;
	uint64_t cyclotomicOrder = 1024*2/32;
	BigInteger modulusBigInt = Poly::Integer("2147352577");
	BigInteger rootOfUnityBigInt = Poly::Integer("461230749");

	// BigInteger modulusBigInt = Poly::Integer("268441601");
	// BigInteger rootOfUnityBigInt = Poly::Integer("16947867");

	// BigInteger modulusBigInt = Poly::Integer("268441601");
	// BigInteger rootOfUnityBigInt = Poly::Integer("16947867");
	
	usint relinWindow = 1;
	float stDev = 3;
	MODE mode = RLWE;
	shared_ptr<typename Poly::Params> parms;
	parms.reset( new typename Poly::Params(cyclotomicOrder, modulusBigInt, rootOfUnityBigInt));
	CryptoContext<Poly> cc = CryptoContextFactory<Poly>::genCryptoContextSHIELD(
		parms, plaintextModulus, relinWindow, stDev, mode, depth);
	cc->Enable(ENCRYPTION);
	cc->Enable(SHE);
	return cc;
}

string serializeCC(CryptoContext<Poly> cc){
	Serialized ccSerial;
	cc->Serialize(&ccSerial);
	string stringcc;
	if(SerializableHelper::SerializationToString(ccSerial, stringcc)){
		return stringcc;
	}
	return NULL;
}

CryptoContext<Poly> deserializeCryptoContext(string ccString){
	Serialized serialized;
	SerializableHelper::StringToSerialization(ccString, &serialized);
	return CryptoContextFactory<Poly>::DeserializeAndCreateContext(serialized);
}


KeyStruct* generateKeys(CryptoContext<Poly> cc){
	LPKeyPair<Poly> keyPair = cc->KeyGen();
	cc->EvalMultKeyGen(keyPair.secretKey);
	return new KeyStruct(cc,keyPair);
}

LPPublicKey<Poly> getPublicKey(LPKeyPair<Poly> keypair){
	return keypair.publicKey;
}

LPPrivateKey<Poly> getPrivateKey(LPKeyPair<Poly> keypair){
	return keypair.secretKey;
}

string serializePublicKey(LPPublicKey<Poly> pubKey){
	Serialized pubkeySerial;
	pubKey->Serialize(&pubkeySerial);
	string stringpubkey;
	if(SerializableHelper::SerializationToString(pubkeySerial, stringpubkey)){
		return stringpubkey;
	}
	return NULL;
}

string serializePrivateKey(LPPrivateKey<Poly> privkey){
	Serialized privkeySerial;
	privkey->Serialize(&privkeySerial);
	string stringprivkey;
	if(SerializableHelper::SerializationToString(privkeySerial, stringprivkey)){
		return stringprivkey;
	}
	return NULL;
}

LPPublicKey<Poly> deserializePublicKey(CryptoContext<Poly> cc, string pubkey){
	Serialized serialized;
	SerializableHelper::StringToSerialization(pubkey, &serialized);
	return cc->deserializePublicKey(serialized);
}

LPPrivateKey<Poly> deserializePrivateKey(CryptoContext<Poly> cc, string privkey){
	Serialized serialized;
	SerializableHelper::StringToSerialization(privkey, &serialized);
	return cc->deserializeSecretKey(serialized);
}

Ciphertext<Poly> encryptInt(CryptoContext<Poly> cc, LPPublicKey<Poly> pubKey, int input){
	Plaintext plaintext = cc->MakeIntegerPlaintext(input);
	return cc->Encrypt(pubKey, plaintext);
}

Ciphertext<Poly> encryptBytes(CryptoContext<Poly> cc, LPPublicKey<Poly> pubKey, string input){
	Plaintext plaintext = cc->MakeStringPlaintext(input);
	return cc->Encrypt(pubKey, plaintext);
}

string serializeCiphertext(Ciphertext<Poly> ctext){
	Serialized ctextSerial;
	ctext->Serialize(&ctextSerial);
	string stringctext;
	if(SerializableHelper::SerializationToString(ctextSerial, stringctext)){
		return stringctext;
	}
	return NULL;
}

Ciphertext<Poly> deserializeCiphertext(CryptoContext<Poly> cc, string ctext){
	Serialized serialized;
	SerializableHelper::StringToSerialization(ctext, &serialized);
	return cc->deserializeCiphertext(serialized);
}


int decryptInt(CryptoContext<Poly> cc, LPPrivateKey<Poly> privkey, Ciphertext<Poly> ctext){
	Plaintext ptValue;
	cc->Decrypt(privkey, ctext, &ptValue);
	return ptValue->GetIntegerValue();
}

string decryptString(CryptoContext<Poly> cc, LPPrivateKey<Poly> privkey, Ciphertext<Poly> ctext){
	Plaintext ptValue;
	cc->Decrypt(privkey, ctext, &ptValue);
	return ptValue->GetStringValue();
}

Ciphertext<Poly> evalMult(CryptoContext<Poly> cc, Ciphertext<Poly> one, Ciphertext<Poly> two){
	return cc->EvalMult(one, two);
}

Ciphertext<Poly> evalAdd(CryptoContext<Poly> cc, Ciphertext<Poly> one, Ciphertext<Poly> two){
	return cc->EvalAdd(one, two);
}

Ciphertext<Poly> evalSub(CryptoContext<Poly> cc, Ciphertext<Poly> one, Ciphertext<Poly> two){
	return cc->EvalSub(one, two);
}

// decryptInt(CryptoContext<Poly> cc){

// }

// decryptBytes(CryptoContext<Poly> cc){

// }


PYBIND11_MODULE(example, m) {
	// m.doc() = "pybind11 example plugin"; // optional module docstring

	// m.def("printCryptoContext", &printCryptoContext, "");


	py::class_<CryptoContextImpl<Poly>, std::shared_ptr<CryptoContextImpl<Poly>>>(m, "CryptoContextImpl")
		.def("EvalMultKeyGen", &CryptoContextImpl<Poly>::EvalMultKeyGen);
	py::class_<LPKeyPair<Poly>, std::shared_ptr<LPKeyPair<Poly>>>(m, "LPKeyPair");
	py::class_<LPPublicKeyImpl<Poly>, std::shared_ptr<LPPublicKeyImpl<Poly>>>(m, "LPPublicKeyImpl");
	py::class_<LPPrivateKeyImpl<Poly>, std::shared_ptr<LPPrivateKeyImpl<Poly>>>(m, "LPPrivateKeyImpl");
	py::class_<CiphertextImpl<Poly>, std::shared_ptr<CiphertextImpl<Poly>>>(m, "CiphertextImpl");

	// py::class_<CryptoContext<Poly>, std::shared_ptr<CryptoContextImpl<Poly>>>(m, "CryptoContext");

	 py::class_<KeyStruct>(m, "KeyStruct")
        .def("getCC", &KeyStruct::getCC)
        .def("getKeypair", &KeyStruct::getKeypair);

	m.def("generateCC", &generateCC, "");
	m.def("serializeCC", &serializeCC, "");
	m.def("deserializeCryptoContext", &deserializeCryptoContext, "");
	m.def("generateKeys", &generateKeys, "");
	m.def("getPublicKey", &getPublicKey, "");
	m.def("getPrivateKey", &getPrivateKey, "");
	m.def("serializePublicKey", &serializePublicKey, "");
	m.def("serializePrivateKey", &serializePrivateKey, "");
	m.def("deserializePublicKey", &deserializePublicKey, "");
	m.def("deserializePrivateKey", &deserializePrivateKey, "");
	m.def("encryptInt", &encryptInt, "");
	m.def("encryptBytes", &encryptBytes, "");
	m.def("serializeCiphertext", &serializeCiphertext, "");
	m.def("deserializeCiphertext", &deserializeCiphertext, "");
	m.def("decryptInt", &decryptInt, "");
	m.def("decryptString", &decryptString, "");
	m.def("evalMult", &evalMult, "");
	m.def("evalAdd", &evalAdd, "");
	m.def("evalSub", &evalSub, "");

	m.def("printFullCtext", &printFullCtext, "");
	m.def("getCtextMatrixSample", &getCtextMatrixSample, "");
	// generateCC
	// serializeCC
	// deserializeCryptoContext
	// generateKeys
	// getPublicKey
	// getPrivateKey
	// serializePublicKey
	// serializePrivateKey
	// deserializePublicKey
	// deserializePrivateKey
	// encryptInt
	// encryptBytes
	// serializeCiphertext
	// deserializeCiphertext
	// decryptInt
	// decryptString


	// py::class_<CryptoContextFactory<Poly>, std::shared_ptr<CryptoContextFactory<Poly>>>(m, "CryptoContextFactory")
	// 	// .def("genCryptoContextFV", (CryptoContext<Poly> (*)(const usint, float, usint, float, unsigned int, unsigned int, unsigned int, MODE)) &CryptoContextFactory<Poly>::genCryptoContextFV)
	// 	.def("DeserializeAndCreateContext", &CryptoContextFactory<Poly>::DeserializeAndCreateContext);
	// py::enum_<PKESchemeFeature>(m, "PKESchemeFeature")
	// 	.value("ENCRYPTION", PKESchemeFeature::ENCRYPTION)
	// 	.value("PRE", PKESchemeFeature::PRE)
	// 	.value("SHE", PKESchemeFeature::SHE)
	// 	.value("FHE", PKESchemeFeature::FHE)
	// 	.value("LEVELEDSHE", PKESchemeFeature::LEVELEDSHE)
	// 	.value("MULTIPARTY", PKESchemeFeature::MULTIPARTY)
	// 	.export_values();
	// py::enum_<MODE>(m, "MODE")
	// 	.value("RLWE", MODE::RLWE)
	// 	.value("OPTIMIZED", MODE::OPTIMIZED)
	// 	.export_values();

	// py::class_<CryptoContext<Poly>, CryptoContext<Poly>>(m, "CryptoContext")
	// 	.def("Enable", (void (CryptoContext<Poly>::*)(PKESchemeFeature)) &CryptoContext<Poly>::Enable)
	// 	.def("KeyGen", &CryptoContext<Poly>::KeyGen)
	// 	.def("EvalMultKeyGen", &CryptoContext<Poly>::EvalMultKeyGen)
	// 	.def("EvalSumKeyGen", &CryptoContext<Poly>::EvalSumKeyGen)
	// 	.def("Encrypt", &CryptoContext<Poly>::Encrypt)
	// 	.def("Decrypt", &CryptoContext<Poly>::Decrypt)
	// 	.def("EvalMult", (std::shared_ptr<Ciphertext<Poly>> (CryptoContext<Poly>::*)(const std::shared_ptr<Ciphertext<Poly>>, const std::shared_ptr<Ciphertext<Poly>>) const) &CryptoContext<Poly>::EvalMult)
	// 	.def("EvalAdd", (std::shared_ptr<Ciphertext<Poly>> (CryptoContext<Poly>::*)(const std::shared_ptr<Ciphertext<Poly>>, const std::shared_ptr<Ciphertext<Poly>>) const) &CryptoContext<Poly>::EvalAdd)
	// 	.def("EvalSub", (std::shared_ptr<Ciphertext<Poly>> (CryptoContext<Poly>::*)(const std::shared_ptr<Ciphertext<Poly>>, const std::shared_ptr<Ciphertext<Poly>>) const) &CryptoContext<Poly>::EvalSub)
	// 	.def("Serialize", &CryptoContext<Poly>::Serialize)
	// 	.def("deserializeCiphertext", &CryptoContext<Poly>::deserializeCiphertext)
	// 	.def("deserializePublicKey", &CryptoContext<Poly>::deserializePublicKey)
	// 	.def("deserializeSecretKey", &CryptoContext<Poly>::deserializeSecretKey);

	// py::class_<DecryptResult>(m, "DecryptResult")
	// 	.def_readonly("isValid", &DecryptResult::isValid)
	// 	.def_readonly("messageLength", &DecryptResult::messageLength);

	// py::class_<LPKeyPair<Poly>, std::shared_ptr<LPKeyPair<Poly>>>(m, "LPKeyPair")
	// 	.def_readonly("publicKey", &LPKeyPair<Poly>::publicKey)
	// 	.def_readonly("secretKey", &LPKeyPair<Poly>::secretKey);
	// py::class_<LPPublicKey<Poly>, std::shared_ptr<LPPublicKey<Poly>>>(m, "LPPublicKey")
	// 	.def("Serialize", &LPPublicKey<Poly>::Serialize);
	// py::class_<LPPrivateKey<Poly>, std::shared_ptr<LPPrivateKey<Poly>>>(m, "LPPrivateKey")
	// 	.def("Serialize", &LPPrivateKey<Poly>::Serialize);

	// py::class_<Plaintext>(m, "Plaintext");
	// py::class_<IntPlaintextEncoding, Plaintext>(m, "IntPlaintextEncoding")
	// 	.def(py::init<std::vector<uint32_t>>())
	// 	.def("size", &IntPlaintextEncoding::size)
	// 	.def("resize", (void (std::vector<uint32_t>::*)(long unsigned int)) &std::vector<uint32_t>::resize);
	// py::class_<BytePlaintextEncoding, Plaintext>(m, "BytePlaintextEncoding")
	// 	.def(py::init<const char*>());

	// py::class_<Ciphertext<Poly>, std::shared_ptr<Ciphertext<Poly>>>(m, "Ciphertext")
	// 	.def(py::init<>())
	// 	.def("Serialize", &Ciphertext<Poly>::Serialize)
	// 	.def("GetElements", &Ciphertext<Poly>::GetElements)
	// 	.def("GetCryptoContext", &Ciphertext<Poly>::GetCryptoContext);

	// py::class_<Serialized>(m, "Serialized")
 //    .def(py::init<>());

	// // http://pybind11.readthedocs.io/en/stable/faq.html#limitations-involving-reference-arguments
	// m.def("SerializationToString", [](const Serialized& serObj, std::string& jsonString) { bool rv = SerializableHelper::SerializationToString(serObj, jsonString); return std::make_tuple(rv, jsonString); });
	// m.def("StringToSerialization", &SerializableHelper::StringToSerialization);
	// m.def("WriteSerializationToFile", &SerializableHelper::WriteSerializationToFile);
	// m.def("ReadSerializationFromFile", &SerializableHelper::ReadSerializationFromFile);

	// m.def("add", &add, "A function which adds two numbers");
	// m.def("nothing", &nothing, "A function which does nothing");
	// m.def("decodeInts", &decodeInts, "");
	// m.def("decodeBytes", &decodeBytes, "");
	// m.def("makeShared", &makeShared, "");
	// m.def("printCryptoContext", &printCryptoContext, "");

	// m.def("getCtextMatrixSample", &getCtextMatrixSample, "A function to retreive a small sample of a ctext for diaplay purposes");
	// m.def("genCCBV", &genCCBV, "func to gen cc bv with fixed values");

	// m.def("printFullCtext", &printFullCtext);
}
