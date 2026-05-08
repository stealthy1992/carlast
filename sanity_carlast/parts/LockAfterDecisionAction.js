// studio/parts/LockAfterDecisionAction.js

import defaultResolve, { PublishAction } from 'part:@sanity/desk-tool/document-actions'
import sanityClient from 'part:@sanity/base/client'

const client = sanityClient.withConfig({ apiVersion: '2022-03-07' })

function LockedPublishAction(props) {
  const originalAction = PublishAction(props)

  // publishedDocument = the last committed published snapshot
  const publishedStatus = props.publishedDocument?.status
  const isDecisionMade  =
    publishedStatus === 'approved' || publishedStatus === 'declined'

  if (isDecisionMade) {
    // Already decided — disable the button entirely
    return {
      ...originalAction,
      label:    '🔒 Decision Locked',
      title:    `This application was already ${publishedStatus}. No further changes allowed.`,
      disabled: true,
      onHandle: () => {},
    }
  }

  // Not yet decided — wrap onHandle to stamp decisionMade:true when a final status is published
  return {
    ...originalAction,
    onHandle: async () => {
      const draftStatus = props.draft?.status

      // If admin is publishing an approved/declined decision for the first time,
      // patch decisionMade:true into the document BEFORE publishing
      if (draftStatus === 'approved' || draftStatus === 'declined') {
        await client
          .patch(`drafts.${props.id}`)
          .set({ decisionMade: true })
          .commit()
      }

      // Now run the original publish
      originalAction.onHandle()
    },
  }
}

export default function resolveDocumentActions(props) {
  const actions = defaultResolve(props)

  if (props.type !== 'userForms') {
    return actions
  }

  return actions.map((action) =>
    action === PublishAction ? LockedPublishAction : action
  )
}