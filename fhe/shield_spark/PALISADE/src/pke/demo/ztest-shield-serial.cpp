#include <iostream>
#include <fstream>
#include <iterator>
#include <chrono>
#include <iterator>

#include "palisade.h"
#include "cryptocontexthelper.h"
#include "utils/debug.h"
#include "utils/serializablehelper.h"

using namespace std;
using namespace lbcrypto;



void serializeCC(CryptoContext<Poly> ctx){
	Serialized ccSerial;
	if(ctx->Serialize(&ccSerial)){
		string stringcc;
		bool ccRet = SerializableHelper::SerializationToString(ccSerial, stringcc);
		cout << stringcc << " string stringcc"<< endl << endl << endl << endl;
		cout << " cc ret " << ccRet << endl << "\n\n\n\n\n\n\n\n";
	}
	else{
		cerr << "Error serializing cc" << endl;
		return;
	}
}



void
keymaker(CryptoContext<Poly> ctx)
{

	// Initialize the public key containers.
	LPKeyPair<Poly> kp = ctx->KeyGen();

	if( kp.publicKey && kp.secretKey ) {
		Serialized pubK, privK;

		if( kp.publicKey->Serialize(&pubK) ) {
			string stringPubK;
			bool pubRet = SerializableHelper::SerializationToString(pubK, stringPubK);
			cout << stringPubK << " string prk"<< endl << endl << endl << endl;
			cout << " pubRet ret " << pubRet << endl << "\n\n\n\n\n\n\n\n";
		} else {
			cerr << "Error serializing public key" << endl;
			return;
		}
		if( kp.secretKey->Serialize(&privK) ) {
			string stringPrivK;
			bool privRet = SerializableHelper::SerializationToString(privK, stringPrivK);
			cout << stringPrivK << " string prk"<< endl << endl << endl << endl;

			cout << " privRet ret " << privRet << endl << "\n\n\n\n\n\n\n\n";

		} else {
			cerr << "Error serializing private key" << endl;
			return;
		}
	} else {
		cerr << "Failure in generating keys" << endl;
	}

	return;
}




int main(int argc, char *argv[])
{

	int plaintextModulus = 1024;
	int depth = 4;
	uint64_t cyclotomicOrder = 1024*2/16;

	/// SOLINAS PRIME
	// BigInteger modulusBigInt = PolyType::Integer("2147352577");
	// BigInteger rootOfUnityBigInt = PolyType::Integer("1539779042");

	BigInteger modulusBigInt = Poly::Integer("2147352577");
	BigInteger rootOfUnityBigInt = Poly::Integer("461230749");

	// BigInteger modulusBigInt = PolyType::Integer("2147473409");
	// BigInteger rootOfUnityBigInt = PolyType::Integer("256290069");

	usint relinWindow = 1;
	float stDev = 3;

	MODE mode = RLWE;

	shared_ptr<typename Poly::Params> parms;

	parms.reset( new typename Poly::Params(cyclotomicOrder,
							modulusBigInt,
							rootOfUnityBigInt));

	CryptoContext<Poly> cc = CryptoContextFactory<Poly>::genCryptoContextSHIELD(
		parms, plaintextModulus, relinWindow, stDev, mode, depth);

	cc->Enable(ENCRYPTION);
	cc->Enable(SHE);


	serializeCC(cc);

	keymaker(cc);

	return 0;
}
