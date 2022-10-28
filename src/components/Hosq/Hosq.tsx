import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import Dropzone from 'react-dropzone'
// import { toast } from 'react-toastify'
import { useNetwork } from 'wagmi'
import { CircularProgress, CircularProgressLabel } from '@chakra-ui/progress'
import axios, { CancelToken } from 'axios'
import { ethers } from 'ethers'

import { useHosqRead, useHosqWrite } from '../utils/hooks'
import hosqStyles from './Hosq.modules.css'
import blockTimes from '../utils/blockTimes'
import { useMediaQuery } from 'react-responsive'

// const blockTimes = require("../utils/blockTimes.json");

export interface HosqProviderProps {
  children: ReactNode
  DefaultProviderId?: number
}

export interface HosqUploadProps {
  files?: File[]
  blobs?: { blob: Blob, name: string }[]
  wrapInDir?: boolean
}

export interface HosqUploadFilesProps {
  maxFiles?: number
  accept?: any
  allowPinning?: boolean
  wrapInDir?: boolean
  uploadOnDrop?: boolean
  onDrop?: (f: File[]) => void
}

let selectedProvider: any | undefined
let selectedProviderId: number = 0

function FileUploadComponent ({ callback, ...props }: any) {
  return (
    <Dropzone preventDropOnDocument
      onDropAccepted={acceptedFiles => callback(acceptedFiles)}
      maxFiles={props.maxFiles} accept={props.accept}>
      {({ getRootProps, getInputProps, isFocused, isDragAccept, isDragReject }) => (
        <div className={hosqStyles.container} {...getRootProps({ isFocused, isDragAccept, isDragReject })}>
          <input {...getInputProps()} />
          {isDragAccept
            ? <p>Drop</p>
            : <p>Drag 'n' drop {props.maxFiles === 1 ? 'a file' : 'some files'} here, or click to select</p>
          }
        </div>
      )}
    </Dropzone>
  )
}

function PinButton (props: { blocks: number, cid: string, chainId: number, symbol?: string }) {
  const { isError, error, isLoading, write, fees } = useHosqPin(props.cid, props.blocks, selectedProviderId, props.chainId)
  const fee = (fees.data != null) ? fees.data[0].add(fees.data[1]).toString() : '0'
  // console.log(data, isError, isLoading, ethers.utils.formatEther(fee));
  const feeErr = () => { console.error(fees.error); 
    // toast.error('Error getting the provider fee')
   }
  fees.isError && feeErr()
  const pinErr = () => { console.error(error); 
    //toast.error('Error submitting pinning request') 
  }
  isError && pinErr()
  return (
    <div className={hosqStyles.div_flex_column}>
      <span className={`as-text-size-xs as-text-bold ${fees.isLoading ? 'as-loading' : ''}`}>
        Fee {props.symbol || '?'} {ethers.utils.formatEther(fee)}
      </span>
      <span className={[`as-btn-primary as-pointer as-shadow-sm ${hosqStyles.text_center} ${isLoading ? 'as-loading' : ''}`,
        hosqStyles.border1rem, hosqStyles.fill_width].join(' ')}
        onClick={() => write()} style={{ minWidth: '102px' }}>Pin CID</span>
    </div>
  )
}

function HosqPin (props: { cid: string }) {
  // const [blocks, setBlocks] = useState(1);
  const dateInput = useRef<any>()
  const [date, setDate] = useState(new Date(new Date().getTime() + (7 * 86400 * 1000)))
  const { chain } = useNetwork()
  const blocks = Math.round(((date.getTime() - new Date().getTime()) / 1000) / blockTimes[chain?.id as number])
  // console.log(blocks);
  useEffect(() => {
    dateInput.current.value = date.toISOString().substring(0, 10)
    dateInput.current.min = new Date().toISOString().substring(0, 10)
  }, [])
  return (
    <div className={[hosqStyles.div_space_between, hosqStyles.fill_width].join(' ')}>
      <div className={hosqStyles.div_flex_column}>
        <span className="as-text-size-xs as-text-bold">
          Select expiration date
        </span>
        <input className={[hosqStyles.border1rem, 'as-text-dark as-bg-light as-shadow-sm'].join(' ')}
          type="date" ref={dateInput} onChange={(e) => { setDate(new Date(e.target.value)) }} />
      </div>
      <PinButton blocks={blocks} cid={props.cid} chainId={chain?.id as number} symbol={chain?.nativeCurrency?.symbol} />
    </div>
  )
}

export function useHosqPin (cid: string, numberOfBlocks: number, providerId: number, chain: number) {
  const fees = useHosqRead(chain, 'get_total_price_for_blocks', [numberOfBlocks, providerId])
  const write = useHosqWrite(chain, 'add_new_valid_block', [cid, numberOfBlocks, providerId],
    { value: (fees.data != null) ? fees.data[0].add(fees.data[1]).toString() : '0' })
  return {
    ...write,
    fees
  }
}

