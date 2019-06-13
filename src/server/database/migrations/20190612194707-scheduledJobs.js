import SlackNotification from 'server/database/types/SlackNotification'

exports.up = async (r) => {
  try {
    await r.tableCreate('ScheduledJob')
  } catch (e) {
    console.log(e)
  }
  try {
    await r.table('ScheduledJob').indexCreate('type')
    await r.table('ScheduledJob').indexCreate('runAt')
  } catch (e) {
    console.log(e)
  }

  try {
    const slackUsers = await r.table('SlackAuth').filter({isActive: true})
    const slackNotifications = await r
      .table('SlackNotification')
      .pluck('userId', 'teamId', 'channelId')
      .distinct()
    const stageCompleteNotifications = slackUsers.map((slackUser) => {
      const {userId, teamId} = slackUser
      return new SlackNotification({
        userId,
        teamId,
        channelId: null,
        event: 'meetingStageTimeLimit'
      })
    })
    const stageReadyNotifications = slackUsers.map((slackUser) => {
      const {userId, teamId} = slackUser
      const teamMemberNotification = slackNotifications.find(
        (notification) => notification.teamId === teamId && notification.userId === userId
      )
      const channelId = (teamMemberNotification && teamMemberNotification.channelId) || null
      return new SlackNotification({userId, teamId, channelId, event: 'meetingNextStageReady'})
    })
    const records = [...stageCompleteNotifications, ...stageReadyNotifications]
    await r.table('SlackNotification').insert(records)
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await r.tableDrop('ScheduledJob')
  } catch (e) {
    console.log(e)
  }
}
