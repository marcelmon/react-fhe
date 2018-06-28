#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include "palisade.h"
#include "cryptocontexthelper.h"
#include "cryptocontextgen.h"
#include "utils/serializablehelper.h"

namespace py = pybind11;

using namespace std;
using namespace lbcrypto;

int add(int i, int j) {
	return i + j;
}

py::bytes nothing(const std::string alice, const std::string bob) {
	int len = alice.length();
	char *carol = new char[len];
	for (int i = 0; i < len; i++) {
		carol[i] = alice[i] ^ bob[i];
	}
	// http://pybind11.readthedocs.io/en/stable/advanced/functions.html#return-value-policies
	return py::bytes(carol, len);
}

// TODO wish could get rid of this
std::vector<uint32_t> decodeInts(IntPlaintextEncoding plaintext) {
	return plaintext;
}

// TODO wish could get rid of this
std::string decodeBytes(BytePlaintextEncoding plaintext) {
	std::vector<uint8_t> v = (std::vector<uint8_t>) plaintext;
	std::string s;
	s.assign(v.begin(), v.end());
	return s;
}

// TODO wish could get rid of this
std::shared_ptr<Ciphertext<Poly>> makeShared(const Ciphertext<Poly> ciphertext) {
	std::shared_ptr<Ciphertext<Poly>> shared = std::make_shared<Ciphertext<Poly>>(ciphertext);
	return shared;
}

// TODO remove
void printCryptoContext(shared_ptr<CryptoContext<Poly>> cryptoContext) {
	std::cout << "p = " << cryptoContext->GetCryptoParameters()->GetPlaintextModulus() << std::endl;
}


