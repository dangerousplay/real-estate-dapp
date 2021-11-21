import React, { useState } from 'react';
import {Form} from "react-bootstrap";
import ImageGallery from 'react-image-gallery';
import {ipfsClient} from "../../ipfs";
import {toast} from "react-toastify";


async function uploadImages(e: any, ipfsUrl: string,
                            onImagesChanged: ((f: string[]) => void) | undefined,
                            images: string[],
                            setImages: (value: string[]) => void) {
    const files = e.target.files

    const uploadedImages: string[] = []

    for (let i = 0; i < files.length; i++) {
        const image = files[i];

        try {
            const uploadedImage = await ipfsClient.add(image)
            const imageUrl = `${ipfsUrl}/ipfs/${uploadedImage.path}`

            uploadedImages.push(imageUrl)
        } catch (e) {
            toast("Falha no upload da imagem: " + JSON.stringify(e))
        }
    }

    const newImages = [...images].concat(uploadedImages)

    if (onImagesChanged)
        onImagesChanged(newImages)

    setImages(newImages)
}

type ImageUploadProps = {
    ipfsUrl: string,
    onImagesChanged?: (f: string[]) => void,
    defaultPhotos?: string[]
    inputName?: string
};

export const ImageUpload: React.FC<ImageUploadProps> = ({ ipfsUrl, onImagesChanged, inputName, defaultPhotos }) => {
    const [images, setImages] = useState<string[]>(defaultPhotos ?? [])

    const uploadMultipleFiles = async (e: any) => {
        await uploadImages(e, ipfsUrl, onImagesChanged, images, setImages);
    }

    return (
        <>
            <div style={{maxWidth: "600px", maxHeight: "600px"}}>
                {images.length > 0 ?
                    <ImageGallery items={images.map(i => { return { original: i } } )} showPlayButton={false}/> :
                    <div/>
                }
            </div>

            <br/>

            <div>
                <Form.Control type="file" name={inputName || "files"} multiple onChange={uploadMultipleFiles}/>
            </div>
        </>
    )
}