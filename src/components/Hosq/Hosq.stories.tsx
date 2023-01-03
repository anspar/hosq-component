import React from 'react'

import { ComponentStory, ComponentMeta } from '@storybook/react'

import { HosqUploadFiles, HosqPicker } from './Hosq'

import { ThemeSwitch } from '@anspar/anspar-theme'

import { WalletContext, Wallet } from '@anspar/rainbowkit-anspar'

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export default {
  title: 'Hosq',
  component: HosqUploadFiles
} as ComponentMeta<typeof HosqUploadFiles>

const Template: ComponentStory<typeof HosqUploadFiles> = (args) => {
  return (
    <div style={{ backgroundColor: 'var(--as-common)', padding: '1rem' }}>
      <ThemeSwitch style={{ width: '30px' }} />
      <WalletContext testnets>
        <Wallet />
        <br />
        <div style={{ marginBottom: '0.5rem' }}>
          <HosqUploadFiles {...args} />
        </div>
        <HosqPicker />
      </WalletContext>
    </div>
  )
}

export const UploadFiles = Template.bind({})
export const UploadFilesAcceptOnlyImages = Template.bind({})
UploadFilesAcceptOnlyImages.args = {
  accept: {
    'image/*': []
  }
}

const Template2: ComponentStory<typeof HosqUploadFiles> = (args) => {
  return (
    <div style={{ backgroundColor: 'var(--as-common)', padding: '1rem' }}>
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
          default: {
            http: ['http://server:8545']
          }
        }
      }]
      }>
        <Wallet />
        <div style={{ margin: '0.5rem 0' }}>
          <HosqUploadFiles {...args} />
        </div>
        <HosqPicker />
      </WalletContext>
    </div>
  )
}
export const UploadFilesCustomChain = Template2.bind({})
