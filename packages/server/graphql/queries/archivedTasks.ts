import {GraphQLID, GraphQLNonNull} from 'graphql'
import {forwardConnectionArgs} from 'graphql-relay'
import getRethink from '../../database/rethinkDriver'
import GraphQLISO8601Type from '../types/GraphQLISO8601Type'
import {TaskConnection} from '../types/Task'
import {getUserId, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'

export default {
  type: TaskConnection,
  args: {
    ...forwardConnectionArgs,
    after: {
      type: GraphQLISO8601Type,
      description: 'the datetime cursor'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique team ID'
    }
  },
  async resolve(_source, {first, after, teamId}, {authToken}) {
    const r = await getRethink()

    // AUTH
    const userId = getUserId(authToken)
    if (!isTeamMember(authToken, teamId)) {
      standardError(new Error('Not organization lead'), {userId})
      return null
    }

    // RESOLUTION
    const teamMemberId = `${userId}::${teamId}`
    const dbAfter = after ? new Date(after) : r.maxval
    const tasks = await r
      .table('Task')
      // use a compound index so we can easily paginate later
      .between([teamId, r.minval], [teamId, dbAfter], {
        index: 'teamIdUpdatedAt'
      })
      .filter((task) =>
        task('tags')
          .contains('archived')
          .and(
            r.branch(task('tags').contains('private'), task('teamMemberId').eq(teamMemberId), true)
          )
      )
      .orderBy(r.desc('updatedAt'))
      .limit(first + 1)
      .coerceTo('array')
      .run()

    const nodes = tasks.slice(0, first)
    const edges = nodes.map((node) => ({
      cursor: node.updatedAt,
      node
    }))
    const firstEdge = edges[0]
    return {
      edges,
      pageInfo: {
        startCursor: firstEdge && firstEdge.cursor,
        endCursor: firstEdge ? edges[edges.length - 1].cursor : new Date(),
        hasNextPage: tasks.length > nodes.length
      }
    }
  }
}
