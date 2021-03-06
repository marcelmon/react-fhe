/**
 * @file SHIELD.h -- Operations for the SHIELD cryptoscheme.
 * @author  TPOC: palisade@njit.edu
 *
 * @copyright Copyright (c) 2017, New Jersey Institute of Technology (NJIT)
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice, this
 * list of conditions and the following disclaimer in the documentation and/or other
 * materials provided with the distribution.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS
 * OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN
 * IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
 /*
 * This code implements the SHIELD homomorphic encryption scheme.
 
 */


#ifndef LBCRYPTO_CRYPTO_SHIELD_H
#define LBCRYPTO_CRYPTO_SHIELD_H

//Includes Section
#include "palisade.h"

/**
 * @namespace lbcrypto
 * The namespace of lbcrypto
 */
namespace lbcrypto {

	/**
	 * @brief Crypto parameters class for RLWE-based schemes.
	 * The basic scheme is described here:
	 *   -  Brakerski Z., Vaikuntanathan V. (2011) Fully Homomorphic Encryption from Ring-LWE and Security for Key Dependent Messages. In: Rogaway P. (eds) Advances in Cryptology – CRYPTO 2011. CRYPTO 2011. Lecture Notes in Computer Science, vol 6841. Springer, Berlin, Heidelberg
	 *      (http://www.wisdom.weizmann.ac.il/~zvikab/localpapers/IdealHom.pdf) or alternative Internet source: (http://dx.doi.org/10.1007/978-3-642-22792-9_29).
	 * 
	 *
	 * @tparam Element a ring element.
	 */
	template <class Element>
	class LPCryptoParametersSHIELD : public LPCryptoParametersRLWE<Element> {
		public:
			
			/**
			 * Default Constructor.
			 */
			LPCryptoParametersSHIELD() : LPCryptoParametersRLWE<Element>() {
				m_mode = RLWE;
			}

			/**
			 * Copy constructor.
			 *
	 		 * @param rhs - source
			 */
			LPCryptoParametersSHIELD(const LPCryptoParametersSHIELD &rhs) : LPCryptoParametersRLWE<Element>(rhs) {
				m_mode = rhs.m_mode;
			}

			/**
			 * Constructor that initializes values.  Note that it is possible to set parameters in a way that is overall
			 * infeasible for actual use.  There are fewer degrees of freedom than parameters provided.  Typically one
			 * chooses the basic noise, assurance and security parameters as the typical community-accepted values, 
			 * then chooses the plaintext modulus and depth as needed.  The element parameters should then be choosen 
			 * to provide correctness and security.  In some cases we would need to operate over already 
			 * encrypted/provided ciphertext and the depth needs to be pre-computed for initial settings.
			 *
			 * @param &params element parameters.
			 * @param &plaintextModulus plaintext modulus.
			 * @param distributionParameter noise distribution parameter.
			 * @param assuranceMeasure assurance level.
			 * @param securityLevel security level.
			 * @param relinWindow the size of the relinearization window.
			 * @param mode sets the mode of operation: RLWE or OPTIMIZED
			 * @param depth depth which is set to 1.
			 */
			LPCryptoParametersSHIELD(
				shared_ptr<typename Element::Params> params,
				const PlaintextModulus &plaintextModulus,
				float distributionParameter, 
				float assuranceMeasure, 
				float securityLevel, 
				usint relinWindow,
				MODE mode,
				int depth = 1)
					: LPCryptoParametersRLWE<Element>(
						params,
						EncodingParams( new EncodingParamsImpl(plaintextModulus) ),
						distributionParameter,
						assuranceMeasure,
						securityLevel,
						relinWindow,
						depth) {
				m_mode = mode;
			}

			/**
			* Constructor that initializes values.
			*
			* @param &params element parameters.
			* @param &encodingParams plaintext space parameters.
			* @param distributionParameter noise distribution parameter.
			* @param assuranceMeasure assurance level.
			* @param securityLevel security level.
			* @param relinWindow the size of the relinearization window.
			* @param mode sets the mode of operation: RLWE or OPTIMIZED
			* @param depth depth which is set to 1.
			*/
			LPCryptoParametersSHIELD(
				shared_ptr<typename Element::Params> params,
				EncodingParams encodingParams,
				float distributionParameter,
				float assuranceMeasure,
				float securityLevel,
				usint relinWindow,
				MODE mode,
				int depth = 1)
				: LPCryptoParametersRLWE<Element>(
					params,
					encodingParams,
					distributionParameter,
					assuranceMeasure,
					securityLevel,
					relinWindow,
					depth) {
				m_mode = mode;
			}

