/* eslint-disable no-sequences */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-return-assign */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { DetailedHTMLProps, InputHTMLAttributes, useCallback, useEffect, useRef, useState } from 'react'
import Dropzone from 'react-dropzone'
import { useNetwork, useAccount } from 'wagmi'
import { CircularProgress, CircularProgressLabel } from '@chakra-ui/progress'
import axios, { CancelToken } from 'axios'
import { ethers } from 'ethers'

import { useHosqRead, useHosqWrite } from '../utils/hooks'
import hosqStyles from './Hosq.modules.css'
import blockTimes from '../utils/blockTimes'
import { useMediaQuery } from 'react-responsive'

export interface HosqPickerProps {
  DefaultProviderId?: number
  hide?: boolean
}

export interface HosqUploadProps {
  files?: File[]
  blobs?: Array<{ blob: Blob, name: string }>
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
let selectedProviderId: number = 1

function FileUploadComponent({ callback, ...props }: any) {
  return (
    <Dropzone preventDropOnDocument
      onDropAccepted={acceptedFiles => callback(acceptedFiles)}
      maxFiles={props.maxFiles} accept={props.accept}>
      {({ getRootProps, getInputProps, isFocused, isDragAccept, isDragReject }) => (
        <div className={hosqStyles.container} {...getRootProps({ isFocused, isDragAccept, isDragReject })}>
          <input {...getInputProps()} />
          {isDragAccept
            ? <p>Drop</p>
            : <p>Drag & drop {props.maxFiles === 1 ? 'a file' : 'some files'} here, or click to select</p>
          }
        </div>
      )}
    </Dropzone>
  )
}

function PinButton(props: { blocks: number, cid: string, chainId: number, symbol?: string }) {
  const { isError, error, isLoading, write, fees } = useHosqPin(props.cid, props.blocks, selectedProviderId, props.chainId)
  const fee = (fees.data != null) ? fees.data[0].add(fees.data[1]).toString() : '0'
  // console.log(data, isError, isLoading, ethers.utils.formatEther(fee));
  const feeErr = () => {
    console.error(fees.error)
    // toast.error('Error getting the provider fee')
  }
  fees.isError && feeErr()
  const pinErr = () => {
    console.error(error)
  }
  isError && pinErr()
  return (
    <div className={hosqStyles.div_flex_column}>
      <span className={`as-text-size-xs as-text-bold ${fees.isLoading ? 'as-loading' : ''}`}>
        Fee {props.symbol ?? '?'} {ethers.utils.formatEther(fee)}
      </span>
      <span className={[`as-btn as-btn-primary as-pointer ${hosqStyles.text_center} ${isLoading ? 'as-loading' : ''}`,
      hosqStyles.border1rem, hosqStyles.fill_width].join(' ')}
        onClick={() => write?.()} style={{ minWidth: '102px' }}>Pin CID</span>
    </div>
  )
}

function HosqPin(props: { cid: string }) {
  // const [blocks, setBlocks] = useState(1);
  const dateInput = useRef<any>()
  const [date, setDate] = useState(new Date(new Date().getTime() + (7 * 86400 * 1000)))
  const { chain } = useNetwork()
  const [blocks, setBlocks] = useState(0)
  // console.log(blocks);
  useEffect(() => {
    dateInput.current.value = date.toISOString().substring(0, 10)
    dateInput.current.min = new Date().toISOString().substring(0, 10)
  }, [])

  useEffect(() => {
    setBlocks(Math.round(((date.getTime() - new Date().getTime()) / 1000) / blockTimes[chain?.id as number]))
  }, [date])
  return (
    <div className={[hosqStyles.div_space_between, hosqStyles.fill_width].join(' ')} style={{ marginBottom: '5px' }}>
      <div className={hosqStyles.div_flex_column}>
        <span className="as-text-size-xs as-text-bold">
          Select expiration date
        </span>
        <input className={[hosqStyles.border1rem, 'as-text-dark as-bg-light'].join(' ')}
          type="date" ref={dateInput} onChange={(e) => { setDate(new Date(e.target.value)) }} />
      </div>
      {
        (blocks !== 0 && !isNaN(blocks)) && <PinButton blocks={blocks} cid={props.cid} chainId={chain?.id as number} symbol={chain?.nativeCurrency?.symbol} />
      }
    </div>
  )
}

export function useHosqPin(cid: string, numberOfBlocks: number, providerId: number, chain: number) {
  const fees = useHosqRead(chain, 'get_total_price_for_blocks', [numberOfBlocks, providerId])
  const write = useHosqWrite(chain, 'add_new_valid_block', [cid, numberOfBlocks, providerId],
    { value: (fees.data != null) ? fees.data[0].add(fees.data[1]).toString() : '0' })
  return {
    ...write,
    fees
  }
}

export function useHosqUpload(data: HosqUploadProps) {
  const [progress, setProgress] = useState(0)
  const [response, setResponse] = useState<any | undefined>()
  const [error, setError] = useState<any | undefined>()
  let url: string | undefined //= "localhost:11666"
  if (isProviderSelected()) {
    url = selectedProvider.api_url.endsWith('/')
      ? selectedProvider.api_url.substring(0, selectedProvider.api_url.length - 1)
      : selectedProvider.api_url
  }
  const upload = useCallback((cancelToken: CancelToken) => {
    const body = new FormData()
    data.files?.map((f, _i) => body.append('file', f, `${f.webkitRelativePath || f.name}`))
    data.blobs?.map((b, _i) => body.append('blob', b.blob, b.name))

    setResponse(undefined)
    setError(undefined)

    axios({
      method: 'POST',
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
      }
    }).catch((e) => {
      setError(e)
    })
  }, [data.files, data.blobs, data.wrapInDir])

