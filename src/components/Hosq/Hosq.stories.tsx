import React from 'react'

import { ComponentStory, ComponentMeta } from '@storybook/react'

import { HosqUploadFiles, HosqPicker } from './Hosq'

import { ThemeSwitch } from '@anspar/anspar-theme'

import { WalletContext, Wallet } from '@anspar/rainbowkit-anspar'

export default {
  title: 'WalletContext/Hosq',
  component: HosqUploadFiles
} as ComponentMeta<typeof HosqUploadFiles>

const Template: ComponentStory<typeof HosqUploadFiles> = (args) => {
  return (
    <>
      <ThemeSwitch style={{ width: '30px' }} />
      <WalletContext testnets>
        <Wallet />
        <br />
        <HosqPicker />
        <div style={{ marginTop: '0.5rem', backgroundColor: 'var(--as-light)', padding: '1rem' }}>
            <HosqUploadFiles {...args} />
        </div>
      </WalletContext>
    </>
  )
}

export const UploadFiles = Template.bind({})
export const UploadFilesAcceptOnlyImages = Template.bind({})
UploadFilesAcceptOnlyImages.args = {
  accept: {
    'image/*': []
  }
}

const Template2: ComponentStory<typeof HosqPicker> = (args) => {
  return (
    <>
      <ThemeSwitch style={{ width: '30px' }} />
      <WalletContext testnets customTestChains={[{
        id: 1337,
        name: 'Anspar',
        network: 'Anspar',
        nativeCurrency: {
          decimals: 18,
          name: 'Anspar',
          symbol: 'AT'
        },
        rpcUrls: {
          default: 'http://server:8545'
        }
      }]
      }>
        <Wallet />
        <br />
        <HosqPicker />
      </WalletContext>
    </>
  )
}
export const HosqProviderPicker = Template2.bind({})

const Template3: ComponentStory<typeof HosqUploadFiles> = (args) => {
  return (
    <>
      <ThemeSwitch style={{ width: '30px' }} />
      <WalletContext testnets customTestChains={[{
        id: 1337,
        name: 'Anspar',
        network: 'Anspar',
        nativeCurrency: {
          decimals: 18,
          name: 'Anspar',
          symbol: 'AT'
        },
        rpcUrls: {
          default: 'http://server:8545'
        }
      }]
      }>
        <Wallet />
        <div style={{ margin: '0.5rem 0', backgroundColor: 'var(--as-light)', padding: '1rem' }}>
            <HosqUploadFiles {...args} />
        </div>
        <HosqPicker />
      </WalletContext>
    </>
  )
}
export const UploadFilesCustomChain = Template3.bind({})
