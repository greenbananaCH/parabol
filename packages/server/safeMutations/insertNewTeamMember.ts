import getRethink from '../database/rethinkDriver'
import toTeamMemberId from '../../client/utils/relay/toTeamMemberId'

interface Options {
  isLead?: boolean
  checkInOrder?: number
}

const insertNewTeamMember = async (userId: string, teamId: string, options: Options = {}) => {
  const r = await getRethink()
  const {isLead = false, checkInOrder} = options
  const teamMemberId = toTeamMemberId(teamId, userId)
  return r
    .table('User')
    .get(userId)
    .do((user) => {
      return r
        .table('TeamMember')
        .insert(
          {
            id: teamMemberId,
            isNotRemoved: true,
            isLead,
            isFacilitator: true,
            checkInOrder:
              checkInOrder !== undefined
                ? checkInOrder
                : r
                    .table('TeamMember')
                    .getAll(teamId, {index: 'teamId'})
                    .filter({isNotRemoved: true})
                    .count()
                    .add(1)
                    .default(2),
            teamId,
            userId,
            email: user('email').default(''),
            picture: user('picture').default(''),
            preferredName: user('preferredName').default('')
            // conflict is possible if person was removed from the team + org & then rejoined (isNotRemoved would be false)
          },
          {conflict: 'update', returnChanges: true}
        )('changes')(0)('new_val')
        .default(null)
    })
    .run()
}

export default insertNewTeamMember