			/**
			* Destructor.
			*/
			virtual ~LPCryptoParametersSHIELD() {}
			
			/**
			* Serialize the object into a Serialized
			* @param serObj is used to store the serialized result. It MUST be a rapidjson Object (SetObject());
			* @return true if successfully serialized
			*/
			bool Serialize(Serialized* serObj) const;

			/**
			* Populate the object from the deserialization of the Serialized
			* @param serObj contains the serialized object
			* @return true on success
			*/
			bool Deserialize(const Serialized& serObj);

			/**
			* Gets the mode setting: RLWE or OPTIMIZED.
			*
			* @return the mode setting.
			*/
			MODE GetMode() const { return m_mode; }

			/**
			* Configures the mode for generating the secret key polynomial
			*/
			void SetMode(MODE mode) { m_mode = mode; }

			/**
			* == operator to compare to this instance of LPCryptoParametersSHIELD object.
			*
			* @param &rhs LPCryptoParameters to check equality against.
			*/
			bool operator==(const LPCryptoParameters<Element> &rhs) const {
				const LPCryptoParametersSHIELD<Element> *el = dynamic_cast<const LPCryptoParametersSHIELD<Element> *>(&rhs);

				if (el == 0) return false;

				if (m_mode != el->m_mode) return false;

				return  LPCryptoParametersRLWE<Element>::operator==(rhs);
			}

			void PrintParameters(std::ostream& os) const {
				LPCryptoParametersRLWE<Element>::PrintParameters(os);

				os << " mode: " << m_mode;
			}

	private:
		// specifies whether the keys are generated from discrete 
		// Gaussian distribution or ternary distribution with the norm of unity
		MODE m_mode;

	};


	/**
	* @brief Encryption algorithm implementation template for SHIELD-based schemes.
	
	* @tparam Element a ring element.
	*/
	template <class Element>
	class LPAlgorithmSHIELD : public LPEncryptionAlgorithm<Element> {
	public:

		/**
		 * Default constructor
		 */
		LPAlgorithmSHIELD() {};

		/**
		* Method for encrypting plaintext using SHIELD Scheme
		*
		* @param publicKey is the public key used for encryption.
		* @param &plaintext the plaintext input.
		* @param doEncryption encrypts if true, embeds (encodes) the plaintext into cryptocontext if false
		* @return ciphertext which results from encryption.
		*/
		Ciphertext<Element> Encrypt(const LPPublicKey<Element> publicKey, Element plaintext) const;


		/**
		 * Encrypt method for the SHIELD Scheme.  See the class description for citations on where the algorithms were
		 * taken from.
		 *
		 * @param privateKey The encryption key.
		 * @param plaintext Plaintext to be encrypted.
		 * @param doEncryption encrypts if true, embeds (encodes) the plaintext into cryptocontext if false
		 * @return A shared pointer to the encrypted Ciphertext.
		 */
		Ciphertext<Element> Encrypt(const LPPrivateKey<Element> privateKey, Element plaintext) const
		{
			std::string errMsg = "LPAlgorithmSHIELD::Encrypt with plaintext is not implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}

		/**
		* Method for decrypting plaintext using SHIELD
		*
		* @param &privateKey private key used for decryption.
		* @param &ciphertext ciphertext id decrypted.
		* @param *plaintext the plaintext output.
		* @return the success/fail result
		*/
		DecryptResult Decrypt(const LPPrivateKey<Element> privateKey,
			const Ciphertext<Element> ciphertext,
			NativePoly *plaintext) const;

		/**
		* Function to generate public and private keys
		*
		* @param cc is the cryptoContext which encapsulates the crypto paramaters.
		* @param makeSparse is a boolean flag that species if the key is sparse(interleaved zeroes) or not.
		* @return KeyPair containting private key and public key.
		*/
		LPKeyPair<Element> KeyGen(CryptoContext<Element> cc, bool makeSparse=false);

	};

