use schnorrkel::{signing_context, Keypair, SecretKey, MiniSecretKey, PublicKey,
	derive::{Derivation, ChainCode, CHAIN_CODE_LENGTH},
	keys::{KEYPAIR_LENGTH, PUBLIC_KEY_LENGTH, SECRET_KEY_LENGTH},
	sign::{Signature, SIGNATURE_LENGTH}
};

// We must make sure that this is the same as declared in the substrate source code.
const SIGNING_CTX: &[u8] = b"substrate";
const DERIVE_CTX: &[u8] = b"SchnorrRistrettoHDKD";

/// Private helper function.
fn keypair_from_seed(seed: &[u8]) -> Keypair {
	MiniSecretKey::from_bytes(seed)
		.expect("32 bytes can always build a key; qed")
		.expand_to_keypair()
}

pub fn __hard_derive_keypair(pair: &[u8], cc: &[u8]) -> [u8; KEYPAIR_LENGTH] {
	let pair = match Keypair::from_bytes(pair) {
		Ok(pair) => pair,
		Err(_) => panic!("Provided pair is invalid.")
	};
	let derived = pair
		.secret
		.hard_derive_mini_secret_key(signing_context(DERIVE_CTX).bytes(&cc[..]))
		.expand()
		.to_keypair()
		.to_bytes();

	let mut res = [0u8; KEYPAIR_LENGTH];
	res.copy_from_slice(&derived);
	res
}

pub fn __hard_derive_secret(secret: &[u8], cc: &[u8]) -> [u8; SECRET_KEY_LENGTH] {
	let secret = match SecretKey::from_bytes(secret) {
		Ok(secret) => secret,
		Err(_) => panic!("Provided private key is invalid.")
	};
	let derived = secret
		.hard_derive_mini_secret_key(signing_context(DERIVE_CTX).bytes(&cc[..]))
		.expand();

	let mut res = [0u8; SECRET_KEY_LENGTH];
	res.copy_from_slice(&derived.to_bytes());
	res
}

pub fn __keypair_from_seed(seed: &[u8]) -> [u8; KEYPAIR_LENGTH] {
	let keypair = keypair_from_seed(seed).to_bytes();
	let mut kp = [0u8; KEYPAIR_LENGTH];
	kp.copy_from_slice(&keypair);
	kp
}

pub fn __soft_derive_keypair(pair: &[u8], junction: &[u8]) -> [u8; KEYPAIR_LENGTH] {
	let keypair = match Keypair::from_bytes(pair) {
		Ok(keypair) => keypair,
		Err(_) => panic!("Provided keypair is invalid.")
	};
	let mut cc = [0u8; CHAIN_CODE_LENGTH];
	cc.copy_from_slice(&junction);
	let derived = keypair.derived_key_simple(ChainCode(cc), &[]).0;
	let mut res = [0u8; KEYPAIR_LENGTH];
	res.copy_from_slice(&derived.to_bytes());
	res
}

pub fn __soft_derive_public(pubkey: &[u8], junction: &[u8]) -> [u8; PUBLIC_KEY_LENGTH] {
	let public = match PublicKey::from_bytes(pubkey) {
		Ok(public) => public,
		Err(_) => panic!("Provided public key is invalid.")
	};
	let mut cc = [0u8; CHAIN_CODE_LENGTH];
	cc.copy_from_slice(&junction);
	let derived = public.derived_key_simple(ChainCode(cc), &[]).0;
	let mut res = [0u8; PUBLIC_KEY_LENGTH];
	res.copy_from_slice(&derived.to_bytes());
	res
}

pub fn __soft_derive_secret(seckey: &[u8], junction: &[u8]) -> [u8; SECRET_KEY_LENGTH] {
	let secret = match SecretKey::from_bytes(seckey) {
		Ok(secret) => secret,
		Err(_) => panic!("Provided private key is invalid.")
	};
	let mut cc = [0u8; CHAIN_CODE_LENGTH];
	cc.copy_from_slice(&junction);
	let derived = secret.derived_key_simple(ChainCode(cc), &[]).0;
	let mut res = [0u8; SECRET_KEY_LENGTH];
	res.copy_from_slice(&derived.to_bytes());
	res
}

pub fn __secret_from_seed(seed: &[u8]) -> [u8; SECRET_KEY_LENGTH] {
	let secret = keypair_from_seed(seed).secret.to_bytes();
	let mut s = [0u8; SECRET_KEY_LENGTH];
	s.copy_from_slice(&secret);
	s
}

pub fn __verify(signature: &[u8], message: &[u8], pubkey: &[u8]) -> bool {
	let sig = match Signature::from_bytes(signature) {
		Ok(some_sig) => some_sig,
		Err(_) => return false
	};
	let pk = match PublicKey::from_bytes(pubkey) {
		Ok(some_pk) => some_pk,
		Err(_) => return false
	};
	pk.verify_simple(SIGNING_CTX, message, &sig)
}

pub fn __sign(public: &[u8], private: &[u8], message: &[u8]) -> [u8; SIGNATURE_LENGTH] {
	// despite being a method of KeyPair, only the secret is used for signing.
	let secret = match SecretKey::from_bytes(private) {
		Ok(some_secret) => some_secret,
		Err(_) => panic!("Provided private key is invalid.")
	};

	let public = match PublicKey::from_bytes(public) {
		Ok(some_public) => some_public,
		Err(_) => panic!("Provided public key is invalid.")
	};

	let context = signing_context(SIGNING_CTX);
	secret.sign(context.bytes(message), &public).to_bytes()
}
