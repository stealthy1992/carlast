// studio/parts/LockAfterDecisionAction.js

import defaultResolve, { PublishAction } from 'part:@sanity/desk-tool/document-actions'

// Wraps the default PublishAction to disable it once a final
// decision (approved / declined) has already been published.
function LockedPublishAction(props) {
  const originalAction = PublishAction(props)

  const publishedStatus = props.publishedDocument?.status
  const isDecisionMade  =
    publishedStatus === 'approved' || publishedStatus === 'declined'

  if (!isDecisionMade) {
    // No decision yet — behave exactly like the normal Publish button
    return originalAction
  }

  // Decision already made — return a locked version
  return {
    ...originalAction,
    label:    '🔒 Decision Locked',
    title:    `This application was already ${publishedStatus}. The status and reason can no longer be changed.`,
    disabled: true,
    onHandle: () => {},   // no-op — belt and suspenders
  }
}

// The resolver function receives all actions for every document type.
// We only swap PublishAction for our wrapped version on "userForms" documents.
export default function resolveDocumentActions(props) {
  const actions = defaultResolve(props)

  if (props.type !== 'userForms') {
    return actions   // leave all other document types untouched
  }

  return actions.map((action) =>
    action === PublishAction ? LockedPublishAction : action
  )
}