	/**
	* Class for evaluation of somewhat homomorphic operations.
	* The basic scheme is described here:
	*   -  Brakerski Z., Vaikuntanathan V. (2011) Fully Homomorphic Encryption from Ring-LWE and Security for Key Dependent Messages. In: Rogaway P. (eds) Advances in Cryptology – CRYPTO 2011. CRYPTO 2011. Lecture Notes in Computer Science, vol 6841. Springer, Berlin, Heidelberg
	*      (http://www.wisdom.weizmann.ac.il/~zvikab/localpapers/IdealHom.pdf) or alternative Internet source: (http://dx.doi.org/10.1007/978-3-642-22792-9_29).
	* 
	* We use advances from the BGV scheme for levelled homomorphic capabilities from here:
	*   - Brakerski Z., Gentry C., Halevi S. (2013) Packed Ciphertexts in LWE-Based Homomorphic Encryption. In: Kurosawa K., Hanaoka G. (eds) Public-Key Cryptography – PKC 2013. Lecture Notes in Computer Science, vol 7778. Springer, Berlin, Heidelberg
	*     (https://eprint.iacr.org/2011/277.pdf).
	*
	* Implementation design details that we use in our implementation are discussed here: 
	*   - Gentry C., Halevi S., Smart N.P. (2012) Homomorphic Evaluation of the AES Circuit. In: Safavi-Naini R., Canetti R. (eds) Advances in Cryptology – CRYPTO 2012. Lecture Notes in Computer Science, vol 7417. Springer, Berlin, Heidelberg
	*     ( https://eprint.iacr.org/2012/099.pdf)
	*
	* @tparam Element a ring element.
	*/
	template <class Element>
	class LPAlgorithmSHESHIELD : public LPSHEAlgorithm<Element> {
	public:

		/**
		* Default constructor
		*/
		LPAlgorithmSHESHIELD() {}

		/**
		* Function for homomorphic addition of ciphertexts.
		*
		* @param ciphertext1 first input ciphertext.
		* @param ciphertext2 second input ciphertext.
		* @return result of homomorphic addition of input ciphertexts.
		*/
		Ciphertext<Element> EvalAdd(const Ciphertext<Element> ciphertext1,
			const Ciphertext<Element> ciphertext2) const;


