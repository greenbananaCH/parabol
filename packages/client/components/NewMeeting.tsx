import React, {useEffect, useRef, useState} from 'react'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import NewMeetingTeamPicker from './NewMeetingTeamPicker'
import NewMeetingMeetingSelector from './NewMeetingMeetingSelector'
import {MeetingTypeEnum} from '../types/graphql'
import NewMeetingSettings from './NewMeetingSettings'
import sortByTier from '../utils/sortByTier'
import useRouter from '../hooks/useRouter'
import NewMeetingActions from './NewMeetingActions'
import NewMeetingBackButton from './NewMeetingBackButton'
import WaveSVG from '../../../static/images/wave.svg'
import {NewMeeting_viewer} from '__generated__/NewMeeting_viewer.graphql'
import NewMeetingHowTo from './NewMeetingHowTo'
import NewMeetingIllustration from './NewMeetingIllustration'
import {mod} from 'react-swipeable-views-core'
import useBreakpoint from '../hooks/useBreakpoint'
import {Breakpoint} from '../types/constEnums'
import useStoreQueryRetry from 'hooks/useStoreQueryRetry'
import makeMinWidthMediaQuery from '../utils/makeMinWidthMediaQuery'

interface Props {
  retry(): void
  teamId?: string | null
  viewer: NewMeeting_viewer
}

const MEDIA_QUERY_VERTICAL_CENTERING = makeMinWidthMediaQuery(840)

const IllustrationAndSelector = styled('div')({
  gridArea: 'picker',
  width: '100%'
})

const TeamAndSettings = styled('div')<{isDesktop}>(({isDesktop}) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  gridArea: 'settings',
  paddingTop: isDesktop ? 32 : undefined,
  [MEDIA_QUERY_VERTICAL_CENTERING]: {
    minHeight: isDesktop ? undefined : 166
  }
}))

const NewMeetingBlock = styled('div')<{innerWidth: number; isDesktop: boolean}>(
  {
    alignItems: 'flex-start',
    backgroundImage: 'linear-gradient(0deg, #F1F0FA 25%, #FFFFFF 50%)',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'column',
    justifyItems: 'center',
    minHeight: '100%'
  },
  ({innerWidth, isDesktop}) =>
    isDesktop && {
      backgroundImage: `url('${WaveSVG}'), linear-gradient(0deg, #F1F0FA 50%, #FFFFFF 50%)`,
      backgroundSize: '100%',
      // the wave is 2560x231, so to figure out the offset from the center, we need to find how much scaling there was
      backgroundPositionY: `calc(50% - ${Math.floor(((innerWidth / 2560) * 231) / 2 - 1)}px), 0`,
      height: '100%',
      minHeight: 0,
      overflow: 'auto'
    }
)

const NewMeetingInner = styled('div')<{isDesktop: boolean}>(
  {
    alignItems: 'flex-start',
    justifyItems: 'center',
    margin: '0 auto auto',
    [MEDIA_QUERY_VERTICAL_CENTERING]: {
      marginTop: 'auto'
    }
  },
  ({isDesktop}) =>
    isDesktop && {
      display: 'grid',
      gridTemplateAreas: `'picker howto' 'settings actions'`,
      gridTemplateColumns: 'minmax(0, 4fr) minmax(0, 3fr)',
      gridTemplateRows: 'auto 3fr',
      flex: 1,
      margin: 'auto',
      maxHeight: 900,
      maxWidth: 1400,
      padding: '0 32px 16px 64px'
    }
)

const useInnerWidth = () => {
  const [innerWidth, setInnerWidth] = useState(() => window.innerWidth)
  useEffect(() => {
    const resizeWindow = () => {
      setInnerWidth(window.innerWidth)
    }
    window.addEventListener('resize', resizeWindow, {passive: true})
    return () => {
      window.removeEventListener('resize', resizeWindow)
    }
  }, [])
  return innerWidth
}

export const NEW_MEETING_ORDER = [MeetingTypeEnum.retrospective, MeetingTypeEnum.action]

const NewMeeting = (props: Props) => {
  const {teamId, viewer, retry} = props
  const {teams} = viewer
  useStoreQueryRetry(retry)
  const {history} = useRouter()
  const innerWidth = useInnerWidth()
  const [idx, setIdx] = useState(0)
  const meetingType = NEW_MEETING_ORDER[mod(idx, NEW_MEETING_ORDER.length)]
  const sendToMeRef = useRef(false)
  useEffect(() => {
    if (!teamId) {
      sendToMeRef.current = true
      const [firstTeam] = sortByTier(teams)
      const nextPath = firstTeam ? `/new-meeting/${firstTeam.id}` : '/newteam'
      history.replace(nextPath)
    }
  }, [])
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_GRID)
  const selectedTeam = teams.find((team) => team.id === teamId)
  useEffect(() => {
    if (!selectedTeam) return
    const {lastMeetingType} = selectedTeam
    const meetingIdx = NEW_MEETING_ORDER.indexOf(lastMeetingType as MeetingTypeEnum)
    setIdx(meetingIdx)
  }, [teamId])
  if (!teamId || !selectedTeam) return null
  return (
    <NewMeetingBlock innerWidth={innerWidth} isDesktop={isDesktop}>
      <NewMeetingBackButton teamId={teamId} sendToMe={sendToMeRef.current} />
      <NewMeetingInner isDesktop={isDesktop}>
        <IllustrationAndSelector>
          <NewMeetingIllustration idx={idx} setIdx={setIdx} />
          <NewMeetingMeetingSelector meetingType={meetingType} idx={idx} setIdx={setIdx} />
        </IllustrationAndSelector>
        <NewMeetingHowTo meetingType={meetingType} />
        <TeamAndSettings isDesktop={isDesktop}>
          <NewMeetingTeamPicker selectedTeam={selectedTeam} teams={teams} />
          <NewMeetingSettings selectedTeam={selectedTeam} meetingType={meetingType} />
        </TeamAndSettings>
        <NewMeetingActions team={selectedTeam} meetingType={meetingType} />
      </NewMeetingInner>
    </NewMeetingBlock>
  )
}

export default createFragmentContainer(NewMeeting, {
  viewer: graphql`
    fragment NewMeeting_viewer on User {
      ...NewMeetingExistingMeetings_viewer
      teams {
        ...NewMeetingTeamPicker_selectedTeam
        ...NewMeetingSettings_selectedTeam
        ...NewMeetingTeamPicker_teams
        ...NewMeetingActions_team
        id
        lastMeetingType
        name
        tier
      }
    }
  `
})