export function useHosqUpload (data: HosqUploadProps) {
  const [progress, setProgress] = useState(0)
  const [response, setResponse] = useState<any | undefined>()
  const [error, setError] = useState<any | undefined>()
  let url: string | undefined; //= "localhost:11666"
  if (isProviderSelected()) {
    url = selectedProvider.api_url.endsWith('/')
      ? selectedProvider.api_url.substring(0, selectedProvider.api_url.length - 1)
      : selectedProvider.api_url
  }
  const upload = useCallback((cancelToken: CancelToken) => {
    const body = new FormData()
    data.files !== undefined && data.files?.map((f) => body.append('file', f, `${f.webkitRelativePath}`))
    data.blobs !== undefined && data.blobs?.map((b, i) => body.append(`file`, b.blob, b.name))
    // console.log(data.files);
    setResponse(undefined)
    setError(undefined)
    // if (url === undefined) {
    //   toast.error('Failed to upload, Hosq provider is not available')
    //   return
    // }
    axios({
      method: 'post',
      baseURL: url,
      url: data.wrapInDir ? '/v0/file/upload?dir=true' : '/v0/file/upload?dir=false',
      onUploadProgress: (e) => {
        setProgress(parseInt(`${(e.loaded / e.total) * 100}`))
      },
      data: body,
      cancelToken
    }).then((res) => {
      if (res.status === 200) {
        if (typeof res.data === 'string') {
          try {
            const val = res.data.split('\n')
            if (val[val.length - 1] === '') val.pop()
            setResponse(JSON.parse(val[val.length - 1]))
          } catch (e) {
            console.error(e)
            setError(res)
          }
          return
        }
        setResponse(res.data)
      } else {
        setError(res)
        // toast.error('Failed to upload')
      }
    }).catch((e) => {
      setError(e)
    })
  }, [data.files, data.blobs, data.wrapInDir])

  return { response, error, progress, upload }
}

export function HosqUploadFiles (props: HosqUploadFilesProps) {
  const [files, setFiles] = useState<File[]>([])
  const { response, progress, error, upload } = useHosqUpload({ files, wrapInDir: props.wrapInDir })
  const fileSpan: any = useRef()
  const isMobile = useMediaQuery({ maxWidth: 767 });
  useEffect(() => {
    if (files.length === 0) return
    let [name, size] = ['', 0]
    if (files.length === 1) { name = files[0].name, size = files[0].size } else {
      name = `${files.length} files`
      files.forEach((f) => size += f.size)
    }
    fileSpan.current.innerHTML = `${name}  <span class="as-text-bold">${(size / 1e6).toFixed(2)} MiB</span>`
    ;(props.onDrop != null) && props.onDrop(files)
    const token = axios.CancelToken
    const source = token.source()
    if (props.uploadOnDrop) {
      upload(source.token)
    }
    return () => {
      props.uploadOnDrop && source.cancel()
    }
  }, [files])
  return (
    <div className={hosqStyles.hosq_upload_div}>
      {
        response !== undefined &&
        <div className={`${hosqStyles.div_flex_column} ${hosqStyles.fill_width}`}>
          <a target='_blank' href={`${getGateway()}/${response.Hash}`} className="as-text-size-n" rel="noreferrer">
            {isMobile ? `${response.Hash.substring(0, 30)}...` : response.Hash}
          </a>
          {
            props.allowPinning && <HosqPin cid={response.Hash} />
          }
        </div>
      }

      <FileUploadComponent callback={setFiles} maxFiles={props.maxFiles} accept={props.accept} />

      <div className={[hosqStyles.div_space_between, hosqStyles.fill_width].join(' ')}>
        <span ref={fileSpan} className="as-text-size-n">Noting selected</span>
        {
          (files.length > 0 && !response && props.uploadOnDrop && !error) &&
          <CircularProgress size="30px" thickness={10} isIndeterminate={progress === 100}
            value={progress} color="var(--as-primary)">
            <CircularProgressLabel>{progress}%</CircularProgressLabel>
          </CircularProgress>
        }
      </div>
    </div>
  )
}

export function isProviderSelected () {
  return selectedProvider !== undefined
}

export function useGet (cid: string, json: boolean = false) {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<any | undefined>()
  const [error, setError] = useState<any | undefined>()
  useEffect(() => {
    if (!isProviderSelected()) {
      setError('Provider is not available')
      return
    }
    setIsLoading(true)
    fetch(`${selectedProvider.api_url}/ipfs/${cid}`).then(async (res) => {
      setIsLoading(false)
      if (res.status !== 200) {
        console.error(res)
        setError(res.status)
        // toast.error(`Failed to request data from '${selectedProvider.name}' provider`)
        return
      }
      setData(json ? (await res.json()) : res)
    }).catch((e) => {
      console.error(e)
      setIsLoading(false)
      setError(e)
    })
  }, [])
  return { data, error, isLoading }
}

export function getGateway () {
  if (!isProviderSelected()) return ''
  return `${selectedProvider.api_url}/ipfs`
}

export function HosqProvider ({ children, ...props }: HosqProviderProps) {
  const { chain } = useNetwork()
  const { data, isError } = useHosqRead(chain?.id as number, 'get_provider_details', [
    props.DefaultProviderId ? props.DefaultProviderId : 1
  ])
  const [ready, setReady] = useState(false)
  useEffect(() => {
    // isError && toast.error('Failed to get Hosq provider')
    if (data != null) {
      selectedProvider = data
      selectedProviderId = props.DefaultProviderId ? props.DefaultProviderId : 1
      setReady(true)
      return
    }
    setReady(false)
  }, [data])

  return (
    ready ? <>{children}</> : <>Hosq is not available on this chain</>
  )
}
