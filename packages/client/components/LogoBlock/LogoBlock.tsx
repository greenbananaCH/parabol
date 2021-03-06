import React from 'react'
import {Link} from 'react-router-dom'
import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV2'
import logoMarkPurple from '../../styles/theme/images/brand/mark-purple.svg'

const RootBlock = styled('div')({
  alignItems: 'flex-end',
  borderTop: `1px solid ${PALETTE.BACKGROUND_PRIMARY_10A}`,
  boxSizing: 'content-box',
  display: 'flex',
  padding: 8,
  justifyContent: 'center',
  userSelect: 'none'
})

const Anchor = styled(Link)({
  display: 'block'
})

const Image = styled('img')({
  display: 'block'
})

interface Props {
  onClick: () => void
}

const LogoBlock = (props: Props) => {
  const {onClick} = props
  return (
    <RootBlock>
      <Anchor title='My Dashboard' to='/me' onClick={onClick}>
        <Image crossOrigin='' alt='Parabol' src={logoMarkPurple} />
      </Anchor>
    </RootBlock>
  )
}

export default LogoBlock
