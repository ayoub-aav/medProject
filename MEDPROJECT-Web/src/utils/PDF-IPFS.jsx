import { PinataSDK } from "pinata";

const Pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT,
  pinataGateway: import.meta.env.VITE_GATEWAY_URL,
  pinataApiKey: import.meta.env.VITE_PINATA_API_KEY,
  pinataSecretApiKey: import.meta.env.VITE_PINATA_SECRET_KEY
});

export const uploadPDFToIPFS = async (file) => {
  if (!file || file.type !== 'application/pdf') {
    throw new Error('Please select a valid PDF file');
  }

  try {
    // Upload file to Pinata
    const upload = await Pinata.upload.private.file(file);
    

    if (!upload.cid) {
      throw new Error('Upload failed: No CID returned');
    }

    return upload.cid;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
};



export const getPDFFromIPFS = async (cid) => {
  if (!cid) throw new Error('No CID provided');

  try {
    const { data, contentType } = await Pinata.gateways.private.get(cid);
    console.log('Pinata Response:', { contentType, data });

    const arrayBuffer = await data.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    if (uint8Array.length === 0) {
      throw new Error('Downloaded file is empty');
    }

    // Verify PDF header
    if (uint8Array[0] !== 0x25 || uint8Array[1] !== 0x50 || 
        uint8Array[2] !== 0x44 || uint8Array[3] !== 0x46) {
      throw new Error('Downloaded file is not a valid PDF');
    }

    return {
      data: arrayBuffer,
      contentType: contentType || 'application/pdf'
    };
  } catch (error) {
    console.error('IPFS download error:', error.message, error.stack);
    throw error;
  }
};