  return { response, error, progress, upload }
}

export function HosqUploadFiles(props: HosqUploadFilesProps) {
  const [files, setFiles] = useState<File[]>([])
  const { response, progress, error, upload } = useHosqUpload({ files, wrapInDir: props.wrapInDir })
  const fileSpan: any = useRef()
  const isMobile = useMediaQuery({ maxWidth: 767 })
  useEffect(() => {
    if (files.length === 0) return
    let [name, size] = ['', 0]
    if (files.length === 1) { name = files[0].name; size = files[0].size } else {
      name = `${files.length} files`
      files.forEach((f) => size += f.size)
    }
    fileSpan.current.innerHTML = `${name}  <span class="as-text-bold">${(size / 1e6).toFixed(2)} MiB</span>`
    props.onDrop?.(files)
    const token = axios.CancelToken
    const source = token.source()
    if (props.uploadOnDrop) {
      upload(source.token)
    }
    return () => {
      props.uploadOnDrop && source.cancel()
    }
  }, [files, props.uploadOnDrop])
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

export function isProviderSelected(): boolean {
  return selectedProvider !== undefined
}

export function useGet(cid: string, json: boolean = false) {
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

export function getGateway() {
  if (!isProviderSelected()) return ''
  return `${selectedProvider.api_url}/ipfs`
}

function ProviderDetails(props: { pID: number, hide?: boolean }) {
  const { chain } = useNetwork()
  const { data, isError, isLoading } = useHosqRead(chain?.id as number, 'get_provider_details', [props.pID])
  useEffect(() => {
    if (data != null) {
      selectedProvider = data
      selectedProviderId = props.pID // add user select option
    }
  }, [data, props.hide])

  if (props.hide) return (<></>)
  return (
    <div className={`${isLoading && 'as-loading'} ${isError && 'as-bg-danger'} ${hosqStyles.providerDetails}`}>
      {
        (data && data?.api_url !== '')
          ? <>
            <span>{data?.name}</span>
            <span>{data?.api_url}</span>
            <span>{ethers.utils.formatEther(data?.block_price.toString() || '0')} {chain?.nativeCurrency?.symbol}</span>
          </>
          : <span>Provider is not Found</span>
      }
    </div>
  )
}

export function HosqPicker(props: HosqPickerProps) {
  const hosqIdInput = useRef<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>>()
  const [pID, setPID] = useState(props.DefaultProviderId ? props.DefaultProviderId : 1)
  const { isConnected } = useAccount()

  return (
    <div className={`${hosqStyles.picker}`}>
      {/* <span>Hosq Provider Picker</span> */}
      <div>
        <input type="number" placeholder='Hosq ID' min={1} ref={hosqIdInput} />
        <span className='as-btn-primary as-btn' onClick={() => { setPID(hosqIdInput.current?.valueAsNumber) }}>Select</span>
      </div>
      {isConnected && <ProviderDetails pID={pID} hide={props.hide} />}
    </div>
  )
}
