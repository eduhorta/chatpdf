import { Pinecone, PineconeClient } from '@pinecone-database/pinecone'
import { downloadFromS3 } from './s3-server'
import {PDFLoader} from 'langchain/document_loaders/fs/pdf'
import {Document, RecursiveCharacterTextSplitter} from '@pinecone-database/doc-splitter'


let pinecone: PineconeClient | null = null

export const getPinecone = async () => {
    if(!pinecone) {
        pinecone = new PineconeClient()
        await pinecone.init({
            environment: process.env.PINECONE_ENVIRONMENT!,
            apiKey: process.env.PINECONE_API_KEY!,
        })
    }
    return pinecone
}

type PDFPage = {
    pageContent: string;
    metadata: {
        loc: {pageNumber: number};
    }
}

export async function loadS3IntoPinecone(fileKey: string) {
    // 1. Obtain the PDF -> Download and read from PDF
    console.log('downloading s3 into file system')
    const file_name = await downloadFromS3(fileKey)
    if (!file_name) {
        throw new Error('could not download from S3')
    }
    const loader = new PDFLoader(file_name)
    const pages = (await loader.load()) as PDFPage[]
    // 2. Split and segment the PDF into smaller documents
    return pages
}

async function prepareDocument(page: PDFPage) {
    let {pageContent, metadata} = page
    pageContent = pageContent.replace(/\n/g, '')
}