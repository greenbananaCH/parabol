import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {NewMeetingPhaseTypeEnum} from '../../../client/types/graphql'
import {GQLContext} from '../graphql'
import EstimateStage from './EstimateStage'
import makeMutationPayload from './makeMutationPayload'

export const VoteForPokerStorySuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'VoteForPokerStorySuccess',
  fields: () => ({
    stage: {
      type: GraphQLNonNull(EstimateStage),
      description: 'The stage that holds the updated scores',
      resolve: async ({meetingId, stageId}, _args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const {phases} = meeting
        const estimatePhase = phases.find(
          (phase) => phase.phaseType === NewMeetingPhaseTypeEnum.ESTIMATE
        )!
        const {stages} = estimatePhase
        const estimateStage = stages.find((stage) => stage.id === stageId)!
        return estimateStage
      }
    }
  })
})

const VoteForPokerStoryPayload = makeMutationPayload(
  'VoteForPokerStoryPayload',
  VoteForPokerStorySuccess
)

export default VoteForPokerStoryPayload