PYBIND11_MODULE(example, m) {
	m.doc() = "pybind11 example plugin"; // optional module docstring

	py::class_<CryptoContextFactory<Poly>, std::shared_ptr<CryptoContextFactory<Poly>>>(m, "CryptoContextFactory")
		.def("genCryptoContextFV", (std::shared_ptr<CryptoContext<Poly>> (*)(const usint, float, usint, float, unsigned int, unsigned int, unsigned int, MODE)) &CryptoContextFactory<Poly>::genCryptoContextFV)
		.def("DeserializeAndCreateContext", &CryptoContextFactory<Poly>::DeserializeAndCreateContext);
	py::enum_<PKESchemeFeature>(m, "PKESchemeFeature")
		.value("ENCRYPTION", PKESchemeFeature::ENCRYPTION)
		.value("PRE", PKESchemeFeature::PRE)
		.value("SHE", PKESchemeFeature::SHE)
		.value("FHE", PKESchemeFeature::FHE)
		.value("LEVELEDSHE", PKESchemeFeature::LEVELEDSHE)
		.value("MULTIPARTY", PKESchemeFeature::MULTIPARTY)
		.export_values();
	py::enum_<MODE>(m, "MODE")
		.value("RLWE", MODE::RLWE)
		.value("OPTIMIZED", MODE::OPTIMIZED)
		.export_values();

	py::class_<CryptoContext<Poly>, std::shared_ptr<CryptoContext<Poly>>>(m, "CryptoContext")
		.def("Enable", (void (CryptoContext<Poly>::*)(PKESchemeFeature)) &CryptoContext<Poly>::Enable)
		.def("KeyGen", &CryptoContext<Poly>::KeyGen)
		.def("EvalMultKeyGen", &CryptoContext<Poly>::EvalMultKeyGen)
		.def("EvalSumKeyGen", &CryptoContext<Poly>::EvalSumKeyGen)
		.def("Encrypt", &CryptoContext<Poly>::Encrypt)
		.def("Decrypt", &CryptoContext<Poly>::Decrypt)
		.def("EvalMult", (std::shared_ptr<Ciphertext<Poly>> (CryptoContext<Poly>::*)(const std::shared_ptr<Ciphertext<Poly>>, const std::shared_ptr<Ciphertext<Poly>>) const) &CryptoContext<Poly>::EvalMult)
		.def("EvalAdd", (std::shared_ptr<Ciphertext<Poly>> (CryptoContext<Poly>::*)(const std::shared_ptr<Ciphertext<Poly>>, const std::shared_ptr<Ciphertext<Poly>>) const) &CryptoContext<Poly>::EvalAdd)
		.def("EvalSub", (std::shared_ptr<Ciphertext<Poly>> (CryptoContext<Poly>::*)(const std::shared_ptr<Ciphertext<Poly>>, const std::shared_ptr<Ciphertext<Poly>>) const) &CryptoContext<Poly>::EvalSub)
		.def("Serialize", &CryptoContext<Poly>::Serialize)
		.def("deserializeCiphertext", &CryptoContext<Poly>::deserializeCiphertext)
		.def("deserializePublicKey", &CryptoContext<Poly>::deserializePublicKey)
		.def("deserializeSecretKey", &CryptoContext<Poly>::deserializeSecretKey);

	py::class_<DecryptResult>(m, "DecryptResult")
		.def_readonly("isValid", &DecryptResult::isValid)
		.def_readonly("messageLength", &DecryptResult::messageLength);

	py::class_<LPKeyPair<Poly>, std::shared_ptr<LPKeyPair<Poly>>>(m, "LPKeyPair")
		.def_readonly("publicKey", &LPKeyPair<Poly>::publicKey)
		.def_readonly("secretKey", &LPKeyPair<Poly>::secretKey);
	py::class_<LPPublicKey<Poly>, std::shared_ptr<LPPublicKey<Poly>>>(m, "LPPublicKey")
		.def("Serialize", &LPPublicKey<Poly>::Serialize);
	py::class_<LPPrivateKey<Poly>, std::shared_ptr<LPPrivateKey<Poly>>>(m, "LPPrivateKey")
		.def("Serialize", &LPPrivateKey<Poly>::Serialize);

	py::class_<Plaintext>(m, "Plaintext");
	py::class_<IntPlaintextEncoding, Plaintext>(m, "IntPlaintextEncoding")
		.def(py::init<std::vector<uint32_t>>())
		.def("size", &IntPlaintextEncoding::size)
		.def("resize", (void (std::vector<uint32_t>::*)(long unsigned int)) &std::vector<uint32_t>::resize);
	py::class_<BytePlaintextEncoding, Plaintext>(m, "BytePlaintextEncoding")
		.def(py::init<const char*>());

	py::class_<Ciphertext<Poly>, std::shared_ptr<Ciphertext<Poly>>>(m, "Ciphertext")
		.def(py::init<>())
		.def("Serialize", &Ciphertext<Poly>::Serialize)
		.def("GetElements", &Ciphertext<Poly>::GetElements)
		.def("GetCryptoContext", &Ciphertext<Poly>::GetCryptoContext);

	py::class_<Serialized>(m, "Serialized")
    .def(py::init<>());

	// http://pybind11.readthedocs.io/en/stable/faq.html#limitations-involving-reference-arguments
	m.def("SerializationToString", [](const Serialized& serObj, std::string& jsonString) { bool rv = SerializableHelper::SerializationToString(serObj, jsonString); return std::make_tuple(rv, jsonString); });
	m.def("StringToSerialization", &SerializableHelper::StringToSerialization);
	m.def("WriteSerializationToFile", &SerializableHelper::WriteSerializationToFile);
	m.def("ReadSerializationFromFile", &SerializableHelper::ReadSerializationFromFile);

	m.def("add", &add, "A function which adds two numbers");
	m.def("nothing", &nothing, "A function which does nothing");
	m.def("decodeInts", &decodeInts, "");
	m.def("decodeBytes", &decodeBytes, "");
	m.def("makeShared", &makeShared, "");
	m.def("printCryptoContext", &printCryptoContext, "");
}