		/**
		* Function for evaluation addition on ciphertext.
		* See the class description for citations on where the algorithms were taken from.
		*
		* @param ciphertext The input ciphertext.
		* @param plaintext The input plaintext.
		* @return A shared pointer to the ciphertext which is the EvalAdd of the two inputs.
		*/
		Ciphertext<Element> EvalAdd(const Ciphertext<Element> ciphertext,
			const Plaintext plaintext) const
		{
			std::string errMsg = "LPAlgorithmSHESHIELD::EvalAdd with plaintext is not implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}



		/**
		* Function for homomorphic subtraction of ciphertexts.
		*
		* @param ciphertext1 the input ciphertext.
		* @param ciphertext2 the input ciphertext.
		* @return result of homomorphic subtraction of input ciphertexts.
		*/
		Ciphertext<Element> EvalSub(const Ciphertext<Element> ciphertext1, 
			const Ciphertext<Element> ciphertext2) const;


		/**
		* Function for evaluation addition on ciphertext.
		* See the class description for citations on where the algorithms were taken from.
		*
		* @param ciphertext The input ciphertext.
		* @param plaintext The input plaintext.
		* @return A shared pointer to the ciphertext which is the EvalAdd of the two inputs.
		*/
		Ciphertext<Element> EvalSub(const Ciphertext<Element> ciphertext,
			const Plaintext plaintext) const
		{
			std::string errMsg = "LPAlgorithmSHESHIELD::EvalSub with plaintext is not implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}

		/**
		* Function for homomorphic multiplication of ciphertexts without key switching. 
		* Currently it assumes that the input arguments are fresh ciphertexts (of depth 1). Support for the input ciphertexts of higher depths will be added later.
		*
		* @param ciphertext1 first input ciphertext.
		* @param ciphertext2 second input ciphertext.
		* @return result of homomorphic multiplication of input ciphertexts.
		*/
		Ciphertext<Element> EvalMult(const Ciphertext<Element> ciphertext1,
			const Ciphertext<Element> ciphertext2) const;

		/**
		* Function for multiplying ciphertext by plaintext.
		*
		* @param ciphertext input ciphertext.
		* @param plaintext input plaintext embedded in the cryptocontext.
		* @return result of the multiplication.
		*/
		Ciphertext<Element> EvalMult(const Ciphertext<Element> ciphertext,
			const Plaintext plaintext) const 
		{
			std::string errMsg = "LPAlgorithmSHESHIELD::EvalMult with plaintext is not implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		
		}

		/**
		* Function for homomorphic multiplication of ciphertexts followed by key switching operation.
		* Currently it assumes that the input arguments are fresh ciphertexts (of depth 1). Support for the input ciphertexts of higher depths will be added later.
		*
		* @param ciphertext1 first input ciphertext.
		* @param ciphertext2 second input ciphertext.
		* @param ek is the evaluation key to make the newCiphertext decryptable by the same secret key as that of ciphertext1 and ciphertext2.
		* @return result of homomorphic multiplication of input ciphertexts.
		*/
		Ciphertext<Element> EvalMult(const Ciphertext<Element> ciphertext1,
			const Ciphertext<Element> ciphertext2,
			const LPEvalKey<Element> ek) const;


		/**
		* Unimplemented function to support  a multiplication with depth larger than 2 for the SHIELD scheme.
		*
		* @param ciphertext1 The first input ciphertext.
		* @param ciphertext2 The second input ciphertext.
		* @param ek is the evaluation keys input.
		* @return A shared pointer to the ciphertext which is the EvalMult of the two inputs.
		*/
		Ciphertext<Element> EvalMultAndRelinearize(const Ciphertext<Element> ciphertext1,
			const Ciphertext<Element> ciphertext2,
			const vector<LPEvalKey<Element>> &ek) const {
			std::string errMsg = "LPAlgorithmSHESHIELD::EvalMultAndRelinearize is not implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}

		/**
		* Unimplemented function to support multiplication of a list of ciphertexts with depth larger than 2 for the SHIELD scheme.
		*
		* @param cipherTextList is the input ciphertexts.
		* @param evalKey is the evaluation keys input.
		* @return A shared pointer to the ciphertext which is the result of the multiplication.
		*/
		Ciphertext<Element> EvalMultMany(const vector<Ciphertext<Element>>& cipherTextList,
				const vector<LPEvalKey<Element>> &evalKeys) const {
			std::string errMsg = "LPAlgorithmSHESHIELD::EvalMultMany is not implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}



		/**
		* Function for homomorphic negation of ciphertexts.
		*
		* @param ct first input ciphertext.
		* @return new ciphertext.
		*/
		Ciphertext<Element> EvalNegate(const Ciphertext<Element> ct) const
		{
			std::string errMsg = "LPAlgorithmSHESHIELD::EvalNegate is not implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}

		/**
		* Method for generating a KeySwitchHint using RLWE relinearization (based on the RLWE assumption only)
		*
		* @param originalPrivateKey is the original private key used for encryption.
		* @param newPrivateKey is the new private key to generate the keyswitch hint.
		* @return resulting keySwitchHint to switch the ciphertext to be decryptable by new private key.
		*/
		LPEvalKey<Element> KeySwitchGen(const LPPrivateKey<Element> originalPrivateKey, 
			const LPPrivateKey<Element> newPrivateKey) const
		{
			std::string errMsg = "LPAlgorithmSHESHIELD::KeySwitchGen is not implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}

		/**
		* Method for KeySwitching based on a KeySwitchHint - uses the RLWE relinearization
		*
		* @param keySwitchHint Hint required to perform the ciphertext switching.
		* @param cipherText Original ciphertext to perform switching on.
		* @return cipherText decryptable by new private key.
		*/
		Ciphertext<Element> KeySwitch(const LPEvalKey<Element> keySwitchHint, 
			const Ciphertext<Element> cipherText) const
		{
			std::string errMsg = "LPAlgorithmSHESHIELD::KeySwitch is not implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}

		/**
		* Method for KeySwitching based on NTRU key generation and RLWE relinearization. Not used for SHIELD.
		* Function to generate 1..log(q) encryptions for each bit of the original private key
		*
		* @param &newPublicKey encryption key for the new ciphertext.
		* @param origPrivateKey original private key used for decryption.
		*/
		LPEvalKey<Element> KeySwitchRelinGen(const LPPublicKey<Element> newPublicKey,
			const LPPrivateKey<Element> origPrivateKey) const {
			std::string errMsg = "LPAlgorithmSHESHIELD:KeySwitchRelinGen is not implemented for SHIELD as relinearization is the default technique and no NTRU key generation is used in SHIELD.";
			throw std::runtime_error(errMsg);
		}

		/**
		* Method for KeySwitching based on NTRU key generation and RLWE relinearization. Not used for SHIELD.
		*
		* @param evalKey the evaluation key.
		* @param ciphertext the input ciphertext.
		* @return the resulting Ciphertext
		*/
		Ciphertext<Element> KeySwitchRelin(const LPEvalKey<Element> evalKey,
			const Ciphertext<Element> ciphertext) const {
			std::string errMsg = "LPAlgorithmSHESHIELD:KeySwitchRelin is not implemented for SHIELD as relinearization is the default technique and no NTRU key generation is used in SHIELD.";
			throw std::runtime_error(errMsg);
		}

		/**
		* Function to generate key switch hint on a ciphertext for depth 2.
		*
		* @param originalPrivateKey is the original private key used for generating ciphertext.
		* @return keySwitchHint generated to switch the ciphertext.
		*/
		LPEvalKey<Element> EvalMultKeyGen(const LPPrivateKey<Element> originalPrivateKey) const;


		/**
		* Function to generate key switch hint on a ciphertext of depth more than 2.
		* This method is not currently supported.
		* This method uses a key switch hint which is not secure, even without the subfield lattice attacks.
		*
		* @param originalPrivateKey private key to start from.
		* @return resulting evalkeyswitch hint
		*/
		vector<LPEvalKey<Element>> EvalMultKeysGen(const LPPrivateKey<Element> originalPrivateKey) const {
			std::string errMsg = "LPAlgorithmSHESHIELD::EvalMultKeysGen is not implemented for SHIELD SHE Scheme.";
			throw std::runtime_error(errMsg);
		}


		/**
		* Function for evaluating automorphism of ciphertext at index i
		*
		* @param ciphertext the input ciphertext.
		* @param i automorphism index
		* @param &evalKeys - reference to the map of evaluation keys generated by EvalAutomorphismKeyGen.
		* @return resulting ciphertext
		*/
		Ciphertext<Element> EvalAutomorphism(const Ciphertext<Element> ciphertext, usint i,
			const std::map<usint,LPEvalKey<Element>> &evalKeys) const
		{
			std::string errMsg = "LPAlgorithmSHESHIELD::EvalAutomorphism is not implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}


		/**
		* Generate automophism keys for a given private key; Uses the private key for encryption
		*
		* @param privateKey private key.
		* @param indexList list of automorphism indices to be computed
		* @return returns the evaluation keys
		*/
		shared_ptr<std::map<usint,LPEvalKey<Element>>> EvalAutomorphismKeyGen(const LPPrivateKey<Element> privateKey,
			const std::vector<usint> &indexList) const
		{
			std::string errMsg = "LPAlgorithmSHESHIELD::EvalAutomorphismKeyGen is not implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}

		/**
		* Generate automophism keys for a given private key; Uses the public key for encryption
		*
		* @param publicKey public key.
		* @param privateKey private key.
		* @param indexList list of automorphism indices to be computed
		* @return returns the evaluation keys
		*/
		shared_ptr<std::map<usint, LPEvalKey<Element>>> EvalAutomorphismKeyGen(const LPPublicKey<Element> publicKey,
			const LPPrivateKey<Element> privateKey, const std::vector<usint> &indexList) const {
			std::string errMsg = "LPAlgorithmSHESHIELD::EvalAutomorphismKeyGen is not implemented for SHIELD SHE Scheme.";
			throw std::runtime_error(errMsg);
		}

	};

	/**
	* @brief PRE scheme based on SHIELD.
	* The basic scheme is described here:
	*   -  Brakerski Z., Vaikuntanathan V. (2011) Fully Homomorphic Encryption from Ring-LWE and Security for Key Dependent Messages. In: Rogaway P. (eds) Advances in Cryptology – CRYPTO 2011. CRYPTO 2011. Lecture Notes in Computer Science, vol 6841. Springer, Berlin, Heidelberg
	*      (http://www.wisdom.weizmann.ac.il/~zvikab/localpapers/IdealHom.pdf) or alternative Internet source: (http://dx.doi.org/10.1007/978-3-642-22792-9_29).
	* 
	* We use advances from the BGV scheme for levelled homomorphic capabilities from here:
	*   - Brakerski Z., Gentry C., Halevi S. (2013) Packed Ciphertexts in LWE-Based Homomorphic Encryption. In: Kurosawa K., Hanaoka G. (eds) Public-Key Cryptography – PKC 2013. Lecture Notes in Computer Science, vol 7778. Springer, Berlin, Heidelberg
	*     (https://eprint.iacr.org/2011/277.pdf).
	*
 	* Our PRE design and algorithms are informed by the design here:
 	*   - Polyakov, Yuriy, Kurt Rohloff, Gyana Sahu and Vinod Vaikuntanathan. Fast Proxy Re-Encryption for Publish/Subscribe Systems. Under Review in ACM Transactions on Privacy and Security (ACM TOPS).
	*
	* @tparam Element a ring element.
	*/
	template <class Element>
	class LPAlgorithmPRESHIELD : public LPPREAlgorithm<Element> {
	public:

		/**
		 * Default constructor
		 */
		LPAlgorithmPRESHIELD() {}

		/**
		* Function to generate a re-encryption key as 1..log(q) encryptions for each bit of the original private key
		* Variant that uses the new secret key directly.
		*
		* @param newKey new private key for the new ciphertext.
		* @param origPrivateKey original private key used for decryption.
		* @return evalKey the evaluation key for switching the ciphertext to be decryptable by new private key.
		*/
		LPEvalKey<Element> ReKeyGen(const LPPrivateKey<Element> newKey,
			const LPPrivateKey<Element> origPrivateKey) const
		{
			std::string errMsg = "LPAlgorithmPRESHIELD::ReKeyGen is not implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}

		/**
		* Function to generate a re-encryption key as 1..log(q) encryptions for each bit of the original private key
		* Variant that uses the public key for the new secret key.
		*
		* @param newKey public key for the new private key.
		* @param origPrivateKey original private key used for decryption.
		* @return evalKey the evaluation key for switching the ciphertext to be decryptable by new private key.
		*/
		LPEvalKey<Element> ReKeyGen(const LPPublicKey<Element> newKey,
			const LPPrivateKey<Element> origPrivateKey) const {
			std::string errMsg = "LPAlgorithmPRESHIELD::ReKeyGen using a public key of the new secret key is not implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}

		/**
		* Function to define the re-encryption method using the evaluation key generated by ReKeyGen
		*
		* @param evalKey the evaluation key.
		* @param ciphertext the input ciphertext.
		* @return resulting ciphertext after the re-encryption operation.
		*/
		Ciphertext<Element> ReEncrypt(const LPEvalKey<Element> evalKey,
			const Ciphertext<Element> ciphertext) const
		{
			std::string errMsg = "LPAlgorithmPRESHIELD::ReEncrypt is not implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}

	};

	/**
	 * @brief The multiparty homomorphic encryption capability for the SHIELD scheme. A version of this multiparty scheme built on the BGV scheme is seen here:
	 *   - Asharov G., Jain A., López-Alt A., Tromer E., Vaikuntanathan V., Wichs D. (2012) Multiparty Computation with Low Communication, Computation and Interaction via Threshold FHE. In: Pointcheval D., Johansson T. (eds) Advances in Cryptology – EUROCRYPT 2012. EUROCRYPT 2012. Lecture Notes in Computer Science, vol 7237. Springer, Berlin, Heidelberg
	 *
	 * During offline key generation, this multiparty scheme relies on the clients coordinating their public key generation.  To do this, a single client generates a public-secret key pair.
	 * This public key is shared with other keys which use an element in the public key to generate their own public keys.
	 * The clients generate a shared key pair using a scheme-specific approach, then generate re-encryption keys.  Re-encryption keys are uploaded to the server.
	 * Clients encrypt data with their public keys and send the encrypted data server.
	 * The data is re-encrypted.  Computations are then run on the data.
	 * The result is sent to each of the clients.
	 * One client runs a "Leader" multiparty decryption operation with its own secret key.  All other clients run a regular "Main" multiparty decryption with their own secret key.
	 * The resulting partially decrypted ciphertext are then fully decrypted with the decryption fusion algorithms.
	 *
	 * @tparam Element a ring element.
	 */
	template <class Element>
	class LPAlgorithmMultipartySHIELD : public LPMultipartyAlgorithm<Element> {
	public:

		/**
		 * Default constructor
		 */
		LPAlgorithmMultipartySHIELD() {}

		LPKeyPair<Element> MultipartyKeyGen(CryptoContext<Element> cc,
			const LPPublicKey<Element> pk1,
			bool makeSparse=false,
			bool pre=false) {
			std::string errMsg = "LPAlgorithmMultipartySHIELD::MultipartyKeyGen using the new secret key is not implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}
		
		/**
		 * Method for main decryption operation run by most decryption clients for multiparty homomorphic encryption
		 *
		 * @param privateKey private key used for decryption.
		 * @param ciphertext ciphertext id decrypted.
		 */
		LPKeyPair<Element> MultipartyKeyGen(CryptoContext<Element> cc,
			const vector<LPPrivateKey<Element>>& secretKeys,
			bool makeSparse=false) {
			std::string errMsg = "LPAlgorithmMultipartySHIELD::MultipartyKeyGen using the new secret key is not implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}

		/**
		 * Method for main decryption operation run by most decryption clients for multiparty homomorphic encryption
		 *
		 * @param privateKey private key used for decryption.
		 * @param ciphertext ciphertext id decrypted.
		 */
		Ciphertext<Element> MultipartyDecryptMain(const LPPrivateKey<Element> privateKey,
			const Ciphertext<Element> ciphertext) const
		{
			std::string errMsg = "LPAlgorithmMultipartySHIELD::MultipartyDecryptMain using the new secret key is not implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}

		/**
		 * Method for decryption operation run by the lead decryption client for multiparty homomorphic encryption
		 *
		 * @param privateKey private key used for decryption.
		 * @param ciphertext ciphertext id decrypted.
		 */
		Ciphertext<Element> MultipartyDecryptLead(const LPPrivateKey<Element> privateKey,
			const Ciphertext<Element> ciphertext) const
		{
			std::string errMsg = "LPAlgorithmMultipartySHIELD::MultipartyDecryptLead using the new secret key is not implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}

		/**
		 * Method for fusing the partially decrypted ciphertext.
		 *
		 * @param &ciphertextVec ciphertext id decrypted.
		 * @param *plaintext the plaintext output.
		 * @return the decoding result.
		 */
		DecryptResult MultipartyDecryptFusion(const vector<Ciphertext<Element>>& ciphertextVec,
			NativePoly *plaintext) const
		{
			std::string errMsg = "LPAlgorithmMultipartySHIELD::MultipartyDecryptFusion using the new secret key is not implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}
	};


	/**
	* @brief Concrete feature class for Leveled SHESHIELD operations. This class adds leveled (BGV scheme) features to the SHIELD scheme.
	* 
	* We use advances from the BGV scheme for levelled homomorphic capabilities from here:
	*   - Brakerski Z., Gentry C., Halevi S. (2013) Packed Ciphertexts in LWE-Based Homomorphic Encryption. In: Kurosawa K., Hanaoka G. (eds) Public-Key Cryptography – PKC 2013. Lecture Notes in Computer Science, vol 7778. Springer, Berlin, Heidelberg
	*     (https://eprint.iacr.org/2011/277.pdf).
	*
	* @tparam Element a ring element.
	*/
	template <class Element>
	class LPLeveledSHEAlgorithmSHIELD : public LPLeveledSHEAlgorithm<Element> {
	public:
		/**
		* Default constructor
		*/
		LPLeveledSHEAlgorithmSHIELD() {}

		/**
		* Method for ModReducing CipherText.
		*
		* @param cipherText is the ciphertext to perform modreduce on.
		* @return ciphertext after the modulus reduction performed.
		*/
		virtual Ciphertext<Element> ModReduce(Ciphertext<Element> cipherText) const
		{
			std::string errMsg = "LPLeveledSHEAlgorithmSHIELD::ModReduce using the new secret key is not implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}

		/**
		* Method for RingReducing CipherText. Not implemented for the SHIELD scheme.
		*
		* @param cipherText is the ciphertext to perform ringreduce on.
		* @param keySwitchHint is the keyswitchhint to switch the ciphertext from original private key to a sparse private key.
		*/
		virtual Ciphertext<Element> RingReduce(Ciphertext<Element> cipherText, const LPEvalKey<Element> keySwitchHint) const {

			std::string errMsg = "LPLeveledSHEAlgorithmSHIELD::RindReduce is not currently implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}

		/**
		* Method for Composed EvalMult, which includes homomorphic multiplication, key switching, and modulo reduction. Not implemented for the SHIELD/BGV scheme.
		*
		* @param cipherText1 ciphertext1, first input ciphertext to perform multiplication on.
		* @param cipherText2 cipherText2, second input ciphertext to perform multiplication on.
		* @param quadKeySwitchHint is used for EvalMult operation.
		* @return resulting ciphertext.
		*/
		Ciphertext<Element> ComposedEvalMult(
			const Ciphertext<Element> cipherText1,
			const Ciphertext<Element> cipherText2,
			const LPEvalKey<Element> quadKeySwitchHint) const
		{
			std::string errMsg = "LPLeveledSHEAlgorithmSHIELD::ComposedEvalMult is not currently implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}

		/**
		* Method for Level Reduction from sk -> sk1. This method peforms a keyswitch on the ciphertext and then performs a modulus reduction.
		* Not implemented for the SHIELD scheme.
		*
		* @param cipherText1 is the original ciphertext to be key switched and mod reduced.
		* @param linearKeySwitchHint is the linear key switch hint to perform the key switch operation.
		* @return resulting ciphertext.
		*/
		virtual Ciphertext<Element> LevelReduce(const Ciphertext<Element> cipherText1,
			const LPEvalKey<Element> linearKeySwitchHint) const 
		{
			std::string errMsg = "LPLeveledSHEAlgorithmSHIELD::LevelReduce is not currently implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}

		/**
		* Function that determines if security requirements are met if ring dimension is reduced by half.
		* Not implemented for the SHIELD scheme.
		*
		* @param ringDimension is the original ringDimension
		* @param &moduli is the vector of moduli that is used
		* @param rootHermiteFactor is the security threshold
		* @return boolean value that determines if the ring is reducable.
		*/
		virtual bool CanRingReduce(usint ringDimension, const std::vector<BigInteger> &moduli, const double rootHermiteFactor) const
		{
			std::string errMsg = "LPAlgorithmSHESHIELD::CanRingReduce is not currently implemented for the SHIELD Scheme.";
			throw std::runtime_error(errMsg);
		}



		/**
		* Method for ComposedEvalMult.  This method performs an EvalMult on two input ciphertext, then a
		* modululus reduction and a key switch on the result.
		* See the class description for citations on where the algorithms were taken from.
		*
		* @param cipherText1 The first input ciphertext to perform multiplication on.
		* @param cipherText2 THe second input ciphertext to perform multiplication on.
		* @param quadKeySwitchHint The resultant quadratic secret key after multiplication to the secret key of the particular level.
		* @return The resulting ciphertext that can be decrypted with the secret key of the particular level.
		*/
		// Ciphertext<Element> ComposedEvalMult(
		// 	const Ciphertext<Element> cipherText1,
		// 	const Ciphertext<Element> cipherText2,
		// 	const LPEvalKey<Element> quadKeySwitchHint) const
		// {
		// 	std::string errMsg = "LPAlgorithmSHESHIELD::ComposedEvalMult is not currently implemented for the SHIELD Scheme.";
		// 	throw std::runtime_error(errMsg);
		// }
	};


	/**
	* @brief Main public key encryption scheme for the SHIELD implementation
	* @tparam Element a ring element.
	*/
	template <class Element>
	class LPPublicKeyEncryptionSchemeSHIELD : public LPPublicKeyEncryptionScheme<Element> {
	public:
		LPPublicKeyEncryptionSchemeSHIELD() : LPPublicKeyEncryptionScheme<Element>() {}

		bool operator==(const LPPublicKeyEncryptionScheme<Element>& sch) const {
			if( dynamic_cast<const LPPublicKeyEncryptionSchemeSHIELD<Element> *>(&sch) == 0 )
				return false;
			return true;
		}

		void Enable(PKESchemeFeature feature);
	};

} // namespace lbcrypto ends
#endif
